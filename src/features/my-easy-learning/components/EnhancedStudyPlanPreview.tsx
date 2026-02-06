/**
 * EnhancedStudyPlanPreview Component
 *
 * Displays study plan with lessons instead of tasks.
 * Each lesson can be clicked to open the LessonViewer modal.
 */

import { useState, useCallback, useMemo, memo } from 'react';
import {
  BookOpen,
  Clock,
  Target,
  Save,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Check,
  Lock,
  Play,
  Loader2,
} from 'lucide-react';
import { LessonViewer } from './lesson/LessonViewer';
import { lessonContentGenerationService } from '../services/LessonContentGenerationService';
import type {
  EnhancedGeneratedStudyPlan,
  EnhancedStudyPlanWeekData,
} from '../services/StudyPlanGenerationService';
import type { GeneratedLesson, LessonTopic } from '../types/lesson';
import type { StudyPlanProfile } from '../types';

interface EnhancedStudyPlanPreviewProps {
  plan: EnhancedGeneratedStudyPlan | null;
  profile: StudyPlanProfile | null;
  onSavePlan?: () => void;
  isSaving?: boolean;
  onXpEarned: (amount: number, reason: string) => void;
  onLessonComplete?: (weekNumber: number, lessonNumber: number) => void;
}

export const EnhancedStudyPlanPreview = memo(function EnhancedStudyPlanPreview({
  plan,
  profile,
  onSavePlan,
  isSaving = false,
  onXpEarned,
  onLessonComplete,
}: EnhancedStudyPlanPreviewProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [generatedLessons, setGeneratedLessons] = useState<Map<string, GeneratedLesson>>(new Map());
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<GeneratedLesson | null>(null);
  const [isLessonViewerOpen, setIsLessonViewerOpen] = useState(false);

  // Toggle week expansion
  const toggleWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  }, []);

  // Generate lesson key for storage
  const getLessonKey = useCallback((weekNumber: number, lessonNumber: number) => {
    return `${weekNumber}-${lessonNumber}`;
  }, []);

  // Open lesson (generate if needed)
  const handleLessonClick = useCallback(
    async (week: EnhancedStudyPlanWeekData, topic: LessonTopic) => {
      if (!profile || !plan) return;

      const lessonKey = getLessonKey(week.week_number, topic.lessonNumber);

      // Check if already generated
      const existingLesson = generatedLessons.get(lessonKey);
      if (existingLesson) {
        setActiveLesson(existingLesson);
        setIsLessonViewerOpen(true);
        return;
      }

      // Generate lesson content
      setLoadingLesson(lessonKey);

      try {
        const lesson = await lessonContentGenerationService.generateLessonContent(
          profile,
          topic,
          week.id
        );

        setGeneratedLessons((prev) => new Map(prev).set(lessonKey, lesson));
        setActiveLesson(lesson);
        setIsLessonViewerOpen(true);
      } catch (error) {
        console.error('Erro ao gerar licao:', error);
      } finally {
        setLoadingLesson(null);
      }
    },
    [profile, plan, generatedLessons, getLessonKey]
  );

  // Close lesson viewer
  const handleCloseLessonViewer = useCallback(() => {
    setIsLessonViewerOpen(false);
    setActiveLesson(null);
  }, []);

  // Handle section complete
  const handleSectionComplete = useCallback((sectionId: string) => {
    if (!activeLesson) return;

    setActiveLesson((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, isCompleted: true, completedAt: new Date().toISOString() } : s
        ),
      };
    });
  }, [activeLesson]);

  // Handle quiz complete
  const handleQuizComplete = useCallback(
    (score: number, answers: Record<string, string>) => {
      if (!activeLesson) return;

      setActiveLesson((prev) => {
        if (!prev || !prev.quiz) return prev;
        return {
          ...prev,
          quiz: {
            ...prev.quiz,
            attempts: [
              ...prev.quiz.attempts,
              {
                attemptNumber: prev.quiz.attempts.length + 1,
                score,
                answers,
                completedAt: new Date().toISOString(),
                timeSpentSeconds: 0,
              },
            ],
            bestScore: Math.max(prev.quiz.bestScore || 0, score),
            isPassed: score >= prev.quiz.passingScore,
          },
        };
      });
    },
    [activeLesson]
  );

  // Handle exercise complete
  const handleExerciseComplete = useCallback(
    (exerciseId: string, usedHints: boolean) => {
      if (!activeLesson) return;

      setActiveLesson((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map((e) =>
            e.id === exerciseId
              ? { ...e, isCompleted: true, completedAt: new Date().toISOString() }
              : e
          ),
        };
      });

      // Award XP
      if (!usedHints) {
        onXpEarned(40, 'Exercicio completo sem dicas!');
      } else {
        onXpEarned(25, 'Exercicio completo');
      }
    },
    [activeLesson, onXpEarned]
  );

  // Handle external resource access
  const handleExternalResourceAccess = useCallback(
    (resourceId: string) => {
      if (!activeLesson) return;

      setActiveLesson((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          externalResources: prev.externalResources.map((r) =>
            r.id === resourceId
              ? { ...r, isAccessed: true, accessedAt: new Date().toISOString() }
              : r
          ),
        };
      });
    },
    [activeLesson]
  );

  // Handle lesson complete
  const handleLessonComplete = useCallback(() => {
    if (!activeLesson) return;

    setActiveLesson((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
    });

    // Update stored lesson
    const lessonKey = `${activeLesson.weekId}-${activeLesson.lessonNumber}`;
    setGeneratedLessons((prev) => {
      const newMap = new Map(prev);
      const lesson = newMap.get(lessonKey);
      if (lesson) {
        newMap.set(lessonKey, { ...lesson, isCompleted: true, completedAt: new Date().toISOString() });
      }
      return newMap;
    });

    // Notify parent
    if (onLessonComplete && activeLesson) {
      // Extract week number from weekId (this assumes weekId format)
      const weekMatch = activeLesson.weekId.match(/week-(\d+)/);
      const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 1;
      onLessonComplete(weekNumber, activeLesson.lessonNumber);
    }
  }, [activeLesson, onLessonComplete]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!plan) return 0;

    let totalLessons = 0;
    let completedLessons = 0;

    plan.weeks.forEach((week) => {
      totalLessons += week.lessonTopics.length;
      week.lessonTopics.forEach((topic) => {
        const lessonKey = getLessonKey(week.week_number, topic.lessonNumber);
        const lesson = generatedLessons.get(lessonKey);
        if (lesson?.isCompleted) {
          completedLessons++;
        }
      });
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }, [plan, generatedLessons, getLessonKey]);

  // Empty state
  if (!plan) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 p-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-400">
            Seu plano de estudos aparecera aqui
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Complete a conversa para gerar seu plano personalizado
          </p>
        </div>
      </div>
    );
  }

  const { plan_summary, weeks, contentStrategy } = plan;

  return (
    <div className="h-full overflow-y-auto bg-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Seu Plano de Estudos</h1>
              </div>
              <p className="mt-2 text-sm text-white/80">
                {contentStrategy.reasoning}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{plan_summary.total_weeks} semanas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{plan_summary.total_hours}h totais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{plan_summary.estimated_completion}</span>
                </div>
              </div>
            </div>
            {onSavePlan && (
              <button
                type="button"
                onClick={onSavePlan}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Plano'}
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/80">Progresso geral</span>
              <span className="text-white font-semibold">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Topics */}
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="font-semibold text-white">Principais Topicos</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {plan_summary.main_topics.map((topic, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Content Strategy Badge */}
        <div className="rounded-lg bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-300">
                Modo: {contentStrategy.overallMode === 'native' ? 'Aprendizado Nativo' : contentStrategy.overallMode === 'hybrid' ? 'Hibrido' : 'Recursos Externos'}
              </h4>
              <p className="text-sm text-slate-400">
                {contentStrategy.nativePercentage}% do conteudo sera ensinado diretamente pela IA
              </p>
            </div>
          </div>
        </div>

        {/* Weeks */}
        <div className="space-y-4">
          {weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.week_number);
            const weekLessonsCompleted = week.lessonTopics.filter((topic) => {
              const lessonKey = getLessonKey(week.week_number, topic.lessonNumber);
              return generatedLessons.get(lessonKey)?.isCompleted;
            }).length;
            const weekProgress = week.lessonTopics.length > 0
              ? Math.round((weekLessonsCompleted / week.lessonTopics.length) * 100)
              : 0;

            return (
              <div key={week.id} className="rounded-lg bg-slate-800 overflow-hidden">
                {/* Week Header */}
                <button
                  type="button"
                  onClick={() => toggleWeek(week.week_number)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-white">
                        Semana {week.week_number}: {week.title}
                      </h3>
                      <p className="text-sm text-slate-400">{week.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm text-slate-400">{week.estimated_hours}h</span>
                      <div className="text-xs text-slate-500">
                        {weekLessonsCompleted}/{week.lessonTopics.length} licoes
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Week Content (Lessons) */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Learning Objectives */}
                    {week.learningObjectives.length > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                          Objetivos da Semana
                        </h4>
                        <ul className="space-y-1">
                          {week.learningObjectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                              <Target className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lessons */}
                    <div className="space-y-2">
                      {week.lessonTopics.map((topic, idx) => {
                        const lessonKey = getLessonKey(week.week_number, topic.lessonNumber);
                        const generatedLesson = generatedLessons.get(lessonKey);
                        const isCompleted = generatedLesson?.isCompleted;
                        const isLoading = loadingLesson === lessonKey;
                        const isLocked = idx > 0 && !generatedLessons.get(getLessonKey(week.week_number, idx))?.isCompleted && week.week_number > 1;

                        return (
                          <button
                            key={`${week.id}-${topic.lessonNumber}`}
                            type="button"
                            onClick={() => !isLocked && handleLessonClick(week, topic)}
                            disabled={isLoading || isLocked}
                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                              isCompleted
                                ? 'border-green-500/30 bg-green-900/10 hover:bg-green-900/20'
                                : isLocked
                                ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                                : 'border-slate-700 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Lesson Status Icon */}
                              <div
                                className={`p-2 rounded-lg ${
                                  isCompleted
                                    ? 'bg-green-500/20'
                                    : isLocked
                                    ? 'bg-slate-700'
                                    : 'bg-blue-500/20'
                                }`}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                                ) : isCompleted ? (
                                  <Check className="h-5 w-5 text-green-400" />
                                ) : isLocked ? (
                                  <Lock className="h-5 w-5 text-slate-500" />
                                ) : (
                                  <Play className="h-5 w-5 text-blue-400" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">
                                    Licao {topic.lessonNumber}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      topic.suggestedDeliveryMode === 'native'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : topic.suggestedDeliveryMode === 'hybrid'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {topic.suggestedDeliveryMode === 'native'
                                      ? 'IA ensina'
                                      : topic.suggestedDeliveryMode === 'hybrid'
                                      ? 'Hibrido'
                                      : 'Externo'}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-white mt-1 truncate">
                                  {topic.title}
                                </h4>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                  {topic.description}
                                </p>

                                {/* Learning objectives */}
                                {topic.learningObjectives.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {topic.learningObjectives.slice(0, 2).map((obj, objIdx) => (
                                      <span
                                        key={objIdx}
                                        className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"
                                      >
                                        {obj}
                                      </span>
                                    ))}
                                    {topic.learningObjectives.length > 2 && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                                        +{topic.learningObjectives.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Progress indicator for generated lessons */}
                              {generatedLesson && !isCompleted && (
                                <div className="text-right">
                                  <span className="text-xs text-slate-400">
                                    {generatedLesson.progressPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {isLessonViewerOpen && (
        <LessonViewer
          lesson={activeLesson}
          isLoading={loadingLesson !== null}
          onClose={handleCloseLessonViewer}
          onSectionComplete={handleSectionComplete}
          onQuizComplete={handleQuizComplete}
          onExerciseComplete={handleExerciseComplete}
          onExternalResourceAccess={handleExternalResourceAccess}
          onXpEarned={onXpEarned}
          onLessonComplete={handleLessonComplete}
        />
      )}
    </div>
  );
});

export default EnhancedStudyPlanPreview;
