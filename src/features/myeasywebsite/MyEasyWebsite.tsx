import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, Eye, Loader2, Send, ArrowLeft, Globe, Lock, RefreshCw, Smartphone, Save, Palette, Rocket, MessageSquare, Laptop, Store, Handshake, Utensils, Heart, GraduationCap, Image as ImageIcon, X } from 'lucide-react';
import { SiteTemplate } from './SiteTemplate';
import { SiteEditor } from '../../components/SiteEditor';
import type { ColorPalette } from '../../constants/colorPalettes';
import { colorPalettes } from '../../constants/colorPalettes';
import { rewriteAllContent, correctNameCapitalization } from '../../lib/gemini';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{ label: string; value: string; icon?: any }>;
  requiresInput?: boolean;
  requiresImages?: boolean;
  showColorPalettes?: boolean;
  showCustomColorButton?: boolean;
};

type BusinessArea = 'technology' | 'retail' | 'services' | 'food' | 'health' | 'education';

type SectionKey = 'hero' | 'about' | 'services' | 'gallery' | 'app' | 'testimonials' | 'contact' | 'faq' | 'pricing' | 'team';

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

export function MyEasyWebsite() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou seu assistente de criação de sites.\n\nVamos criar um site profissional para sua empresa!\n\nPara começar, escolha a área de atuação do seu negócio:',
      options: [
        { label: 'Tecnologia', value: 'technology', icon: Laptop },
        { label: 'Varejo', value: 'retail', icon: Store },
        { label: 'Serviços', value: 'services', icon: Handshake },
        { label: 'Alimentação', value: 'food', icon: Utensils },
        { label: 'Saúde', value: 'health', icon: Heart },
        { label: 'Educação', value: 'education', icon: GraduationCap },
      ]
    }
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
      { question: 'Como posso agendar um horário?', answer: 'Você pode agendar através do nosso site, app ou WhatsApp.' },
      { question: 'Quais são as formas de pagamento?', answer: 'Aceitamos dinheiro, cartão de crédito/débito e PIX.' },
      { question: 'Vocês atendem aos finais de semana?', answer: 'Sim, atendemos de segunda a sábado, das 9h às 18h.' }
    ],
    pricing: [
      { name: 'Básico', price: 'R$ 99', features: ['Atendimento básico', 'Produtos padrão', 'Sem agendamento'] },
      { name: 'Premium', price: 'R$ 199', features: ['Atendimento premium', 'Produtos premium', 'Agendamento prioritário', 'Brindes exclusivos'] },
      { name: 'VIP', price: 'R$ 299', features: ['Atendimento VIP', 'Produtos top de linha', 'Agendamento exclusivo', 'Tratamento especial', 'Benefícios extras'] }
    ],
    team: [
      { name: 'João Silva', role: 'CEO & Fundador' },
      { name: 'Maria Santos', role: 'Diretora de Operações' },
      { name: 'Pedro Costa', role: 'Gerente de Atendimento' }
    ]
  });
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [selectedColorCategory, setSelectedColorCategory] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sitePreviewUrl, setSitePreviewUrl] = useState('https://seu-site.netlify.app');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showNetlifyModal, setShowNetlifyModal] = useState(false);
  const [netlifyName, setNetlifyName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAreaSelect = (area: BusinessArea) => {
    const userMessage: Message = {
      role: 'user',
      content: `Selecionei: ${area}`
    };
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: 'Ótima escolha! 🎯\n\nAgora me diga, qual é o nome da sua empresa?',
      requiresInput: true
    };
    
    setMessages([...messages, userMessage, assistantMessage]);
    setSiteData({ ...siteData, area });
    setCurrentStep(1);
  };

  // Handler para seleção de vibração/emoção do site
  const handleVibeSelect = (vibe: string) => {
    const vibeLabels: Record<string, string> = {
      'vibrant': '🎨 Vibrante & Animado',
      'dark': '🌑 Dark & Profissional',
      'light': '☀️ Claro & Alegre',
      'corporate': '💼 Corporativo & Formal',
      'fun': '🎪 Divertido & Criativo',
      'elegant': '✨ Elegante & Minimalista'
    };

    const userMessage: Message = {
      role: 'user',
      content: `Escolhi: ${vibeLabels[vibe]}`
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: 'Perfeito! 🎨\n\nAgora vamos escolher as cores perfeitas para o seu site!\n\nPrimeiro, escolha uma cor base:',
      options: [
        { label: '💙 Azul', value: 'blue' },
        { label: '💚 Verde', value: 'green' },
        { label: '💜 Roxo', value: 'purple' },
        { label: '💗 Rosa', value: 'pink' },
        { label: '❤️ Vermelho', value: 'red' },
        { label: '🧡 Laranja', value: 'orange' },
        { label: '💛 Amarelo', value: 'yellow' },
        { label: '🤍 Neutro', value: 'neutral' },
      ]
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setSiteData({ ...siteData, vibe });
    setCurrentStep(4);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages([...messages, userMessage]);
    
    setTimeout(() => {
      let assistantResponse: Message;
      
      switch(currentStep) {
        case 1: // Nome da empresa
          setSiteData({ ...siteData, name: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: `Perfeito, ${inputMessage}! 🌟\n\nAgora, crie um slogan impactante para sua empresa.\n\n(Exemplo: "Elevando seu estilo a um novo nível")`
          };
          setCurrentStep(2);
          break;
        
        case 2: // Slogan
          setSiteData({ ...siteData, slogan: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: 'Excelente slogan! 📝\n\nAgora, descreva brevemente sua empresa. O que vocês fazem? Quais produtos ou serviços oferecem?'
          };
          setCurrentStep(3);
          break;
        
        case 3: // Descrição
          setSiteData({ ...siteData, description: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: '✨ Perfeito! Agora me diga:\n\n**Que sentimento você quer transmitir ao visitante do seu site?**',
            options: [
              { label: '🎨 Vibrante & Animado', value: 'vibrant' },
              { label: '🌑 Dark & Profissional', value: 'dark' },
              { label: '☀️ Claro & Alegre', value: 'light' },
              { label: '💼 Corporativo & Formal', value: 'corporate' },
              { label: '🎪 Divertido & Criativo', value: 'fun' },
              { label: '✨ Elegante & Minimalista', value: 'elegant' },
            ]
          };
          setCurrentStep(3.5); // Novo step para vibração
          break;
        
        case 3.5: // Vibração (será chamado por handleVibeSelect)
          // Este caso não será usado diretamente, mas mantenho para consistência
          break;
        
        case 4: // Cores (agora via ColorPaletteSelector, mas mantém fallback para descrição textual)
          // Este caso só será usado se o usuário usar a opção "Descrever Minhas Cores"
          const customColors = processColors(inputMessage);
          setSiteData({ 
            ...siteData, 
            colors: JSON.stringify(customColors)
          });
          setShowColorSelector(false);
          assistantResponse = {
            role: 'assistant',
            content: 'Perfeito! ✨\n\nSua paleta personalizada foi criada!\n\nAgora selecione quais seções você quer no seu site:',
            options: [
              { label: 'Hero (Início)', value: 'hero' },
              { label: 'Sobre Nós', value: 'about' },
              { label: 'Serviços', value: 'services' },
              { label: 'Galeria', value: 'gallery' },
              { label: 'App Download', value: 'app' },
              { label: 'Depoimentos', value: 'testimonials' },
              { label: 'Contato', value: 'contact' },
            ]
          };
          setCurrentStep(5);
          break;
        
        case 7: // Respostas das perguntas de seções
          // Processar serviços
          if (siteData.sections.includes('services') && siteData.services.length === 0) {
            const servicesList = inputMessage.split(',').map(s => s.trim()).filter(s => s);
            setSiteData({ ...siteData, services: servicesList });
            
            // Próxima pergunta
            if (siteData.sections.includes('gallery')) {
              assistantResponse = {
                role: 'assistant',
                content: '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
                requiresImages: true
              };
            } else if (siteData.sections.includes('contact')) {
              assistantResponse = {
                role: 'assistant',
                content: '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?'
              };
              setCurrentStep(8);
            } else {
              handleGenerateSite();
              return;
            }
          }
          // Processar contato
          else if (siteData.sections.includes('contact')) {
            if (!siteData.address) {
              setSiteData({ ...siteData, address: inputMessage });
              assistantResponse = {
                role: 'assistant',
                content: 'Ótimo! 📞\n\nAgora me diga o telefone de contato:'
              };
              setCurrentStep(8);
            } else if (!siteData.phone) {
              setSiteData({ ...siteData, phone: inputMessage });
              assistantResponse = {
                role: 'assistant',
                content: 'Perfeito! ✉️\n\nPor último, qual é o e-mail de contato?'
              };
              setCurrentStep(9);
            } else {
              setSiteData({ ...siteData, email: inputMessage });
              handleGenerateSite();
              return;
            }
          } else {
            handleGenerateSite();
            return;
          }
          break;
        
        case 8: // Telefone
          setSiteData({ ...siteData, phone: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: 'Perfeito! ✉️\n\nPor último, qual é o e-mail de contato?'
          };
          setCurrentStep(9);
          break;
        
        case 9: // Email
          setSiteData({ ...siteData, email: inputMessage });
          handleGenerateSite();
          return;
        
        default:
          assistantResponse = {
            role: 'assistant',
            content: 'Entendi!'
          };
      }
      
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);

    setInputMessage('');
  };

  const handleSectionSelect = (section: string) => {
    const currentSections = [...siteData.sections];
    const sectionKey = section as SectionKey;
    
    if (currentSections.includes(sectionKey)) {
      setSiteData({
        ...siteData,
        sections: currentSections.filter(s => s !== sectionKey)
      });
    } else {
      setSiteData({
        ...siteData,
        sections: [...currentSections, sectionKey]
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📋 Vamos configurar a seção de SERVIÇOS\n\nListe seus serviços separados por vírgula.\n\n(Exemplo: Corte Premium, Barboterapia, Hidratação Capilar)'
      }]);
      setCurrentStep(7);
      return;
    }

    // Perguntas para Galeria
    if (sections.includes('gallery') && siteData.gallery.length === 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
        requiresImages: true
      }]);
      setCurrentStep(7);
      return;
    }

    // Perguntas para Contato
    if (sections.includes('contact') && !siteData.address) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?'
      }]);
      setCurrentStep(7);
      return;
    }

    // Se não há mais perguntas, gera o site
    handleGenerateSite();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageUrls: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === files.length) {
          setUploadedImages(prev => [...prev, ...imageUrls]);
          setSiteData({ ...siteData, gallery: [...siteData.gallery, ...imageUrls] });
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ ${imageUrls.length} imagem(ns) adicionada(s) com sucesso!\n\nDeseja adicionar mais imagens ou continuar?`,
            options: [
              { label: 'Adicionar mais', value: 'more' },
              { label: 'Continuar', value: 'continue' }
            ]
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handler para seleção de cor base
  const handleColorCategorySelect = (category: string) => {
    const categoryLabels: Record<string, string> = {
      'blue': '💙 Azul',
      'green': '💚 Verde',
      'purple': '💜 Roxo',
      'pink': '💗 Rosa',
      'red': '❤️ Vermelho',
      'orange': '🧡 Laranja',
      'yellow': '💛 Amarelo',
      'neutral': '🤍 Neutro'
    };

    const userMessage: Message = {
      role: 'user',
      content: `Escolhi: ${categoryLabels[category]}`
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: `Ótima escolha! ${categoryLabels[category]}\n\nAgora escolha uma das paletas profissionais abaixo:`,
      showColorPalettes: true,
      showCustomColorButton: true
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setSelectedColorCategory(category);
    setCurrentStep(4.5);
  };

  // Handler para seleção de paleta
  const handlePaletteSelect = (palette: ColorPalette) => {
    const paletteColors = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      dark: palette.dark,
      light: palette.light
    };
    
    setSiteData({ 
      ...siteData, 
      colors: JSON.stringify(paletteColors),
      selectedPaletteId: palette.id
    });
    setShowColorSelector(false);
    
    // Adicionar mensagem do assistente
    setMessages(prev => [...prev, {
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
      ]
    }]);
    setCurrentStep(5);
  };

  // Handler para descrição customizada de cores
  const handleCustomColors = (description: string) => {
    const customColors = processColors(description);
    setSiteData({ 
      ...siteData, 
      colors: JSON.stringify(customColors)
    });
    setShowColorSelector(false);
    
    // Adicionar mensagens
    setMessages(prev => [...prev, 
      {
        role: 'user',
        content: `Minhas cores: ${description}`
      },
      {
        role: 'assistant',
        content: `Perfeito! 🎨\n\nSua paleta personalizada foi criada com base em "${description}"!\n\nAgora selecione quais seções você quer no seu site:`,
        options: [
          { label: 'Hero (Início)', value: 'hero' },
          { label: 'Sobre Nós', value: 'about' },
          { label: 'Serviços', value: 'services' },
          { label: 'Galeria', value: 'gallery' },
          { label: 'App Download', value: 'app' },
          { label: 'Depoimentos', value: 'testimonials' },
          { label: 'Contato', value: 'contact' },
        ]
      }
    ]);
    setCurrentStep(5);
  };

  // Função para processar cores descritas pelo usuário (IA personalizada)
  const processColors = (colorDescription: string) => {
    const desc = colorDescription.toLowerCase();
    
    // Mapear cores comuns
    const colorMap: Record<string, string> = {
      'azul': '#2563eb',
      'azul claro': '#60a5fa',
      'azul escuro': '#1e40af',
      'roxo': '#9333ea',
      'roxo claro': '#c084fc',
      'roxo escuro': '#7e22ce',
      'verde': '#22c55e',
      'verde claro': '#4ade80',
      'verde escuro': '#16a34a',
      'vermelho': '#ef4444',
      'vermelho claro': '#f87171',
      'vermelho escuro': '#dc2626',
      'laranja': '#f97316',
      'laranja claro': '#fb923c',
      'laranja escuro': '#ea580c',
      'amarelo': '#facc15',
      'amarelo claro': '#fde047',
      'amarelo escuro': '#eab308',
      'rosa': '#ec4899',
      'rosa claro': '#f472b6',
      'rosa escuro': '#db2777',
      'preto': '#1f2937',
      'cinza': '#6b7280',
      'cinza claro': '#9ca3af',
      'cinza escuro': '#374151',
      'dourado': '#f59e0b',
      'prata': '#94a3b8',
      'marrom': '#92400e',
      'turquesa': '#06b6d4',
      'ciano': '#0891b2',
    };

    // Tentar encontrar AMBAS as cores na descrição
    let primaryColor = '#f97316'; // laranja vibrante padrão
    let secondaryColor = '#facc15'; // amarelo padrão
    
    // Dividir por "e", vírgula ou "com"
    const parts = desc.split(/\s+e\s+|,\s+|\s+com\s+/).map(p => p.trim());
    
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
      light: lightColor
    };
  };

  const handleGenerateSite = async () => {
    setIsGenerating(true);
    
    // Mensagem de que a IA está processando
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '🤖 Estou processando seus textos com IA...\n\n✨ Reescrevendo slogan\n📝 Otimizando descrição\n🎯 Melhorando serviços\n❓ Gerando FAQ personalizado\n\nIsso vai deixar seu site muito mais profissional e persuasivo!'
    }]);
    
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
        testimonials: rewrittenContent.testimonials
      };
      
      setSiteData(updatedSiteData);
      
      // Mensagem de sucesso da IA
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '✅ Textos otimizados com sucesso!\n\n🎨 Slogan reescrito com impacto\n📖 Descrição persuasiva criada\n🌟 Serviços profissionalizados\n💬 FAQ personalizado gerado\n\nAgora vou gerar seu site...'
      }]);
      
      // Pequeno delay para mostrar a mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGeneratedSite(`site-${Date.now()}`);
      setSitePreviewUrl(`https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`);
      setIsGenerating(false);
      
      const successMessage: Message = {
        role: 'assistant',
        content: '🎊 Seu site foi gerado com sucesso!\n\n✨ Todos os textos foram otimizados por IA para máxima conversão!\n\nVocê pode visualizá-lo no preview ao lado.\n\nAgora você pode:\n✏️ Editar cores e textos\n👁️ Abrir em uma nova aba\n🚀 Publicar no Netlify!'
      };
      
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Erro ao gerar site:', error);
      setIsGenerating(false);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Ocorreu um erro ao otimizar os textos.\n\nMas não se preocupe! Vou gerar seu site com os textos originais.\n\nVocê poderá editá-los manualmente depois.'
      }]);
      
      // Gerar site mesmo com erro na IA
      setTimeout(() => {
        setGeneratedSite(`site-${Date.now()}`);
        setSitePreviewUrl(`https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`);
      }, 1000);
    }
  };

  const handlePublishToNetlify = () => {
    setShowNetlifyModal(true);
  };

  const handleConfirmNetlify = () => {
    if (!netlifyName.trim()) return;
    
    // Aqui seria a integração real com Netlify
    setSitePreviewUrl(`https://${netlifyName}.netlify.app`);
    setShowNetlifyModal(false);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🎉 Site publicado com sucesso!\n\nSeu site está disponível em:\n${netlifyName}.netlify.app`
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Dashboard</span>
              </a>
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-purple-400" />
                <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                  Criador de Sites Inteligente
                </h1>
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
              <h2 className="text-lg font-semibold text-white">Assistente de Criação</h2>
            </div>
            <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
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
                      <span className="text-xs font-semibold text-purple-400">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  
                  {message.options && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {message.options.map((option, idx) => {
                        const Icon = option.icon;
                        const isSelected = currentStep === 5 && siteData.sections.includes(option.value as SectionKey);
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
                            <span className="text-xs font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Color Palettes Grid */}
                  {message.showColorPalettes && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {colorPalettes.filter(p => selectedColorCategory ? p.category === selectedColorCategory : true).map((palette) => (
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
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: palette.primary }}></div>
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: palette.secondary }}></div>
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: palette.accent }}></div>
                            </div>
                            <span className="text-xs font-medium text-slate-200">{palette.name}</span>
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Color Button */}
                      {message.showCustomColorButton && (
                        <div className="border-t border-slate-700 pt-4">
                          <button
                            onClick={() => {
                              const description = prompt('💡 Descreva suas cores favoritas:\n\nExemplos:\n• "azul e amarelo"\n• "roxo com rosa"\n• "verde e laranja"\n• "preto e dourado"');
                              if (description) {
                                handleCustomColors(description);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
                          >
                            <Palette className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-purple-300">💡 Ou clique aqui e descreva suas cores em uma frase</span>
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
                              <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-16 object-cover rounded" />
                              <button
                                onClick={() => {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                  setSiteData({
                                    ...siteData,
                                    gallery: siteData.gallery.filter((_, i) => i !== idx)
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {(
            <div className="border-t border-slate-800 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  disabled={currentStep === 0 || currentStep === 3.5 || currentStep === 5 || isGenerating}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || currentStep === 0 || currentStep === 3.5 || currentStep === 5 || isGenerating}
                  className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
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
                  <span className="text-sm text-slate-400">{sitePreviewUrl}</span>
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
                  <p className="text-xl text-white font-semibold">Gerando seu site...</p>
                  <p className="text-slate-400 mt-2">Aplicando suas preferências e criando um design profissional</p>
                </div>
              </div>
            ) : generatedSite ? (
              <SiteTemplate siteData={siteData} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                  <Globe className="h-24 w-24 text-slate-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Preview do Site</h2>
                  <p className="text-slate-400 mb-2">O preview do seu site aparecerá aqui em tempo real</p>
                  <p className="text-slate-500 text-sm">Converse com o assistente para começar a criar seu site</p>
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

      {/* Netlify Modal */}
      {showNetlifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Rocket className="h-6 w-6 text-purple-400" />
                <span>Publicar no Netlify</span>
              </h2>
              <button
                onClick={() => setShowNetlifyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-slate-300 mb-6">
              🎉 Seu site está pronto! Escolha um nome para publicá-lo online:
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome do seu site:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={netlifyName}
                  onChange={(e) => setNetlifyName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="meu-site"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-slate-400">.netlify.app</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Exemplo: <strong className="text-purple-400">meu-negocio</strong> → meu-negocio.netlify.app
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                ℹ️ Seu site ficará disponível instantaneamente no endereço escolhido!
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNetlifyModal(false)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmNetlify}
                disabled={!netlifyName.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Rocket className="h-4 w-4" />
                <span>Publicar Agora!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
