import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, Eye, Loader2, Send, ArrowLeft, Globe, Lock, RefreshCw, Smartphone, Save, Palette, Rocket, MessageSquare, Laptop, Store, Handshake, Utensils, Heart, GraduationCap, Image as ImageIcon, X } from 'lucide-react';
import { SiteTemplate } from './SiteTemplate';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{ label: string; value: string; icon?: any }>;
  requiresInput?: boolean;
  requiresImages?: boolean;
};

type BusinessArea = 'technology' | 'retail' | 'services' | 'food' | 'health' | 'education';

type SectionKey = 'hero' | 'about' | 'services' | 'gallery' | 'app' | 'testimonials' | 'contact';

interface SiteData {
  area: string;
  name: string;
  slogan: string;
  description: string;
  colors: string;
  sections: SectionKey[];
  services: string[];
  gallery: string[];
  appPlayStore: string;
  appAppStore: string;
  showPlayStore: boolean;
  showAppStore: boolean;
  testimonials: Array<{ name: string; text: string; rating: number }>;
  address: string;
  phone: string;
  email: string;
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
    colors: '',
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
    email: ''
  });
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
            content: 'Ótima descrição! 🎨\n\nVamos escolher as cores do seu site. Descreva as cores que representam sua marca.\n\n(Exemplo: "azul e laranja", "preto e dourado", "verde e branco")\n\nA IA vai encontrar a melhor combinação para você!'
          };
          setCurrentStep(4);
          break;
        
        case 4: // Cores
          setSiteData({ ...siteData, colors: inputMessage });
          assistantResponse = {
            role: 'assistant',
            content: 'Perfeito! ✨\n\nAgora selecione quais seções você quer no seu site:',
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
                content: '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa?'
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
        content: '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa?'
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

  // Função para processar cores descritas pelo usuário
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
    
    return { primary: primaryColor, secondary: secondaryColor };
  };

  const handleGenerateSite = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Processar cores
      const processedColors = processColors(siteData.colors);
      setSiteData({
        ...siteData,
        colors: JSON.stringify(processedColors) // Salvar como JSON
      });
      
      setGeneratedSite(`site-${Date.now()}`);
      setSitePreviewUrl(`https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`);
      setIsGenerating(false);
      
      const successMessage: Message = {
        role: 'assistant',
        content: '🎊 Seu site foi gerado com sucesso!\n\nVocê pode visualizá-lo no preview ao lado.\n\nAgora você pode:\n✏️ Editar cores e textos\n👁️ Abrir em uma nova aba\n🚀 Publicar no Netlify!'
      };
      
      setMessages(prev => [...prev, successMessage]);
    }, 3000);
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
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  
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
          <div className="border-t border-slate-800 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                disabled={currentStep === 0 || currentStep === 5 || isGenerating}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || currentStep === 0 || currentStep === 5 || isGenerating}
                className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
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
                  <span className="text-sm text-slate-400">{sitePreviewUrl}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {generatedSite && (
                  <>
                    <button className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors">
                      <Save className="h-4 w-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm">Atualizar</span>
                    </button>
                    <button className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm">Cores</span>
                    </button>
                    <button className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition-colors">
                      <Smartphone className="h-4 w-4" />
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
