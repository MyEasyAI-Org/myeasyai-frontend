import { ArrowLeft, PenTool } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BusinessNiche,
  ContentMessage,
  ContentTone,
  ContentType,
  GeneratedContent,
  SocialNetwork,
} from './types';
import {
  BUSINESS_NICHES,
  CONTENT_TONES,
  CONTENT_TYPES,
  CONVERSATION_STEPS,
  INITIAL_MESSAGES,
  SOCIAL_NETWORKS,
} from './constants';
import { useContentData } from './hooks/useContentData';
import { ContentChatPanel } from './components/ContentChatPanel';
import { ContentPreview } from './components/ContentPreview';
import {
  buildContentPrompt,
  exportCalendar,
  generateCalendarEntries,
  generateContentIdeas,
  generateId,
  getHashtagsForNiche,
  parseGeneratedContent,
} from './utils/contentGenerator';

type MyEasyContentProps = {
  onBackToDashboard?: () => void;
};

export function MyEasyContent({ onBackToDashboard }: MyEasyContentProps) {
  // Content data management
  const content = useContentData();

  // Conversation state
  const [messages, setMessages] = useState<ContentMessage[]>(INITIAL_MESSAGES);
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.NICHE_SELECTION);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ step: number; messages: ContentMessage[] }>
  >([]);

  // UI state
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save conversation snapshot for back navigation
  const saveSnapshot = useCallback(() => {
    setConversationHistory((prev) => [
      ...prev,
      { step: currentStep, messages: [...messages] },
    ]);
  }, [currentStep, messages]);

  // Go back to previous step
  const goBack = useCallback(() => {
    if (conversationHistory.length === 0) return;

    const lastSnapshot = conversationHistory[conversationHistory.length - 1];
    setCurrentStep(lastSnapshot.step);
    setMessages(lastSnapshot.messages);
    setConversationHistory((prev) => prev.slice(0, -1));
  }, [conversationHistory]);

  // Add message to conversation
  const addMessage = useCallback((message: ContentMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Handle niche selection
  const handleNicheSelect = useCallback(
    (niche: BusinessNiche) => {
      saveSnapshot();
      content.updateBusinessNiche(niche);

      const nicheConfig = BUSINESS_NICHES.find((n) => n.id === niche);
      addMessage({
        role: 'user',
        content: nicheConfig?.name || niche,
      });

      addMessage({
        role: 'assistant',
        content: `Otimo! Voce atua no segmento de ${nicheConfig?.name}.\n\nAgora me diz: qual e o nome do seu negocio?`,
      });

      setCurrentStep(CONVERSATION_STEPS.BUSINESS_NAME);
    },
    [saveSnapshot, content, addMessage],
  );

  // Handle tone selection
  const handleToneSelect = useCallback(
    (tone: ContentTone) => {
      saveSnapshot();
      content.updateBrandVoice(tone);

      const toneConfig = CONTENT_TONES.find((t) => t.id === tone);
      addMessage({
        role: 'user',
        content: toneConfig?.name || tone,
      });

      addMessage({
        role: 'assistant',
        content: `Perfeito! Seu tom de comunicacao sera ${toneConfig?.name.toLowerCase()}.\n\nAgora selecione as redes sociais onde voce quer publicar:`,
        showNetworkSelector: true,
      });

      setCurrentStep(CONVERSATION_STEPS.NETWORK_SELECTION);
    },
    [saveSnapshot, content, addMessage],
  );

  // Handle network toggle
  const handleNetworkToggle = useCallback(
    (network: SocialNetwork) => {
      content.toggleNetwork(network);
    },
    [content],
  );

  // Handle confirm networks
  const handleConfirmNetworks = useCallback(() => {
    saveSnapshot();
    const selectedNames = content.contentData.selectedNetworks
      .map((n) => SOCIAL_NETWORKS.find((sn) => sn.id === n)?.name || n)
      .join(', ');

    addMessage({
      role: 'user',
      content: `Redes selecionadas: ${selectedNames}`,
    });

    addMessage({
      role: 'assistant',
      content: `Excelente escolha!\n\nAgora selecione os tipos de conteudo que voce quer criar:`,
      showContentTypeSelector: true,
    });

    setCurrentStep(CONVERSATION_STEPS.CONTENT_TYPE_SELECTION);
  }, [saveSnapshot, content.contentData.selectedNetworks, addMessage]);

  // Handle content type toggle
  const handleContentTypeToggle = useCallback(
    (contentType: ContentType) => {
      content.toggleContentType(contentType);
    },
    [content],
  );

  // Handle confirm content types and generate
  const handleConfirmContentTypes = useCallback(async () => {
    saveSnapshot();
    const selectedNames = content.contentData.selectedContentTypes
      .map((ct) => CONTENT_TYPES.find((c) => c.id === ct)?.name || ct)
      .join(', ');

    addMessage({
      role: 'user',
      content: `Tipos selecionados: ${selectedNames}`,
    });

    addMessage({
      role: 'assistant',
      content: `Otimo! Agora me conte sobre o que voce quer criar conteudo.\n\nQual e o tema ou assunto principal?`,
    });

    setCurrentStep(CONVERSATION_STEPS.TOPIC_INPUT);
  }, [saveSnapshot, content.contentData.selectedContentTypes, addMessage]);

  // Handle send message (text input)
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    saveSnapshot();
    addMessage({
      role: 'user',
      content: userMessage,
    });

    switch (currentStep) {
      case CONVERSATION_STEPS.BUSINESS_NAME:
        content.updateBusinessName(userMessage);
        addMessage({
          role: 'assistant',
          content: `Legal, ${userMessage}!\n\nE quem e seu publico-alvo? Descreva brevemente para quem voce vende.`,
        });
        setCurrentStep(CONVERSATION_STEPS.TARGET_AUDIENCE);
        break;

      case CONVERSATION_STEPS.TARGET_AUDIENCE:
        content.updateTargetAudience(userMessage);
        addMessage({
          role: 'assistant',
          content: `Entendi! Seu publico e: ${userMessage}\n\nAgora escolha o tom de voz para seus conteudos:`,
          showToneSelector: true,
        });
        setCurrentStep(CONVERSATION_STEPS.TONE_SELECTION);
        break;

      case CONVERSATION_STEPS.TOPIC_INPUT:
        content.updateCurrentTopic(userMessage);
        addMessage({
          role: 'assistant',
          content: `Tema: "${userMessage}"\n\nQual e o objetivo desse conteudo? (Ex: gerar engajamento, vender, educar, entreter)`,
        });
        setCurrentStep(CONVERSATION_STEPS.OBJECTIVE_INPUT);
        break;

      case CONVERSATION_STEPS.OBJECTIVE_INPUT:
        content.updateCurrentObjective(userMessage);
        await generateContent(userMessage);
        break;

      default:
        // Allow free-form conversation for regeneration or new content
        if (currentStep === CONVERSATION_STEPS.RESULT) {
          content.updateCurrentTopic(userMessage);
          addMessage({
            role: 'assistant',
            content: `Novo tema: "${userMessage}"\n\nQual e o objetivo desse conteudo?`,
          });
          setCurrentStep(CONVERSATION_STEPS.OBJECTIVE_INPUT);
        }
        break;
    }
  }, [inputMessage, currentStep, content, saveSnapshot, addMessage]);

  // Generate content using AI
  const generateContent = useCallback(
    async (objective: string) => {
      setIsGenerating(true);
      setCurrentStep(CONVERSATION_STEPS.GENERATING);

      addMessage({
        role: 'assistant',
        content: `Gerando seu conteudo... Isso pode levar alguns segundos.`,
      });

      try {
        // Generate content for each selected type and network combination
        const generatedContents: GeneratedContent[] = [];

        for (const contentType of content.contentData.selectedContentTypes) {
          for (const network of content.contentData.selectedNetworks) {
            // Special handling for calendar
            if (contentType === 'calendar') {
              const calendar = generateCalendarEntries(
                new Date(),
                content.contentData.selectedNetworks,
                content.contentData.businessNiche,
                3,
              );
              content.setCalendar(calendar);
              continue;
            }

            // Special handling for ideas
            if (contentType === 'ideas') {
              const ideas = generateContentIdeas(
                content.contentData.businessNiche,
                content.contentData.selectedNetworks,
              );
              content.setIdeas(ideas);
              continue;
            }

            // Special handling for hashtags
            if (contentType === 'hashtags') {
              const hashtags = getHashtagsForNiche(
                content.contentData.businessNiche,
              );
              const hashtagContent: GeneratedContent = {
                id: generateId(),
                type: 'hashtags',
                network,
                title: `Hashtags para ${content.contentData.businessName}`,
                content: `Aqui estao as hashtags sugeridas para o seu nicho de ${content.contentData.businessNiche}:`,
                hashtags,
                createdAt: new Date(),
              };
              generatedContents.push(hashtagContent);
              continue;
            }

            // For other content types, simulate AI generation
            // In a real implementation, this would call the AI API
            const prompt = buildContentPrompt(
              {
                contentType,
                network,
                topic: content.contentData.currentTopic,
                objective,
                tone: content.contentData.brandVoice,
                includeHashtags: true,
                includeImageDescription: true,
                includeBestTime: true,
                generateVariations: true,
                variationCount: 2,
              },
              {
                name: content.contentData.businessName,
                niche: content.contentData.businessNiche,
                audience: content.contentData.targetAudience,
                tone: content.contentData.brandVoice,
              },
            );

            // Simulate AI response (in production, call actual API)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockResponse = generateMockContent(
              contentType,
              network,
              content.contentData.currentTopic,
              content.contentData.businessName,
              content.contentData.businessNiche,
              content.contentData.brandVoice,
            );

            const parsedContent = parseGeneratedContent(mockResponse, {
              contentType,
              network,
              topic: content.contentData.currentTopic,
            });

            generatedContents.push(parsedContent);
          }
        }

        // Add all generated contents
        for (const generatedContent of generatedContents) {
          content.addGeneratedContent(generatedContent);
        }

        addMessage({
          role: 'assistant',
          content: `Pronto! Gerei ${generatedContents.length} conteudo(s) para voce!\n\nConfira no painel ao lado. Voce pode:\n- Copiar com 1 clique\n- Salvar na biblioteca\n- Gerar variacoes\n\nQuer criar mais conteudo? Me diz o proximo tema!`,
        });

        setCurrentStep(CONVERSATION_STEPS.RESULT);
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: `Ops! Ocorreu um erro ao gerar o conteudo. Por favor, tente novamente.`,
        });
        setCurrentStep(CONVERSATION_STEPS.TOPIC_INPUT);
      } finally {
        setIsGenerating(false);
      }
    },
    [content, addMessage],
  );

  // Save content to library
  const handleSaveContent = useCallback(
    (generatedContent: GeneratedContent) => {
      content.saveContent(generatedContent);
    },
    [content],
  );

  // Regenerate content
  const handleRegenerateContent = useCallback(
    async (oldContent: GeneratedContent) => {
      setIsGenerating(true);

      // Remove old content
      content.removeGeneratedContent(oldContent.id);

      // Generate new version
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockResponse = generateMockContent(
        oldContent.type,
        oldContent.network,
        oldContent.title,
        content.contentData.businessName,
        content.contentData.businessNiche,
        content.contentData.brandVoice,
      );

      const newContent = parseGeneratedContent(mockResponse, {
        contentType: oldContent.type,
        network: oldContent.network,
        topic: oldContent.title,
      });

      content.addGeneratedContent(newContent);
      setIsGenerating(false);
    },
    [content],
  );

  // Export calendar
  const handleExportCalendar = useCallback(
    (format: 'csv' | 'json') => {
      const exported = exportCalendar(content.contentData.calendar, format);
      const blob = new Blob([exported], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendario-editorial.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [content.contentData.calendar],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-orange-900/20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                  MyEasyContent
                </span>
                <p className="text-xs text-slate-400">
                  Criador de Conteudo para Redes Sociais
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onBackToDashboard
                    ? onBackToDashboard()
                    : (window.location.href = '/')
                }
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        <ContentChatPanel
          messages={messages}
          currentStep={currentStep}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isGenerating={isGenerating}
          selectedNetworks={content.contentData.selectedNetworks}
          selectedContentTypes={content.contentData.selectedContentTypes}
          canGoBack={conversationHistory.length > 0}
          onSendMessage={handleSendMessage}
          onNicheSelect={handleNicheSelect}
          onToneSelect={handleToneSelect}
          onNetworkToggle={handleNetworkToggle}
          onContentTypeToggle={handleContentTypeToggle}
          onConfirmNetworks={handleConfirmNetworks}
          onConfirmContentTypes={handleConfirmContentTypes}
          onGoBack={goBack}
          messagesEndRef={messagesEndRef}
        />

        <ContentPreview
          contentData={content.contentData}
          isGenerating={isGenerating}
          onSaveContent={handleSaveContent}
          onRegenerateContent={handleRegenerateContent}
          onExportCalendar={handleExportCalendar}
        />
      </div>
    </div>
  );
}

