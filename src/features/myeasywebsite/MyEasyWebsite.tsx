import * as flags from 'country-flag-icons/react/3x2';
import {
  ArrowLeft,
  Check,
  Eye,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Laptop,
  Loader2,
  Lock,
  MessageSquare,
  Palette,
  Rocket,
  Save,
  Send,
  Sparkles,
  Store,
  Upload,
  Utensils,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/Modal';
import { NetlifyDeploy } from '../../components/NetlifyDeploy';
import { SiteEditor } from '../../components/SiteEditor';
import type { ColorPalette } from '../../constants/colorPalettes';
import { colorPalettes } from '../../constants/colorPalettes';
import {
  COUNTRIES,
  type CountryAddressConfig,
} from '../../constants/countries';
import {
  correctNameCapitalization,
  generateCustomColorPalettes,
  rewriteAllContent,
} from '../../lib/gemini';
import { SiteTemplate } from './SiteTemplate';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{ label: string; value: string; icon?: any }>;
  requiresInput?: boolean;
  requiresImages?: boolean;
  showColorPalettes?: boolean;
  showCustomColorButton?: boolean;
};

type BusinessArea =
  | 'technology'
  | 'retail'
  | 'services'
  | 'food'
  | 'health'
  | 'education';

type SectionKey =
  | 'hero'
  | 'about'
  | 'services'
  | 'gallery'
  | 'app'
  | 'testimonials'
  | 'contact'
  | 'faq'
  | 'pricing'
  | 'team';

interface SiteData {
  area: string;
  name: string;
  slogan: string;
  description: string;
  vibe: string; // Vibração/emoção do site (dark, vibrant, light, corporate, fun, elegant)
  colors: string; // JSON string com { primary, secondary, accent, dark, light }
  selectedPaletteId?: string;
  sections: SectionKey[];
  services: string[];
  gallery: string[];
  appPlayStore: string;
  appAppStore: string;
  showPlayStore: boolean;
  showAppStore: boolean;
  testimonials: Array<{ name: string; role: string; text: string }>;
  address: string;
  phone: string;
  email: string;
  faq: Array<{ question: string; answer: string }>;
  pricing: Array<{ name: string; price: string; features: string[] }>;
  team: Array<{ name: string; role: string; photo?: string }>;
  heroStats?: Array<{ value: string; label: string }>;
  features?: Array<{ title: string; description: string }>;
  aboutContent?: { title: string; subtitle: string; checklist: string[] };
  serviceDescriptions?: Array<{ name: string; description: string }>;
}

type MyEasyWebsiteProps = {
  onBackToDashboard?: () => void;
};

