import { ArrowLeft, Library, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserData } from '../../hooks/useUserData';
import { SaveStudyPlanModal } from './components/SaveStudyPlanModal';
import { StudyPlanChatPanel } from './components/StudyPlanChatPanel';
import { StudyPlanLibrary } from './components/StudyPlanLibrary';
import { StudyPlanPreview } from './components/StudyPlanPreview';
import { EnhancedStudyPlanPreview } from './components/EnhancedStudyPlanPreview';
import { ProgressTab } from './components/gamification';
import { useStudyPlanData } from './hooks/useStudyPlanData';
import { useStudyPlanLibrary } from './hooks/useStudyPlanLibrary';
import { useLearningGamification } from './hooks/useLearningGamification';
import { studyPlanGenerationService } from './services/StudyPlanGenerationService';
import type { EnhancedGeneratedStudyPlan } from './services/StudyPlanGenerationService';
import type {
  ChatMessage,
  SkillLevel,
  StudyMotivation,
  StudyPlanProfile,
} from './types';

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
  const useEnhancedMode = true; // Always use AI teaching mode

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
      } else {
        toast.error('Erro ao salvar plano');
      }
    },
    [studyPlanData, studyPlanLibrary, enhancedPlan]
  );

  const handleLoadPlan = useCallback(
    (item: typeof studyPlanLibrary.items[0]) => {
      studyPlanData.setGeneratedPlan(item.plan_data);
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
      <div className="border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">MyEasyLearning</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'progress' ? 'chat' : 'progress')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                viewMode === 'progress'
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              {viewMode === 'progress' ? 'Voltar' : 'Progresso'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'library' ? 'chat' : 'library')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                viewMode === 'library'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Library className="h-4 w-4" />
              {viewMode === 'library' ? 'Voltar' : 'Biblioteca'}
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
        <div className="flex flex-1 overflow-hidden">
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
                onXpEarned={gamification.addXP}
                onLessonComplete={(weekNumber, lessonNumber) => {
                  gamification.recordTaskCompleted(new Date().getHours(), studyPlanData.data.profile?.skill_category);
                  console.log(`Lesson ${lessonNumber} of week ${weekNumber} completed!`);
                }}
              />
            ) : (
              <StudyPlanPreview
                plan={studyPlanData.data.generatedPlan}
                onSavePlan={handleSavePlan}
                isSaving={studyPlanLibrary.isSaving}
                onTaskComplete={gamification.recordTaskCompleted}
              />
            )}
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveStudyPlanModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        defaultName={studyPlanData.data.profile?.skill_name || ''}
        isSaving={studyPlanLibrary.isSaving}
      />
    </div>
  );
}
