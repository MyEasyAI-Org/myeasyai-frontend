import type { Dispatch, SetStateAction } from 'react';
import type { ColorPalette } from '../../../constants/colorPalettes';
import { contentRewritingService } from '../../../services/ContentRewritingService';
import type { CountryAddressConfig } from '../../../constants/countries';
import type { Message } from '../hooks/useConversationFlow';
import type { BusinessArea, SectionKey } from '../hooks/useSiteData';
import { siteManagementService, type SiteData } from '../../../services/SiteManagementService';
import { authService } from '../../../services/AuthServiceV2';
import { generateSiteHTML } from '../utils/siteGenerator';

/**
 * Custom hook que centraliza todos os handlers do MyEasyWebsite
 */
export function useMyEasyWebsiteHandlers({
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
  onSiteCreated,
}: {
  conversation: any;
  site: any;
  colorPalettes: any;
  addressManagement: any;
  inputMessage: string;
  setInputMessage: Dispatch<SetStateAction<string>>;
  setUploadedImages: Dispatch<SetStateAction<string[]>>;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  setGeneratedSite: Dispatch<SetStateAction<string | null>>;
  setSitePreviewUrl: Dispatch<SetStateAction<string>>;
  setShowSummary: Dispatch<SetStateAction<boolean>>;
  setSummaryMessageIndex: Dispatch<SetStateAction<number | null>>;
  onSiteCreated?: (site: SiteData) => void;
}) {
  // Função auxiliar para salvar snapshot
  const saveSnapshot = () => {
    conversation.saveSnapshot(site.siteData);
  };

  // Função auxiliar para formatar telefone
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

  // Função para processar cores descritas pelo usuário
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

  // Confirmar endereço diretamente
  const confirmAddress = () => {
    if (!addressManagement.addressConfirmation) return;

    site.updateAddress(addressManagement.addressConfirmation.formatted);
    addressManagement.clearAddressConfirmation();

    conversation.addMessage({
      role: 'assistant',
      content: 'Perfeito! 📞\n\nAgora me diga o telefone de contato:',
    });
    conversation.goToStep(8);
  };

  // Corrigir endereço
  const correctAddress = () => {
    addressManagement.clearAddressConfirmation();
    conversation.addMessage({
      role: 'assistant',
      content: 'Ok! Digite o endereço correto:',
    });
    conversation.goToStep(7.5);
  };

  // Fazer perguntas sobre seções
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
    setSummaryMessageIndex(conversation.messagesCount); // Salvar índice da mensagem atual
    conversation.goToStep(9.5); // Ir direto para confirmação do resumo
  };

  // Handler para seleção de área
  const handleAreaSelect = (area: BusinessArea) => {
    saveSnapshot();

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

    conversation.addMessage(userMessage);
    conversation.addMessage(assistantMessage);
    site.updateArea(area);
    conversation.goToStep(1);
  };

  // Handler para seleção de vibe
  const handleVibeSelect = (vibe: string) => {
    saveSnapshot();

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

    conversation.addMessage(userMessage);
    conversation.addMessage(assistantMessage);
    site.updateVibe(vibe);
    conversation.goToStep(4);
  };

  // Handler para enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    saveSnapshot();

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    conversation.addMessage(userMessage);

    setTimeout(async () => {
      let assistantResponse: Message = {
        role: 'assistant',
        content: 'Entendi!',
      };

      switch (conversation.currentStep) {
        case 1: // Nome da empresa
          site.updateName(inputMessage);
          assistantResponse = {
            role: 'assistant',
            content: `Perfeito, ${inputMessage}! 🌟\n\nAgora, crie um slogan impactante para sua empresa.\n\n(Exemplo: "Elevando seu estilo a um novo nível")`,
          };
          conversation.goToStep(2);
          break;

        case 2: // Slogan
          site.updateSlogan(inputMessage);
          assistantResponse = {
            role: 'assistant',
            content:
              'Excelente slogan! 📝\n\nAgora, descreva brevemente sua empresa. O que vocês fazem? Quais produtos ou serviços oferecem?',
          };
          conversation.goToStep(3);
          break;

        case 3: // Descrição
          site.updateDescription(inputMessage);
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
          conversation.goToStep(3.5);
          break;

        case 3.5: // Vibração (será chamado por handleVibeSelect)
          break;

        case 4: {
          // Cores (agora via ColorPaletteSelector, mas mantém fallback para descrição textual)
          const customColors = processColors(inputMessage);
          site.updateColors(JSON.stringify(customColors));
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
          conversation.goToStep(5);
          break;
        }

        case 7: // Respostas das perguntas de seções
          // Processar serviços
          if (
            site.siteData.sections.includes('services') &&
            site.siteData.services.length === 0
          ) {
            const servicesList = inputMessage
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s);
            site.setServices(servicesList);

            // Próxima pergunta
            if (site.siteData.sections.includes('gallery')) {
              assistantResponse = {
                role: 'assistant',
                content:
                  '📸 Vamos configurar a seção de GALERIA\n\nEnvie as imagens que você quer na galeria do seu site.\n\nClique no botão de upload abaixo ⬇️',
                requiresImages: true,
              };
            } else if (site.siteData.sections.includes('contact')) {
              assistantResponse = {
                role: 'assistant',
                content:
                  '📧 Vamos configurar a seção de CONTATO\n\nQual é o endereço completo da sua empresa com CEP?',
              };
              conversation.goToStep(7.5);
            } else {
              // SEMPRE mostrar resumo antes de gerar o site
              setShowSummary(true);
              assistantResponse = {
                role: 'assistant',
                content:
                  '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
              };
              setSummaryMessageIndex(conversation.messagesCount + 1);
              conversation.goToStep(9.5);
            }
          }
          // Processar endereço e buscar coordenadas
          else if (site.siteData.sections.includes('contact') && !site.siteData.address) {
            // Buscar coordenadas do endereço
            const isValid = await addressManagement.validateAddress(inputMessage);

            if (isValid) {
              assistantResponse = {
                role: 'assistant',
                content:
                  '📍 Encontrei a localização!\n\nVerifique no mapa abaixo se está correto:',
              };
              conversation.goToStep(7.6);
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
            setSummaryMessageIndex(conversation.messagesCount + 1);
            conversation.goToStep(9.5);
          }
          break;

        case 7.5: {
          // Correção de endereço
          const isValid = await addressManagement.validateAddress(inputMessage);

          if (isValid) {
            assistantResponse = {
              role: 'assistant',
              content:
                '📍 Encontrei a localização!\n\nVerifique no mapa abaixo se está correto:',
            };
            conversation.goToStep(7.6);
          } else {
            assistantResponse = {
              role: 'assistant',
              content:
                '❌ Não consegui encontrar esse endereço.\n\nPor favor, digite um endereço mais completo com cidade e estado.',
            };
          }
          break;
        }

        case 7.6: // Confirmação de endereço
          if (
            inputMessage.toLowerCase().includes('sim') ||
            inputMessage.toLowerCase().includes('confirmar') ||
            inputMessage.toLowerCase().includes('correto')
          ) {
            if (addressManagement.addressConfirmation) {
              site.updateAddress(addressManagement.addressConfirmation.formatted);
              addressManagement.clearAddressConfirmation();

              assistantResponse = {
                role: 'assistant',
                content: 'Perfeito! 📞\n\nAgora me diga o telefone de contato:',
              };
              conversation.goToStep(8);
            }
          } else {
            addressManagement.clearAddressConfirmation();
            assistantResponse = {
              role: 'assistant',
              content: 'Ok! Digite o endereço correto:',
            };
            conversation.goToStep(7.5);
          }
          break;

        case 8: {
          // Telefone com seletor de país
          const formattedPhone = formatPhoneNumber(
            inputMessage,
            addressManagement.selectedCountry,
          );
          site.updatePhone(`${addressManagement.selectedCountry.dial} ${formattedPhone}`);

          assistantResponse = {
            role: 'assistant',
            content: 'Perfeito! ✉️\n\nPor último, qual é o e-mail de contato?',
          };
          conversation.goToStep(9);
          break;
        }

        case 9: // Email
          site.updateEmail(inputMessage);
          setShowSummary(true);
          assistantResponse = {
            role: 'assistant',
            content:
              '📋 Perfeito! Agora vou mostrar um resumo de todas as suas informações para você confirmar:',
          };
          setSummaryMessageIndex(conversation.messagesCount + 1);
          conversation.goToStep(9.5);
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
          break;
      }

      conversation.addMessage(assistantResponse);
    }, 1000);

    setInputMessage('');
  };

  // Handler para seleção de cor base
  const handleColorCategorySelect = (category: string) => {
    saveSnapshot();

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

    conversation.addMessage(userMessage);
    conversation.addMessage(assistantMessage);
    colorPalettes.selectCategory(category);
    conversation.goToStep(4.5);
  };

  // Handler para seleção de paleta
  const handlePaletteSelect = (palette: ColorPalette) => {
    saveSnapshot();

    const paletteColors = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      dark: palette.dark,
      light: palette.light,
    };

    site.updateColors(JSON.stringify(paletteColors));
    site.updateSelectedPaletteId(palette.id);

    conversation.addMessage({
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
    });
    conversation.goToStep(5);
  };

  // Handler para seleção de seção
  const handleSectionSelect = (section: string) => {
    const currentSections = [...site.siteData.sections];
    const sectionKey = section as SectionKey;

    if (currentSections.includes(sectionKey)) {
      site.removeSection(sectionKey);
    } else {
      site.addSection(sectionKey);
    }
  };

  // Handler para confirmar seções
  const handleConfirmSections = () => {
    if (site.siteData.sections.length === 0) return;

    conversation.goToStep(6);
    askSectionQuestions();
  };

  // Handler para upload de imagens
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
          site.addGalleryImages(imageUrls);

          conversation.addMessage({
            role: 'assistant',
            content: `✅ ${imageUrls.length} imagem(ns) adicionada(s) com sucesso!\n\nDeseja adicionar mais imagens ou continuar?`,
            options: [
              { label: 'Adicionar mais', value: 'more' },
              { label: 'Continuar', value: 'continue' },
            ],
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handler para cores customizadas
  const handleCustomColors = async (description: string) => {
    conversation.addMessage({
      role: 'user',
      content: `Minhas cores: ${description}`,
    });
    conversation.addMessage({
      role: 'assistant',
      content: `🎨 Entendi! Você quer cores "${description}"...\n\n🤖 Deixa eu criar algumas paletas profissionais para você escolher!\n\n✨ Usando IA para gerar 6 opções incríveis...`,
    });

    try {
      await colorPalettes.generateCustomPalettes(description);

      conversation.addMessage({
        role: 'assistant',
        content: `✅ Paletas geradas com sucesso!\n\n🎨 Criei ${colorPalettes.generatedPalettes.length} opções de paletas baseadas em "${description}".\n\nEscolha sua favorita:`,
        showColorPalettes: true,
      });
    } catch (error) {
      console.error('Erro ao gerar paletas:', error);
      const customColors = processColors(description);
      site.updateColors(JSON.stringify(customColors));

      conversation.addMessage({
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
      });
      conversation.goToStep(5);
    }
  };

  // Handler para gerar site
  const handleGenerateSite = async () => {
    setIsGenerating(true);

    conversation.addMessage({
      role: 'assistant',
      content:
        '🤖 Estou processando seus textos com IA...\n\n✨ Reescrevendo slogan\n📝 Otimizando descrição\n🎯 Melhorando serviços\n❓ Gerando FAQ personalizado\n\nIsso vai deixar seu site muito mais profissional e persuasivo!',
    });

    try {
      const correctedName = await contentRewritingService.correctNameCapitalization(site.siteData.name);

      const rewrittenContent = await contentRewritingService.rewriteAllContent({
        name: correctedName,
        area: site.siteData.area,
        slogan: site.siteData.slogan,
        description: site.siteData.description,
        services: site.siteData.services,
      });

      site.updateName(correctedName);
      site.updateSlogan(rewrittenContent.slogan);
      site.updateDescription(rewrittenContent.description);
      site.setServices(rewrittenContent.services);
      site.updateFAQ(rewrittenContent.faq);
      site.updateHeroStats(rewrittenContent.heroStats);
      site.updateFeatures(rewrittenContent.features);
      site.updateAboutContent(rewrittenContent.aboutContent);
      site.updateServiceDescriptions(rewrittenContent.serviceDescriptions);
      site.updateTestimonials(rewrittenContent.testimonials);

      conversation.addMessage({
        role: 'assistant',
        content:
          '✅ Textos otimizados com sucesso!\n\n🎨 Slogan reescrito com impacto\n📖 Descrição persuasiva criada\n🌟 Serviços profissionalizados\n💬 FAQ personalizado gerado\n\nAgora vou gerar seu site...',
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Gerar HTML do site
      const generatedHtml = generateSiteHTML(site.siteData, site);

      // Salvar site no banco imediatamente (status: building)
      const user = authService.getUser();
      if (user?.uuid) {
        const slug = correctedName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

        try {
          // Salvar TODOS os dados do site para poder restaurar depois
          const fullSiteData = {
            // Dados básicos
            businessName: correctedName,
            tagline: site.siteData.slogan,
            description: site.siteData.description,
            phone: site.siteData.phone,
            email: site.siteData.email,
            address: site.siteData.address,

            // Configurações visuais
            colors: site.siteData.colors, // JSON string com todas as cores
            selectedPaletteId: site.siteData.selectedPaletteId,
            vibe: site.siteData.vibe,
            area: site.siteData.area,

            // Seções e conteúdo
            sections: site.siteData.sections,
            services: site.siteData.services,
            serviceDescriptions: site.siteData.serviceDescriptions,
            gallery: site.siteData.gallery,
            faq: site.siteData.faq,
            pricing: site.siteData.pricing,
            team: site.siteData.team,
            testimonials: site.siteData.testimonials,
            heroStats: site.siteData.heroStats,
            features: site.siteData.features,
            aboutContent: site.siteData.aboutContent,

            // Apps
            appPlayStore: site.siteData.appPlayStore,
            appAppStore: site.siteData.appAppStore,
            showPlayStore: site.siteData.showPlayStore,
            showAppStore: site.siteData.showAppStore,

            // HTML gerado
            generatedHtml,

            // Estado da conversa (para restaurar depois)
            conversationMessages: conversation.messages,
            conversationStep: conversation.currentStep,
          };

          const createResult = await siteManagementService.createSite({
            user_uuid: user.uuid,
            slug,
            name: correctedName,
            business_type: site.siteData.area || 'business',
            status: 'building',
            settings: JSON.stringify(fullSiteData),
          });

          if (createResult.success && createResult.data) {
            console.log('✅ [handleGenerateSite] Site salvo no banco:', createResult.data.slug);
            onSiteCreated?.(createResult.data);
          }
        } catch (err) {
          console.error('❌ [handleGenerateSite] Erro ao salvar site no banco:', err);
        }
      }

      setGeneratedSite(`site-${Date.now()}`);
      const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
      setSitePreviewUrl(
        `https://${correctedName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')}.${domain}`,
      );
      setIsGenerating(false);

      const successMessage: Message = {
        role: 'assistant',
        content:
          '🎊 Seu site foi gerado com sucesso!\n\n✨ Todos os textos foram otimizados por IA para máxima conversão!\n\nVocê pode visualizá-lo no preview ao lado.\n\nAgora você pode:\n✏️ Editar cores e textos\n👁️ Abrir em uma nova aba\n🚀 Publicar!',
      };

      conversation.addMessage(successMessage);
    } catch (error) {
      console.error('Erro ao gerar site:', error);
      setIsGenerating(false);

      conversation.addMessage({
        role: 'assistant',
        content:
          '❌ Ocorreu um erro ao otimizar os textos.\n\nMas não se preocupe! Vou gerar seu site com os textos originais.\n\nVocê poderá editá-los manualmente depois.',
      });

      setTimeout(() => {
        setGeneratedSite(`site-${Date.now()}`);
        const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
        setSitePreviewUrl(
          `https://${site.siteData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')}.${domain}`,
        );
      }, 1000);
    }
  };

  return {
    handleAreaSelect,
    handleVibeSelect,
    handleSendMessage,
    handleColorCategorySelect,
    handlePaletteSelect,
    handleSectionSelect,
    handleConfirmSections,
    handleImageUpload,
    handleCustomColors,
    confirmAddress,
    correctAddress,
    handleGenerateSite,
  };
}
