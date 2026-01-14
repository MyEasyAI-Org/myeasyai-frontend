import { ArrowLeft, Library } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserData } from '../../hooks/useUserData';
import { SaveStudyPlanModal } from './components/SaveStudyPlanModal';
import { StudyPlanChatPanel } from './components/StudyPlanChatPanel';
import { StudyPlanLibrary } from './components/StudyPlanLibrary';
import { StudyPlanPreview } from './components/StudyPlanPreview';
import { useStudyPlanData } from './hooks/useStudyPlanData';
import { useStudyPlanLibrary } from './hooks/useStudyPlanLibrary';
import { studyPlanGenerationService } from './services/StudyPlanGenerationService';
import type {
  ChatMessage,
  SkillLevel,
  StudyMotivation,
  StudyPlanProfile,
} from './types';

interface MyEasyLearningProps {
  onBackToDashboard?: () => void;
}

export function MyEasyLearning({ onBackToDashboard }: MyEasyLearningProps) {
  const { userUuid } = useUserData();
  const studyPlanData = useStudyPlanData();
  const studyPlanLibrary = useStudyPlanLibrary(userUuid);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Initialize conversation
  useEffect(() => {
    if (studyPlanData.data.currentStep === 'welcome') {
      studyPlanData.setCurrentStep('skill_selection');
      setMessages([
        {
          role: 'assistant',
          content: '👋 Olá! Que bom ter você aqui no MyEasyLearning!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: '🎯 Vou te ajudar a criar um plano de estudos personalizado para você dominar uma nova habilidade e alavancar sua carreira!',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: '💡 Para começar, me diga: qual habilidade você quer aprender?\n\nPor exemplo:\n• "Python"\n• "Excel Avançado"\n• "Inglês para negócios"\n• "Marketing Digital"\n• "Liderança"\n\nDigite abaixo a habilidade que você quer dominar:',
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
      content: `✅ Ótima escolha! ${skillName} é uma habilidade muito valiosa!`,
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '📊 Agora me diga: qual seu nível atual em ' + skillName + '?\n\nEscolha uma das opções abaixo:',
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
      content: '✅ Entendi! Vamos criar um plano do seu nível atual.',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '🎯 E até que nível você quer chegar?\n\nEscolha seu objetivo abaixo:',
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
      content: '✅ Perfeito! Esse é um ótimo objetivo!',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '⏰ Agora me diga: quanto tempo você tem disponível para estudar POR SEMANA?\n\nSeja honesto! É melhor um plano realista do que um plano impossível de cumprir 😊\n\nEscolha abaixo:',
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
      content: '✅ Ótimo! Vou criar um plano com esse ritmo de estudos.',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '📅 E quando você quer dominar essa habilidade?\n\nPense em um prazo realista para seu objetivo.\n\nEscolha abaixo:',
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
      content: '✅ Perfeito! Prazo definido.',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '🔥 Por último, me conte: por que você quer aprender essa habilidade?\n\nIsso me ajuda a personalizar seu plano!\n\nEscolha abaixo:',
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
      content: '✅ Entendi perfeitamente sua motivação!',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '📋 Ótimo! Vamos revisar tudo que você me passou:',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: `✓ Habilidade: ${profile.skill_name}\n✓ Nível atual: ${profile.current_level === 'none' ? 'Nenhum' : profile.current_level}\n✓ Objetivo: ${profile.target_level}\n✓ Tempo semanal: ${profile.weekly_hours}h\n✓ Prazo: ${profile.deadline_weeks} semanas\n✓ Motivação: ${motivationLabels[motivation]}`,
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '👀 Dá uma olhada se está tudo certinho!\n\nSe estiver tudo ok, digite "gerar" para eu criar seu plano de estudos personalizado com Inteligência Artificial.\n\nSe quiser mudar algo, me avise que a gente ajusta! ✨',
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
        content: '👂 Estou te ouvindo! Me diga o que você quer ajustar.\n\nOu se estiver tudo certo, é só digitar "gerar" para eu criar seu plano!',
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

    studyPlanData.setCurrentStep('generating');

    addMessage({
      role: 'assistant',
      content: '✨ Perfeito! Agora vou criar seu plano de estudos personalizado.',
      timestamp: new Date(),
    });

    addMessage({
      role: 'assistant',
      content: '⏳ Estou usando Inteligência Artificial para montar tudo de forma organizada e profissional. Isso pode levar alguns segundos...',
      timestamp: new Date(),
    });

    try {
      const profile = studyPlanData.data.profile!;

      // Generate study plan with Gemini AI
      const generatedPlan = await studyPlanGenerationService.generateStudyPlan(profile);

      studyPlanData.setGeneratedPlan(generatedPlan);
      studyPlanData.setCurrentStep('result');
      setIsGenerating(false);

      addMessage({
        role: 'assistant',
        content: '🎉 Pronto! Seu plano de estudos está pronto!',
        timestamp: new Date(),
      });

      addMessage({
        role: 'assistant',
        content: `📚 Criei um cronograma de ${generatedPlan.weeks.length} semanas com tudo que você precisa estudar.\n\n👉 Confira o plano completo no painel ao lado.\n\nVocê pode acompanhar seu progresso, marcar tarefas como concluídas e muito mais! 🚀`,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Erro ao gerar plano de estudos:', error);
      setIsGenerating(false);

      addMessage({
        role: 'assistant',
        content: '❌ Ops! Ocorreu um erro ao gerar seu plano de estudos. Por favor, tente novamente em alguns instantes.',
        timestamp: new Date(),
      });

      toast.error('Erro ao gerar plano de estudos. Tente novamente.');
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
      const generatedPlan = studyPlanData.data.generatedPlan;
      const profile = studyPlanData.data.profile;

      if (!generatedPlan || !profile) {
        toast.error('Nenhum plano para salvar');
        return;
      }

      // Update profile with plan name
      const updatedProfile = { ...profile, plan_name: planName };
      studyPlanData.updateProfile({ plan_name: planName });

      const savedPlan = await studyPlanLibrary.saveStudyPlan(
        generatedPlan,
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
    [studyPlanData, studyPlanLibrary]
  );

  const handleLoadPlan = useCallback(
    (item: typeof studyPlanLibrary.items[0]) => {
      studyPlanData.setGeneratedPlan(item.plan_data);
      studyPlanData.setCurrentStep('result');
      setShowLibrary(false);
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
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">MyEasyLearning</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Library className="h-4 w-4" />
            {showLibrary ? 'Voltar' : 'Biblioteca'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showLibrary ? (
        <div className="flex-1 overflow-y-auto p-6">
          <StudyPlanLibrary
            items={studyPlanLibrary.items}
            isLoading={studyPlanLibrary.isLoading}
            onLoadPlan={handleLoadPlan}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeletePlan}
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
            <StudyPlanPreview
              plan={studyPlanData.data.generatedPlan}
              onSavePlan={handleSavePlan}
              isSaving={studyPlanLibrary.isSaving}
            />
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
