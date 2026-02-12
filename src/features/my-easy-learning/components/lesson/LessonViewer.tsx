/**
 * LessonViewer Component
 *
 * Main modal component for viewing and interacting with lesson content.
 * Displays theory, code examples, quizzes, exercises, and external resources.
 */

import { memo, useState, useCallback, useEffect } from 'react';
import {
  X,
  BookOpen,
  Code,
  HelpCircle,
  PenTool,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Lightbulb,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { TheoryContent } from './TheoryContent';
import { CodeExample } from './CodeExample';
import { QuizComponent } from './QuizComponent';
import { ExerciseCard } from './ExerciseCard';
import type { GeneratedLesson, LessonSection, ExternalResource } from '../../types/lesson';
import { calculateLessonProgress, LESSON_XP_REWARDS } from '../../types/lesson';

interface LessonViewerProps {
  lesson: GeneratedLesson | null;
  isLoading: boolean;
  onClose: () => void;
  onSectionComplete: (sectionId: string) => void;
  onQuizComplete: (score: number, answers: Record<string, string>) => void;
  onExerciseComplete: (exerciseId: string, usedHints: boolean) => void;
  onExternalResourceAccess: (resourceId: string) => void;
  onXpEarned: (amount: number, reason: string) => void;
  onLessonComplete: () => void;
}

type TabType = 'content' | 'quiz' | 'exercises' | 'resources';

export const LessonViewer = memo(function LessonViewer({
  lesson,
  isLoading,
  onClose,
  onSectionComplete,
  onQuizComplete,
  onExerciseComplete,
  onExternalResourceAccess,
  onXpEarned,
  onLessonComplete,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Track if we've already triggered lesson completion to prevent double XP
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);

  // Reset state when lesson changes
  useEffect(() => {
    setActiveTab('content');
    setCurrentSectionIndex(0);
    setCompletedSections(new Set());
    setHasTriggeredCompletion(false);
  }, [lesson?.id]);

  const handleSectionComplete = useCallback(
    (sectionId: string) => {
      if (completedSections.has(sectionId)) return;

      setCompletedSections((prev) => new Set(prev).add(sectionId));
      onSectionComplete(sectionId);
      onXpEarned(LESSON_XP_REWARDS.SECTION_COMPLETED, 'Secao da licao concluida');
    },
    [completedSections, onSectionComplete, onXpEarned]
  );

  // Check if lesson can be marked as complete (all requirements met)
  const checkLessonCompletion = useCallback((quizJustPassed?: boolean) => {
    if (!lesson || lesson.isCompleted || hasTriggeredCompletion) return;

    const allSectionsComplete = lesson.sections.every(
      (s) => completedSections.has(s.id) || s.isCompleted
    );
    const allExercisesComplete = lesson.exercises.length === 0 || lesson.exercises.every((e) => e.isCompleted);
    const quizPassed = !lesson.quiz || lesson.quiz.isPassed || quizJustPassed;

    if (allSectionsComplete && allExercisesComplete && quizPassed) {
      setHasTriggeredCompletion(true);
      onXpEarned(LESSON_XP_REWARDS.LESSON_COMPLETED, 'Licao completa!');
      onLessonComplete();
    }
  }, [lesson, completedSections, hasTriggeredCompletion, onXpEarned, onLessonComplete]);

  const handleNextSection = useCallback(() => {
    if (!lesson) return;

    const currentSection = lesson.sections[currentSectionIndex];
    if (currentSection && !completedSections.has(currentSection.id)) {
      handleSectionComplete(currentSection.id);
    }

    if (currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      // Last section completed - check if lesson can be marked as complete
      // This handles cases where there's no quiz or exercises
      setTimeout(() => checkLessonCompletion(), 100);
    }
  }, [lesson, currentSectionIndex, completedSections, handleSectionComplete, checkLessonCompletion]);

  const handlePrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  }, [currentSectionIndex]);

  const handleQuizComplete = useCallback(
    (score: number, answers: Record<string, string>) => {
      onQuizComplete(score, answers);

      // Check if lesson is now complete (after quiz passed)
      const passed = score >= (lesson?.quiz?.passingScore || 70);
      if (lesson && passed) {
        setTimeout(() => checkLessonCompletion(true), 100);
      }
    },
    [lesson, onQuizComplete, checkLessonCompletion]
  );

  const handleExerciseComplete = useCallback(
    (exerciseId: string, usedHints: boolean) => {
      onExerciseComplete(exerciseId, usedHints);
      // Check if this was the last exercise and lesson can be completed
      setTimeout(() => checkLessonCompletion(), 100);
    },
    [onExerciseComplete, checkLessonCompletion]
  );

  const handleExternalResourceClick = useCallback(
    (resource: ExternalResource) => {
      window.open(resource.url, '_blank');
      if (!resource.isAccessed) {
        onExternalResourceAccess(resource.id);
        onXpEarned(LESSON_XP_REWARDS.EXTERNAL_RESOURCE_ACCESSED, 'Recurso externo acessado');
      }
    },
    [onExternalResourceAccess, onXpEarned]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Gerando sua licao...</h3>
          <p className="text-slate-400">
            A IA esta preparando conteudo personalizado para voce.
          </p>
        </div>
      </div>
    );
  }

  // No lesson state
  if (!lesson) {
    return null;
  }

  const progress = calculateLessonProgress(lesson);
  const currentSection = lesson.sections[currentSectionIndex];

  // Section icon mapping
  const getSectionIcon = (type: LessonSection['type']) => {
    switch (type) {
      case 'theory':
        return <BookOpen className="h-4 w-4" />;
      case 'example':
        return <Code className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'summary':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'content' as TabType, label: 'Conteudo', icon: BookOpen, count: lesson.sections.length },
    { id: 'quiz' as TabType, label: 'Quiz', icon: HelpCircle, count: lesson.quiz ? lesson.quiz.questions.length : 0 },
    { id: 'exercises' as TabType, label: 'Exercicios', icon: PenTool, count: lesson.exercises.length },
    { id: 'resources' as TabType, label: 'Recursos', icon: ExternalLink, count: lesson.externalResources.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{lesson.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{lesson.objective}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Progresso da licao</span>
              <span className="text-slate-300">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.count === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : tab.count === 0
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    activeTab === tab.id ? 'bg-blue-500' : 'bg-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Section navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {lesson.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSectionIndex(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        index === currentSectionIndex
                          ? 'bg-blue-600 text-white'
                          : completedSections.has(section.id) || section.isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {completedSections.has(section.id) || section.isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        getSectionIcon(section.type)
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-400">
                  {currentSectionIndex + 1} / {lesson.sections.length}
                </span>
              </div>

              {/* Current section content */}
              {currentSection && (
                <>
                  {currentSection.type === 'example' && currentSection.codeSnippet ? (
                    <CodeExample
                      title={currentSection.title}
                      codeSnippet={currentSection.codeSnippet}
                      explanation={currentSection.content}
                      isCompleted={completedSections.has(currentSection.id) || currentSection.isCompleted}
                    />
                  ) : currentSection.type === 'summary' && currentSection.keyPoints ? (
                    <div className={`rounded-xl border p-6 ${
                      completedSections.has(currentSection.id) || currentSection.isCompleted
                        ? 'bg-green-900/10 border-green-500/30'
                        : 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{currentSection.title}</h3>
                      </div>
                      <ul className="space-y-3">
                        {currentSection.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                            </div>
                            <span className="text-slate-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : currentSection.type === 'tip' ? (
                    <div className={`rounded-xl border p-6 ${
                      completedSections.has(currentSection.id) || currentSection.isCompleted
                        ? 'bg-green-900/10 border-green-500/30'
                        : 'bg-amber-900/10 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Lightbulb className="h-5 w-5 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{currentSection.title}</h3>
                      </div>
                      <p className="text-slate-300">{currentSection.content}</p>
                    </div>
                  ) : currentSection.type === 'warning' ? (
                    <div className={`rounded-xl border p-6 ${
                      completedSections.has(currentSection.id) || currentSection.isCompleted
                        ? 'bg-green-900/10 border-green-500/30'
                        : 'bg-red-900/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{currentSection.title}</h3>
                      </div>
                      <p className="text-slate-300">{currentSection.content}</p>
                    </div>
                  ) : (
                    <TheoryContent
                      title={currentSection.title}
                      content={currentSection.content}
                      isCompleted={completedSections.has(currentSection.id) || currentSection.isCompleted}
                    />
                  )}
                </>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={handlePrevSection}
                  disabled={currentSectionIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentSectionIndex === 0
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Anterior
                </button>

                <button
                  onClick={handleNextSection}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  {currentSectionIndex === lesson.sections.length - 1 ? (
                    <>
                      <Check className="h-5 w-5" />
                      Concluir
                    </>
                  ) : (
                    <>
                      Proximo
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && lesson.quiz && (
            <QuizComponent
              quiz={lesson.quiz}
              onComplete={handleQuizComplete}
              onXpEarned={onXpEarned}
            />
          )}

          {activeTab === 'quiz' && !lesson.quiz && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum quiz disponivel para esta licao.</p>
            </div>
          )}

          {/* Exercises Tab */}
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              {lesson.exercises.length > 0 ? (
                lesson.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={(usedHints) => handleExerciseComplete(exercise.id, usedHints)}
                    onXpEarned={onXpEarned}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <PenTool className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum exercicio disponivel para esta licao.</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {lesson.externalResources.length > 0 ? (
                lesson.externalResources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => handleExternalResourceClick(resource)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      resource.isAccessed
                        ? 'border-green-500/30 bg-green-900/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        resource.isAccessed ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <ExternalLink className={`h-5 w-5 ${
                          resource.isAccessed ? 'text-green-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{resource.title}</h4>
                          {resource.isAccessed && (
                            <Check className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-slate-500">{resource.source}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">~{resource.estimatedMinutes} min</span>
                          <span className="text-slate-600">•</span>
                          <span className={resource.isFree ? 'text-green-400' : 'text-amber-400'}>
                            {resource.isFree ? 'Gratuito' : 'Pago'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">
                            {resource.language === 'pt' ? 'Portugues' : 'Ingles'}
                          </span>
                        </div>
                        <p className="text-sm text-blue-400 mt-2">{resource.whyRecommended}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <ExternalLink className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Nenhum recurso externo necessario para esta licao.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Todo o conteudo foi gerado especialmente para voce!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with XP info */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                XP ganho: <span className="text-amber-400 font-semibold">{lesson.xpEarned}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Total disponivel: <span className="text-slate-300">{lesson.totalXpAvailable}</span>
              </span>
            </div>
            {lesson.isCompleted && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                Licao Completa!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default LessonViewer;
