import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserData } from '../../hooks/useUserData';
import { resumeGenerationService } from '../../services/ResumeGenerationService';
import { CreateProfileModal } from './components/CreateProfileModal';
import { ProfileSelector } from './components/ProfileSelector';
import { ResumeChatPanel } from './components/ResumeChatPanel';
import { ResumeLibrary } from './components/ResumeLibrary';
import { ResumePreview } from './components/ResumePreview';
import { useResumeData } from './hooks/useResumeData';
import { useResumeLibrary } from './hooks/useResumeLibrary';
import { useResumeProfiles } from './hooks/useResumeProfiles';
import type {
  CareerLevel,
  ChatMessage,
  ConversationStep,
  CreateResumeProfileInput,
  Experience,
  PersonalInfo,
  ResumeLanguage,
  ResumeProfile,
  TemplateStyle,
} from './types';

interface MyEasyResumeProps {
  onBackToDashboard?: () => void;
}

export function MyEasyResume({ onBackToDashboard }: MyEasyResumeProps) {
  const { userUuid } = useUserData();

  // Profile management
  const {
    profiles,
    currentProfile,
    isLoading: isLoadingProfiles,
    isSaving: isSavingProfile,
    createProfile,
    selectProfile,
  } = useResumeProfiles(userUuid);

  // Library management
  const {
    items: libraryItems,
    isLoading: libraryIsLoading,
    saveResume,
    toggleFavorite,
    deleteItem: deleteLibraryItem,
  } = useResumeLibrary(currentProfile?.id || null, userUuid);

  // Resume data
  const resumeData = useResumeData();

  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Vou te ajudar a criar um currículo profissional. Vamos começar?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ step: ConversationStep; messages: ChatMessage[] }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation based on profile availability
  useEffect(() => {
    // Only initialize once when we know the loading state
    if (isLoadingProfiles) return;

    // If we already started the conversation, don't restart
    if (resumeData.data.currentStep !== 'welcome') return;

    const setStep = resumeData.conversation.setStep;
    const setProfile = resumeData.setProfile;

    if (currentProfile) {
      // Has profile - skip to target role
      setProfile(currentProfile);
      setStep('target_role');
      setMessages([
        {
          role: 'assistant',
          content: '👋 Olá! Que bom ter você aqui!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Vou te ajudar a criar um currículo profissional que vai te destacar no mercado de trabalho. É simples e rápido!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: `Estou usando o perfil "${currentProfile.name}" que você já tem salvo.\n\n📝 Para começar, me diga: qual cargo você está buscando?\n\nPor exemplo: "Analista de Marketing", "Desenvolvedor Front-end", "Gerente de Vendas"...`,
          timestamp: new Date(),
        },
      ]);
    } else if (profiles.length === 0) {
      // No profiles - ask to create one first
      setStep('career_level');
      setMessages([
        {
          role: 'assistant',
          content: '👋 Olá! Que bom ter você aqui!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Vou te ajudar a criar um currículo profissional que vai te destacar no mercado de trabalho. É simples e rápido!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: '📋 Primeiro, vamos criar seu perfil profissional.\n\nEscolha abaixo qual opção melhor descreve sua experiência no mercado:',
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentProfile, profiles.length, isLoadingProfiles, resumeData.data.currentStep, resumeData.conversation.setStep, resumeData.setProfile]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const saveSnapshot = useCallback(() => {
    setConversationHistory((prev) => [
      ...prev,
      { step: resumeData.data.currentStep, messages: [...messages] },
    ]);
  }, [resumeData.data.currentStep, messages]);

  const goBack = useCallback(() => {
    if (conversationHistory.length === 0) return;
    const lastSnapshot = conversationHistory[conversationHistory.length - 1];
    resumeData.conversation.setStep(lastSnapshot.step);
    setMessages(lastSnapshot.messages);
    setConversationHistory((prev) => prev.slice(0, -1));
  }, [conversationHistory, resumeData]);

  // Handle career level selection
  const handleCareerLevelSelect = useCallback(
    async (level: CareerLevel) => {
      saveSnapshot();
      addMessage({ role: 'user', content: level, timestamp: new Date() });

      if (!currentProfile) {
        // Create a temporary profile if none exists
        const tempProfile: ResumeProfile = {
          id: `temp-${Date.now()}`,
          user_id: userUuid || '',
          name: 'Perfil Temporário',
          career_level: level,
          target_role: '',
          industry: '',
          template_style: 'ats',
          preferred_language: 'pt-BR',
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: null,
        };
        resumeData.setProfile(tempProfile);
      } else {
        // Update existing profile
        const updatedProfile: ResumeProfile = { ...currentProfile, career_level: level };
        resumeData.setProfile(updatedProfile);
      }

      resumeData.conversation.setStep('target_role');
      addMessage({
        role: 'assistant',
        content: '✅ Perfeito! Agora vamos para o próximo passo.',
        timestamp: new Date(),
      });
      addMessage({
        role: 'assistant',
        content: '💼 Me diga: qual cargo ou posição você está procurando?\n\nPor exemplo:\n• "Analista de Marketing"\n• "Desenvolvedor Front-end"\n• "Gerente de Vendas"\n• "Assistente Administrativo"',
        timestamp: new Date(),
      });
    },
    [currentProfile, userUuid, saveSnapshot, addMessage, resumeData]
  );

  // Handle template style selection
  const handleTemplateStyleSelect = useCallback(
    (style: TemplateStyle) => {
      const profile = resumeData.data.profile;
      if (!profile) return;

      saveSnapshot();
      addMessage({ role: 'user', content: style, timestamp: new Date() });

      const updatedProfile: ResumeProfile = { ...profile, template_style: style };
      resumeData.setProfile(updatedProfile);
      resumeData.conversation.setStep('language');

      addMessage({
        role: 'assistant',
        content: '✅ Ótima escolha de template!',
        timestamp: new Date(),
      });
      addMessage({
        role: 'assistant',
        content: '🌍 Agora me diga: em que idioma você prefere que seu currículo seja escrito?\n\nEscolha uma das opções abaixo.',
        timestamp: new Date(),
      });
    },
    [saveSnapshot, addMessage, resumeData]
  );

  // Handle language selection
  const handleLanguageSelect = useCallback(
    (lang: ResumeLanguage) => {
      const profile = resumeData.data.profile;
      if (!profile) return;

      saveSnapshot();
      addMessage({ role: 'user', content: lang, timestamp: new Date() });

      const updatedProfile: ResumeProfile = { ...profile, preferred_language: lang };
      resumeData.setProfile(updatedProfile);
      resumeData.conversation.setStep('personal_info');

      addMessage({
        role: 'assistant',
        content: '✅ Perfeito! Idioma selecionado.',
        timestamp: new Date(),
      });
      addMessage({
        role: 'assistant',
        content: '👤 Agora vamos às suas informações pessoais.\n\nPara começar, digite seu nome completo aqui embaixo.\n\nExemplo: "João da Silva Santos"',
        timestamp: new Date(),
      });
    },
    [saveSnapshot, addMessage, resumeData]
  );

  // Handle industry selection
  const handleIndustrySelect = useCallback(
    (industry: string) => {
      const profile = resumeData.data.profile;
      if (!profile) return;

      saveSnapshot();
      addMessage({ role: 'user', content: industry, timestamp: new Date() });

      const updatedProfile: ResumeProfile = { ...profile, industry };
      resumeData.setProfile(updatedProfile);
      resumeData.conversation.setStep('template_style');

      addMessage({
        role: 'assistant',
        content: '✅ Ótimo! Área de atuação registrada.',
        timestamp: new Date(),
      });
      addMessage({
        role: 'assistant',
        content: '🎨 Agora vamos escolher o estilo visual do seu currículo.\n\nQual modelo você prefere? Escolha abaixo:\n\n• ATS: Simples e direto, ideal para sistemas de recrutamento\n• Moderno: Visual mais atual e atrativo\n• Executivo: Elegante e profissional',
        timestamp: new Date(),
      });
    },
    [saveSnapshot, addMessage, resumeData]
  );

  // Handle text input
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const profile = resumeData.data.profile;
    if (!profile) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    addMessage({ role: 'user', content: userMessage, timestamp: new Date() });
    saveSnapshot();

    const currentStep = resumeData.data.currentStep;

    try {
      setIsGenerating(true);

      switch (currentStep) {
        case 'target_role':
          {
            const updatedProfile: ResumeProfile = { ...profile, target_role: userMessage };
            resumeData.setProfile(updatedProfile);
            resumeData.conversation.setStep('industry');
            addMessage({
              role: 'assistant',
              content: '✅ Excelente! Cargo anotado.',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '🏢 Agora me conte: em qual área ou indústria você trabalha?\n\nPor exemplo:\n• "Tecnologia"\n• "Varejo"\n• "Saúde"\n• "Educação"\n• "Serviços Financeiros"',
              timestamp: new Date(),
            });
          }
          break;

        case 'personal_info':
          {
            // Store the full name
            resumeData.personalInfo.update({ fullName: userMessage });
            resumeData.conversation.setStep('contact_email');
            addMessage({
              role: 'assistant',
              content: `✅ Ótimo, ${userMessage.split(' ')[0]}!`,
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '📧 Agora preciso do seu e-mail de contato.\n\nDigite o e-mail que você quer que apareça no currículo.\n\n📝 Exemplo:\n"joao.silva@email.com"',
              timestamp: new Date(),
            });
          }
          break;

        case 'contact_email':
          {
            resumeData.personalInfo.update({ email: userMessage });
            resumeData.conversation.setStep('contact_phone');
            addMessage({
              role: 'assistant',
              content: '✅ E-mail registrado!',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '📱 Agora seu número de telefone.\n\nDigite com DDD.\n\n📝 Exemplo:\n"(21) 98765-4321" ou "21987654321"',
              timestamp: new Date(),
            });
          }
          break;

        case 'contact_phone':
          {
            resumeData.personalInfo.update({ phone: userMessage });
            resumeData.conversation.setStep('contact_location');
            addMessage({
              role: 'assistant',
              content: '✅ Telefone registrado!',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '📍 Qual sua cidade e estado?\n\nIsso ajuda os recrutadores a saberem sua localização.\n\n📝 Exemplo:\n"Rio de Janeiro, RJ" ou "São Paulo, SP"',
              timestamp: new Date(),
            });
          }
          break;

        case 'contact_location':
          {
            resumeData.personalInfo.update({ location: userMessage });
            resumeData.conversation.setStep('contact_links');
            addMessage({
              role: 'assistant',
              content: '✅ Localização registrada!',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '🔗 Por último, você tem LinkedIn, portfólio ou GitHub?\n\nDigite os links separados por vírgula, ou digite "pular" se não tiver.\n\n📝 Exemplo:\n"linkedin.com/in/joaosilva, github.com/joaosilva"\n\nOu simplesmente:\n"pular"',
              timestamp: new Date(),
            });
          }
          break;

        case 'contact_links':
          {
            if (userMessage.toLowerCase() !== 'pular') {
              // Parse links (simplified)
              const links = userMessage.split(',').map((l) => l.trim());
              const updates: Partial<PersonalInfo> = {};

              links.forEach((link) => {
                const lowerLink = link.toLowerCase();
                if (lowerLink.includes('linkedin')) {
                  updates.linkedinUrl = link.startsWith('http') ? link : `https://${link}`;
                } else if (lowerLink.includes('github')) {
                  updates.githubUrl = link.startsWith('http') ? link : `https://${link}`;
                } else {
                  // Assume it's a portfolio
                  updates.portfolioUrl = link.startsWith('http') ? link : `https://${link}`;
                }
              });

              resumeData.personalInfo.update(updates);
            }

            resumeData.conversation.setStep('experience_input');
            addMessage({
              role: 'assistant',
              content: '✅ Perfeito! Informações de contato completas.',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: '💼 Agora vamos falar sobre sua experiência profissional.',
              timestamp: new Date(),
            });
            addMessage({
              role: 'assistant',
              content: 'Digite sua experiência mais recente seguindo este modelo:\n\nCargo | Nome da Empresa | Data Início - Data Fim | Breve descrição do que você fazia\n\n📝 Exemplo:\n"Analista de Vendas | ABC Comércio | 01/2020 - 12/2023 | Responsável pelo atendimento a clientes e fechamento de vendas"',
              timestamp: new Date(),
            });
          }
          break;

        case 'experience_input':
          {
            if (userMessage.toLowerCase() === 'continuar') {
              resumeData.conversation.setStep('education_input');
              addMessage({
                role: 'assistant',
                content: '✅ Perfeito! Experiências registradas.',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: '🎓 Agora vamos para sua formação acadêmica.',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: 'Digite sua formação seguindo este modelo:\n\nNome do Curso | Nome da Instituição | Ano de Conclusão\n\n📝 Exemplo:\n"Administração de Empresas | Universidade Federal do Rio | 2018"\n\nOu se ainda está cursando:\n"Gestão Comercial | Faculdade XYZ | Em andamento"',
                timestamp: new Date(),
              });
            } else {
              // Parse experience (simplified)
              const parts = userMessage.split('|').map((p) => p.trim());
              if (parts.length >= 3) {
                const exp: Experience = {
                  id: Date.now().toString(),
                  position: parts[0] || '',
                  company: parts[1] || '',
                  location: '',
                  startDate: parts[2]?.split('-')[0]?.trim() || '',
                  endDate: parts[2]?.split('-')[1]?.trim() || null,
                  description: parts[3] || '',
                  achievements: [],
                  isCurrentJob: parts[2]?.toLowerCase().includes('atual') || false,
                };
                resumeData.experiences.add(exp);
              }

              addMessage({
                role: 'assistant',
                content: '✅ Experiência adicionada com sucesso!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: 'Você pode adicionar outra experiência anterior ou digitar "continuar" para prosseguir para a próxima etapa.',
                timestamp: new Date(),
              });
            }
          }
          break;

        case 'education_input':
          {
            if (userMessage.toLowerCase() === 'continuar') {
              resumeData.conversation.setStep('skills_input');
              addMessage({
                role: 'assistant',
                content: '✅ Ótimo! Formação acadêmica registrada.',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: '⭐ Agora a última etapa antes da revisão: suas habilidades e competências!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: 'Digite suas principais habilidades separadas por vírgula.\n\n📝 Exemplo:\n"Atendimento ao cliente, Excel, Trabalho em equipe, Comunicação, Organização"\n\nQuando terminar, digite "continuar" para revisar tudo antes de gerar o currículo.',
                timestamp: new Date(),
              });
            } else {
              addMessage({
                role: 'assistant',
                content: '✅ Formação adicionada!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: 'Você pode adicionar outra formação ou digitar "continuar" para prosseguir.',
                timestamp: new Date(),
              });
            }
          }
          break;

        case 'skills_input':
          {
            if (userMessage.toLowerCase() === 'continuar') {
              // Go to review step
              resumeData.conversation.setStep('review');

              // Build review summary
              const firstName = resumeData.data.personalInfo.fullName.split(' ')[0];
              const experiencesCount = resumeData.data.experiences.length;
              const educationCount = resumeData.data.education.length;

              addMessage({
                role: 'assistant',
                content: '✅ Habilidades registradas!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: `📋 Perfeito, ${firstName}! Vamos revisar tudo que você me passou:`,
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: `✓ Nome: ${resumeData.data.personalInfo.fullName}\n✓ E-mail: ${resumeData.data.personalInfo.email}\n✓ Telefone: ${resumeData.data.personalInfo.phone}\n✓ Localização: ${resumeData.data.personalInfo.location}\n✓ Experiências profissionais: ${experiencesCount}\n✓ Formação acadêmica: ${educationCount}\n✓ Habilidades registradas`,
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: '👀 Dá uma olhada se está tudo certinho!\n\nSe estiver tudo ok, digite "gerar" para eu criar seu currículo profissional com Inteligência Artificial.\n\nSe quiser mudar algo, me avise que a gente ajusta! ✨',
                timestamp: new Date(),
              });
            } else {
              // Add skills (simplified - just store the message for now)
              addMessage({
                role: 'assistant',
                content: '✅ Habilidades adicionadas!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: 'Você pode adicionar mais habilidades ou digitar "continuar" para revisar suas informações.',
                timestamp: new Date(),
              });
            }
          }
          break;

        case 'review':
          {
            if (userMessage.toLowerCase() === 'gerar') {
              resumeData.conversation.setStep('generating');
              addMessage({
                role: 'assistant',
                content: '✨ Perfeito! Agora vou criar seu currículo profissional.',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: '⏳ Estou usando Inteligência Artificial para montar tudo de forma organizada e profissional. Isso leva apenas alguns segundos...',
                timestamp: new Date(),
              });

              // Generate professional summary
              const summary = await resumeGenerationService.generateProfessionalSummary({
                profile,
                personalInfo: resumeData.data.personalInfo,
                experiences: resumeData.data.experiences,
                education: resumeData.data.education,
                skills: resumeData.data.skills,
              });

              resumeData.professionalSummary.set(summary);

              // Create generated resume
              const generatedResume = {
                id: Date.now().toString(),
                personalInfo: resumeData.data.personalInfo,
                professionalSummary: summary,
                experiences: resumeData.data.experiences,
                education: resumeData.data.education,
                skills: resumeData.data.skills,
                languages: resumeData.data.languages,
                certifications: resumeData.data.certifications,
                projects: resumeData.data.projects,
                createdAt: new Date(),
              };

              resumeData.generatedResume.set(generatedResume);
              resumeData.conversation.setStep('result');

              addMessage({
                role: 'assistant',
                content: '🎉 Pronto! Seu currículo foi criado com sucesso!',
                timestamp: new Date(),
              });
              addMessage({
                role: 'assistant',
                content: '👉 Confira o resultado no painel ao lado.\n\nVocê pode editar qualquer informação clicando diretamente sobre o texto, salvar na biblioteca ou exportar em PDF! 📄',
                timestamp: new Date(),
              });
            } else {
              addMessage({
                role: 'assistant',
                content: '👂 Estou te ouvindo! Me diga o que você quer ajustar.\n\nOu se estiver tudo certo, é só digitar "gerar" para eu criar seu currículo!',
                timestamp: new Date(),
              });
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage({
        role: 'assistant',
        content: '😕 Ops! Algo deu errado. Não se preocupe, tente novamente que vou te ajudar!',
        timestamp: new Date(),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    inputMessage,
    resumeData,
    addMessage,
    saveSnapshot,
  ]);

  const handleSaveResume = useCallback(async () => {
    if (!resumeData.data.generatedResume || !currentProfile || !userUuid) return;

    const versionName = `${currentProfile.target_role} - ${new Date().toLocaleDateString('pt-BR')}`;

    await saveResume(resumeData.data.generatedResume, versionName, {
      tags: [currentProfile.target_role, currentProfile.industry],
    });

    addMessage({
      role: 'assistant',
      content: '✅ Currículo salvo na biblioteca com sucesso! Você pode acessá-lo a qualquer momento.',
      timestamp: new Date(),
    });
  }, [resumeData.data.generatedResume, currentProfile, userUuid, saveResume, addMessage]);

  const handleCreateProfile = useCallback(
    async (profileData: CreateResumeProfileInput) => {
      await createProfile(profileData);
      setIsProfileModalOpen(false);
    },
    [createProfile]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">MyEasyResume</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLibrary(!showLibrary)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
            >
              {showLibrary ? 'Ocultar' : 'Mostrar'} Biblioteca
            </button>
            <ProfileSelector
              profiles={profiles}
              currentProfile={currentProfile}
              onSelectProfile={selectProfile}
              onCreateProfile={() => setIsProfileModalOpen(true)}
              isLoading={isLoadingProfiles}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ResumeChatPanel
          messages={messages}
          currentStep={resumeData.data.currentStep}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isGenerating={isGenerating}
          canGoBack={conversationHistory.length > 0}
          onSendMessage={handleSendMessage}
          onCareerLevelSelect={handleCareerLevelSelect}
          onTemplateStyleSelect={handleTemplateStyleSelect}
          onLanguageSelect={handleLanguageSelect}
          onIndustrySelect={handleIndustrySelect}
          onGoBack={goBack}
          messagesEndRef={messagesEndRef}
        />

        {/* Preview/Library */}
        <div className="flex-1 overflow-y-auto bg-slate-900 p-6">
          {showLibrary ? (
            <ResumeLibrary
              items={libraryItems}
              isLoading={libraryIsLoading}
              onLoadResume={(item) => {
                // Convert library item to generated resume
                const resume = {
                  ...item,
                  createdAt: new Date(item.created_at),
                };
                resumeData.loadFromResume(resume);
                setShowLibrary(false);
              }}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteLibraryItem}
            />
          ) : (
            <ResumePreview
              resume={resumeData.data.generatedResume}
              onSave={handleSaveResume}
              onExport={() => alert('Exportação PDF em desenvolvimento')}
              onUpdate={(updatedResume) => {
                resumeData.generatedResume.set(updatedResume);
              }}
              isSaving={false}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleCreateProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
}
