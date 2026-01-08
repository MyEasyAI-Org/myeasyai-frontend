import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BusinessNiche,
  ContentBusinessProfile,
  ContentMessage,
  ContentTone,
  ContentType,
  CreateContentProfileInput,
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
import { useContentProfiles } from './hooks/useContentProfiles';
import { useContentLibrary } from './hooks/useContentLibrary';
import { ContentChatPanel } from './components/ContentChatPanel';
import { ContentPreview } from './components/ContentPreview';
import { ProfileSelector } from './components/ProfileSelector';
import { CreateProfileModal } from './components/CreateProfileModal';
import {
  exportCalendar,
  generateCalendarEntries,
  generateContentIdeas,
} from './utils/contentGenerator';
import { socialContentService } from '../../services/SocialContentService';
import { useUserData } from '../../hooks/useUserData';

type MyEasyContentProps = {
  onBackToDashboard?: () => void;
};

export function MyEasyContent({ onBackToDashboard }: MyEasyContentProps) {
  // User data for profile management
  const { userUuid } = useUserData();

  // Content profiles management
  const {
    profiles,
    currentProfile,
    isLoading: isLoadingProfiles,
    isSaving: isSavingProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
  } = useContentProfiles(userUuid);

  // Content library management
  const {
    items: libraryItems,
    isLoading: libraryIsLoading,
    filters: libraryFilters,
    saveContent: saveToLibrary,
    toggleFavorite: toggleLibraryFavorite,
    deleteItem: deleteLibraryItem,
    updateFilters: updateLibraryFilters,
    clearFilters: clearLibraryFilters,
  } = useContentLibrary(currentProfile?.id || null, userUuid);

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ContentBusinessProfile | null>(null);

  // Content data management
  const content = useContentData();

  // Conversation state
  const [messages, setMessages] = useState<ContentMessage[]>(INITIAL_MESSAGES);
  const [currentStep, setCurrentStep] = useState<number>(CONVERSATION_STEPS.NICHE_SELECTION);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ step: number; messages: ContentMessage[] }>
  >([]);

  // UI state
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Track if we've already applied the initial profile
  const [hasAppliedInitialProfile, setHasAppliedInitialProfile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply initial profile when loaded - skip initial questions
  useEffect(() => {
    // Only run once when profile is first loaded
    if (
      !hasAppliedInitialProfile &&
      !isLoadingProfiles &&
      currentProfile &&
      currentStep === CONVERSATION_STEPS.NICHE_SELECTION
    ) {
      setHasAppliedInitialProfile(true);

      // Apply profile data to content state
      if (currentProfile.business_niche) {
        content.updateBusinessNiche(currentProfile.business_niche);
      }
      if (currentProfile.target_audience) {
        content.updateTargetAudience(currentProfile.target_audience);
      }
      if (currentProfile.brand_voice) {
        content.updateBrandVoice(currentProfile.brand_voice);
      }
      if (currentProfile.selected_networks && currentProfile.selected_networks.length > 0) {
        content.setNetworks(currentProfile.selected_networks);
      }
      if (currentProfile.preferred_content_types && currentProfile.preferred_content_types.length > 0) {
        content.setContentTypes(currentProfile.preferred_content_types);
      }

      // Build profile summary
      const nicheConfig = BUSINESS_NICHES.find((n) => n.id === currentProfile.business_niche);
      const toneConfig = CONTENT_TONES.find((t) => t.id === currentProfile.brand_voice);
      const networkNames = (currentProfile.selected_networks || [])
        .map((n) => SOCIAL_NETWORKS.find((sn) => sn.id === n)?.name || n)
        .join(', ');

      // Get content type names if profile has them
      const contentTypeNames = (currentProfile.preferred_content_types || [])
        .map((ct) => CONTENT_TYPES.find((c) => c.id === ct)?.name || ct)
        .join(', ');

      // Always show content type selector so user can choose what to generate
      setCurrentStep(CONVERSATION_STEPS.CONTENT_TYPE_SELECTION);
      setMessages([
        {
          role: 'assistant',
          content: `Ola! Estou usando seu perfil **${currentProfile.name}**:\n\n` +
            `- **Nicho:** ${nicheConfig?.name || currentProfile.business_niche}\n` +
            `- **Publico:** ${currentProfile.target_audience || 'Nao definido'}\n` +
            `- **Tom:** ${toneConfig?.name || currentProfile.brand_voice}\n` +
            `- **Redes:** ${networkNames || 'Nenhuma selecionada'}\n` +
            (contentTypeNames ? `- **Tipos preferidos:** ${contentTypeNames}\n` : '') +
            `\nQue tipo de conteudo voce quer criar hoje?`,
          showContentTypeSelector: true,
        },
      ]);
    }
  }, [
    hasAppliedInitialProfile,
    isLoadingProfiles,
    currentProfile,
    currentStep,
    content,
  ]);

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
        content: `Gerando seu conteudo com IA... Isso pode levar alguns segundos.`,
      });

      // Helper to add delay between API calls (avoid rate limiting)
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      try {
        const generatedContents: GeneratedContent[] = [];

        // Filter content types that need AI vs local generation
        const aiContentTypes = content.contentData.selectedContentTypes.filter(
          (ct) => ['feed_post', 'caption', 'story', 'reel'].includes(ct)
        );
        const localContentTypes = content.contentData.selectedContentTypes.filter(
          (ct) => ['calendar', 'ideas', 'hashtags', 'best_times'].includes(ct)
        );

        // Handle local content types first (no API calls)
        for (const contentType of localContentTypes) {
          if (contentType === 'calendar') {
            const calendar = generateCalendarEntries(
              new Date(),
              content.contentData.selectedNetworks,
              content.contentData.businessNiche,
              3,
            );
            content.setCalendar(calendar);
          } else if (contentType === 'ideas') {
            const ideas = generateContentIdeas(
              content.contentData.businessNiche,
              content.contentData.selectedNetworks,
            );
            content.setIdeas(ideas);
          }
          // hashtags and best_times are included in feed_post/caption generation
        }

        // Generate AI content - ALL selected content types for ALL networks
        let callIndex = 0;
        for (const contentType of aiContentTypes) {
          for (const network of content.contentData.selectedNetworks) {
            // Add delay between API calls (except first one)
            if (callIndex > 0) {
              await delay(1500); // 1.5 second delay between calls
            }
            callIndex++;

            try {
              const generatedContent = await socialContentService.generateContent({
                contentType,
                network,
                topic: content.contentData.currentTopic,
                businessName: content.contentData.businessName,
                niche: content.contentData.businessNiche,
                audience: content.contentData.targetAudience,
                tone: content.contentData.brandVoice,
                objective,
                includeHashtags: contentType === 'feed_post' || contentType === 'caption' || contentType === 'reel',
                includeImageDescription: contentType === 'feed_post',
              });

              generatedContents.push(generatedContent);
            } catch (aiError) {
              console.error(`Erro ao gerar ${contentType} para ${network}:`, aiError);
            }
          }
        }

        // Add all generated contents
        for (const generatedContent of generatedContents) {
          content.addGeneratedContent(generatedContent);
        }

        if (generatedContents.length > 0) {
          addMessage({
            role: 'assistant',
            content: `Pronto! Gerei ${generatedContents.length} conteudo(s) para voce!\n\nConfira no painel ao lado. Voce pode:\n- Copiar com 1 clique\n- Salvar na biblioteca\n- Gerar variacoes\n\nQuer criar mais conteudo? Me diz o proximo tema!`,
          });
        } else {
          addMessage({
            role: 'assistant',
            content: `Nao consegui gerar conteudo no momento. Por favor, verifique sua conexao e tente novamente.`,
          });
        }

        setCurrentStep(CONVERSATION_STEPS.RESULT);
      } catch (error) {
        console.error('Erro na geracao de conteudo:', error);
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

  // Save content to library (local state + D1)
  const handleSaveContent = useCallback(
    async (generatedContent: GeneratedContent) => {
      // Save to local state
      content.saveContent(generatedContent);

      // Save to D1 library if profile is selected
      if (currentProfile?.id) {
        await saveToLibrary(generatedContent);
      }
    },
    [content, currentProfile?.id, saveToLibrary],
  );

  // Regenerate content
  const handleRegenerateContent = useCallback(
    async (oldContent: GeneratedContent) => {
      setIsGenerating(true);

      try {
        // Remove old content
        content.removeGeneratedContent(oldContent.id);

        // Generate new version using AI
        const newContent = await socialContentService.generateContent({
          contentType: oldContent.type,
          network: oldContent.network,
          topic: oldContent.title,
          businessName: content.contentData.businessName,
          niche: content.contentData.businessNiche,
          audience: content.contentData.targetAudience,
          tone: content.contentData.brandVoice,
          objective: content.contentData.currentObjective,
          includeHashtags: true,
          includeImageDescription: oldContent.type === 'feed_post',
        });

        content.addGeneratedContent(newContent);
      } catch (error) {
        console.error('Erro ao regenerar conteudo:', error);
      } finally {
        setIsGenerating(false);
      }
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

  // Profile handlers
  const handleCreateProfile = useCallback(() => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  }, []);

  const handleEditProfile = useCallback((profile: ContentBusinessProfile) => {
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  }, []);

  const handleDeleteProfile = useCallback(
    async (profile: ContentBusinessProfile) => {
      await deleteProfile(profile.id);
    },
    [deleteProfile]
  );

  const handleSelectProfile = useCallback(
    (profile: ContentBusinessProfile) => {
      selectProfile(profile);

      // Apply profile settings to content data
      if (profile.business_niche) {
        content.updateBusinessNiche(profile.business_niche);
      }
      if (profile.target_audience) {
        content.updateTargetAudience(profile.target_audience);
      }
      if (profile.brand_voice) {
        content.updateBrandVoice(profile.brand_voice);
      }
      if (profile.selected_networks && profile.selected_networks.length > 0) {
        content.setNetworks(profile.selected_networks);
      }
      if (profile.preferred_content_types && profile.preferred_content_types.length > 0) {
        content.setContentTypes(profile.preferred_content_types);
      }

      // Build profile summary for chat restart
      const nicheConfig = BUSINESS_NICHES.find((n) => n.id === profile.business_niche);
      const toneConfig = CONTENT_TONES.find((t) => t.id === profile.brand_voice);
      const networkNames = (profile.selected_networks || [])
        .map((n) => SOCIAL_NETWORKS.find((sn) => sn.id === n)?.name || n)
        .join(', ');
      const contentTypeNames = (profile.preferred_content_types || [])
        .map((ct) => CONTENT_TYPES.find((c) => c.id === ct)?.name || ct)
        .join(', ');

      // Reset conversation and always show content type selector
      setConversationHistory([]);
      setCurrentStep(CONVERSATION_STEPS.CONTENT_TYPE_SELECTION);
      setMessages([
        {
          role: 'assistant',
          content: `Trocando para o perfil **${profile.name}**:\n\n` +
            `- **Nicho:** ${nicheConfig?.name || profile.business_niche}\n` +
            `- **Publico:** ${profile.target_audience || 'Nao definido'}\n` +
            `- **Tom:** ${toneConfig?.name || profile.brand_voice}\n` +
            `- **Redes:** ${networkNames || 'Nenhuma selecionada'}\n` +
            (contentTypeNames ? `- **Tipos preferidos:** ${contentTypeNames}\n` : '') +
            `\nQue tipo de conteudo voce quer criar hoje?`,
          showContentTypeSelector: true,
        },
      ]);
    },
    [selectProfile, content]
  );

  const handleSaveProfile = useCallback(
    async (input: CreateContentProfileInput) => {
      if (editingProfile) {
        await updateProfile(editingProfile.id, input);
      } else {
        const newProfile = await createProfile(input);
        if (newProfile) {
          handleSelectProfile(newProfile);
        }
      }
      setIsProfileModalOpen(false);
      setEditingProfile(null);
    },
    [editingProfile, updateProfile, createProfile, handleSelectProfile]
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
            <div className="flex items-center space-x-4">
              {/* Profile Selector */}
              <ProfileSelector
                profiles={profiles}
                currentProfile={currentProfile}
                isLoading={isLoadingProfiles}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={handleCreateProfile}
                onEditProfile={handleEditProfile}
                onDeleteProfile={handleDeleteProfile}
              />

              <button
                type="button"
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
          libraryItems={libraryItems}
          libraryIsLoading={libraryIsLoading}
          libraryFilters={libraryFilters}
          onUpdateLibraryFilters={updateLibraryFilters}
          onClearLibraryFilters={clearLibraryFilters}
          onToggleLibraryFavorite={toggleLibraryFavorite}
          onDeleteLibraryItem={deleteLibraryItem}
        />
      </div>

      {/* Create/Edit Profile Modal */}
      <CreateProfileModal
        isOpen={isProfileModalOpen}
        editProfile={editingProfile}
        isSaving={isSavingProfile}
        onClose={() => {
          setIsProfileModalOpen(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default MyEasyContent;
