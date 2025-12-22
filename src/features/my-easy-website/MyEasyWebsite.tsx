import * as flags from 'country-flag-icons/react/3x2';
import {
  ArrowLeft,
  Cloud,
  Eye,
  Loader2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CloudflareDeploy } from '../../components/CloudflareDeploy';
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
import { useUserSite } from './hooks/useUserSite';
import { ExistingSitePanel } from './components/ExistingSitePanel';
import { generateSiteHTML } from './utils/siteGenerator';
import { siteManagementService, type SiteSettings } from '../../services/SiteManagementService';

type MyEasyWebsiteProps = {
  onBackToDashboard?: () => void;
  onGoToSubscription?: () => void;
};

export function MyEasyWebsite({ onBackToDashboard, onGoToSubscription }: MyEasyWebsiteProps = {}) {
  // Custom hooks - Centralized state management
  const colorPalettes = useColorPalettes();
  const addressManagement = useAddressManagement();
  const userSite = useUserSite();

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
  const [showExistingSitePanel, setShowExistingSitePanel] = useState(true); // Mostrar painel de projeto existente
  const [sitePreviewUrl, setSitePreviewUrl] = useState(
    'https://seu-site.myeasyai.com',
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
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

  // Estado do site atual sendo editado (para saber se é novo ou existente)
  const [currentEditingSiteId, setCurrentEditingSiteId] = useState<number | null>(null);
  const [currentEditingSiteSlug, setCurrentEditingSiteSlug] = useState<string | null>(null);
  const [currentEditingSiteStatus, setCurrentEditingSiteStatus] = useState<'building' | 'active' | 'inactive' | null>(null);

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
    onSiteCreated: (createdSite) => {
      // Atualizar estado local com o site criado
      setCurrentEditingSiteId(createdSite.id ?? null);
      setCurrentEditingSiteSlug(createdSite.slug);
      setCurrentEditingSiteStatus(createdSite.status || 'building');
      // Recarregar lista de sites
      userSite.loadAllSites();
    },
  });

  // A função askSectionQuestions agora vem do hook handlers
  // para evitar duplicação e usar a versão com parâmetros skipServices/skipGallery

  const handlePublishSite = () => {
    setShowDeployModal(true);
  };

  const handleDeploySuccess = (result: { url: string; slug?: string }) => {
    setSitePreviewUrl(result.url);
    setShowDeployModal(false);

    // Após publicação bem-sucedida, marcar como 'active' para travar o slug nas próximas vezes
    setCurrentEditingSiteStatus('active');

    // Se o slug mudou (primeira publicação), atualizar o slug atual
    if (result.slug) {
      setCurrentEditingSiteSlug(result.slug);
    }

    // Recarregar lista de sites para refletir as mudanças
    userSite.loadAllSites();

    conversation.addMessage({
      role: 'assistant',
      content: `Site publicado com sucesso!\n\nSeu site está disponível em:\n${result.url}\n\nVocê pode acessá-lo agora mesmo e compartilhar com seus clientes!`,
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
                    onClick={handlePublishSite}
                    className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 text-white hover:from-orange-600 hover:to-amber-700 transition-colors shadow-lg shadow-orange-500/50"
                  >
                    <Cloud className="h-4 w-4" />
                    <span>Publicar Site</span>
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
        {/* Loading inicial - enquanto carrega os dados do usuário */}
        {userSite.isLoading && showExistingSitePanel && (
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-orange-400 animate-spin" />
              <p className="text-slate-400 text-lg">Carregando seus sites...</p>
            </div>
          </div>
        )}

        {/* Painel de projeto existente - mostra lista de sites ou cria novo */}
        {!userSite.isLoading && showExistingSitePanel && (userSite.hasExistingSite || userSite.allUserSites.length > 0) && (
          <div className="w-full flex items-start justify-center overflow-auto py-6">
            <ExistingSitePanel
              sites={userSite.allUserSites}
              currentSite={userSite.userSite}
              siteSettings={userSite.siteSettings}
              isLoading={userSite.isLoading}
              canCreateMore={userSite.canCreateSite}
              sitesCount={userSite.sitesCount}
              sitesLimit={userSite.sitesLimit}
              onContinueEditing={(selectedSite) => {
                // Selecionar o site e carregar no preview
                userSite.selectSite(selectedSite);
                // Marcar como site existente
                setCurrentEditingSiteId(selectedSite.id ?? null);
                setCurrentEditingSiteSlug(selectedSite.slug);
                setCurrentEditingSiteStatus(selectedSite.status || 'building');

                const settings = selectedSite.settings
                  ? (typeof selectedSite.settings === 'string' ? JSON.parse(selectedSite.settings) : selectedSite.settings)
                  : null;

                if (settings) {
                  // Restaurar TODOS os dados do site para o estado local
                  site.setAllSiteData({
                    area: settings.area || '',
                    name: settings.businessName || selectedSite.name || '',
                    slogan: settings.tagline || '',
                    description: settings.description || '',
                    vibe: settings.vibe || 'vibrant',
                    colors: settings.colors || JSON.stringify({
                      primary: '#6366F1',
                      secondary: '#8B5CF6',
                      accent: '#EC4899',
                      dark: '#1E293B',
                      light: '#F1F5F9',
                    }),
                    selectedPaletteId: settings.selectedPaletteId,
                    sections: settings.sections || [],
                    services: settings.services || [],
                    gallery: settings.gallery || [],
                    appPlayStore: settings.appPlayStore || '',
                    appAppStore: settings.appAppStore || '',
                    showPlayStore: settings.showPlayStore || false,
                    showAppStore: settings.showAppStore || false,
                    testimonials: settings.testimonials || [],
                    address: settings.address || '',
                    phone: settings.phone || '',
                    email: settings.email || '',
                    faq: settings.faq || [],
                    pricing: settings.pricing || [],
                    team: settings.team || [],
                    heroStats: settings.heroStats,
                    features: settings.features,
                    aboutContent: settings.aboutContent,
                    serviceDescriptions: settings.serviceDescriptions,
                  });

                  // Restaurar estado da conversa (se houver)
                  if (settings.conversationMessages && Array.isArray(settings.conversationMessages)) {
                    conversation.setAllMessages(settings.conversationMessages);
                  }
                  if (typeof settings.conversationStep === 'number') {
                    conversation.goToStep(settings.conversationStep);
                  }

                  // Carregar o HTML gerado para o preview
                  if (settings.generatedHtml) {
                    setGeneratedSite(settings.generatedHtml);
                  }
                }

                const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
                setSitePreviewUrl(`https://${selectedSite.slug}.${domain}`);
                setShowExistingSitePanel(false);
              }}
              onStartNew={() => {
                // Limpar estado - é um site novo, sem slug travado
                setCurrentEditingSiteId(null);
                setCurrentEditingSiteSlug(null);
                setCurrentEditingSiteStatus(null);
                setGeneratedSite(null);
                setShowExistingSitePanel(false);
              }}
              onDeleteSite={async (siteId) => {
                await userSite.deleteSite(siteId);
              }}
              onUpgrade={() => {
                // Navegar para página de planos (aba Assinatura)
                onGoToSubscription?.();
              }}
            />
          </div>
        )}

        {/* Chat e Preview - só mostra se não tem sites ou usuario escolheu criar/editar */}
        {!userSite.isLoading && (!showExistingSitePanel || (userSite.allUserSites.length === 0 && !userSite.hasExistingSite)) && (
          <>
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
              handleTemplateSelect={handlers.handleTemplateSelect}
              handleSectionSelect={handlers.handleSectionSelect}
              handleConfirmSections={handlers.handleConfirmSections}
              handleImageUpload={handlers.handleImageUpload}
              handleCustomColors={handlers.handleCustomColors}
              confirmAddress={handlers.confirmAddress}
              correctAddress={handlers.correctAddress}
              openInputModal={openInputModal}
              goBack={goBack}
              handleGenerateSite={handlers.handleGenerateSite}
              askSectionQuestions={handlers.askSectionQuestions}
              handleBusinessHoursSelect={handlers.handleBusinessHoursSelect}
              handleBusinessHoursCustom={handlers.handleBusinessHoursCustom}
              handleLogoOption={handlers.handleLogoOption}
              handleLogoUpload={handlers.handleLogoUpload}
              handlePricingOption={handlers.handlePricingOption}
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
          </>
        )}
      </div>

      {/* Site Editor */}
      {showEditor && (
        <SiteEditor
          siteData={site.siteData}
          onUpdate={async (updatedData) => {
            // Atualizar estado local
            site.setAllSiteData(updatedData);

            // Persistir no banco de dados se tivermos um site existente
            if (currentEditingSiteId && currentEditingSiteSlug) {
              try {
                // Regenerar o HTML com os novos dados
                const generatedHtml = generateSiteHTML(updatedData, { siteData: updatedData });

                // Montar o objeto completo de settings
                const fullSiteData = {
                  // Dados básicos
                  businessName: updatedData.name,
                  tagline: updatedData.slogan,
                  description: updatedData.description,
                  phone: updatedData.phone,
                  email: updatedData.email,
                  address: updatedData.address,

                  // Configurações visuais
                  colors: updatedData.colors,
                  selectedPaletteId: updatedData.selectedPaletteId,
                  vibe: updatedData.vibe,
                  area: updatedData.area,

                  // Seções e conteúdo
                  sections: updatedData.sections,
                  services: updatedData.services,
                  serviceDescriptions: updatedData.serviceDescriptions,
                  gallery: updatedData.gallery,
                  faq: updatedData.faq,
                  pricing: updatedData.pricing,
                  team: updatedData.team,
                  testimonials: updatedData.testimonials,
                  heroStats: updatedData.heroStats,
                  features: updatedData.features,
                  aboutContent: updatedData.aboutContent,

                  // Apps
                  appPlayStore: updatedData.appPlayStore,
                  appAppStore: updatedData.appAppStore,
                  showPlayStore: updatedData.showPlayStore,
                  showAppStore: updatedData.showAppStore,

                  // HTML gerado
                  generatedHtml,

                  // Estado da conversa (manter o estado atual)
                  conversationMessages: conversation.messages,
                  conversationStep: conversation.currentStep,
                };

                const result = await siteManagementService.updateSite(
                  currentEditingSiteId,
                  currentEditingSiteSlug,
                  { settings: JSON.stringify(fullSiteData) }
                );

                if (result.success) {
                  console.log('✅ [SiteEditor] Site salvo no banco:', currentEditingSiteSlug);
                  // Recarregar lista de sites para refletir as mudanças
                  userSite.loadAllSites();
                } else {
                  console.error('❌ [SiteEditor] Erro ao salvar site:', result.error);
                }
              } catch (err) {
                console.error('❌ [SiteEditor] Erro ao persistir alterações:', err);
              }
            }
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

      {/* Cloudflare Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CloudflareDeploy
                htmlContent={generateSiteHTML(site.siteData, site)}
                siteName={site.siteData.name
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')}
                siteSettings={{
                  businessName: site.siteData.name,
                  tagline: site.siteData.slogan,
                  description: site.siteData.description,
                  phone: site.siteData.phone,
                  email: site.siteData.email,
                  address: site.siteData.address,
                  theme: {
                    primaryColor: site.siteData.colors?.split(',')[0]?.trim(),
                    secondaryColor: site.siteData.colors?.split(',')[1]?.trim(),
                  },
                } as SiteSettings}
                onDeploySuccess={handleDeploySuccess}
                onClose={() => setShowDeployModal(false)}
                editingSiteId={currentEditingSiteId}
                editingSiteSlug={currentEditingSiteSlug}
                siteStatus={currentEditingSiteStatus}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
