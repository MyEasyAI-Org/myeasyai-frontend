import * as flags from 'country-flag-icons/react/3x2';
import {
  ArrowLeft,
  Eye,
  Rocket,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NetlifyDeploy } from '../../components/NetlifyDeploy';
import { SiteEditor } from '../../components/SiteEditor';
import type { CountryAddressConfig } from '../../constants/countries';
import { useAddressManagement } from './hooks/useAddressManagement';
import { useColorPalettes } from './hooks/useColorPalettes';
import { useConversationFlow } from './hooks/useConversationFlow';
import { useSiteData } from './hooks/useSiteData';
import { ChatPanel } from './components/ChatPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { InputModal } from './components/modals/InputModal';
import { SectionsEditModal } from './components/modals/SectionsEditModal';
import { ColorsEditModal } from './components/modals/ColorsEditModal';
import { useMyEasyWebsiteHandlers } from './handlers/useMyEasyWebsiteHandlers';
import { generateSiteHTML } from './utils/siteGenerator';

type MyEasyWebsiteProps = {
  onBackToDashboard?: () => void;
};

export function MyEasyWebsite({ onBackToDashboard }: MyEasyWebsiteProps = {}) {
  // Custom hooks - Centralized state management
  const colorPalettes = useColorPalettes();
  const addressManagement = useAddressManagement();

  // Conversation flow management
  const conversation = useConversationFlow({
    initialStep: 0,
    autoScroll: true,
    initialMessages: [
      {
        role: 'assistant',
        content:
          '👋 Olá! Sou seu assistente de criação de sites.\n\nVamos criar um site profissional para sua empresa!\n\nPara começar, escolha a área de atuação do seu negócio:',
        options: [
          { label: 'Tecnologia', value: 'technology', icon: 'Laptop' },
          { label: 'Varejo', value: 'retail', icon: 'Store' },
          { label: 'Serviços', value: 'services', icon: 'Handshake' },
          { label: 'Alimentação', value: 'food', icon: 'Utensils' },
          { label: 'Saúde', value: 'health', icon: 'Heart' },
          { label: 'Educação', value: 'education', icon: 'GraduationCap' },
        ],
      },
    ],
  });

  // Site data management
  const site = useSiteData({
    area: '',
    name: '',
    slogan: '',
    description: '',
    vibe: '',
    colors: '',
    selectedPaletteId: undefined,
    sections: [],
    services: [],
    gallery: [],
    appPlayStore: '',
    appAppStore: '',
    showPlayStore: false,
    showAppStore: false,
    testimonials: [],
    address: '',
    phone: '',
    email: '',
    faq: [
      {
        question: 'Como posso agendar um horário?',
        answer: 'Você pode agendar através do nosso site, app ou WhatsApp.',
      },
      {
        question: 'Quais são as formas de pagamento?',
        answer: 'Aceitamos dinheiro, cartão de crédito/débito e PIX.',
      },
      {
        question: 'Vocês atendem aos finais de semana?',
        answer: 'Sim, atendemos de segunda a sábado, das 9h às 18h.',
      },
    ],
    pricing: [
      {
        name: 'Básico',
        price: 'R$ 99',
        features: ['Atendimento básico', 'Produtos padrão', 'Sem agendamento'],
      },
      {
        name: 'Premium',
        price: 'R$ 199',
        features: [
          'Atendimento premium',
          'Produtos premium',
          'Agendamento prioritário',
          'Brindes exclusivos',
        ],
      },
      {
        name: 'VIP',
        price: 'R$ 299',
        features: [
          'Atendimento VIP',
          'Produtos top de linha',
          'Agendamento exclusivo',
          'Tratamento especial',
          'Benefícios extras',
        ],
      },
    ],
    team: [
      { name: 'João Silva', role: 'CEO & Fundador' },
      { name: 'Maria Santos', role: 'Diretora de Operações' },
      { name: 'Pedro Costa', role: 'Gerente de Atendimento' },
    ],
  });

  // UI-only states
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sitePreviewUrl, setSitePreviewUrl] = useState(
    'https://seu-site.netlify.app',
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showNetlifyModal, setShowNetlifyModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [summaryMessageIndex, setSummaryMessageIndex] = useState<number | null>(
    null,
  );
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputModalConfig, setInputModalConfig] = useState<{
    title: string;
    placeholder: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    multiline?: boolean;
  } | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função auxiliar para abrir modal de entrada
  const openInputModal = (config: {
    title: string;
    placeholder: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    multiline?: boolean;
  }) => {
    setInputModalConfig(config);
    setModalInputValue(config.defaultValue);
    setShowInputModal(true);
  };

  // Função para fechar modal de entrada
  const closeInputModal = () => {
    setShowInputModal(false);
    setInputModalConfig(null);
    setModalInputValue('');
  };

  // Função para confirmar entrada do modal
  const handleConfirmInput = () => {
    if (inputModalConfig && modalInputValue.trim()) {
      inputModalConfig.onConfirm(modalInputValue.trim());
    }
    closeInputModal();
  };

  // Função para voltar para o estado anterior
  const goBack = () => {
    if (!conversation.canGoBack) return;

    const lastSnapshot = conversation.conversationHistory[conversation.conversationHistory.length - 1];
    conversation.goBack();
    site.setAllSiteData(lastSnapshot.data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  // Helper para renderizar bandeiras SVG
  const FlagIcon = ({
    countryCode,
    className = 'w-6 h-4',
  }: {
    countryCode: string;
    className?: string;
  }) => {
    const Flag = flags[countryCode as keyof typeof flags];
    if (!Flag) return null;
    return <Flag className={className} />;
  };

  // Função para formatar telefone baseado no país
  const formatPhoneNumber = (
    phone: string,
    country: CountryAddressConfig,
  ): string => {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = '';
    let phoneIndex = 0;

    for (
      let i = 0;
      i < country.phoneFormat.length && phoneIndex < cleaned.length;
      i++
    ) {
      if (country.phoneFormat[i] === '#') {
        formatted += cleaned[phoneIndex];
        phoneIndex++;
      } else {
        formatted += country.phoneFormat[i];
      }
    }

    return formatted || cleaned;
  };

  // Handlers usando custom hook
  const handlers = useMyEasyWebsiteHandlers({
    conversation,
    site,
    colorPalettes,
    addressManagement,
    inputMessage,
    setInputMessage,
    setUploadedImages,
    setIsGenerating,
    setGeneratedSite,
    setSitePreviewUrl,
    setShowSummary,
    setSummaryMessageIndex,
  });

  // Extrair funções auxiliares que são usadas no ChatPanel
  const askSectionQuestions = () => {
    const sections = site.siteData.sections;

    // Perguntas para Serviços
    if (sections.includes('services') && site.siteData.services.length === 0) {
      conversation.addMessage({
        role: 'assistant',
        content:
          '📋 Vamos configurar a seção de SERVIÇOS\n\nListe seus serviços separados por vírgula.\n\n(Exemplo: Corte Premium, Barboterapia, Hidratação Capilar)',
      });
      conversation.goToStep(7);
      return;
    }

    // Perguntas para Galeria
    if (sections.includes('gallery') && site.siteData.gallery.length === 0) {
      conversation.addMessage({
        role: 'assistant',
        content:
          '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
        requiresImages: true,
      });
      conversation.goToStep(7);
      return;
    }

    // Perguntas para Contato
    if (sections.includes('contact') && !site.siteData.address) {
      conversation.addMessage({
        role: 'assistant',
        content:
          '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?',
      });
      conversation.goToStep(7);
      return;
    }

    // SEMPRE mostrar resumo antes de gerar o site
    setShowSummary(true);
    conversation.addMessage({
      role: 'assistant',
      content:
        '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
    });
    setSummaryMessageIndex(conversation.messagesCount);
    conversation.goToStep(9.5);
  };

  const handlePublishToNetlify = () => {
    setShowNetlifyModal(true);
  };

  const handleDeploySuccess = (deployedSite: any) => {
    setSitePreviewUrl(deployedSite.url);
    setShowNetlifyModal(false);

    conversation.addMessage({
      role: 'assistant',
      content: `🎉 Site publicado com sucesso!\n\nSeu site está disponível em:\n${deployedSite.url}\n\nVocê pode acessá-lo agora mesmo e compartilhar com seus clientes!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
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
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                  MyEasyWebsite
                </span>
                <p className="text-xs text-slate-400">
                  Criador de Sites Inteligente com IA
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {generatedSite && (
                <>
                  <button
                    onClick={() => window.open(sitePreviewUrl, '_blank')}
                    className="flex items-center space-x-2 rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-blue-400 hover:bg-blue-600/20 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Abrir Site</span>
                  </button>
                  <button
                    onClick={handlePublishToNetlify}
                    className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg shadow-purple-500/50"
                  >
                    <Rocket className="h-4 w-4" />
                    <span>Publicar no Netlify</span>
                  </button>
                </>
              )}
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
        <ChatPanel
          conversation={conversation}
          site={site}
          colorPalettes={colorPalettes}
          addressManagement={addressManagement}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          showCountryDropdown={showCountryDropdown}
          setShowCountryDropdown={setShowCountryDropdown}
          showSummary={showSummary}
          summaryMessageIndex={summaryMessageIndex}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          isGenerating={isGenerating}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          editingField={editingField}
          setEditingField={setEditingField}
          handleAreaSelect={handlers.handleAreaSelect}
          handleVibeSelect={handlers.handleVibeSelect}
          handleSendMessage={handlers.handleSendMessage}
          handleColorCategorySelect={handlers.handleColorCategorySelect}
          handlePaletteSelect={handlers.handlePaletteSelect}
          handleSectionSelect={handlers.handleSectionSelect}
          handleConfirmSections={handlers.handleConfirmSections}
          handleImageUpload={handlers.handleImageUpload}
          handleCustomColors={handlers.handleCustomColors}
          confirmAddress={handlers.confirmAddress}
          correctAddress={handlers.correctAddress}
          openInputModal={openInputModal}
          goBack={goBack}
          handleGenerateSite={handlers.handleGenerateSite}
          askSectionQuestions={askSectionQuestions}
          fileInputRef={fileInputRef}
          messagesEndRef={messagesEndRef}
        />

        <PreviewPanel
          site={site}
          generatedSite={generatedSite}
          sitePreviewUrl={sitePreviewUrl}
          isGenerating={isGenerating}
          showEditor={showEditor}
          setShowEditor={setShowEditor}
        />
      </div>

      {/* Site Editor */}
      {showEditor && (
        <SiteEditor
          siteData={site.siteData}
          onUpdate={(updatedData) => {
            site.setAllSiteData(updatedData);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Input Modal */}
      {showInputModal && inputModalConfig && (
        <InputModal
          isOpen={showInputModal}
          config={inputModalConfig}
          value={modalInputValue}
          onChange={setModalInputValue}
          onConfirm={handleConfirmInput}
          onClose={closeInputModal}
        />
      )}

      {/* Sections Edit Modal */}
      {showEditModal && editingField === 'sections' && (
        <SectionsEditModal
          isOpen={showEditModal}
          sections={site.siteData.sections}
          onToggleSection={handlers.handleSectionSelect}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
        />
      )}

      {/* Colors Edit Modal */}
      {showEditModal && editingField === 'colors' && (
        <ColorsEditModal
          isOpen={showEditModal}
          selectedPaletteId={site.siteData.selectedPaletteId}
          palettes={colorPalettes.getAllPalettes()}
          onSelectPalette={handlers.handlePaletteSelect}
          onCustomColors={handlers.handleCustomColors}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
        />
      )}

      {/* Netlify Deploy Modal */}
      {showNetlifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Rocket className="h-6 w-6 text-purple-400" />
                  <span>Publicar no Netlify</span>
                </h2>
                <button
                  onClick={() => setShowNetlifyModal(false)}
                  className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                >
                  Fechar
                </button>
              </div>

              <NetlifyDeploy
                htmlContent={generateSiteHTML(site.siteData, site)}
                siteName={site.siteData.name
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')}
                onDeploySuccess={handleDeploySuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