// Mock content generation (replace with actual AI API call in production)
function generateMockContent(
  contentType: ContentType,
  network: SocialNetwork,
  topic: string,
  businessName: string,
  niche: BusinessNiche,
  tone: ContentTone,
): string {
  const toneEmojis: Record<ContentTone, string> = {
    professional: '',
    casual: '',
    funny: '',
    inspirational: '',
    educational: '',
    promotional: '',
  };

  const templates: Record<ContentType, string> = {
    feed_post: `${topic}

Voce sabia que ${topic.toLowerCase()} pode transformar seu dia a dia?

Na ${businessName}, acreditamos que cada detalhe faz a diferenca. Por isso, estamos sempre buscando as melhores solucoes para voce.

O que voce acha? Conta pra gente nos comentarios!

#${niche} #${businessName.replace(/\s+/g, '')} #conteudo #dicas`,

    caption: `${topic}

Essa e a nossa missao aqui na ${businessName}!

Curte ai se voce concorda!`,

    story: `STORY 1:
Titulo: "${topic}"
Texto: "Voce ja pensou nisso?"
CTA: Enquete - Sim / Nao

STORY 2:
Titulo: "A verdade e que..."
Texto: Explicacao sobre ${topic}
CTA: Deslize para cima

STORY 3:
Titulo: "${businessName}"
Texto: "Estamos aqui pra te ajudar!"
CTA: Link nos comentarios`,

    reel: `ROTEIRO DE REEL

GANCHO (0-3s):
"Voce precisa saber disso sobre ${topic}!"

DESENVOLVIMENTO (3-15s):
- Ponto 1: Apresente o problema
- Ponto 2: Mostre a solucao
- Ponto 3: De um exemplo pratico

CTA (15-30s):
"Salva esse video e manda pra alguem que precisa ver isso!"

MUSICA: Trending audio
HASHTAGS: #${niche} #dicas #viral`,

    calendar: '',
    ideas: '',
    hashtags: '',
    best_times: `MELHORES HORARIOS PARA POSTAR:

Segunda a Sexta:
- Manha: 7h - 9h (alta)
- Almoco: 12h - 14h (media)
- Noite: 19h - 21h (alta)

Fins de Semana:
- Sabado: 11h - 13h (media)
- Domingo: 17h - 19h (media)`,
  };

  return templates[contentType] || `Conteudo sobre ${topic} para ${businessName}`;
}

export default MyEasyContent;
