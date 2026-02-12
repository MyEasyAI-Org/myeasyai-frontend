import { ArrowLeft, Library, GraduationCap, MessageCircle, BookOpen, Save, AlertTriangle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { WithAttentionIndicator } from '../../components/AttentionIndicator';
import { useUserData } from '../../hooks/useUserData';
import { SaveStudyPlanModal } from './components/SaveStudyPlanModal';
import { UnsavedPlanModal } from './components/UnsavedPlanModal';
import { StudyPlanChatPanel } from './components/StudyPlanChatPanel';
import { StudyPlanLibrary } from './components/StudyPlanLibrary';
import { StudyPlanPreview } from './components/StudyPlanPreview';
import { EnhancedStudyPlanPreview } from './components/EnhancedStudyPlanPreview';
import { FinalExamComponent } from './components/exam';
import { ProgressTab } from './components/gamification';
import { useStudyPlanData } from './hooks/useStudyPlanData';
import { useStudyPlanLibrary } from './hooks/useStudyPlanLibrary';
import { useLearningGamification } from './hooks/useLearningGamification';
import { useFinalExam } from './hooks/useFinalExam';
import { studyPlanGenerationService } from './services/StudyPlanGenerationService';
import type { EnhancedGeneratedStudyPlan } from './services/StudyPlanGenerationService';
import type { GeneratedLesson } from './types/lesson';
import type { CourseDiploma, FinalExam } from './types/courseCompletion';
import { LEGAL_DISCLAIMER_TEXT, LEGAL_DISCLAIMER_CHECKBOX_TEXT } from './types/courseCompletion';
import type {
  ChatMessage,
  GeneratedStudyPlan,
  SkillLevel,
  StudyMotivation,
  StudyPlanProfile,
} from './types';
import {
  createMockProfile,
  createMockCompletedPlan,
  createMockGeneratedLessons,
  createMockPassedExam,
} from './utils/devMockCompletedCourse';

interface MyEasyLearningProps {
  onBackToDashboard?: () => void;
}

type ViewMode = 'chat' | 'library' | 'progress';

export function MyEasyLearning({ onBackToDashboard }: MyEasyLearningProps) {
  const { userUuid } = useUserData();
  const studyPlanData = useStudyPlanData();
  const studyPlanLibrary = useStudyPlanLibrary(userUuid);
  const gamification = useLearningGamification({ enabled: !!userUuid });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedGeneratedStudyPlan | null>(null);
  const [generatingStep, setGeneratingStep] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'plan'>('chat');
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<Map<string, GeneratedLesson>>(new Map());
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [existingExam, setExistingExam] = useState<FinalExam | null>(null);
  const useEnhancedMode = true; // Always use AI teaching mode

  // Final Exam / Certificate hook
  const finalExamHook = useFinalExam({
    plan: enhancedPlan,
    profile: studyPlanData.data.profile,
    generatedLessons,
    onXpEarned: gamification.addXP,
    onDiplomaIssued: (diploma: CourseDiploma) => {
      gamification.recordDiplomaIssued(diploma);
      toast.success('Certificado emitido com sucesso!');
    },
    onExamUpdated: (exam: FinalExam) => {
      gamification.recordExamUpdated(exam);
    },
    existingExam,
    userName: studyPlanData.data.profile?.plan_name || undefined,
  });

  // Check if there's a plan to show
  const hasPlan = enhancedPlan || studyPlanData.data.generatedPlan;

  // Check if there's an unsaved plan
  const hasUnsavedPlan = hasPlan && !isPlanSaved;

  // Initialize conversation
  useEffect(() => {
    if (studyPlanData.data.currentStep === 'welcome') {
      studyPlanData.setCurrentStep('skill_selection');
      setMessages([
        {
          role: 'assistant',
          content: 'E aí! Que bom te ver por aqui! 👋',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Bora criar um plano de estudos sob medida pra você? Aqui eu não só monto o plano, eu vou te ENSINAR de verdade! Nada de ficar jogando link aleatório não 😎',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Pra começar, me conta: o que você quer aprender?\n\nPode ser qualquer coisa:\n• Python, JavaScript, React...\n• Excel ninja, Power BI...\n• Inglês, Espanhol...\n• Marketing, Vendas, Liderança...\n\nManda aí! 👇',
          timestamp: new Date(),
        },
      ]);
    }
  }, [studyPlanData]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSkillSelection = useCallback(async () => {
    if (!inputMessage.trim() || !userUuid) return;

    const skillName = inputMessage.trim();

    addMessage({ role: 'user', content: skillName, timestamp: new Date() });
    setInputMessage('');

    // Create temporary profile
    const profile: StudyPlanProfile = {
      id: crypto.randomUUID(),
      user_id: userUuid,
      plan_name: '',
      skill_name: skillName,
      skill_category: 'technology', // Will be refined later
      current_level: 'none',
      target_level: 'intermediate',
      weekly_hours: 4,
      deadline_weeks: 12,
      deadline_date: '',
      motivation: 'personal_satisfaction',
      is_active: true,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    studyPlanData.setProfile(profile);
    studyPlanData.setCurrentStep('current_level');

    addMessage({
      role: 'assistant',
      content: `Boa! ${skillName} é uma skill muito massa! 🔥`,
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: `Agora preciso saber: qual seu nível atual em ${skillName}?\n\nSem vergonha, hein! Todo mundo começa de algum lugar 😊`,
      timestamp: new Date(),
    });
  }, [inputMessage, userUuid, addMessage, studyPlanData]);

  const handleCurrentLevelSelect = useCallback((level: SkillLevel) => {
    addMessage({
      role: 'user',
      content: level === 'none' ? 'Nenhum' : level === 'basic' ? 'Básico' : level === 'intermediate' ? 'Intermediário' : 'Avançado',
      timestamp: new Date(),
    });

    studyPlanData.updateProfile({ current_level: level });
    studyPlanData.setCurrentStep('target_level');

    addMessage({
      role: 'assistant',
      content: 'Fechou! Anotado aqui ✍️',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'E aí, até onde você quer chegar? 🎯\n\nQual é a meta? Sonha alto que eu te levo lá!',
      timestamp: new Date(),
    });
  }, [addMessage, studyPlanData]);

  const handleTargetLevelSelect = useCallback((level: SkillLevel) => {
    addMessage({
      role: 'user',
      content: level === 'basic' ? 'Básico' : level === 'intermediate' ? 'Intermediário' : level === 'advanced' ? 'Avançado' : 'Especialista',
      timestamp: new Date(),
    });

    studyPlanData.updateProfile({ target_level: level });
    studyPlanData.setCurrentStep('time_availability');

    addMessage({
      role: 'assistant',
      content: 'Isso aí! Gosto de gente ambiciosa! 💪',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'Agora o papo sério: quanto tempo você consegue dedicar POR SEMANA? ⏰\n\nSeja sincero comigo! Prefiro um plano que você consiga cumprir do que um que vai virar peso na consciência 😅',
      timestamp: new Date(),
    });
  }, [addMessage, studyPlanData]);

  const handleWeeklyHoursSelect = useCallback((hours: number) => {
    addMessage({
      role: 'user',
      content: `${hours} horas por semana`,
      timestamp: new Date(),
    });

    studyPlanData.updateProfile({ weekly_hours: hours });
    studyPlanData.setCurrentStep('deadline');

    addMessage({
      role: 'assistant',
      content: 'Show! Vou montar tudo respeitando seu tempo 👌',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'E pra quando você quer estar mandando bem nisso? 📅\n\nNão precisa ter pressa, mas ter uma meta ajuda a manter o foco!',
      timestamp: new Date(),
    });
  }, [addMessage, studyPlanData]);

  const handleDeadlineSelect = useCallback((weeks: number) => {
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + weeks * 7);

    addMessage({
      role: 'user',
      content: weeks === 4 ? '1 mês' : weeks === 8 ? '2 meses' : weeks === 12 ? '3 meses' : weeks === 24 ? '6 meses' : '1 ano',
      timestamp: new Date(),
    });

    studyPlanData.updateProfile({
      deadline_weeks: weeks,
      deadline_date: deadlineDate.toISOString(),
    });
    studyPlanData.setCurrentStep('motivation');

    addMessage({
      role: 'assistant',
      content: 'Marcado no calendário! 📆',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'Última pergunta! Por que você quer aprender isso? 🔥\n\nPode parecer bobeira, mas saber sua motivação me ajuda a deixar o conteúdo mais relevante pra você!',
      timestamp: new Date(),
    });
  }, [addMessage, studyPlanData]);

  const handleMotivationSelect = useCallback((motivation: StudyMotivation) => {
    const motivationLabels = {
      career_change: 'Mudar de carreira',
      promotion: 'Conseguir promoção',
      income_increase: 'Aumentar minha renda',
      personal_project: 'Projeto pessoal',
      personal_satisfaction: 'Satisfação pessoal',
    };

    addMessage({
      role: 'user',
      content: motivationLabels[motivation],
      timestamp: new Date(),
    });

    studyPlanData.updateProfile({ motivation });
    studyPlanData.setCurrentStep('review');

    const profile = studyPlanData.data.profile!;

    addMessage({
      role: 'assistant',
      content: 'Adorei! Motivação é o combustível do aprendizado 🚀',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'Beleza, deixa eu recapitular tudo pra gente não errar:',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: `📝 **Seu perfil de estudos:**\n\n🎯 Skill: ${profile.skill_name}\n📊 Nível atual: ${profile.current_level === 'none' ? 'Começando do zero' : profile.current_level}\n🏆 Meta: ${profile.target_level}\n⏰ Tempo por semana: ${profile.weekly_hours}h\n📅 Prazo: ${profile.deadline_weeks} semanas\n💪 Motivação: ${motivationLabels[motivation]}`,
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: 'Tá tudo certo aí? 👀\n\nSe sim, manda um **"gerar"** que eu crio seu plano personalizado na hora!\n\nSe quiser mudar alguma coisa, é só me falar!',
      timestamp: new Date(),
    });
  }, [addMessage, studyPlanData]);

  const handleGeneratePlan = useCallback(async () => {
    if (inputMessage.toLowerCase() !== 'gerar') {
      addMessage({
        role: 'user',
        content: inputMessage,
        timestamp: new Date(),
      });

      addMessage({
        role: 'assistant',
        content: 'Opa, tô ouvindo! 👂 Me conta o que quer mudar.\n\nQuando tiver tudo certo, manda um **"gerar"** que eu faço a mágica acontecer! ✨',
        timestamp: new Date(),
      });
      return;
    }

    addMessage({
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    });
    setInputMessage('');
    setIsGenerating(true);
    setHasError(false);
    setGeneratingStep('iniciando');

    studyPlanData.setCurrentStep('generating');

    addMessage({
      role: 'assistant',
      content: '🚀 Bora! Deixa comigo...',
      timestamp: new Date(),
    });

    try {
      const profile = studyPlanData.data.profile!;

      if (useEnhancedMode) {
        // Step 1: Starting
        setGeneratingStep('analisando');
        addMessage({
          role: 'assistant',
          content: '🔍 Analisando seu perfil e definindo a melhor estratégia de ensino...',
          timestamp: new Date(),
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 2: Planning
        setGeneratingStep('planejando');
        addMessage({
          role: 'assistant',
          content: '📋 Estruturando as semanas e organizando os tópicos...',
          timestamp: new Date(),
        });

        await new Promise(resolve => setTimeout(resolve, 600));

        // Step 3: Creating lessons
        setGeneratingStep('criando');
        addMessage({
          role: 'assistant',
          content: '✍️ Criando as lições personalizadas pra você...\n\n_(isso pode levar alguns segundos, mas vale a pena!)_',
          timestamp: new Date(),
        });

        const generatedEnhancedPlan = await studyPlanGenerationService.generateEnhancedStudyPlan(profile);

        // Step 4: Finishing
        setGeneratingStep('finalizando');

        setEnhancedPlan(generatedEnhancedPlan);
        studyPlanData.setCurrentStep('result');
        setIsGenerating(false);
        setGeneratingStep(null);

        const totalLessons = generatedEnhancedPlan.weeks.reduce((sum, w) => sum + w.lessonTopics.length, 0);

        addMessage({
          role: 'assistant',
          content: '🎉 PRONTO! Olha que lindo ficou!',
          timestamp: new Date(),
        });

        addMessage({
          role: 'assistant',
          content: `Criei um plano com **${generatedEnhancedPlan.weeks.length} semanas** e **${totalLessons} lições** só pra você!\n\n✨ **O diferencial:** Eu vou te ensinar TUDO diretamente:\n• 📖 Teoria mastigadinha\n• 💻 Exemplos práticos\n• 🧠 Quizzes pra fixar\n• 🎯 Exercícios pra praticar\n\n👉 **Clica em qualquer lição ali do lado pra começar!**\n\nBora aprender? 🚀`,
          timestamp: new Date(),
        });
      } else {
        // Fallback to original plan generation
        const generatedPlan = await studyPlanGenerationService.generateStudyPlan(profile);

        studyPlanData.setGeneratedPlan(generatedPlan);
        studyPlanData.setCurrentStep('result');
        setIsGenerating(false);
        setGeneratingStep(null);

        addMessage({
          role: 'assistant',
          content: '🎉 Pronto! Seu plano tá no jeito!',
          timestamp: new Date(),
        });

        addMessage({
          role: 'assistant',
          content: `Montei um cronograma de ${generatedPlan.weeks.length} semanas com tudo que você precisa.\n\n👉 Confere ali do lado e vai marcando as tarefas conforme for fazendo! 🚀`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao gerar plano de estudos:', error);
      setIsGenerating(false);
      setGeneratingStep(null);
      setHasError(true);

      addMessage({
        role: 'assistant',
        content: '😅 **Ops, deu ruim!**\n\nAlgo não saiu como esperado. Pode ser instabilidade na IA ou problema de conexão.\n\n🔄 **Manda "gerar" de novo** que eu tento mais uma vez!\n\n_(Se continuar dando erro, espera uns minutinhos e tenta de novo)_',
        timestamp: new Date(),
        isError: true,
      });

      toast.error('Eita! Algo deu errado. Tenta de novo?');
    }
  }, [inputMessage, addMessage, studyPlanData]);

  const handleSendMessage = useCallback(() => {
    const currentStep = studyPlanData.data.currentStep;

    if (currentStep === 'skill_selection') {
      handleSkillSelection();
    } else if (currentStep === 'review') {
      handleGeneratePlan();
    }
  }, [studyPlanData.data.currentStep, handleSkillSelection, handleGeneratePlan]);

  // ============================================================================
  // LIBRARY HANDLERS
  // ============================================================================

  const handleSavePlan = useCallback(() => {
    setIsSaveModalOpen(true);
  }, []);

  const handleSaveConfirm = useCallback(
    async (planName: string) => {
      // Use enhanced plan if available, otherwise use the original generated plan
      const planToSave = enhancedPlan || studyPlanData.data.generatedPlan;
      const profile = studyPlanData.data.profile;

      if (!planToSave || !profile) {
        toast.error('Nenhum plano para salvar');
        return;
      }

      // Update profile with plan name
      studyPlanData.updateProfile({ plan_name: planName });

      const savedPlan = await studyPlanLibrary.saveStudyPlan(
        planToSave,
        profile.id,
        planName
      );

      if (savedPlan) {
        toast.success('Plano salvo com sucesso!');
        setIsSaveModalOpen(false);
        setIsPlanSaved(true);
      } else {
        toast.error('Erro ao salvar plano');
      }
    },
    [studyPlanData, studyPlanLibrary, enhancedPlan]
  );

  // Handler for attempting to leave with unsaved plan
  const handleAttemptLeave = useCallback(
    (action: () => void) => {
      if (hasUnsavedPlan) {
        setPendingAction(() => action);
        setIsUnsavedModalOpen(true);
      } else {
        action();
      }
    },
    [hasUnsavedPlan]
  );

  const handleConfirmLeave = useCallback(() => {
    setIsUnsavedModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleSaveFromModal = useCallback(() => {
    setIsUnsavedModalOpen(false);
    setPendingAction(null);
    setIsSaveModalOpen(true);
  }, []);

  // Exam / Certificate handlers
  const handleGeneratedLessonsChange = useCallback((lessons: Map<string, GeneratedLesson>) => {
    setGeneratedLessons(lessons);
  }, []);

  const handleIssueDiploma = useCallback(() => {
    setDisclaimerAccepted(false);
    setIsDisclaimerModalOpen(true);
  }, []);

  const handleDisclaimerConfirm = useCallback(() => {
    if (!disclaimerAccepted) return;
    setIsDisclaimerModalOpen(false);
    finalExamHook.issueDiploma();
  }, [disclaimerAccepted, finalExamHook]);

  const handleDownloadPdf = useCallback(async () => {
    await finalExamHook.downloadPdf();
    toast.success('PDF do certificado baixado!');
  }, [finalExamHook]);

  // DEV ONLY: Load mock completed course for testing certificate flow
  const handleLoadDevMock = useCallback(() => {
    const mockProfile = createMockProfile();
    const mockPlan = createMockCompletedPlan();
    const mockLessons = createMockGeneratedLessons();
    const mockExam = createMockPassedExam();

    studyPlanData.setProfile(mockProfile);
    studyPlanData.setCurrentStep('result');
    setEnhancedPlan(mockPlan);
    setGeneratedLessons(mockLessons);
    setExistingExam(mockExam);
    setIsPlanSaved(true);
    setViewMode('chat');
    toast.success('[DEV] Curso completo + prova aprovada! Clique em "Emitir Certificado" no plano.');
  }, [studyPlanData]);

  const handleLoadPlan = useCallback(
    (item: typeof studyPlanLibrary.items[0]) => {
      const planData = item.plan_data;

      // Check if it's an enhanced plan (has lessonTopics in weeks or contentStrategy)
      const isEnhancedPlan = planData.weeks.some(
        (week: { lessonTopics?: unknown[] }) => week.lessonTopics !== undefined
      ) || ('contentStrategy' in planData);

      if (isEnhancedPlan) {
        // Load as enhanced plan
        setEnhancedPlan(planData as EnhancedGeneratedStudyPlan);
      } else {
        // Load as original plan
        studyPlanData.setGeneratedPlan(planData as GeneratedStudyPlan);
      }

      // Mark as saved since it's being loaded from library
      setIsPlanSaved(true);

      studyPlanData.setCurrentStep('result');
      setViewMode('chat');
      toast.success(`Plano "${item.version_name}" carregado!`);
    },
    [studyPlanData]
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      await studyPlanLibrary.toggleFavorite(id);
    },
    [studyPlanLibrary]
  );

  const handleDeletePlan = useCallback(
    async (id: string) => {
      const success = await studyPlanLibrary.deleteItem(id);
      if (success) {
        toast.success('Plano excluído com sucesso');
      } else {
        toast.error('Erro ao excluir plano');
      }
    },
    [studyPlanLibrary]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={() => handleAttemptLeave(onBackToDashboard)}
                className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-bold text-white">MyEasyLearning</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {/* DEV: Load mock completed course */}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleLoadDevMock}
                className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                title="[DEV] Carregar curso completo mock para testar certificado"
              >
                DEV: Mock Curso
              </button>
            )}
            {/* Save Button - shows different states based on plan status */}
            {hasPlan && (
              isPlanSaved ? (
                // Plan already saved - show disabled "Plano Salvo" button
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-medium bg-slate-700/50 text-slate-400 cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Plano Salvo</span>
                </button>
              ) : (
                // Plan not saved - show save button with subtle attention indicator
                <WithAttentionIndicator
                  show={true}
                  position="bottom"
                  size="sm"
                >
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Salvar</span>
                  </button>
                </WithAttentionIndicator>
              )
            )}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'progress' ? 'chat' : 'progress')}
              className={`flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                viewMode === 'progress'
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">{viewMode === 'progress' ? 'Voltar' : 'Progresso'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'library' ? 'chat' : 'library')}
              className={`flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                viewMode === 'library'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">{viewMode === 'library' ? 'Voltar' : 'Biblioteca'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'library' ? (
        <div className="flex-1 overflow-y-auto p-6">
          <StudyPlanLibrary
            items={studyPlanLibrary.items}
            isLoading={studyPlanLibrary.isLoading}
            onLoadPlan={handleLoadPlan}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeletePlan}
          />
        </div>
      ) : viewMode === 'progress' ? (
        <div className="flex-1 overflow-y-auto">
          <ProgressTab
            state={gamification.state}
            isLoading={gamification.isLoading}
            isSaving={gamification.isSaving}
            error={gamification.error}
            streak={gamification.streak}
            xp={gamification.xp}
            stats={gamification.stats}
          />
        </div>
      ) : (
        <>
          {/* Desktop: Split view */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Chat Panel */}
            <div className="w-1/2 border-r border-slate-800">
              <StudyPlanChatPanel
                messages={messages}
                currentStep={studyPlanData.data.currentStep}
                inputMessage={inputMessage}
                isGenerating={isGenerating}
                generatingStep={generatingStep}
                hasError={hasError}
                onInputChange={setInputMessage}
                onSendMessage={handleSendMessage}
                onSkillLevelSelect={handleCurrentLevelSelect}
                onTargetLevelSelect={handleTargetLevelSelect}
                onMotivationSelect={handleMotivationSelect}
                onWeeklyHoursSelect={handleWeeklyHoursSelect}
                onDeadlineSelect={handleDeadlineSelect}
              />
            </div>

            {/* Preview Panel */}
            <div className="w-1/2">
              {useEnhancedMode && enhancedPlan ? (
                <EnhancedStudyPlanPreview
                  plan={enhancedPlan}
                  profile={studyPlanData.data.profile}
                  onSavePlan={handleSavePlan}
                  isSaving={studyPlanLibrary.isSaving}
                  isPlanSaved={isPlanSaved}
                  onXpEarned={gamification.addXP}
                  onLessonComplete={(weekNumber, lessonNumber) => {
                    gamification.recordTaskCompleted(new Date().getHours(), studyPlanData.data.profile?.skill_category);
                    console.log(`Lesson ${lessonNumber} of week ${weekNumber} completed!`);
                  }}
                  onGeneratedLessonsChange={handleGeneratedLessonsChange}
                  examEligibility={finalExamHook.eligibility}
                  certificateLevel={finalExamHook.certificateLevel}
                  finalExam={finalExamHook.finalExam}
                  diploma={finalExamHook.diploma}
                  canRetake={finalExamHook.canRetake}
                  isGeneratingExam={finalExamHook.isGeneratingExam}
                  onStartExam={finalExamHook.startExam}
                  onGenerateExam={finalExamHook.generateExam}
                  onIssueDiploma={handleIssueDiploma}
                  onDownloadPdf={handleDownloadPdf}
                />
              ) : (
                <StudyPlanPreview
                  plan={studyPlanData.data.generatedPlan}
                  onSavePlan={handleSavePlan}
                  isSaving={studyPlanLibrary.isSaving}
                  isPlanSaved={isPlanSaved}
                  onTaskComplete={gamification.recordTaskCompleted}
                />
              )}
            </div>
          </div>

          {/* Mobile: Single panel with bottom tabs */}
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            {/* Mobile Content Area */}
            <div className="flex-1 overflow-hidden">
              {mobilePanel === 'chat' ? (
                <StudyPlanChatPanel
                  messages={messages}
                  currentStep={studyPlanData.data.currentStep}
                  inputMessage={inputMessage}
                  isGenerating={isGenerating}
                  generatingStep={generatingStep}
                  hasError={hasError}
                  onInputChange={setInputMessage}
                  onSendMessage={handleSendMessage}
                  onSkillLevelSelect={handleCurrentLevelSelect}
                  onTargetLevelSelect={handleTargetLevelSelect}
                  onMotivationSelect={handleMotivationSelect}
                  onWeeklyHoursSelect={handleWeeklyHoursSelect}
                  onDeadlineSelect={handleDeadlineSelect}
                />
              ) : (
                <>
                  {useEnhancedMode && enhancedPlan ? (
                    <EnhancedStudyPlanPreview
                      plan={enhancedPlan}
                      profile={studyPlanData.data.profile}
                      onSavePlan={handleSavePlan}
                      isSaving={studyPlanLibrary.isSaving}
                      isPlanSaved={isPlanSaved}
                      onXpEarned={gamification.addXP}
                      onLessonComplete={(weekNumber, lessonNumber) => {
                        gamification.recordTaskCompleted(new Date().getHours(), studyPlanData.data.profile?.skill_category);
                        console.log(`Lesson ${lessonNumber} of week ${weekNumber} completed!`);
                      }}
                      onGeneratedLessonsChange={handleGeneratedLessonsChange}
                      examEligibility={finalExamHook.eligibility}
                      certificateLevel={finalExamHook.certificateLevel}
                      finalExam={finalExamHook.finalExam}
                      diploma={finalExamHook.diploma}
                      canRetake={finalExamHook.canRetake}
                      isGeneratingExam={finalExamHook.isGeneratingExam}
                      onStartExam={finalExamHook.startExam}
                      onGenerateExam={finalExamHook.generateExam}
                      onIssueDiploma={handleIssueDiploma}
                      onDownloadPdf={handleDownloadPdf}
                    />
                  ) : (
                    <StudyPlanPreview
                      plan={studyPlanData.data.generatedPlan}
                      onSavePlan={handleSavePlan}
                      isSaving={studyPlanLibrary.isSaving}
                      isPlanSaved={isPlanSaved}
                      onTaskComplete={gamification.recordTaskCompleted}
                    />
                  )}
                </>
              )}
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="border-t border-slate-800 bg-slate-900 safe-area-bottom">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setMobilePanel('chat')}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                    mobilePanel === 'chat'
                      ? 'text-cyan-400 bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePanel('plan')}
                  disabled={!hasPlan}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                    !hasPlan
                      ? 'text-slate-600 cursor-not-allowed'
                      : mobilePanel === 'plan'
                        ? 'text-cyan-400 bg-slate-800/50'
                        : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-medium">
                    {hasPlan ? 'Meu Plano' : 'Sem Plano'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Modal */}
      <SaveStudyPlanModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        defaultName={studyPlanData.data.profile?.skill_name || ''}
        isSaving={studyPlanLibrary.isSaving}
      />

      {/* Unsaved Plan Warning Modal */}
      <UnsavedPlanModal
        isOpen={isUnsavedModalOpen}
        onClose={() => {
          setIsUnsavedModalOpen(false);
          setPendingAction(null);
        }}
        onSave={handleSaveFromModal}
        onLeave={handleConfirmLeave}
        planName={studyPlanData.data.profile?.skill_name}
      />

      {/* Final Exam Modal (full-screen) */}
      {finalExamHook.isExamActive && finalExamHook.finalExam && (
        <FinalExamComponent
          exam={finalExamHook.finalExam}
          questions={finalExamHook.examQuestions}
          onComplete={finalExamHook.submitExamAttempt}
          onCancel={finalExamHook.cancelExam}
        />
      )}

      {/* Legal Disclaimer Modal */}
      {isDisclaimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-800 border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Aviso Legal Importante</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Disclaimer text */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {LEGAL_DISCLAIMER_TEXT}
              </p>
            </div>

            {/* Checkbox */}
            <div className="px-4 pb-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {LEGAL_DISCLAIMER_CHECKBOX_TEXT}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDisclaimerConfirm}
                disabled={!disclaimerAccepted}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Aceitar e Emitir Certificado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
