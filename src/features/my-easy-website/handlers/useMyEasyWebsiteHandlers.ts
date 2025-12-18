import type { Dispatch, SetStateAction } from 'react';
import type { ColorPalette } from '../../../constants/colorPalettes';
import { contentRewritingService } from '../../../services/ContentRewritingService';
import type { CountryAddressConfig } from '../../../constants/countries';
import type { Message } from '../hooks/useConversationFlow';
import type { BusinessArea, SectionKey } from '../hooks/useSiteData';
import { siteManagementService, type SiteData } from '../../../services/SiteManagementService';
import { authService } from '../../../services/AuthServiceV2';
import { generateSiteHTML } from '../utils/siteGenerator';
import { TEMPLATE_CONFIGS } from '../constants/templateConfig';
import { selectBestTemplate } from '../utils/templateSelector';

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

    // Salvar coordenadas para o mapa e habilitar exibicao do mapa
    if (addressManagement.addressConfirmation.lat && addressManagement.addressConfirmation.lng) {
      site.updateMapCoordinates(
        addressManagement.addressConfirmation.lat,
        addressManagement.addressConfirmation.lng
      );
      site.updateShowMap(true);
    }

    addressManagement.clearAddressConfirmation();

    conversation.addMessage({
      role: 'assistant',
      content: 'Endereço salvo! ✅\n\nAgora o telefone para contato 📞\n\nEsse número vai aparecer no WhatsApp do seu site!',
    });
    conversation.goToStep(8);
  };

  // Corrigir endereço
  const correctAddress = () => {
    addressManagement.clearAddressConfirmation();
    conversation.addMessage({
      role: 'assistant',
      content: 'Sem problemas! 😊\n\nDigite o endereço correto com cidade e estado.',
    });
    conversation.goToStep(7.5);
  };

  // Tipo para opções de skip no fluxo de perguntas
  type SkipOptions = {
    services?: boolean;
    gallery?: boolean;
    address?: boolean;
    phone?: boolean;
    email?: boolean;
    socialLinks?: boolean;
    businessHours?: boolean;
    logo?: boolean;
    stats?: boolean;
    team?: boolean;
    pricing?: boolean;
    whatsapp?: boolean;
    seo?: boolean;
  };

  // Fazer perguntas sobre seções - SEMPRE coleta informações básicas
  // O parâmetro skip é usado para evitar loops quando acabamos de salvar um campo
  // (o React state ainda não atualizou quando askSectionQuestions é chamado)
  const askSectionQuestions = (skip: SkipOptions = {}) => {
    const sections = site.siteData.sections;

    // 1. PRIMEIRO: Perguntar sobre Serviços (se a seção foi selecionada)
    if (sections.includes('services') && site.siteData.services.length === 0 && !skip.services) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Ótimo! Agora vamos listar seus serviços ⚡\n\nQuais serviços ou produtos você oferece?\n\nSepare cada um por vírgula, por exemplo:\nCorte de Cabelo, Barba, Hidratação, Massagem',
      });
      conversation.goToStep(7);
      return;
    }

    // 2. SEGUNDO: Perguntar sobre Galeria (se a seção foi selecionada)
    if (sections.includes('gallery') && site.siteData.gallery.length === 0 && !skip.gallery) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Hora de mostrar seu trabalho! 📸\n\nEnvie as melhores fotos do seu negócio.\n\nFotos de boa qualidade fazem toda a diferença!',
        requiresImages: true,
      });
      conversation.goToStep(7);
      return;
    }

    // 3. SEMPRE: Perguntar sobre endereço (necessário para mapa e WhatsApp)
    if (!site.siteData.address && !skip.address) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Agora vamos ao contato 📍\n\nQual é o endereço da sua empresa?\n\nInclua rua, número, bairro, cidade e CEP.\n\nDigite "pular" se preferir não mostrar',
      });
      conversation.goToStep(7.5);
      return;
    }

    // 4. SEMPRE: Perguntar sobre telefone (necessário para WhatsApp flutuante)
    if (!site.siteData.phone && !skip.phone) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Agora o telefone 📞\n\nEsse número vai aparecer no botão de WhatsApp do seu site!\n\nDigite o número com DDD:',
      });
      conversation.goToStep(8);
      return;
    }

    // 5. SEMPRE: Perguntar sobre email
    if (!site.siteData.email && !skip.email) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Agora falta só o e-mail ✉️\n\nQual é o e-mail de contato da empresa?',
      });
      conversation.goToStep(9);
      return;
    }

    // 6. Perguntar sobre redes sociais (se ainda não configurou)
    // socialLinks === undefined significa "não perguntado", {} significa "perguntado mas vazio"
    if (site.siteData.socialLinks === undefined && !skip.socialLinks) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Vamos às redes sociais 📱\n\nQual é o Instagram da sua empresa?\n\nCole o link ou só o @\n\nDigite "pular" se não tiver',
      });
      conversation.goToStep(9.1);
      return;
    }

    // 7. Perguntar sobre horário de funcionamento
    // businessHours === undefined significa "não perguntado", {} significa "perguntado mas vazio"
    if (site.siteData.businessHours === undefined && !skip.businessHours) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Qual é o horário de funcionamento? 🕐',
        options: [
          { label: 'Seg-Sex 9h às 18h', value: 'weekdays-9-18', icon: 'Briefcase' },
          { label: 'Seg-Sex 8h às 17h', value: 'weekdays-8-17', icon: 'Briefcase' },
          { label: 'Seg-Sáb 9h às 18h', value: 'weeksat-9-18', icon: 'Calendar' },
          { label: '24 horas', value: 'always', icon: 'Clock' },
          { label: 'Personalizar', value: 'custom', icon: 'Plus' },
          { label: 'Pular', value: 'skip', icon: 'SkipForward' },
        ],
      });
      conversation.goToStep(9.4);
      return;
    }

    // 8. Perguntar sobre logo (se ainda não tem)
    if (site.siteData.logo === undefined && !skip.logo) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Você tem uma logo da empresa? 🎨',
        options: [
          { label: 'Sim, quero enviar', value: 'upload-logo', icon: 'UploadCloud' },
          { label: 'Não tenho, usar nome', value: 'skip-logo', icon: 'Type' },
        ],
      });
      conversation.goToStep(9.45);
      return;
    }

    // 9. Perguntar sobre estatísticas (se ainda não foram processadas)
    const statsNotProcessed = !site.siteData.heroStats ||
      (site.siteData.heroStats.length === 0) ||
      (site.siteData.heroStats.length > 0 && !site.siteData.heroStats.some((s: { label: string }) => s.label === '_processed' || s.label === 'Anos de Experiência' || s.label === 'Clientes Satisfeitos' || s.label === 'Avaliação Média'));

    if (statsNotProcessed && !skip.stats) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Vamos adicionar números ao seu site 📊\n\nHá quantos anos você está no mercado?\n\nExemplo: 5, 10, 20\n\nDigite "pular" se preferir não mostrar',
      });
      conversation.goToStep(10);
      return;
    }

    // 10. Perguntar sobre equipe (se a seção foi selecionada)
    const teamNotProcessed = sections.includes('team') &&
      site.siteData.team.length === 0 &&
      !site.siteData.team.some((t: { name: string }) => t.name === '_processed');

    if (teamNotProcessed && !skip.team) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Agora sua equipe! 👥\n\nDigite cada pessoa assim:\nNome - Cargo\n\nExemplo:\nJoão Silva - Fundador\nMaria Santos - Gerente\n\nDigite "pular" para continuar',
      });
      conversation.goToStep(11);
      return;
    }

    // 11. Perguntar sobre preços (se a seção foi selecionada)
    const pricingNotProcessed = sections.includes('pricing') &&
      site.siteData.pricing.length === 0 &&
      !site.siteData.pricing.some((p: { name: string }) => p.name === '_processed');

    if (pricingNotProcessed && !skip.pricing) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Vamos aos preços! 💰\n\nQuer mostrar uma tabela de preços no site?',
        options: [
          { label: 'Sim, quero adicionar', value: 'add-pricing', icon: 'DollarSign' },
          { label: 'Pular', value: 'skip-pricing', icon: 'SkipForward' },
        ],
      });
      conversation.goToStep(12);
      return;
    }

    // 12. Perguntar sobre mensagem do WhatsApp
    if (!site.siteData.whatsappConfig?.welcomeMessage && !skip.whatsapp) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Quase lá! 🎉\n\nQual mensagem você quer que apareça quando alguém clicar no WhatsApp?\n\nExemplo: "Olá! Vi seu site e gostaria de saber mais..."\n\nDigite "pular" para usar a mensagem padrão',
      });
      conversation.goToStep(13);
      return;
    }

    // 13. Perguntar sobre SEO (palavras-chave)
    if ((!site.siteData.seoData?.keywords || site.siteData.seoData.keywords.length === 0) && !skip.seo) {
      conversation.addMessage({
        role: 'assistant',
        content:
          'Última etapa: SEO 🔍\n\nDigite até 5 palavras-chave do seu negócio.\n\nExemplo: barbearia, corte masculino, barba\n\nDigite "pular" se preferir',
      });
      conversation.goToStep(15);
      return;
    }

    // 14. FINALMENTE: Mostrar resumo
    setShowSummary(true);
    conversation.addMessage({
      role: 'assistant',
      content:
        'Parabéns! Você terminou! 🎊\n\nVamos revisar tudo antes de criar seu site:',
    });
    setSummaryMessageIndex(conversation.messagesCount);
    conversation.goToStep(9.5);
  };

  // Handler para seleção de área
  const handleAreaSelect = (area: BusinessArea) => {
    saveSnapshot();

    const areaLabels: Record<string, string> = {
      technology: '💻 Tecnologia',
      retail: '🛍️ Varejo',
      services: '🔧 Serviços',
      food: '🍔 Alimentação',
      health: '🏥 Saúde',
      education: '📚 Educação',
    };

    const userMessage: Message = {
      role: 'user',
      content: `Selecionei: ${areaLabels[area] || area}`,
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content:
        'Ótima escolha! 🎯\n\nVamos criar seu site! 🚀\n\nQual é o nome da sua empresa?',
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
        'Excelente! 🎨\n\nQual é sua cor favorita?',
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
            content: `Adorei o nome "${inputMessage}"! 🌟\n\nAgora crie um slogan para sua empresa.\n\nExemplo: "Transformando sonhos em realidade"`,
          };
          conversation.goToStep(2);
          break;

        case 2: // Slogan
          site.updateSlogan(inputMessage);
          assistantResponse = {
            role: 'assistant',
            content:
              'Slogan salvo! 🎉\n\nAgora descreva sua empresa... Me conte um pouco sobre o que vocês fazem. 😉',
          };
          conversation.goToStep(3);
          break;

        case 3: // Descrição
          site.updateDescription(inputMessage);
          assistantResponse = {
            role: 'assistant',
            content:
              'Perfeito! 🎯\n\nQual clima você quer passar no seu site?',
            options: [
              { label: 'Vibrante & Animado', value: 'vibrant', icon: 'Palette' },
              { label: 'Dark & Profissional', value: 'dark', icon: 'Moon' },
              { label: 'Claro & Alegre', value: 'light', icon: 'Sun' },
              { label: 'Corporativo & Formal', value: 'corporate', icon: 'Briefcase' },
              { label: 'Divertido & Criativo', value: 'fun', icon: 'PartyPopper' },
              { label: 'Elegante & Minimalista', value: 'elegant', icon: 'Sparkles' },
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
              'Paleta definida! ✨\n\nQuais seções você quer no site?',
            options: [
              { label: 'Início', value: 'hero', icon: 'Home' },
              { label: 'Sobre Nós', value: 'about', icon: 'BookOpen' },
              { label: 'Serviços', value: 'services', icon: 'Zap' },
              { label: 'Galeria', value: 'gallery', icon: 'Camera' },
              { label: 'Download App', value: 'app', icon: 'Smartphone' },
              { label: 'Depoimentos', value: 'testimonials', icon: 'MessageCircle' },
              { label: 'Contato', value: 'contact', icon: 'MapPin' },
              { label: 'FAQ', value: 'faq', icon: 'HelpCircle' },
              { label: 'Preços', value: 'pricing', icon: 'DollarSign' },
              { label: 'Equipe', value: 'team', icon: 'Users' },
            ],
          };
          conversation.goToStep(5);
          break;
        }

        case 7: // Respostas das perguntas de seções (serviços)
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

            // Ir direto para próxima pergunta (sem mensagem de confirmação redundante)
            setTimeout(() => askSectionQuestions({ services: true }), 300);
            setInputMessage('');
            return;
          }
          break;

        case 7.5: {
          // Endereço - pode ser pulado
          if (inputMessage.toLowerCase().includes('pular')) {
            // Marcar endereço como vazio mas processado (usando espaço para diferenciar de não-preenchido)
            site.updateAddress(' ');
            // Ir direto para próxima pergunta
            setTimeout(() => askSectionQuestions({ services: true, gallery: true, address: true }), 300);
            setInputMessage('');
            return;
          }

          // Validar endereço
          const isValid = await addressManagement.validateAddress(inputMessage);

          if (isValid) {
            assistantResponse = {
              role: 'assistant',
              content:
                'Encontrei a localização! 📍\n\nVerifique no mapa se está correto:',
            };
            conversation.goToStep(7.6);
          } else {
            assistantResponse = {
              role: 'assistant',
              content:
                'Não encontrei esse endereço ❌\n\nDigite um endereço mais completo com cidade e estado.\n\nOu digite "pular" para continuar',
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

              // Salvar coordenadas para o mapa
              if (addressManagement.addressConfirmation.lat && addressManagement.addressConfirmation.lng) {
                site.updateMapCoordinates(
                  addressManagement.addressConfirmation.lat,
                  addressManagement.addressConfirmation.lng
                );
                site.updateShowMap(true);
              }

              addressManagement.clearAddressConfirmation();

              // Ir direto para próxima pergunta
              setTimeout(() => askSectionQuestions({ services: true, gallery: true, address: true }), 300);
              setInputMessage('');
              return;
            }
          } else {
            addressManagement.clearAddressConfirmation();
            assistantResponse = {
              role: 'assistant',
              content: 'Ok! Digite o endereço correto ou "pular" para continuar',
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

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({ services: true, gallery: true, address: true, phone: true }), 300);
          setInputMessage('');
          return;
        }

        case 9: // Email
          site.updateEmail(inputMessage);

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({ services: true, gallery: true, address: true, phone: true, email: true }), 300);
          setInputMessage('');
          return;

        case 9.1: // Instagram
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateSocialLink('instagram', inputMessage.trim());
          }
          // Sempre inicializa o objeto socialLinks se não existir (marca como "perguntado")
          if (!site.siteData.socialLinks) {
            site.updateSocialLinks({});
          }
          assistantResponse = {
            role: 'assistant',
            content: 'E o Facebook? 👍\n\nCole o link da sua página ou digite "pular"',
          };
          conversation.goToStep(9.2);
          break;

        case 9.2: // Facebook
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateSocialLink('facebook', inputMessage.trim());
          }
          assistantResponse = {
            role: 'assistant',
            content: 'E o LinkedIn? 💼\n\nCole o link ou digite "pular"',
          };
          conversation.goToStep(9.3);
          break;

        case 9.3: // LinkedIn
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateSocialLink('linkedin', inputMessage.trim());
          }

          // Marcar que redes sociais foram processadas usando objeto vazio (sem campo 'processed')
          // O fluxo usa o skip parameter em askSectionQuestions para evitar loop
          if (!site.siteData.socialLinks) {
            site.updateSocialLinks({});
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true
          }), 300);
          setInputMessage('');
          return;

        case 9.4: // Horario de funcionamento (texto) - fallback se precisar digitar
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            // Parse horario personalizado ou usar o texto direto
            const defaultHours = { open: '09:00', close: '18:00' };
            site.updateBusinessHours({
              monday: defaultHours,
              tuesday: defaultHours,
              wednesday: defaultHours,
              thursday: defaultHours,
              friday: defaultHours,
            });
          } else {
            // Marcar que horário foi processado (mesmo que vazio)
            site.updateBusinessHours({});
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true
          }), 300);
          setInputMessage('');
          return;

        case 9.41: // Horário de funcionamento personalizado (texto livre)
          if (inputMessage.trim()) {
            // Salvar horário como texto customizado
            site.updateBusinessHours({
              customText: inputMessage.trim(),
            });
          } else {
            // Marcar que horário foi processado (mesmo que vazio)
            site.updateBusinessHours({});
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true
          }), 300);
          setInputMessage('');
          return;

        // === NOVOS STEPS PARA FUNCIONALIDADES 1-7 ===

        case 10: // Estatísticas/Números - Anos de experiência
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            const years = inputMessage.trim();
            const currentStats = site.siteData.heroStats || [];
            site.updateHeroStats([
              ...currentStats.filter((s: { value: string; label: string }) => s.label !== 'Anos de Experiência'),
              { value: years.includes('+') ? years : `${years}+`, label: 'Anos de Experiência' }
            ]);
          }
          assistantResponse = {
            role: 'assistant',
            content: 'Ótimo! 📊\n\nQuantos clientes você já atendeu?\n\nExemplo: 500, 1000, 5000\n\nDigite "pular" se preferir não mostrar',
          };
          conversation.goToStep(10.1);
          break;

        case 10.1: // Estatísticas - Clientes
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            const clients = inputMessage.trim();
            const currentStats = site.siteData.heroStats || [];
            site.updateHeroStats([
              ...currentStats.filter((s: { value: string; label: string }) => s.label !== 'Clientes Satisfeitos'),
              { value: clients.includes('+') ? clients : `${clients}+`, label: 'Clientes Satisfeitos' }
            ]);
          }
          assistantResponse = {
            role: 'assistant',
            content: 'Excelente! ⭐\n\nQual é a nota média das suas avaliações?\n\nExemplo: 4.5, 4.8, 5.0\n\nDigite "pular" se preferir não mostrar',
          };
          conversation.goToStep(10.2);
          break;

        case 10.2: // Estatísticas - Avaliação
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            const rating = inputMessage.trim();
            const currentStats = site.siteData.heroStats || [];
            site.updateHeroStats([
              ...currentStats.filter((s: { value: string; label: string }) => s.label !== 'Avaliação Média'),
              { value: rating.includes('★') ? rating : `${rating}★`, label: 'Avaliação Média' }
            ]);
          } else if (site.siteData.heroStats?.length === 0) {
            // Marcar que estatísticas foram processadas (mesmo que vazias)
            site.updateHeroStats([{ value: '', label: '_processed' }]);
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
            businessHours: true, logo: true, stats: true
          }), 300);
          setInputMessage('');
          return;

        case 11: // Equipe
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            const lines = inputMessage.split('\n').filter(l => l.trim());
            const teamMembers = lines.map(line => {
              const parts = line.split('-').map(p => p.trim());
              return {
                name: parts[0] || 'Membro',
                role: parts[1] || 'Equipe',
              };
            });
            site.updateTeam(teamMembers);
          } else {
            // Marcar que equipe foi processada (pulada) com marcador especial
            site.updateTeam([{ name: '_processed', role: '_skipped' }]);
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
            businessHours: true, logo: true, stats: true, team: true
          }), 300);
          setInputMessage('');
          return;

        case 12.1: // Preços - entrada de texto
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            // Formato esperado: Plano1 - R$99 - feature1, feature2 | Plano2 - R$199 - feature1, feature2
            const plans = inputMessage.split('|').map(plan => {
              const parts = plan.split('-').map(p => p.trim());
              return {
                name: parts[0] || 'Plano',
                price: parts[1] || 'Consulte',
                features: parts[2] ? parts[2].split(',').map(f => f.trim()) : ['Atendimento personalizado'],
              };
            });
            site.updatePricing(plans);
          } else {
            // Marcar que preços foram processados (pulados) com marcador especial
            site.updatePricing([{ name: '_processed', price: '', features: [] }]);
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
            businessHours: true, logo: true, stats: true, team: true, pricing: true
          }), 300);
          setInputMessage('');
          return;

        case 13: // WhatsApp customizado
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateWhatsAppMessage(inputMessage.trim());
          } else {
            // Marcar como processado com mensagem padrão
            site.updateWhatsAppConfig({ welcomeMessage: 'Olá! Vi seu site e gostaria de saber mais.' });
          }

          // Ir direto para próxima pergunta
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
            businessHours: true, logo: true, stats: true, team: true, pricing: true, whatsapp: true
          }), 300);
          setInputMessage('');
          return;

        case 14: // Domínio personalizado (removido do fluxo básico - pode ser configurado depois)
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateCustomDomain({
              customDomain: inputMessage.trim(),
              hasCustomDomain: true,
              dnsConfigured: false,
            });
          }

          // Ir direto para próxima pergunta (SEO)
          setTimeout(() => askSectionQuestions({
            services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
            businessHours: true, logo: true, stats: true, team: true, pricing: true, whatsapp: true, seo: true
          }), 300);
          setInputMessage('');
          return;

        case 15: // SEO Keywords
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            const keywords = inputMessage.split(',').map(k => k.trim()).filter(k => k).slice(0, 5);
            site.updateSEOKeywords(keywords);
          } else {
            // Marcar como processado
            site.updateSEOData({ keywords: [] });
          }

          // Ir para resumo (Analytics será opcional/avançado)
          setShowSummary(true);
          conversation.addMessage({
            role: 'assistant',
            content:
              'Parabéns! Você terminou! 🎊\n\nVamos revisar tudo antes de criar seu site:',
          });
          setSummaryMessageIndex(conversation.messagesCount + 1);
          conversation.goToStep(9.5);
          setInputMessage('');
          return;

        case 16: // Google Analytics (opcional - não está mais no fluxo básico)
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateGoogleAnalyticsId(inputMessage.trim());
          }
          assistantResponse = {
            role: 'assistant',
            content: 'Analytics configurado! 📊',
          };
          break;

        case 17: // Facebook Pixel (opcional - não está mais no fluxo básico)
          if (inputMessage.trim() && !inputMessage.toLowerCase().includes('pular')) {
            site.updateFacebookPixelId(inputMessage.trim());
          }
          assistantResponse = {
            role: 'assistant',
            content: 'Pixel configurado! 📈',
          };
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

    // Selecionar template baseado na área e vibe
    const userData = {
      area: site.siteData.area || 'services',
      name: site.siteData.name || '',
      slogan: site.siteData.slogan || '',
      description: site.siteData.description || '',
      vibe: site.siteData.vibe || 'vibrant',
      services: site.siteData.services || [],
    };

    const templateResult = selectBestTemplate(userData);
    const selectedTemplate = templateResult.template;

    // Salvar template automaticamente selecionado
    site.updateTemplateId(selectedTemplate.id);

    // Mensagem com dados de template para o TemplatePicker visual
    conversation.addMessage({
      role: 'assistant',
      content: `Paleta "${palette.name}" aplicada! 🎨\n\nAgora escolha o visual do seu site. Recomendamos o template "${selectedTemplate.name}" para o seu negócio:`,
      templatePicker: {
        recommendedId: selectedTemplate.id,
        alternativeIds: templateResult.alternativeTemplates.slice(0, 2).map(t => t.id),
      },
    });
    conversation.goToStep(4.7); // Step para seleção visual de template
  };

  // Handler para seleção de template (usado pelo TemplatePicker visual)
  const handleTemplateSelect = (templateId: number) => {
    saveSnapshot();

    const template = TEMPLATE_CONFIGS.find(t => t.id === templateId);

    if (template) {
      site.updateTemplateId(templateId);

      conversation.addMessage({
        role: 'user',
        content: `Template escolhido: ${template.name}`,
      });

      conversation.addMessage({
        role: 'assistant',
        content: `Template "${template.name}" selecionado! 🎯\n\nAgora selecione quais seções você quer no seu site:`,
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
    }
  };

  // Handler para selecao de horario de funcionamento
  const handleBusinessHoursSelect = (option: string) => {
    saveSnapshot();

    const optionLabels: Record<string, string> = {
      'weekdays-9-18': 'Seg-Sex 9h às 18h',
      'weekdays-8-17': 'Seg-Sex 8h às 17h',
      'weeksat-9-18': 'Seg-Sáb 9h às 18h',
      'always': 'Todos os dias 24h',
      'custom': 'Personalizar',
      'skip': 'Pular',
    };

    conversation.addMessage({
      role: 'user',
      content: `Escolhi: ${optionLabels[option] || option}`,
    });

    // Se escolheu personalizar, mostrar seletor visual
    if (option === 'custom') {
      conversation.addMessage({
        role: 'assistant',
        content: 'Configure seu horário de funcionamento 🕐\n\nSelecione os dias e horários abaixo:',
      });
      conversation.goToStep(9.41); // Step para seletor visual de horário
      return;
    }

    if (option !== 'skip') {
      let hours: any = {};
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const allDays = [...weekdays, 'saturday', 'sunday'];

      switch (option) {
        case 'weekdays-9-18':
          weekdays.forEach(day => { hours[day] = { open: '09:00', close: '18:00' }; });
          hours.saturday = { closed: true };
          hours.sunday = { closed: true };
          break;
        case 'weekdays-8-17':
          weekdays.forEach(day => { hours[day] = { open: '08:00', close: '17:00' }; });
          hours.saturday = { closed: true };
          hours.sunday = { closed: true };
          break;
        case 'weeksat-9-18':
          [...weekdays, 'saturday'].forEach(day => { hours[day] = { open: '09:00', close: '18:00' }; });
          hours.sunday = { closed: true };
          break;
        case 'always':
          allDays.forEach(day => { hours[day] = { open: '00:00', close: '23:59' }; });
          break;
      }
      site.updateBusinessHours(hours);
    } else {
      // Marcar como processado (vazio)
      site.updateBusinessHours({});
    }

    // Ir direto para próxima pergunta
    setTimeout(() => askSectionQuestions({
      services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true
    }), 300);
  };

  // Handler para horário de funcionamento customizado (visual picker)
  const handleBusinessHoursCustom = (hours: Record<string, { open: string; close: string } | { closed: boolean }>) => {
    saveSnapshot();

    // Formatar preview para mensagem do usuário
    const openDays = Object.entries(hours)
      .filter(([_, value]) => 'open' in value)
      .map(([key]) => {
        const dayLabels: Record<string, string> = {
          monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
          thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom'
        };
        return dayLabels[key];
      });

    const firstOpenDay = Object.entries(hours).find(([_, value]) => 'open' in value);
    const openTime = firstOpenDay && 'open' in firstOpenDay[1] ? firstOpenDay[1].open.replace(':00', 'h') : '';
    const closeTime = firstOpenDay && 'close' in firstOpenDay[1] ? firstOpenDay[1].close.replace(':00', 'h') : '';

    conversation.addMessage({
      role: 'user',
      content: `Horário: ${openDays.join(', ')} das ${openTime} às ${closeTime}`,
    });

    site.updateBusinessHours(hours);

    // Ir direto para próxima pergunta
    setTimeout(() => askSectionQuestions({
      services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true
    }), 300);
  };

  // Handler para opcao de logo
  const handleLogoOption = (option: string) => {
    saveSnapshot();

    if (option === 'upload-logo') {
      conversation.addMessage({
        role: 'user',
        content: 'Quero fazer upload da minha logo',
      });
      conversation.addMessage({
        role: 'assistant',
        content: 'Perfeito! Faça o upload da sua logo abaixo 📤',
        requiresImages: true,
      });
      conversation.goToStep(9.46);
    } else {
      conversation.addMessage({
        role: 'user',
        content: 'Vou usar o nome estilizado',
      });
      // Marcar logo como processada (sem logo)
      site.updateLogo('');
      // Ir direto para próxima pergunta
      setTimeout(() => askSectionQuestions({
        services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true, logo: true
      }), 300);
    }
  };

  // Handler para upload de logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const logoUrl = reader.result as string;
      site.updateLogo(logoUrl);

      // Ir direto para próxima pergunta
      setTimeout(() => askSectionQuestions({
        services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true, businessHours: true, logo: true
      }), 300);
    };
    reader.readAsDataURL(file);
  };

  // Handler para opções de preços
  const handlePricingOption = (option: string) => {
    saveSnapshot();

    conversation.addMessage({
      role: 'user',
      content: option === 'add-pricing' ? 'Quero adicionar preços' : 'Pular esta etapa',
    });

    if (option === 'add-pricing') {
      conversation.addMessage({
        role: 'assistant',
        content: 'Vamos criar sua tabela de preços! 💰\n\nDigite assim:\nNome - Preço - recursos\n\nUse | para separar planos.\n\nExemplo:\nBásico - R$99 - Corte, Barba | Premium - R$199 - Corte, Barba, Hidratação\n\nDigite "pular" para continuar sem preços',
      });
      conversation.goToStep(12.1);
    } else {
      // Marcar preços como processados (pulados) com marcador especial
      site.updatePricing([{ name: '_processed', price: '', features: [] }]);
      // Ir direto para próxima pergunta
      setTimeout(() => askSectionQuestions({
        services: true, gallery: true, address: true, phone: true, email: true, socialLinks: true,
        businessHours: true, logo: true, stats: true, team: true, pricing: true
      }), 300);
    }
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
      content: `Entendi! Você quer cores "${description}" 🎨\n\nGerando paletas profissionais com IA...`,
    });

    try {
      await colorPalettes.generateCustomPalettes(description);

      conversation.addMessage({
        role: 'assistant',
        content: `Paletas geradas! ✅\n\nCriei ${colorPalettes.generatedPalettes.length} opções baseadas em "${description}".\n\nEscolha sua favorita:`,
        showColorPalettes: true,
      });
    } catch (error) {
      console.error('Erro ao gerar paletas:', error);
      const customColors = processColors(description);
      site.updateColors(JSON.stringify(customColors));

      conversation.addMessage({
        role: 'assistant',
        content: `Paleta personalizada criada! ✅\n\nAgora selecione quais seções você quer no seu site:`,
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
        'Processando seus textos com IA... 🤖\n\nSlogan, descrição, serviços e FAQ serão otimizados para deixar seu site mais profissional!',
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
          'Textos otimizados! ✅\n\nAgora vou gerar seu site...',
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
            templateId: site.siteData.templateId, // ID do template selecionado (1-11)
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

            // Novos campos
            logo: site.siteData.logo,
            socialLinks: site.siteData.socialLinks,
            businessHours: site.siteData.businessHours,
            showMap: site.siteData.showMap,
            mapCoordinates: site.siteData.mapCoordinates,

            // Funcionalidades 1-7
            whatsappConfig: site.siteData.whatsappConfig,
            customDomain: site.siteData.customDomain,
            seoData: site.siteData.seoData,
            analyticsData: site.siteData.analyticsData,

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
          'Seu site foi gerado com sucesso! 🎊\n\nTextos otimizados por IA para máxima conversão.\n\nVeja o preview ao lado e quando estiver pronto, publique!',
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
    handleTemplateSelect,
    handleSectionSelect,
    handleConfirmSections,
    handleImageUpload,
    handleCustomColors,
    confirmAddress,
    correctAddress,
    handleGenerateSite,
    // Novos handlers
    handleBusinessHoursSelect,
    handleBusinessHoursCustom,
    handleLogoOption,
    handleLogoUpload,
    handlePricingOption,
    // Função auxiliar para perguntas de seções (exportada para uso no ChatPanel)
    askSectionQuestions,
  };
}