export function MyEasyWebsite({ onBackToDashboard }: MyEasyWebsiteProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 Olá! Sou seu assistente de criação de sites.\n\nVamos criar um site profissional para sua empresa!\n\nPara começar, escolha a área de atuação do seu negócio:',
      options: [
        { label: 'Tecnologia', value: 'technology', icon: Laptop },
        { label: 'Varejo', value: 'retail', icon: Store },
        { label: 'Serviços', value: 'services', icon: Handshake },
        { label: 'Alimentação', value: 'food', icon: Utensils },
        { label: 'Saúde', value: 'health', icon: Heart },
        { label: 'Educação', value: 'education', icon: GraduationCap },
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<SiteData>({
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
  const [selectedColorCategory, setSelectedColorCategory] = useState<
    string | null
  >(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sitePreviewUrl, setSitePreviewUrl] = useState(
    'https://seu-site.netlify.app',
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showNetlifyModal, setShowNetlifyModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryAddressConfig>(
    COUNTRIES[0],
  ); // Brasil por padrão
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [addressConfirmation, setAddressConfirmation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ step: number; siteData: SiteData; messages: Message[] }>
  >([]);
  const [showSummary, setShowSummary] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>(
    [],
  );
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalInputValue, setModalInputValue] = useState('');

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

  // Função para salvar snapshot do estado atual antes de avançar
  const saveSnapshot = () => {
    setConversationHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        siteData: { ...siteData },
        messages: [...messages],
      },
    ]);
  };

  // Função para voltar para o estado anterior
  const goBack = () => {
    if (conversationHistory.length === 0) return;

    const lastSnapshot = conversationHistory[conversationHistory.length - 1];
    setCurrentStep(lastSnapshot.step);
    setSiteData(lastSnapshot.siteData);
    setMessages(lastSnapshot.messages);
    setConversationHistory((prev) => prev.slice(0, -1));
  };

  // Função para confirmar endereço diretamente (sem precisar digitar)
  const confirmAddress = () => {
    if (!addressConfirmation) return;

    setSiteData({ ...siteData, address: addressConfirmation.address });
    setAddressConfirmation(null);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Perfeito! 📞\n\nAgora me diga o telefone de contato:',
      },
    ]);
    setCurrentStep(8);
  };

  // Função para corrigir endereço
  const correctAddress = () => {
    setAddressConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Ok! Digite o endereço correto:',
      },
    ]);
    setCurrentStep(7.5);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Função para buscar coordenadas do endereço
  const geocodeAddress = async (
    address: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      return null;
    }
  };

  const handleAreaSelect = (area: BusinessArea) => {
    saveSnapshot(); // Salvar snapshot antes de avançar

    const userMessage: Message = {
      role: 'user',
      content: `Selecionei: ${area}`,
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content:
        'Ótima escolha! 🎯\n\nAgora me diga, qual é o nome da sua empresa?',
      requiresInput: true,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setSiteData({ ...siteData, area });
    setCurrentStep(1);
  };

  // Handler para seleção de vibração/emoção do site
  const handleVibeSelect = (vibe: string) => {
    saveSnapshot(); // Salvar snapshot antes de avançar

    const vibeLabels: Record<string, string> = {
      vibrant: '🎨 Vibrante & Animado',
      dark: '🌑 Dark & Profissional',
      light: '☀️ Claro & Alegre',
      corporate: '💼 Corporativo & Formal',
      fun: '🎪 Divertido & Criativo',
      elegant: '✨ Elegante & Minimalista',
    };

    const userMessage: Message = {
      role: 'user',
      content: `Escolhi: ${vibeLabels[vibe]}`,
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content:
        'Perfeito! 🎨\n\nAgora vamos escolher as cores perfeitas para o seu site!\n\nPrimeiro, escolha uma cor base:',
      options: [
        { label: '💙 Azul', value: 'blue' },
        { label: '💚 Verde', value: 'green' },
        { label: '💜 Roxo', value: 'purple' },
        { label: '💗 Rosa', value: 'pink' },
        { label: '❤️ Vermelho', value: 'red' },
        { label: '🧡 Laranja', value: 'orange' },
        { label: '💛 Amarelo', value: 'yellow' },
        { label: '🤍 Neutro', value: 'neutral' },
      ],
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setSiteData({ ...siteData, vibe });
    setCurrentStep(4);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    saveSnapshot(); // Salvar snapshot antes de enviar mensagem

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    setMessages([...messages, userMessage]);

    setTimeout(async () => {
      let assistantResponse: Message;

      switch (currentStep) {
        case 1: // Nome da empresa
          setSiteData({ ...siteData, name: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: `Perfeito, ${inputMessage}! 🌟\n\nAgora, crie um slogan impactante para sua empresa.\n\n(Exemplo: "Elevando seu estilo a um novo nível")`,
          };
          setCurrentStep(2);
          break;

        case 2: // Slogan
          setSiteData({ ...siteData, slogan: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content:
              'Excelente slogan! 📝\n\nAgora, descreva brevemente sua empresa. O que vocês fazem? Quais produtos ou serviços oferecem?',
          };
          setCurrentStep(3);
          break;

        case 3: // Descrição
          setSiteData({ ...siteData, description: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content:
              '✨ Perfeito! Agora me diga:\n\n**Que sentimento você quer transmitir ao visitante do seu site?**',
            options: [
              { label: '🎨 Vibrante & Animado', value: 'vibrant' },
              { label: '🌑 Dark & Profissional', value: 'dark' },
              { label: '☀️ Claro & Alegre', value: 'light' },
              { label: '💼 Corporativo & Formal', value: 'corporate' },
              { label: '🎪 Divertido & Criativo', value: 'fun' },
              { label: '✨ Elegante & Minimalista', value: 'elegant' },
            ],
          };
          setCurrentStep(3.5); // Novo step para vibração
          break;

        case 3.5: // Vibração (será chamado por handleVibeSelect)
          // Este caso não será usado diretamente, mas mantenho para consistência
          break;

        case 4: {
          // Cores (agora via ColorPaletteSelector, mas mantém fallback para descrição textual)
          // Este caso só será usado se o usuário usar a opção "Descrever Minhas Cores"
          const customColors = processColors(inputMessage);
          setSiteData({
            ...siteData,
            colors: JSON.stringify(customColors),
          });
          assistantResponse = {
            role: 'assistant',
            content:
              'Perfeito! ✨\n\nSua paleta personalizada foi criada!\n\nAgora selecione quais seções você quer no seu site:',
            options: [
              { label: 'Hero (Início)', value: 'hero' },
              { label: 'Sobre Nós', value: 'about' },
              { label: 'Serviços', value: 'services' },
              { label: 'Galeria', value: 'gallery' },
              { label: 'App Download', value: 'app' },
              { label: 'Depoimentos', value: 'testimonials' },
              { label: 'Contato', value: 'contact' },
            ],
          };
          setCurrentStep(5);
          break;
        }

        case 7: // Respostas das perguntas de seções
          // Processar serviços
          if (
            siteData.sections.includes('services') &&
            siteData.services.length === 0
          ) {
            const servicesList = inputMessage
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s);
            setSiteData({ ...siteData, services: servicesList });

            // Próxima pergunta
            if (siteData.sections.includes('gallery')) {
              assistantResponse = {
                role: 'assistant',
                content:
                  '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
                requiresImages: true,
              };
            } else if (siteData.sections.includes('contact')) {
              assistantResponse = {
                role: 'assistant',
                content:
                  '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?',
              };
              setCurrentStep(7.5); // Mudança: aguardar endereço
            } else {
              // SEMPRE mostrar resumo antes de gerar o site
              setShowSummary(true);
              assistantResponse = {
                role: 'assistant',
                content:
                  '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
              };
              setSummaryMessageIndex(messages.length + 1);
              setCurrentStep(9.5);
            }
          }
          // Processar endereço e buscar coordenadas
          else if (siteData.sections.includes('contact') && !siteData.address) {
            // Buscar coordenadas do endereço
            const coords = await geocodeAddress(inputMessage);

            if (coords) {
              setAddressConfirmation({
                address: inputMessage,
                lat: coords.lat,
                lng: coords.lng,
              });

              assistantResponse = {
                role: 'assistant',
                content:
                  '📍 Encontrei a localização!\n\nVerifique no mapa abaixo se está correto:',
              };
              setCurrentStep(7.6); // Novo step: confirmação de endereço
            } else {
              assistantResponse = {
                role: 'assistant',
                content:
                  '❌ Não consegui encontrar esse endereço.\n\nPor favor, digite um endereço mais completo com cidade e estado.',
              };
            }
          } else {
            // SEMPRE mostrar resumo antes de gerar o site
            setShowSummary(true);
            assistantResponse = {
              role: 'assistant',
              content:
                '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
            };
            setSummaryMessageIndex(messages.length + 1);
            setCurrentStep(9.5);
          }
          break;

        case 7.5: {
          // Correção de endereço (quando usuário digitou endereço incorreto)
          // Buscar coordenadas do novo endereço
          const newCoords = await geocodeAddress(inputMessage);

          if (newCoords) {
            setAddressConfirmation({
              address: inputMessage,
              lat: newCoords.lat,
              lng: newCoords.lng,
            });

            assistantResponse = {
              role: 'assistant',
              content:
                '📍 Encontrei a localização!\n\nVerifique no mapa abaixo se está correto:',
            };
            setCurrentStep(7.6); // Volta para confirmação
          } else {
            assistantResponse = {
              role: 'assistant',
              content:
                '❌ Não consegui encontrar esse endereço.\n\nPor favor, digite um endereço mais completo com cidade e estado.',
            };
            // Mantém no step 7.5 para tentar novamente
          }
          break;
        }

        case 7.6: // Confirmação de endereço (após ver mapa)
          // Usuário confirmou ou corrigiu o endereço
          if (
            inputMessage.toLowerCase().includes('sim') ||
            inputMessage.toLowerCase().includes('confirmar') ||
            inputMessage.toLowerCase().includes('correto')
          ) {
            // Confirmar endereço
            if (addressConfirmation) {
              setSiteData({
                ...siteData,
                address: addressConfirmation.address,
              });
              setAddressConfirmation(null);

              assistantResponse = {
                role: 'assistant',
                content: 'Perfeito! 📞\n\nAgora me diga o telefone de contato:',
              };
              setCurrentStep(8);
            }
          } else {
            // Usuário quer corrigir
            setAddressConfirmation(null);
            assistantResponse = {
              role: 'assistant',
              content: 'Ok! Digite o endereço correto:',
            };
            setCurrentStep(7.5);
          }
          break;

        case 8: {
          // Telefone com seletor de país
          // Formatar e salvar telefone
          const formattedPhone = formatPhoneNumber(
            inputMessage,
            selectedCountry,
          );
          setSiteData({
            ...siteData,
            phone: `${selectedCountry.dial} ${formattedPhone}`,
          });

          assistantResponse = {
            role: 'assistant',
            content: 'Perfeito! ✉️\n\nPor último, qual é o e-mail de contato?',
          };
          setCurrentStep(9);
          break;
        }

        case 9: // Email
          setSiteData({ ...siteData, email: inputMessage });
          // Mostrar resumo antes de gerar o site
          setShowSummary(true);
          assistantResponse = {
            role: 'assistant',
            content:
              '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
          };
          // Salvar o índice da mensagem do resumo
          setSummaryMessageIndex(messages.length + 1); // +1 porque vamos adicionar a mensagem do assistente
          setCurrentStep(9.5);
          break;

        case 9.5: // Após confirmar o resumo
          if (
            inputMessage.toLowerCase().includes('confirmar') ||
            inputMessage.toLowerCase().includes('sim') ||
            inputMessage.toLowerCase().includes('correto')
          ) {
            setShowSummary(false);
            handleGenerateSite();
            return;
          } else {
            assistantResponse = {
              role: 'assistant',
              content:
                'Ok! Use os botões "Editar" ao lado de cada item para fazer correções.',
            };
          }
          break;

        default:
          assistantResponse = {
            role: 'assistant',
            content: 'Entendi!',
          };
      }

      setMessages((prev) => [...prev, assistantResponse]);
    }, 1000);

    setInputMessage('');
  };

  const handleSectionSelect = (section: string) => {
    const currentSections = [...siteData.sections];
    const sectionKey = section as SectionKey;

    if (currentSections.includes(sectionKey)) {
      setSiteData({
        ...siteData,
        sections: currentSections.filter((s) => s !== sectionKey),
      });
    } else {
      setSiteData({
        ...siteData,
        sections: [...currentSections, sectionKey],
      });
    }
  };

  const handleConfirmSections = () => {
    if (siteData.sections.length === 0) return;

    setCurrentStep(6);
    askSectionQuestions();
  };

  const askSectionQuestions = () => {
    const sections = siteData.sections;

    // Perguntas para Serviços
    if (sections.includes('services') && siteData.services.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '📋 Vamos configurar a seção de SERVIÇOS\n\nListe seus serviços separados por vírgula.\n\n(Exemplo: Corte Premium, Barboterapia, Hidratação Capilar)',
        },
      ]);
      setCurrentStep(7);
      return;
    }

    // Perguntas para Galeria
    if (sections.includes('gallery') && siteData.gallery.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
          requiresImages: true,
        },
      ]);
      setCurrentStep(7);
      return;
    }

    // Perguntas para Contato
    if (sections.includes('contact') && !siteData.address) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?',
        },
      ]);
      setCurrentStep(7);
      return;
    }

    // SEMPRE mostrar resumo antes de gerar o site
    setShowSummary(true);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
      },
    ]);
    setSummaryMessageIndex(messages.length); // Salvar índice da mensagem atual
    setCurrentStep(9.5); // Ir direto para confirmação do resumo
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === files.length) {
          setUploadedImages((prev) => [...prev, ...imageUrls]);
          setSiteData({
            ...siteData,
            gallery: [...siteData.gallery, ...imageUrls],
          });

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `✅ ${imageUrls.length} imagem(ns) adicionada(s) com sucesso!\n\nDeseja adicionar mais imagens ou continuar?`,
              options: [
                { label: 'Adicionar mais', value: 'more' },
                { label: 'Continuar', value: 'continue' },
              ],
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handler para seleção de cor base
  const handleColorCategorySelect = (category: string) => {
    saveSnapshot(); // Salvar snapshot antes de avançar

    const categoryLabels: Record<string, string> = {
      blue: '💙 Azul',
      green: '💚 Verde',
      purple: '💜 Roxo',
      pink: '💗 Rosa',
      red: '❤️ Vermelho',
      orange: '🧡 Laranja',
      yellow: '💛 Amarelo',
      neutral: '🤍 Neutro',
    };

    const userMessage: Message = {
      role: 'user',
      content: `Escolhi: ${categoryLabels[category]}`,
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: `Ótima escolha! ${categoryLabels[category]}\n\nAgora escolha uma das paletas profissionais abaixo:`,
      showColorPalettes: true,
      showCustomColorButton: true,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setSelectedColorCategory(category);
    setCurrentStep(4.5);
  };

  // Handler para seleção de paleta
  const handlePaletteSelect = (palette: ColorPalette) => {
    saveSnapshot(); // Salvar snapshot antes de avançar

    const paletteColors = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      dark: palette.dark,
      light: palette.light,
    };

    setSiteData({
      ...siteData,
      colors: JSON.stringify(paletteColors),
      selectedPaletteId: palette.id,
    });

    // Adicionar mensagem do assistente
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Excelente escolha! 🎨\n\nPaleta "${palette.name}" selecionada com sucesso!\n\nAgora selecione quais seções você quer no seu site:`,
        options: [
          { label: 'Hero (Início)', value: 'hero' },
          { label: 'Sobre Nós', value: 'about' },
          { label: 'Serviços', value: 'services' },
          { label: 'Galeria', value: 'gallery' },
          { label: 'Preços', value: 'pricing' },
          { label: 'Equipe', value: 'team' },
          { label: 'FAQ', value: 'faq' },
          { label: 'App Download', value: 'app' },
          { label: 'Depoimentos', value: 'testimonials' },
          { label: 'Contato', value: 'contact' },
        ],
      },
    ]);
    setCurrentStep(5);
  };

  // Handler para descrição customizada de cores com IA
  const handleCustomColors = async (description: string) => {
    // Adicionar mensagens de loading
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: `Minhas cores: ${description}`,
      },
      {
        role: 'assistant',
        content: `🎨 Entendi! Você quer cores "${description}"...\n\n🤖 Deixa eu criar algumas paletas profissionais para você escolher!\n\n✨ Usando IA para gerar 6 opções incríveis...`,
      },
    ]);

    try {
      // Chamar IA para gerar 6 paletas
      const palettes = await generateCustomColorPalettes(description);
      setGeneratedPalettes(palettes);

      // Atualizar mensagem com as paletas geradas
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ Paletas geradas com sucesso!\n\n🎨 Criei ${palettes.length} opções de paletas baseadas em "${description}".\n\nEscolha sua favorita:`,
          showColorPalettes: true,
        },
      ]);
    } catch (error) {
      console.error('Erro ao gerar paletas:', error);
      // Fallback para processamento local
      const customColors = processColors(description);
      setSiteData({
        ...siteData,
        colors: JSON.stringify(customColors),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ Paleta personalizada criada!\n\nAgora selecione quais seções você quer no seu site:`,
          options: [
            { label: 'Hero (Início)', value: 'hero' },
            { label: 'Sobre Nós', value: 'about' },
            { label: 'Serviços', value: 'services' },
            { label: 'Galeria', value: 'gallery' },
            { label: 'App Download', value: 'app' },
            { label: 'Depoimentos', value: 'testimonials' },
            { label: 'Contato', value: 'contact' },
          ],
        },
      ]);
      setCurrentStep(5);
    }
  };

  // Função para processar cores descritas pelo usuário (IA personalizada)
  const processColors = (colorDescription: string) => {
    const desc = colorDescription.toLowerCase();

    // Mapear cores comuns
    const colorMap: Record<string, string> = {
      azul: '#2563eb',
      'azul claro': '#60a5fa',
      'azul escuro': '#1e40af',
      roxo: '#9333ea',
      'roxo claro': '#c084fc',
      'roxo escuro': '#7e22ce',
      verde: '#22c55e',
      'verde claro': '#4ade80',
      'verde escuro': '#16a34a',
      vermelho: '#ef4444',
      'vermelho claro': '#f87171',
      'vermelho escuro': '#dc2626',
      laranja: '#f97316',
      'laranja claro': '#fb923c',
      'laranja escuro': '#ea580c',
      amarelo: '#facc15',
      'amarelo claro': '#fde047',
      'amarelo escuro': '#eab308',
      rosa: '#ec4899',
      'rosa claro': '#f472b6',
      'rosa escuro': '#db2777',
      preto: '#1f2937',
      cinza: '#6b7280',
      'cinza claro': '#9ca3af',
      'cinza escuro': '#374151',
      dourado: '#f59e0b',
      prata: '#94a3b8',
      marrom: '#92400e',
      turquesa: '#06b6d4',
      ciano: '#0891b2',
    };

    // Tentar encontrar AMBAS as cores na descrição
    let primaryColor = '#f97316'; // laranja vibrante padrão
    let secondaryColor = '#facc15'; // amarelo padrão

    // Dividir por "e", vírgula ou "com"
    const parts = desc.split(/\s+e\s+|,\s+|\s+com\s+/).map((p) => p.trim());

    const foundColors: string[] = [];

    // Procurar todas as cores mencionadas
    for (const part of parts) {
      for (const [key, value] of Object.entries(colorMap)) {
        if (part.includes(key)) {
          foundColors.push(value);
          break;
        }
      }
    }

    // Se encontrou 2 ou mais cores, usar as 2 primeiras
    if (foundColors.length >= 2) {
      primaryColor = foundColors[0];
      secondaryColor = foundColors[1];
    } else if (foundColors.length === 1) {
      primaryColor = foundColors[0];
      // Gerar cor secundária complementar
      secondaryColor = foundColors[0];
    }

    // Gerar cores complementares
    const accentColor = foundColors.length > 2 ? foundColors[2] : primaryColor;
    const darkColor = '#1a1a1a';
    const lightColor = '#f5f5f5';

    return {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      dark: darkColor,
      light: lightColor,
    };
  };

  const handleGenerateSite = async () => {
    setIsGenerating(true);

    // Mensagem de que a IA está processando
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          '🤖 Estou processando seus textos com IA...\n\n✨ Reescrevendo slogan\n📝 Otimizando descrição\n🎯 Melhorando serviços\n❓ Gerando FAQ personalizado\n\nIsso vai deixar seu site muito mais profissional e persuasivo!',
      },
    ]);

    try {
      // Primeiro, corrigir a capitalização do nome da empresa
      const correctedName = await correctNameCapitalization(siteData.name);

      // Chamar a IA do Gemini para reescrever TODOS os textos
      const rewrittenContent = await rewriteAllContent({
        name: correctedName,
        area: siteData.area,
        slogan: siteData.slogan,
        description: siteData.description,
        services: siteData.services,
      });

      // Atualizar siteData com TODOS os textos reescritos pela IA
      const updatedSiteData = {
        ...siteData,
        name: correctedName, // Nome com capitalização corrigida
        slogan: rewrittenContent.slogan,
        description: rewrittenContent.description,
        services: rewrittenContent.services,
        faq: rewrittenContent.faq,
        heroStats: rewrittenContent.heroStats,
        features: rewrittenContent.features,
        aboutContent: rewrittenContent.aboutContent,
        serviceDescriptions: rewrittenContent.serviceDescriptions,
        testimonials: rewrittenContent.testimonials,
      };

      setSiteData(updatedSiteData);

      // Mensagem de sucesso da IA
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '✅ Textos otimizados com sucesso!\n\n🎨 Slogan reescrito com impacto\n📖 Descrição persuasiva criada\n🌟 Serviços profissionalizados\n💬 FAQ personalizado gerado\n\nAgora vou gerar seu site...',
        },
      ]);

      // Pequeno delay para mostrar a mensagem de sucesso
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGeneratedSite(`site-${Date.now()}`);
      setSitePreviewUrl(
        `https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`,
      );
      setIsGenerating(false);

      const successMessage: Message = {
        role: 'assistant',
        content:
          '🎊 Seu site foi gerado com sucesso!\n\n✨ Todos os textos foram otimizados por IA para máxima conversão!\n\nVocê pode visualizá-lo no preview ao lado.\n\nAgora você pode:\n✏️ Editar cores e textos\n👁️ Abrir em uma nova aba\n🚀 Publicar no Netlify!',
      };

      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error('Erro ao gerar site:', error);
      setIsGenerating(false);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '❌ Ocorreu um erro ao otimizar os textos.\n\nMas não se preocupe! Vou gerar seu site com os textos originais.\n\nVocê poderá editá-los manualmente depois.',
        },
      ]);

      // Gerar site mesmo com erro na IA
      setTimeout(() => {
        setGeneratedSite(`site-${Date.now()}`);
        setSitePreviewUrl(
          `https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`,
        );
      }, 1000);
    }
  };

  const generateSiteHTML = (siteData: SiteData): string => {
    // IMPORTANTE: Este HTML deve ser 100% IDÊNTICO ao SiteTemplate.tsx
    // Parse colors
    const colors = siteData.colors
      ? JSON.parse(siteData.colors)
      : {
          primary: '#ea580c',
          secondary: '#1a1a1a',
          accent: '#fb923c',
          dark: '#1a1a1a',
          light: '#f5f5f5',
        };

    // Helper functions (MESMAS do SiteTemplate.tsx)
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const isLightColor = (hex: string): boolean => {
      return getLuminance(hex) > 128;
    };

    const getContrastText = (bgHex: string): string => {
      return isLightColor(bgHex) ? '#1a1a1a' : '#ffffff';
    };

    const lightenColor = (hex: string, percent: number) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(
        255,
        Math.floor((num >> 16) + (255 - (num >> 16)) * percent),
      );
      const g = Math.min(
        255,
        Math.floor(
          ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent,
        ),
      );
      const b = Math.min(
        255,
        Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent),
      );
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };

    const primaryLight = lightenColor(colors.primary, 0.3);

    // Definir vibe PRIMEIRO
    const vibe = siteData.vibe || 'vibrant';

    // Cores de texto para diferentes contextos (MESMAS do SiteTemplate.tsx)
    const heroTextColor = getContrastText(colors.primary);

    // Determinar cor do header baseado no vibe
    const headerTextColor =
      vibe === 'light' || vibe === 'elegant' ? '#111827' : '#ffffff';

    // Definir backgrounds e cores baseadas no vibe (MESMAS do SiteTemplate.tsx)
    let headerBg = 'bg-gray-900/95';

    switch (vibe) {
      case 'light':
        headerBg = 'bg-white/95 border-b border-gray-200';
        break;
      case 'dark':
        headerBg = 'bg-black/95';
        break;
      case 'vibrant':
        headerBg = `bg-[${colors.primary}]/95`;
        break;
      case 'corporate':
        headerBg = 'bg-slate-900/95';
        break;
      case 'fun':
        headerBg = 'bg-purple-600/95';
        break;
      case 'elegant':
        headerBg = 'bg-white/95 border-b border-gray-100';
        break;
    }

    // SEO
    const seoTitle = `${siteData.name} - ${siteData.slogan || 'Seu negócio online'}`;
    const seoDescription =
      siteData.description ||
      `${siteData.name} - ${siteData.slogan}. Conheça nossos serviços e entre em contato!`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Poppins', sans-serif;
          line-height: 1.6;
          color: #333;
          --color-primary: ${colors.primary};
          --color-primary-light: ${primaryLight};
          --color-secondary: ${colors.secondary};
          --color-accent: ${colors.accent};
        }
        
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        
        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        /* Header */
        header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: ${
            vibe === 'light'
              ? 'rgba(255, 255, 255, 0.95)'
              : vibe === 'elegant'
                ? 'rgba(255, 255, 255, 0.95)'
                : vibe === 'dark'
                  ? 'rgba(0, 0, 0, 0.95)'
                  : vibe === 'vibrant'
                    ? `${colors.primary}f2`
                    : vibe === 'corporate'
                      ? 'rgba(15, 23, 42, 0.95)'
                      : vibe === 'fun'
                        ? 'rgba(147, 51, 234, 0.95)'
                        : 'rgba(26, 26, 26, 0.95)'
          };
          backdrop-filter: blur(16px);
          ${vibe === 'light' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
          ${vibe === 'elegant' ? 'border-bottom: 1px solid #f3f4f6;' : ''}
        }
        
        header .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          padding-bottom: 16px;
        }
        
        header .logo { font-size: 24px; font-weight: bold; color: ${headerTextColor}; }
        
        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        
        .mobile-menu-btn span {
          width: 24px;
          height: 2px;
          background: ${headerTextColor};
          transition: all 0.3s;
          border-radius: 2px;
        }
        
        .mobile-menu-btn span:not(:last-child) {
          margin-bottom: 5px;
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }
        
        /* Mobile Menu Drawer */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 300px;
          height: 100vh;
          background: ${headerBg};
          backdrop-filter: blur(16px);
          z-index: 1000;
          transition: right 0.3s ease;
          padding: 80px 24px 24px;
          overflow-y: auto;
          box-shadow: -4px 0 20px rgba(0,0,0,0.3);
        }
        
        .mobile-menu.active {
          right: 0;
        }
        
        .mobile-menu nav {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .mobile-menu nav a {
          color: ${headerTextColor};
          text-decoration: none;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 0;
          border-bottom: 1px solid rgba(${parseInt(headerTextColor.slice(1, 3), 16)}, ${parseInt(headerTextColor.slice(3, 5), 16)}, ${parseInt(headerTextColor.slice(5, 7), 16)}, 0.1);
          transition: opacity 0.3s;
        }
        
        .mobile-menu nav a:hover {
          opacity: 0.7;
        }
        
        .mobile-menu .cta-button {
          margin-top: 24px;
          width: 100%;
          text-align: center;
        }
        
        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }
        
        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        /* Desktop Navigation */
        header nav { display: flex; gap: 32px; }
        
        header nav a {
          color: ${headerTextColor};
          text-decoration: none;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: opacity 0.3s;
        }
        
        header nav a:hover { opacity: 0.7; }
        
        /* Responsive: Hide desktop nav on mobile, show hamburger */
        @media (max-width: 768px) {
          header nav,
          header .cta-button {
            display: none;
          }
          
          .mobile-menu-btn {
            display: flex;
          }
        }
        
        header .cta-button {
          padding: 12px 24px;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, ${colors.primary}, ${primaryLight});
          color: ${heroTextColor};
          border: none;
          cursor: pointer;
          transition: box-shadow 0.3s;
        }
        
        header .cta-button:hover { box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        
        /* Hero Section */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 0;
          background-color: ${colors.primary};
        }
        
        .hero-decorative {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .hero-light-particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: float 6s ease-in-out infinite;
        }
        
        .hero-light-ray {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          opacity: 0.05;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent);
          animation: pulse 4s ease-in-out infinite;
        }
        
        .hero-content { position: relative; z-index: 10; text-align: center; max-width: 1280px; margin: 0 auto; padding: 0 16px; }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.2);
          color: ${heroTextColor};
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          margin-bottom: 32px;
        }
        
        .hero h1 {
          font-size: 72px;
          font-weight: 900;
          margin-bottom: 24px;
          line-height: 1.2;
          color: ${heroTextColor};
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .hero-description {
          font-size: 24px;
          margin-bottom: 48px;
          line-height: 1.5;
          color: ${heroTextColor};
          opacity: 0.95;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
          margin-bottom: 80px;
        }
        
        @media (min-width: 640px) {
          .hero-buttons { flex-direction: row; }
        }
        
        .hero-cta-primary {
          padding: 20px 48px;
          border-radius: 9999px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.05em;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          transition: transform 0.3s, box-shadow 0.3s;
          background: #ffffff;
          color: ${colors.primary};
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        .hero-cta-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
        }
        
        .hero-cta-secondary {
          padding: 20px 48px;
          border-radius: 9999px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.05em;
          transition: transform 0.3s;
          background: transparent;
          color: ${heroTextColor};
          border: 2px solid rgba(${parseInt(heroTextColor.slice(1, 3), 16)}, ${parseInt(heroTextColor.slice(3, 5), 16)}, ${parseInt(heroTextColor.slice(5, 7), 16)}, 0.5);
          backdrop-filter: blur(10px);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        .hero-cta-secondary:hover { transform: scale(1.05); }
        
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 32px;
        }
        
        @media (min-width: 768px) {
          .hero-stats { grid-template-columns: repeat(3, 1fr); gap: 48px; }
        }
        
        .hero-stat {
          padding: 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hero-stat h3 {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 8px;
          color: ${heroTextColor};
        }
        
        .hero-stat p {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          opacity: 0.9;
          color: ${heroTextColor};
        }
        
        /* Features Section */
        .features-section {
          padding: 80px 0;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
          margin-top: -48px;
          position: relative;
          z-index: 20;
          overflow: hidden;
        }
        
        .section-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          background: rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1);
          color: ${colors.primary};
        }
        
        .section-title {
          font-size: 48px;
          font-weight: 900;
          color: #111827;
          text-align: center;
          margin-bottom: 64px;
        }
        
        .section-title .highlight { color: ${colors.primary}; }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        
        @media (min-width: 768px) {
          .features-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        .feature-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          border: 2px solid transparent;
          transition: transform 0.4s, box-shadow 0.4s;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .feature-card:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }
        
        .feature-icon {
          width: 96px;
          height: 96px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
          box-shadow: 0 10px 30px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.25);
          position: relative;
        }
        
        .feature-card h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #111827;
        }
        
        .feature-card p {
          color: #4b5563;
          line-height: 1.5;
        }
        
        /* Services Section */
        .services-section {
          padding: 96px 0;
          color: white;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.dark});
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        
        @media (min-width: 768px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        .service-card {
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.4s, background-color 0.4s, box-shadow 0.4s;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }
        
        .service-card:hover {
          transform: translateY(-20px) scale(1.05);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        
        .service-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          font-size: 48px;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .service-card h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: ${heroTextColor};
          text-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        
        .service-card p {
          line-height: 1.5;
          margin-bottom: 24px;
          color: ${heroTextColor};
          opacity: 0.85;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        
        /* Contact Section */
        .contact-section {
          padding: 96px 0;
          background: #f9fafb;
          position: relative;
          overflow: hidden;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          align-items: center;
        }
        
        @media (min-width: 768px) {
          .contact-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        .contact-item {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: box-shadow 0.3s, transform 0.3s;
          cursor: pointer;
        }
        
        .contact-item:hover {
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          transform: translateX(10px);
        }
        
        .contact-icon {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
          color: ${heroTextColor};
        }
        
        .contact-item strong {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .contact-item p {
          color: #4b5563;
          font-weight: 500;
        }
        
        /* Footer */
        footer {
          background: #111827;
          color: #9ca3af;
          padding: 80px 0;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          margin-bottom: 40px;
        }
        
        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        footer h4 {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        footer p, footer li {
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        footer ul {
          list-style: none;
        }
        
        footer a {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        footer a:hover { color: ${colors.primary}; }
        
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 32px;
          text-align: center;
        }
        
        /* WhatsApp Button */
        .whatsapp-float {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 64px;
          height: 64px;
          background: #25d366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          z-index: 100;
          animation: pulse 2s ease-in-out infinite;
          cursor: pointer;
          text-decoration: none;
        }
        
        .whatsapp-float:hover { transform: scale(1.1); }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <div class="logo">${siteData.name}</div>
            <nav>
                <a href="#">Início</a>
                ${siteData.sections.includes('services') ? '<a href="#servicos">Serviços</a>' : ''}
                ${siteData.sections.includes('gallery') ? '<a href="#galeria">Galeria</a>' : ''}
                ${siteData.sections.includes('contact') ? '<a href="#contato">Contato</a>' : ''}
            </nav>
            <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de entrar em contato')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="cta-button" style="text-decoration: none; display: inline-block;">Fale Conosco</a>
            
            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" onclick="toggleMobileMenu()"></div>
    
    <!-- Mobile Menu Drawer -->
    <div class="mobile-menu">
        <nav>
            <a href="#" onclick="toggleMobileMenu()">Início</a>
            ${siteData.sections.includes('services') ? '<a href="#servicos" onclick="toggleMobileMenu()">Serviços</a>' : ''}
            ${siteData.sections.includes('gallery') ? '<a href="#galeria" onclick="toggleMobileMenu()">Galeria</a>' : ''}
            ${siteData.sections.includes('contact') ? '<a href="#contato" onclick="toggleMobileMenu()">Contato</a>' : ''}
        </nav>
        <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de entrar em contato')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="cta-button" onclick="toggleMobileMenu()" style="text-decoration: none; display: inline-block;">Fale Conosco</a>
    </div>

    <!-- Hero -->
    ${
      siteData.sections.includes('hero')
        ? `
    <section class="hero">
        <!-- Elementos decorativos de fundo -->
        <div class="hero-decorative" style="width: 500px; height: 500px; top: -200px; left: -150px; opacity: 0.15; animation: floatSlow 12s ease-in-out infinite;"></div>
        <div class="hero-decorative" style="width: 350px; height: 350px; bottom: -100px; right: -80px; opacity: 0.15; animation: pulse 4s ease-in-out infinite; animation-delay: 1s;"></div>
        <div class="hero-decorative" style="width: 200px; height: 200px; top: 100px; right: 150px; opacity: 0.1; animation: float 6s ease-in-out infinite; animation-delay: 2s;"></div>
        <div class="hero-decorative" style="width: 280px; height: 280px; top: 50%; left: 10%; opacity: 0.12; animation: pulse 4s ease-in-out infinite; animation-delay: 3s;"></div>
        
        <!-- Partículas de luz animadas - AUMENTADAS -->
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 80px; left: 80px; opacity: 0.6; animation-delay: 0.5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; top: 160px; right: 128px; opacity: 0.5; animation: pulse 4s ease-in-out infinite; animation-delay: 1.5s;"></div>
        <div class="hero-light-particle" style="width: 32px; height: 32px; bottom: 128px; left: 160px; opacity: 0.4; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2.5s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; top: 240px; left: 25%; opacity: 0.7; animation: pulse 4s ease-in-out infinite; animation-delay: 3.5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; bottom: 160px; right: 25%; opacity: 0.55; animation: float 6s ease-in-out infinite; animation-delay: 4s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 33.333%; right: 80px; opacity: 0.45; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2s;"></div>
        
        <!-- NOVAS partículas adicionais -->
        <div class="hero-light-particle" style="width: 28px; height: 28px; top: 40px; right: 25%; opacity: 0.65; animation: pulse 4s ease-in-out infinite; animation-delay: 0.8s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; bottom: 80px; left: 33.333%; opacity: 0.6; animation: float 6s ease-in-out infinite; animation-delay: 1.2s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 50%; left: 40px; opacity: 0.5; animation: floatSlow 12s ease-in-out infinite; animation-delay: 3s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; bottom: 240px; right: 160px; opacity: 0.7; animation: pulse 4s ease-in-out infinite; animation-delay: 4.5s;"></div>
        <div class="hero-light-particle" style="width: 32px; height: 32px; top: 320px; right: 40px; opacity: 0.45; animation: float 6s ease-in-out infinite; animation-delay: 0.3s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; bottom: 40px; left: 80px; opacity: 0.55; animation: floatSlow 12s ease-in-out infinite; animation-delay: 5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; top: 25%; left: 50%; opacity: 0.6; animation: pulse 4s ease-in-out infinite; animation-delay: 1.8s;"></div>
        <div class="hero-light-particle" style="width: 28px; height: 28px; bottom: 33.333%; right: 33.333%; opacity: 0.5; animation: float 6s ease-in-out infinite; animation-delay: 3.2s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; top: 384px; left: 240px; opacity: 0.65; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2.3s;"></div>
        
        <!-- Raios de luz sutis -->
        <div class="hero-light-ray" style="left: 25%; transform: rotate(15deg); animation-delay: 1s;"></div>
        <div class="hero-light-ray" style="right: 33.333%; transform: rotate(-10deg); animation-delay: 2s;"></div>
        
        <div class="container hero-content">
            <div class="hero-badge">
                <span>🔥</span> ${siteData.area}
            </div>
            <h1>${siteData.slogan || siteData.name}</h1>
            <p class="hero-description">${siteData.description}</p>
            <div class="hero-buttons">
                <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\\\D/g, '')}&text=${encodeURIComponent('Olá! Quero começar agora')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="hero-cta-primary">Começar Agora</a>
                <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de saber mais')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="hero-cta-secondary">Saiba Mais</a>
            </div>
            <div class="hero-stats">
                ${(
                  siteData.heroStats || [
                    { value: '500+', label: 'Clientes Satisfeitos' },
                    { value: '4.9★', label: 'Avaliação Média' },
                    { value: '10+', label: 'Anos de Experiência' },
                  ]
                )
                  .map(
                    (stat) => `
                <div class="hero-stat">
                    <h3>${stat.value}</h3>
                    <p>${stat.label}</p>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Features -->
    <section class="features-section">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Por Que Escolher a Gente?</span>
                <h2 class="section-title">
                    Benefícios <span class="highlight">Exclusivos</span>
                </h2>
            </div>
            <div class="features-grid">
                ${(
                  siteData.features || [
                    {
                      title: 'Experiência Premium',
                      description:
                        'Muito mais que um serviço, uma verdadeira experiência de luxo e conforto',
                    },
                    {
                      title: 'Profissionais Qualificados',
                      description:
                        'Equipe altamente treinada e experiente no que faz',
                    },
                    {
                      title: 'Atendimento Fácil',
                      description: 'Agende com total praticidade e rapidez',
                    },
                  ]
                )
                  .map(
                    (feature) => `
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="2.5">
                            <path d="M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z"/>
                        </svg>
                    </div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>

    <!-- About -->
    ${
      siteData.sections.includes('about')
        ? `
    <section class="py-24 bg-white relative overflow-hidden">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 80px; align-items: center;">
                <div>
                    <div style="position: relative; height: 600px;">
                        <img src="https://via.placeholder.com/400x500" alt="Sobre" style="position: absolute; top: 0; left: 0; width: 70%; height: 70%; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
                        <img src="https://via.placeholder.com/400x500" alt="Sobre" style="position: absolute; bottom: 0; right: 0; width: 70%; height: 70%; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
                        <div style="position: absolute; bottom: 20px; left: 20px; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 16px; z-index: 20;">
                            <div style="width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});">⭐</div>
                            <div>
                                <strong style="display: block; font-size: 36px; font-weight: 900; line-height: 1; color: ${colors.primary};">4.9</strong>
                                <p style="font-size: 14px; color: #4b5563; font-weight: 600;">Avaliação</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="section-badge">Sobre Nós</span>
                    <h2 style="font-size: 60px; font-weight: 900; margin-bottom: 24px; line-height: 1.2; color: #111827;">
                        ${siteData.aboutContent?.title || 'Do Sonho à'}<br/>
                        <span style="color: ${colors.primary};">
                            ${siteData.aboutContent?.subtitle || 'Realidade'}
                        </span>
                    </h2>
                    <p style="font-size: 20px; font-weight: 500; color: #374151; margin-bottom: 20px; line-height: 1.5;">
                        Nossa empresa foi projetada para ser um ponto de referência em qualidade, inovação e excelência.
                    </p>
                    <p style="color: #4b5563; margin-bottom: 32px; line-height: 1.5;">
                        ${siteData.description}
                    </p>
                    <div style="margin: 32px 0;">
                        ${(
                          siteData.aboutContent?.checklist || [
                            'Profissionais certificados',
                            'Produtos premium',
                            'Ambiente climatizado',
                          ]
                        )
                          .map(
                            (item) => `
                        <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.15);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${colors.primary}" stroke-width="3">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <span style="font-weight: 600; color: #1f2937;">${item}</span>
                        </div>
                        `,
                          )
                          .join('')}
                    </div>
                    <button class="hero-cta-primary">Agende seu horário</button>
                </div>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Gallery -->
    ${
      siteData.sections.includes('gallery') && siteData.gallery.length > 0
        ? `
    <section id="galeria" style="padding: 96px 0; background: #f9fafb; position: relative; overflow: hidden;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Galeria</span>
                <h2 class="section-title">
                    Nosso <span class="highlight">Trabalho</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; margin-top: 16px; max-width: 896px; margin-left: auto; margin-right: auto;">
                    Confira alguns dos nossos melhores projetos e trabalhos realizados
                </p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                ${siteData.gallery
                  .map(
                    (img, idx) => `
                <div style="position: relative; overflow: hidden; border-radius: 24px; aspect-ratio: 4/3; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <img src="${img}" alt="${siteData.name} - Galeria ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                </div>
                `,
                  )
                  .join('')}
            </div>
            <div style="text-align: center; margin-top: 48px;">
                <button class="hero-cta-primary">Ver Mais Projetos</button>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Testimonials -->
    ${
      siteData.sections.includes('testimonials')
        ? `
    <section style="padding: 96px 0; background: white; position: relative; overflow: hidden;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Depoimentos</span>
                <h2 class="section-title">
                    O que dizem<br/>
                    <span class="highlight">Nossos Clientes</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; margin-top: 16px; max-width: 896px; margin-left: auto; margin-right: auto;">
                    Veja o que nossos clientes satisfeitos têm a dizer sobre nossos serviços
                </p>
            </div>
            <div class="services-grid">
                ${(
                  siteData.testimonials || [
                    {
                      name: 'Ana Silva',
                      role: 'Cliente desde 2024',
                      text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!',
                    },
                    {
                      name: 'Carlos Santos',
                      role: 'Cliente desde 2023',
                      text: 'Superou todas as minhas expectativas! Qualidade premium com atendimento impecável.',
                    },
                    {
                      name: 'Maria Costa',
                      role: 'Cliente desde 2024',
                      text: 'Simplesmente perfeito! A melhor experiência que já tive. Voltarei sempre!',
                    },
                  ]
                )
                  .map(
                    (testimonial) => `
                <div class="feature-card">
                    <div style="margin-bottom: 24px; color: #fbbf24; display: flex; gap: 4px;">
                        ${'⭐'.repeat(5)}
                    </div>
                    <p style="font-size: 18px; font-style: italic; color: #374151; line-height: 1.5; margin-bottom: 32px; position: relative; z-index: 10;">
                        "${testimonial.text}"
                    </p>
                    <div style="width: 64px; height: 4px; margin: 0 auto 24px; border-radius: 9999px; background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});"></div>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; flex-shrink: 0; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent}); color: ${heroTextColor}; box-shadow: 0 5px 20px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.25);">
                            ${testimonial.name.charAt(0)}
                        </div>
                        <div>
                            <strong style="display: block; font-size: 18px; font-weight: bold; color: #111827;">${testimonial.name}</strong>
                            <span style="font-size: 14px; font-weight: 500; color: ${colors.primary};">${testimonial.role}</span>
                        </div>
                    </div>
                </div>
                `,
                  )
                  .join('')}
            </div>
            <div style="text-align: center; margin-top: 64px;">
                <p style="font-size: 18px; color: #4b5563; margin-bottom: 24px;">Você também é nosso cliente? Deixe seu depoimento!</p>
                <button class="hero-cta-primary">Deixar Depoimento</button>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Pricing -->
    ${
      siteData.sections.includes('pricing')
        ? `
    <section style="padding: 96px 0; background: #f9fafb;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Preços</span>
                <h2 class="section-title">
                    Planos que <span class="highlight">Cabem no Bolso</span>
                </h2>
            </div>
            <div class="services-grid">
                ${(
                  siteData.pricing || [
                    {
                      name: 'Básico',
                      price: 'R$ 99',
                      features: [
                        'Atendimento básico',
                        'Produtos padrão',
                        'Sem agendamento',
                      ],
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
                  ]
                )
                  .map((plan, idx) => {
                    const isPopular = idx === 1;
                    return `
                    <div class="feature-card" style="${isPopular ? 'transform: scale(1.05); border: 2px solid ' + colors.primary : 'border: 1px solid #e5e7eb'}; position: relative;">
                        ${isPopular ? `<div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); padding: 4px 24px; border-radius: 9999px; font-size: 14px; font-weight: bold; color: white; background: ${colors.primary};">POPULAR</div>` : ''}
                        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827;">${plan.name}</h3>
                        <div style="margin-bottom: 24px;">
                            <span style="font-size: 48px; font-weight: 900; color: ${colors.primary};">${plan.price}</span>
                            <span style="color: #4b5563;">/mês</span>
                        </div>
                        <ul style="list-style: none; margin-bottom: 32px;">
                            ${plan.features
                              .map(
                                (feature) => `
                            <li style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
                                <svg style="width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="${colors.primary}" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span style="color: #374151;">${feature}</span>
                            </li>
                            `,
                              )
                              .join('')}
                        </ul>
                        <button class="${isPopular ? 'hero-cta-primary' : 'hero-cta-secondary'}" style="width: 100%;">
                            Escolher Plano
                        </button>
                    </div>
                    `;
                  })
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Team -->
    ${
      siteData.sections.includes('team')
        ? `
    <section style="padding: 96px 0; background: white;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Nossa Equipe</span>
                <h2 class="section-title">
                    Conheça nosso <span class="highlight">Time</span>
                </h2>
            </div>
            <div class="services-grid">
                ${(
                  siteData.team || [
                    { name: 'João Silva', role: 'CEO & Fundador' },
                    { name: 'Maria Santos', role: 'Diretora de Operações' },
                    { name: 'Pedro Costa', role: 'Gerente de Atendimento' },
                  ]
                )
                  .map(
                    (member) => `
                <div style="text-align: center;">
                    <div style="position: relative; margin-bottom: 24px; display: inline-block;">
                        <div style="width: 192px; height: 192px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: bold; background: linear-gradient(to bottom right, ${colors.primary}, ${colors.accent}); color: ${heroTextColor};">
                            ${member.name.charAt(0)}
                        </div>
                    </div>
                    <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #111827;">${member.name}</h3>
                    <p style="font-weight: 500; margin-bottom: 16px; color: ${colors.primary};">${member.role}</p>
                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <a href="#" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 50%; color: #6b7280; transition: all 0.3s;">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
                                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- FAQ -->
    ${
      siteData.sections.includes('faq') &&
      siteData.faq &&
      siteData.faq.length > 0
        ? `
    <section style="padding: 96px 0; background: white;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">FAQ</span>
                <h2 class="section-title">
                    Perguntas <span class="highlight">Frequentes</span>
                </h2>
            </div>
            <div style="max-width: 896px; margin: 0 auto;">
                ${siteData.faq
                  .map(
                    (item) => `
                <details style="background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.13); margin-bottom: 16px;">
                    <summary style="display: flex; align-items: center; justify-content: between; padding: 24px; cursor: pointer; list-style: none;">
                        <h3 style="font-size: 18px; font-weight: bold; color: #111827; flex: 1;">${item.question}</h3>
                        <svg style="width: 24px; height: 24px; transform: rotate(0deg); transition: transform 0.3s;" fill="none" stroke="${colors.primary}" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div style="padding: 0 24px 24px;">
                        <p style="color: #4b5563; line-height: 1.5;">${item.answer}</p>
                    </div>
                </details>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- App Download -->
    ${
      siteData.sections.includes('app')
        ? `
    <section style="padding: 96px 0; color: white; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});">
        <div class="container">
            <div style="display: grid; grid-template-columns: 1fr; gap: 80px; align-items: center;">
                <div>
                    <span style="display: inline-block; padding: 8px 20px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; background: rgba(255,255,255,0.25); color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                        Nosso App
                    </span>
                    <h2 style="font-size: 60px; font-weight: 900; margin-bottom: 24px; line-height: 1.2; color: #ffffff; text-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                        Agende pelo<br/>
                        <span style="text-shadow: 0 4px 8px rgba(0,0,0,0.6);">Aplicativo</span>
                    </h2>
                    <p style="font-size: 20px; margin-bottom: 32px; line-height: 1.5; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                        Baixe nosso app e tenha acesso a horários disponíveis, promoções exclusivas e muito mais!
                    </p>
                    <div style="margin-bottom: 40px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; color: #ffffff;">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                            </svg>
                            <span style="font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Agendamento em segundos</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; color: #ffffff;">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                            </svg>
                            <span style="font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Lembretes automáticos</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <button style="padding: 12px 32px; background: white; border-radius: 9999px; font-weight: 600; color: ${colors.primary}; border: none; cursor: pointer;">
                            📱 Google Play
                        </button>
                        <button style="padding: 12px 32px; background: white; border-radius: 9999px; font-weight: 600; color: ${colors.primary}; border: none; cursor: pointer;">
                            🍎 App Store
                        </button>
                    </div>
                </div>
                <div style="position: relative; text-align: center;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 384px; height: 384px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(80px);"></div>
                    <img src="https://via.placeholder.com/300x600/1a1a1a/ffffff?text=App+Preview" alt="App" style="position: relative; z-index: 10; max-width: 300px; margin: 0 auto; filter: drop-shadow(0 25px 50px rgba(0,0,0,0.5)); border-radius: 24px;" />
                </div>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Services -->
    ${
      siteData.sections.includes('services') && siteData.services.length > 0
        ? `
    <section id="servicos" class="services-section">
        <div class="container">
            <div style="text-align: center; max-width: 896px; margin: 0 auto 64px;">
                <span class="section-badge" style="background: rgba(255,255,255,0.2); color: ${heroTextColor}; border: 2px solid rgba(255,255,255,0.3);">Nossos Serviços</span>
                <h2 class="section-title" style="color: ${heroTextColor}; text-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                    Serviços que<br/>
                    <span style="text-shadow: 0 6px 30px rgba(0,0,0,0.6);">Transformam</span>
                </h2>
                <p style="font-size: 20px; line-height: 1.5; color: ${heroTextColor}; opacity: 0.9; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                    Oferecemos uma gama completa de serviços de excelência
                </p>
            </div>
            <div class="services-grid">
                ${siteData.services
                  .slice(0, 6)
                  .map(
                    (service) => `
                <div class="service-card">
                    <div class="service-icon">✨</div>
                    <h3>${service}</h3>
                    <p>Serviço de qualidade premium com resultados excepcionais</p>
                    <div style="width: 64px; height: 4px; margin: 0 auto 24px; border-radius: 9999px; background: rgba(255,255,255,0.3);"></div>
                    <button style="padding: 8px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; transition: transform 0.3s; background: rgba(255,255,255,0.2); color: ${heroTextColor}; border: 1px solid rgba(255,255,255,0.4); cursor: pointer;">
                        Saiba Mais
                    </button>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Contact -->
    ${
      siteData.sections.includes('contact')
        ? `
    <section id="contato" class="contact-section">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Fale Conosco</span>
                <h2 class="section-title">
                    Venha nos <span class="highlight">Visitar</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; max-width: 896px; margin: 0 auto;">
                    Estamos prontos para atender você da melhor forma possível
                </p>
            </div>
            <div class="contact-grid">
                <div>
                    ${
                      siteData.address
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                                <circle cx="12" cy="9" r="2.5"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Endereço</strong>
                            <p>${siteData.address}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    ${
                      siteData.phone
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Telefone</strong>
                            <p>${siteData.phone}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    ${
                      siteData.email
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 8L10.89 13.26C11.5389 13.7165 12.4611 13.7165 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>E-mail</strong>
                            <p>${siteData.email}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    <button class="hero-cta-primary" style="margin-top: 40px;">Como Chegar</button>
                </div>
                <div style="height: 500px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
                    <iframe 
                        src="https://maps.google.com/maps?q=${encodeURIComponent(siteData.address || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        style="width: 100%; height: 100%; border: 0;"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4>${siteData.name}</h4>
                    <p>Experiência premium desde 2024</p>
                </div>
                <div>
                    <h4>Links Rápidos</h4>
                    <ul>
                        <li><a href="#">Sobre Nós</a></li>
                        ${siteData.sections.includes('services') ? '<li><a href="#servicos">Serviços</a></li>' : ''}
                        ${siteData.sections.includes('gallery') ? '<li><a href="#galeria">Galeria</a></li>' : ''}
                        ${siteData.sections.includes('contact') ? '<li><a href="#contato">Contato</a></li>' : ''}
                    </ul>
                </div>
                <div>
                    <h4>Contato</h4>
                    <ul>
                        ${siteData.address ? `<li>${siteData.address}</li>` : ''}
                        ${siteData.phone ? `<li>${siteData.phone}</li>` : ''}
                        ${siteData.email ? `<li>${siteData.email}</li>` : ''}
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 ${siteData.name}. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Float -->
    ${
      siteData.phone
        ? `
    <a href="https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\D/g, '')}&text=${encodeURIComponent('Olá! Vim pelo site')}" target="_blank" rel="noopener noreferrer" class="whatsapp-float">
        <svg viewBox="0 0 24 24" fill="white" style="width: 32px; height: 32px;">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
    </a>
    `
        : ''
    }
    
    <script>
        function toggleMobileMenu() {
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            menuBtn.classList.toggle('active');
        }
    </script>
</body>
</html>`;
  };

  const handlePublishToNetlify = () => {
    setShowNetlifyModal(true);
  };

  const handleDeploySuccess = (site: any) => {
    setSitePreviewUrl(site.url);
    setShowNetlifyModal(false);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 Site publicado com sucesso!\n\nSeu site está disponível em:\n${site.url}\n\nVocê pode acessá-lo agora mesmo e compartilhar com seus clientes!`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
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
        {/* Chat Section - 30% */}
        <div className="w-[30%] border-r border-slate-800 bg-slate-900/50 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                Assistente de Criação
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {message.content}
                  </p>

                  {message.options && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {message.options.map((option, idx) => {
                        const Icon = option.icon;
                        const isSelected =
                          currentStep === 5 &&
                          siteData.sections.includes(
                            option.value as SectionKey,
                          );
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (currentStep === 0) {
                                handleAreaSelect(option.value as BusinessArea);
                              } else if (currentStep === 3.5) {
                                handleVibeSelect(option.value);
                              } else if (currentStep === 4) {
                                handleColorCategorySelect(option.value);
                              } else if (currentStep === 5) {
                                handleSectionSelect(option.value);
                              } else if (option.value === 'more') {
                                // Adicionar mais imagens
                                fileInputRef.current?.click();
                              } else if (option.value === 'continue') {
                                // Continuar para próxima pergunta
                                askSectionQuestions();
                              }
                            }}
                            className={`flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-slate-600 bg-slate-700 hover:border-purple-500 hover:bg-slate-600 text-slate-300'
                            }`}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span className="text-xs font-medium">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Color Palettes Grid */}
                  {message.showColorPalettes && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {(generatedPalettes.length > 0
                          ? generatedPalettes
                          : colorPalettes.filter((p) =>
                              selectedColorCategory
                                ? p.category === selectedColorCategory
                                : true,
                            )
                        ).map((palette) => (
                          <button
                            key={palette.id}
                            onClick={() => handlePaletteSelect(palette)}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:scale-105 ${
                              siteData.selectedPaletteId === palette.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-slate-600 bg-slate-700 hover:border-purple-500'
                            }`}
                          >
                            <div className="flex gap-1">
                              <div
                                className="w-4 h-8 rounded"
                                style={{ backgroundColor: palette.primary }}
                              ></div>
                              <div
                                className="w-4 h-8 rounded"
                                style={{ backgroundColor: palette.secondary }}
                              ></div>
                              <div
                                className="w-4 h-8 rounded"
                                style={{ backgroundColor: palette.accent }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-slate-200">
                              {palette.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Button */}
                      {message.showCustomColorButton && (
                        <div className="border-t border-slate-700 pt-4">
                          <button
                            onClick={() => {
                              openInputModal({
                                title: '💡 Descreva suas cores favoritas',
                                placeholder:
                                  'Ex: azul e amarelo, roxo com rosa, verde e laranja...',
                                defaultValue: '',
                                onConfirm: (description) => {
                                  handleCustomColors(description);
                                },
                                multiline: false,
                              });
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
                          >
                            <Palette className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-purple-300">
                              💡 Ou clique aqui e descreva suas cores em uma
                              frase
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {message.requiresImages && (
                    <div className="mt-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 py-3 text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Fazer Upload de Imagens</span>
                      </button>
                      {uploadedImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => {
                                  setUploadedImages((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  );
                                  setSiteData({
                                    ...siteData,
                                    gallery: siteData.gallery.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  });
                                }}
                                className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {message.options && currentStep === 5 && (
                    <button
                      onClick={handleConfirmSections}
                      className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 py-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
                      disabled={siteData.sections.length === 0}
                    >
                      Continuar ({siteData.sections.length} seções)
                    </button>
                  )}

                  {/* Confirmação de Endereço com Google Maps */}
                  {addressConfirmation &&
                    message.role === 'assistant' &&
                    index === messages.length - 1 && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg overflow-hidden border-2 border-purple-500/30">
                          <iframe
                            src={`https://maps.google.com/maps?q=${addressConfirmation.lat},${addressConfirmation.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            className="w-full h-48"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                        <p className="text-xs text-slate-300">
                          📍 {addressConfirmation.address}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmAddress}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Confirmar
                          </button>
                          <button
                            onClick={correctAddress}
                            className="flex-1 rounded-lg border border-red-500 bg-red-500/10 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Corrigir
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Resumo das Informações para Confirmação */}
                  {showSummary &&
                    message.role === 'assistant' &&
                    index === summaryMessageIndex && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border-2 border-purple-500/30 bg-slate-900/50 overflow-hidden">
                          {/* Header do Resumo */}
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                            <h3 className="text-white font-bold text-center flex items-center justify-center gap-2">
                              <Check className="h-5 w-5" />
                              Resumo das Suas Informações
                            </h3>
                          </div>

                          {/* Corpo do Resumo */}
                          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                            {/* Nome da Empresa */}
                            <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">
                                  Nome da Empresa
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {siteData.name}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  openInputModal({
                                    title: 'Editar Nome da Empresa',
                                    placeholder: 'Digite o novo nome',
                                    defaultValue: siteData.name,
                                    onConfirm: (newValue) => {
                                      setSiteData({
                                        ...siteData,
                                        name: newValue,
                                      });
                                    },
                                  });
                                }}
                                className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                              >
                                Editar
                              </button>
                            </div>

                            {/* Slogan */}
                            <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">
                                  Slogan
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {siteData.slogan}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  openInputModal({
                                    title: 'Editar Slogan',
                                    placeholder: 'Digite o novo slogan',
                                    defaultValue: siteData.slogan,
                                    onConfirm: (newValue) => {
                                      setSiteData({
                                        ...siteData,
                                        slogan: newValue,
                                      });
                                    },
                                  });
                                }}
                                className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                              >
                                Editar
                              </button>
                            </div>

                            {/* Descrição */}
                            <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">
                                  Descrição
                                </p>
                                <p className="text-sm text-white line-clamp-3">
                                  {siteData.description}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  openInputModal({
                                    title: 'Editar Descrição',
                                    placeholder: 'Digite a nova descrição',
                                    defaultValue: siteData.description,
                                    onConfirm: (newValue) => {
                                      setSiteData({
                                        ...siteData,
                                        description: newValue,
                                      });
                                    },
                                    multiline: true,
                                  });
                                }}
                                className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                              >
                                Editar
                              </button>
                            </div>

                            {/* Cores */}
                            {siteData.colors && (
                              <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-400 mb-2">
                                    Paleta de Cores
                                  </p>
                                  <div className="flex gap-2">
                                    {(() => {
                                      const colors = JSON.parse(
                                        siteData.colors,
                                      );
                                      return (
                                        <>
                                          <div className="flex flex-col items-center gap-1">
                                            <div
                                              className="w-10 h-10 rounded-lg border-2 border-white/20"
                                              style={{
                                                backgroundColor: colors.primary,
                                              }}
                                            ></div>
                                            <span className="text-xs text-slate-400">
                                              Principal
                                            </span>
                                          </div>
                                          <div className="flex flex-col items-center gap-1">
                                            <div
                                              className="w-10 h-10 rounded-lg border-2 border-white/20"
                                              style={{
                                                backgroundColor:
                                                  colors.secondary,
                                              }}
                                            ></div>
                                            <span className="text-xs text-slate-400">
                                              Secundária
                                            </span>
                                          </div>
                                          <div className="flex flex-col items-center gap-1">
                                            <div
                                              className="w-10 h-10 rounded-lg border-2 border-white/20"
                                              style={{
                                                backgroundColor: colors.accent,
                                              }}
                                            ></div>
                                            <span className="text-xs text-slate-400">
                                              Destaque
                                            </span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setShowEditModal(true);
                                    setEditingField('colors');
                                  }}
                                  className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            )}

                            {/* Seções */}
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-slate-400">
                                  Seções do Site
                                </p>
                                <button
                                  onClick={() => {
                                    setEditingField('sections');
                                    setShowEditModal(true);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {siteData.sections.map((section) => (
                                  <span
                                    key={section}
                                    className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 text-xs font-medium"
                                  >
                                    {section}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Serviços */}
                            {siteData.services.length > 0 && (
                              <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-400 mb-1">
                                    Serviços
                                  </p>
                                  <p className="text-sm text-white">
                                    {siteData.services.join(', ')}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    openInputModal({
                                      title: 'Editar Serviços',
                                      placeholder:
                                        'Digite os serviços separados por vírgula',
                                      defaultValue:
                                        siteData.services.join(', '),
                                      onConfirm: (newValue) => {
                                        const servicesList = newValue
                                          .split(',')
                                          .map((s) => s.trim())
                                          .filter((s) => s);
                                        setSiteData({
                                          ...siteData,
                                          services: servicesList,
                                        });
                                      },
                                    });
                                  }}
                                  className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            )}

                            {/* Galeria */}
                            {siteData.gallery.length > 0 && (
                              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <p className="text-xs text-slate-400 mb-2">
                                  Imagens da Galeria
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {siteData.gallery.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Galeria ${idx + 1}`}
                                      className="w-full h-16 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contato */}
                            {siteData.sections.includes('contact') && (
                              <>
                                {siteData.address && (
                                  <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-400 mb-1">
                                        📍 Endereço
                                      </p>
                                      <p className="text-sm text-white">
                                        {siteData.address}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        openInputModal({
                                          title: 'Editar Endereço',
                                          placeholder: 'Digite o novo endereço',
                                          defaultValue: siteData.address,
                                          onConfirm: (newValue) => {
                                            setSiteData({
                                              ...siteData,
                                              address: newValue,
                                            });
                                          },
                                        });
                                      }}
                                      className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                )}

                                {siteData.phone && (
                                  <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-400 mb-1">
                                        📞 Telefone
                                      </p>
                                      <p className="text-sm text-white">
                                        {siteData.phone}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        openInputModal({
                                          title: 'Editar Telefone',
                                          placeholder: 'Digite o novo telefone',
                                          defaultValue: siteData.phone,
                                          onConfirm: (newValue) => {
                                            setSiteData({
                                              ...siteData,
                                              phone: newValue,
                                            });
                                          },
                                        });
                                      }}
                                      className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                )}

                                {siteData.email && (
                                  <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-400 mb-1">
                                        ✉️ E-mail
                                      </p>
                                      <p className="text-sm text-white">
                                        {siteData.email}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        openInputModal({
                                          title: 'Editar E-mail',
                                          placeholder: 'Digite o novo e-mail',
                                          defaultValue: siteData.email,
                                          onConfirm: (newValue) => {
                                            setSiteData({
                                              ...siteData,
                                              email: newValue,
                                            });
                                          },
                                        });
                                      }}
                                      className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Footer do Resumo */}
                          <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                            <p className="text-xs text-slate-400 text-center">
                              ✨ Revise suas informações e use os botões
                              "Editar" para fazer correções
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Botões de Ação - Acima do Input */}
          {(conversationHistory.length > 0 || showSummary) && (
            <div className="border-t border-slate-800 px-4 pt-3 pb-2 space-y-2">
              {conversationHistory.length > 0 && (
                <button
                  onClick={goBack}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-4px] transition-transform" />
                  <span className="text-sm font-semibold">
                    Voltar à pergunta anterior
                  </span>
                </button>
              )}

              {showSummary && (
                <button
                  onClick={() => {
                    // NÃO esconder o resumo, apenas gerar o site
                    handleGenerateSite();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50"
                >
                  <Check className="h-5 w-5" />
                  <span>Confirmar e Gerar Site</span>
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-800 p-4">
            {currentStep === 8 ? (
              // Input especial para telefone com dropdown de país
              <div className="space-y-2">
                <p className="text-xs text-slate-400 text-center">
                  💡 Selecione o país e digite o telefone
                </p>
                <div className="flex space-x-2">
                  {/* Dropdown de País */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCountryDropdown(!showCountryDropdown);
                      }}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                    >
                      <FlagIcon
                        countryCode={selectedCountry.code}
                        className="w-6 h-4"
                      />
                      <span className="text-slate-100 text-sm font-semibold">
                        {selectedCountry.dial}
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showCountryDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50">
                        <div className="p-2 border-b border-slate-700 bg-slate-900">
                          <p className="text-xs font-semibold text-purple-300">
                            🌍 Selecione o país
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          {COUNTRIES.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setShowCountryDropdown(false);
                                setInputMessage('');
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-purple-500/20 ${
                                selectedCountry.code === country.code
                                  ? 'bg-purple-500/30 border border-purple-500'
                                  : 'hover:bg-slate-700'
                              }`}
                            >
                              <FlagIcon
                                countryCode={country.code}
                                className="w-6 h-4 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {country.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {country.dial}
                                </p>
                              </div>
                              {selectedCountry.code === country.code && (
                                <Check className="h-4 w-4 text-purple-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input de Telefone */}
                  <input
                    type="tel"
                    value={inputMessage}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(
                        e.target.value,
                        selectedCountry,
                      );
                      setInputMessage(formatted);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Ex: ${selectedCountry.phoneFormat.replace(/#/g, '9')}`}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isGenerating}
                    className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              // Input padrão para outros steps
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  disabled={
                    currentStep === 0 ||
                    currentStep === 3.5 ||
                    currentStep === 5 ||
                    isGenerating
                  }
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !inputMessage.trim() ||
                    currentStep === 0 ||
                    currentStep === 3.5 ||
                    currentStep === 5 ||
                    isGenerating
                  }
                  className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section - 70% */}
        <div className="w-[70%] flex flex-col bg-slate-900/30">
          {/* Browser Bar */}
          <div className="border-b border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 flex-1 max-w-md">
                  <Lock className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-400">
                    {sitePreviewUrl}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {generatedSite && (
                  <>
                    <button
                      onClick={() => setShowEditor(true)}
                      className="flex items-center space-x-2 rounded-lg border border-purple-600 bg-purple-600/10 px-3 py-2 text-purple-400 hover:bg-purple-600/20 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span className="text-sm">Editar Site</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto bg-white relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-xl text-white font-semibold">
                    Gerando seu site...
                  </p>
                  <p className="text-slate-400 mt-2">
                    Aplicando suas preferências e criando um design profissional
                  </p>
                </div>
              </div>
            ) : generatedSite ? (
              <SiteTemplate siteData={siteData} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                  <Globe className="h-24 w-24 text-slate-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Preview do Site
                  </h2>
                  <p className="text-slate-400 mb-2">
                    O preview do seu site aparecerá aqui em tempo real
                  </p>
                  <p className="text-slate-500 text-sm">
                    Converse com o assistente para começar a criar seu site
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Site Editor */}
      {showEditor && (
        <SiteEditor
          siteData={siteData}
          onUpdate={(updatedData) => {
            setSiteData(updatedData);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Modal de Entrada Customizado */}
      {showInputModal && inputModalConfig && (
        <Modal
          isOpen={showInputModal}
          onClose={closeInputModal}
          title={inputModalConfig.title}
        >
          <div className="space-y-4">
            {inputModalConfig.multiline ? (
              <textarea
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                placeholder={inputModalConfig.placeholder}
                rows={4}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && modalInputValue.trim()) {
                    handleConfirmInput();
                  }
                }}
                placeholder={inputModalConfig.placeholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeInputModal}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmInput}
                disabled={!modalInputValue.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Edição de Seções */}
      {showEditModal && editingField === 'sections' && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
          title="📋 Selecione as Seções do Site"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Clique nas seções que você deseja incluir no seu site:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Hero (Início)', value: 'hero' },
                { label: 'Sobre Nós', value: 'about' },
                { label: 'Serviços', value: 'services' },
                { label: 'Galeria', value: 'gallery' },
                { label: 'Preços', value: 'pricing' },
                { label: 'Equipe', value: 'team' },
                { label: 'FAQ', value: 'faq' },
                { label: 'App Download', value: 'app' },
                { label: 'Depoimentos', value: 'testimonials' },
                { label: 'Contato', value: 'contact' },
              ].map((section) => {
                const isSelected = siteData.sections.includes(
                  section.value as SectionKey,
                );
                return (
                  <button
                    key={section.value}
                    onClick={() => {
                      const currentSections = [...siteData.sections];
                      const sectionKey = section.value as SectionKey;

                      if (currentSections.includes(sectionKey)) {
                        setSiteData({
                          ...siteData,
                          sections: currentSections.filter(
                            (s) => s !== sectionKey,
                          ),
                        });
                      } else {
                        setSiteData({
                          ...siteData,
                          sections: [...currentSections, sectionKey],
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-slate-600 bg-slate-700 hover:border-purple-500 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{section.label}</span>
                    {isSelected && (
                      <Check className="h-5 w-5 text-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                }}
                disabled={siteData.sections.length === 0}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar ({siteData.sections.length} seções)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Edição de Cores */}
      {showEditModal && editingField === 'colors' && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
          title="🎨 Escolha as Cores do Seu Site"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Selecione uma paleta de cores ou descreva suas cores customizadas:
            </p>

            {/* Paletas Sugeridas */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">
                Paletas Sugeridas:
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                {colorPalettes.slice(0, 12).map((palette) => {
                  const isSelected = siteData.selectedPaletteId === palette.id;
                  return (
                    <button
                      key={palette.id}
                      onClick={() => {
                        const paletteColors = {
                          primary: palette.primary,
                          secondary: palette.secondary,
                          accent: palette.accent,
                          dark: palette.dark,
                          light: palette.light,
                        };
                        setSiteData({
                          ...siteData,
                          colors: JSON.stringify(paletteColors),
                          selectedPaletteId: palette.id,
                        });
                      }}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-slate-600 bg-slate-700 hover:border-purple-500'
                      }`}
                    >
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-12 rounded"
                          style={{ backgroundColor: palette.primary }}
                        ></div>
                        <div
                          className="w-6 h-12 rounded"
                          style={{ backgroundColor: palette.secondary }}
                        ></div>
                        <div
                          className="w-6 h-12 rounded"
                          style={{ backgroundColor: palette.accent }}
                        ></div>
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-xs font-medium text-slate-200 block">
                          {palette.name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-purple-400 mt-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ou Descrever Cores Customizadas */}
            <div className="border-t border-slate-700 pt-4">
              <p className="text-sm font-semibold text-white mb-3">
                Ou digite as cores do jeito que você imagina:
              </p>
              <input
                type="text"
                placeholder="Ex: azul e amarelo, roxo com rosa, verde marinho..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const description = e.currentTarget.value.trim();
                    setShowEditModal(false);
                    setEditingField(null);
                    await handleCustomColors(description);
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Pressione Enter para gerar paletas com IA baseadas na sua
                descrição
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>
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
                  onClick={() => {
                    setShowEditModal(true);
                    setEditingField('sections');
                  }}
                  className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                >
                  Editar
                </button>
              </div>

              <NetlifyDeploy
                htmlContent={generateSiteHTML(siteData)}
                siteName={siteData.name
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
