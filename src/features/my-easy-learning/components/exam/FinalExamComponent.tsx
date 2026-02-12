/**
 * FinalExamComponent
 *
 * Full-screen exam modal with anti-cheat measures:
 * - Global timer + per-question timers
 * - Forward-only navigation
 * - Tab-away detection
 * - Copy/paste blocked
 * - Option shuffling
 */

import { memo, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  Award,
  RotateCcw,
  Shield,
  Timer,
} from 'lucide-react';
import type {
  FinalExam,
  FinalExamQuestion,
  FinalExamAnswer,
  FinalExamAttempt,
} from '../../types/courseCompletion';

interface FinalExamComponentProps {
  exam: FinalExam;
  questions: FinalExamQuestion[];
  onComplete: (attempt: FinalExamAttempt) => void;
  onCancel: () => void;
}

type ExamPhase = 'intro' | 'exam' | 'result';

export const FinalExamComponent = memo(function FinalExamComponent({
  exam,
  questions,
  onComplete,
  onCancel,
}: FinalExamComponentProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, FinalExamAnswer>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<Set<string>>(new Set());
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timers
  const [examStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [remainingExamTime, setRemainingExamTime] = useState(exam.config.maxTimeMinutes * 60);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [tabAwayCount, setTabAwayCount] = useState(0);

  // Result
  const [finalResult, setFinalResult] = useState<FinalExamAttempt | null>(null);

  // Shuffled options (anti-cheat)
  const shuffledOptions = useMemo(() => {
    return questions.map((q) => {
      if (!q.options) return null;
      const shuffled = [...q.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const currentOptions = shuffledOptions[currentIndex];
  const minTimeMet = questionElapsed >= (currentQuestion?.minTimeSeconds || 15);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global exam timer
  useEffect(() => {
    if (phase !== 'exam') return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - examStartTime) / 1000);
      const remaining = exam.config.maxTimeMinutes * 60 - elapsed;
      setRemainingExamTime(remaining);

      if (remaining <= 0) {
        handleAutoSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, examStartTime]);

  // Per-question timer
  useEffect(() => {
    if (phase !== 'exam' || isConfirmed) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionElapsed(elapsed);

      // Auto-advance if max time exceeded
      if (currentQuestion && elapsed >= currentQuestion.maxTimeSeconds) {
        handleConfirmAnswer(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionStartTime, isConfirmed, currentIndex]);

  // Tab-away detection
  useEffect(() => {
    if (phase !== 'exam') return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabAwayCount((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  // Block copy/paste/context menu
  useEffect(() => {
    if (phase !== 'exam') return;
    const block = (e: Event) => e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('copy', block);
    el.addEventListener('paste', block);
    el.addEventListener('contextmenu', block);
    return () => {
      el.removeEventListener('copy', block);
      el.removeEventListener('paste', block);
      el.removeEventListener('contextmenu', block);
    };
  }, [phase]);

  const handleConfirmAnswer = useCallback(
    (timedOut = false) => {
      if (!currentQuestion) return;

      let answer: string;
      let answersList: string[] | undefined;
      let isCorrect: boolean;

      if (currentQuestion.type === 'multiple_select') {
        answersList = Array.from(selectedMultiple);
        const correctSet = new Set(currentQuestion.correctAnswers || []);
        isCorrect =
          answersList.length === correctSet.size &&
          answersList.every((a) => correctSet.has(a));
        answer = answersList.join(', ');
      } else if (currentQuestion.type === 'fill_blank') {
        answer = fillBlankAnswer.trim();
        isCorrect = answer.toLowerCase() === (currentQuestion.correctAnswer || '').toLowerCase();
      } else {
        answer = selectedAnswer || '';
        isCorrect = answer === currentQuestion.correctAnswer;
      }

      if (timedOut && !answer) {
        answer = '';
        isCorrect = false;
      }

      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      const examAnswer: FinalExamAnswer = {
        questionId: currentQuestion.id,
        answer,
        answers: answersList,
        timeSpentSeconds: timeSpent,
        isCorrect,
      };

      setAnswers((prev) => new Map(prev).set(currentQuestion.id, examAnswer));
      setIsConfirmed(true);
      setShowExplanation(true);
    },
    [currentQuestion, selectedAnswer, selectedMultiple, fillBlankAnswer, questionStartTime]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setSelectedMultiple(new Set());
      setFillBlankAnswer('');
      setIsConfirmed(false);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
      setQuestionElapsed(0);
    } else {
      // Submit exam
      submitExam();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  const handleAutoSubmit = useCallback(() => {
    // Mark unanswered questions as wrong
    if (!isConfirmed && currentQuestion) {
      handleConfirmAnswer(true);
    }
    setTimeout(() => submitExam(), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, currentQuestion]);

  const submitExam = useCallback(() => {
    const totalTime = Math.floor((Date.now() - examStartTime) / 1000);
    const answerArray = Array.from(answers.values());
    const correctCount = answerArray.filter((a) => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = score >= exam.config.passingScore;

    const attempt: FinalExamAttempt = {
      id: crypto.randomUUID(),
      attemptNumber: exam.attempts.length + 1,
      startedAt: new Date(examStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      score,
      passed,
      answers: answerArray,
      questionsUsed: questions.map((q) => q.id),
      totalTimeSeconds: totalTime,
      tabAwayCount,
    };

    setFinalResult(attempt);
    setPhase('result');
    onComplete(attempt);
  }, [answers, exam, examStartTime, onComplete, questions, tabAwayCount]);

  const handleToggleMultiple = useCallback((option: string) => {
    setSelectedMultiple((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(option)) {
        newSet.delete(option);
      } else {
        newSet.add(option);
      }
      return newSet;
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================================================
  // INTRO PHASE
  // ==========================================================================
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Prova Final</h2>
            <p className="text-slate-400 mt-2">{exam.config.questionsPerAttempt} questoes • {exam.config.maxTimeMinutes} minutos</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800">
              <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Tempo limitado</p>
                <p className="text-xs text-slate-400">Voce tem {exam.config.maxTimeMinutes} minutos para completar a prova</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800">
              <ChevronRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Sem voltar</p>
                <p className="text-xs text-slate-400">Apos confirmar uma resposta, nao e possivel voltar</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800">
              <Timer className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Tempo por questao</p>
                <p className="text-xs text-slate-400">Minimo de {exam.config.minTimePerQuestion}s e maximo de {exam.config.maxTimePerQuestion}s por questao</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800">
              <Award className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Nota minima: {exam.config.passingScore}%</p>
                <p className="text-xs text-slate-400">Voce precisa acertar pelo menos {exam.config.passingScore}% das questoes</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setPhase('exam');
                setQuestionStartTime(Date.now());
              }}
              className="flex-1 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer"
            >
              Iniciar Prova
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RESULT PHASE
  // ==========================================================================
  if (phase === 'result' && finalResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 p-8 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              finalResult.passed ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {finalResult.passed ? (
              <Award className="h-10 w-10 text-green-400" />
            ) : (
              <X className="h-10 w-10 text-red-400" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {finalResult.passed ? 'Parabens! Voce passou!' : 'Nao foi dessa vez...'}
          </h3>

          <div className="text-5xl font-bold my-6">
            <span className={finalResult.passed ? 'text-green-400' : 'text-red-400'}>
              {finalResult.score}%
            </span>
          </div>

          <p className="text-slate-400 mb-2">
            {finalResult.answers.filter((a) => a.isCorrect).length} de {questions.length} questoes corretas
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Tempo: {formatTime(finalResult.totalTimeSeconds)}
          </p>

          {finalResult.passed ? (
            <p className="text-green-400 mb-6">
              Voce ja pode emitir seu certificado de conclusao!
            </p>
          ) : (
            <p className="text-slate-400 mb-6">
              Nota minima: {exam.config.passingScore}%. Voce podera tentar novamente em {exam.config.retryWaitHours} horas.
            </p>
          )}

          {tabAwayCount > 0 && (
            <p className="text-amber-400 text-sm mb-4">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Voce saiu da aba {tabAwayCount} vez(es) durante a prova.
            </p>
          )}

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
          >
            {finalResult.passed ? 'Emitir Certificado' : 'Fechar'}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // EXAM PHASE
  // ==========================================================================
  if (!currentQuestion) return null;

  const hasAnswer =
    currentQuestion.type === 'multiple_select'
      ? selectedMultiple.size > 0
      : currentQuestion.type === 'fill_blank'
      ? fillBlankAnswer.trim().length > 0
      : selectedAnswer !== null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 select-none"
      style={{ userSelect: 'none' }}
    >
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Shield className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-white">Prova Final</span>
            <span className="text-sm text-slate-400">
              Questao {currentIndex + 1} de {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Tab-away warning */}
            {tabAwayCount > 0 && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Saidas: {tabAwayCount}
              </span>
            )}
            {/* Global timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                remainingExamTime < 60
                  ? 'bg-red-500/20 text-red-400'
                  : remainingExamTime < 300
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{formatTime(remainingExamTime)}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Per-question timer */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs px-2 py-1 rounded ${
              currentQuestion.difficulty === 'easy'
                ? 'bg-green-500/20 text-green-300'
                : currentQuestion.difficulty === 'medium'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {currentQuestion.difficulty === 'easy' ? 'Facil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Dificil'}
            </span>
            {!isConfirmed && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Timer className="h-4 w-4" />
                {!minTimeMet ? (
                  <span className="text-amber-400">
                    Aguarde {currentQuestion.minTimeSeconds - questionElapsed}s
                  </span>
                ) : (
                  <span>{formatTime(currentQuestion.maxTimeSeconds - questionElapsed)}</span>
                )}
              </div>
            )}
          </div>

          {/* Question text */}
          <h3 className="text-lg font-semibold text-white mb-6">{currentQuestion.question}</h3>

          {/* Code context */}
          {currentQuestion.codeContext && (
            <div className="mb-6 p-4 rounded-lg bg-slate-900 border border-slate-700">
              <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
                {currentQuestion.codeContext}
              </pre>
            </div>
          )}

          {/* Answer area by type */}
          {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && currentOptions && (
            <div className="space-y-3">
              {currentOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                let optionClass = 'border-slate-600 bg-slate-800/50 hover:border-slate-500';

                if (showExplanation) {
                  if (isCorrectOption) {
                    optionClass = 'border-green-500 bg-green-500/20';
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = 'border-red-500 bg-red-500/20';
                  }
                } else if (isSelected) {
                  optionClass = 'border-blue-500 bg-blue-500/20';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isConfirmed && setSelectedAnswer(option)}
                    disabled={isConfirmed}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${optionClass} ${
                      isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        showExplanation && isCorrectOption
                          ? 'border-green-500 bg-green-500'
                          : showExplanation && isSelected && !isCorrectOption
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-500'
                      }`}>
                        {showExplanation && isCorrectOption && <Check className="h-4 w-4 text-white" />}
                        {showExplanation && isSelected && !isCorrectOption && <X className="h-4 w-4 text-white" />}
                      </div>
                      <span className="text-white">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'multiple_select' && currentOptions && (
            <div className="space-y-3">
              <p className="text-sm text-amber-400 mb-2">Selecione TODAS as opcoes corretas:</p>
              {currentOptions.map((option, idx) => {
                const isSelected = selectedMultiple.has(option);
                const isCorrectOption = currentQuestion.correctAnswers?.includes(option);
                let optionClass = 'border-slate-600 bg-slate-800/50 hover:border-slate-500';

                if (showExplanation) {
                  if (isCorrectOption) {
                    optionClass = 'border-green-500 bg-green-500/20';
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = 'border-red-500 bg-red-500/20';
                  }
                } else if (isSelected) {
                  optionClass = 'border-purple-500 bg-purple-500/20';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isConfirmed && handleToggleMultiple(option)}
                    disabled={isConfirmed}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${optionClass} ${
                      isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-500'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <span className="text-white">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <div>
              <input
                type="text"
                value={fillBlankAnswer}
                onChange={(e) => !isConfirmed && setFillBlankAnswer(e.target.value)}
                disabled={isConfirmed}
                placeholder="Digite sua resposta..."
                className="w-full p-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                autoComplete="off"
                onPaste={(e) => e.preventDefault()}
              />
              {showExplanation && (
                <p className="mt-2 text-sm">
                  <span className="text-slate-400">Resposta correta: </span>
                  <span className="text-green-400 font-semibold">{currentQuestion.correctAnswer}</span>
                </p>
              )}
            </div>
          )}

          {currentQuestion.type === 'code_output' && currentOptions && (
            <div className="space-y-3">
              {currentOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                let optionClass = 'border-slate-600 bg-slate-800/50 hover:border-slate-500';

                if (showExplanation) {
                  if (isCorrectOption) optionClass = 'border-green-500 bg-green-500/20';
                  else if (isSelected && !isCorrectOption) optionClass = 'border-red-500 bg-red-500/20';
                } else if (isSelected) {
                  optionClass = 'border-blue-500 bg-blue-500/20';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isConfirmed && setSelectedAnswer(option)}
                    disabled={isConfirmed}
                    className={`w-full p-4 rounded-lg border text-left font-mono transition-all ${optionClass} ${
                      isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span className="text-white">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Explanation after answer */}
          {showExplanation && (
            <div className={`mt-6 p-4 rounded-lg border ${
              answers.get(currentQuestion.id)?.isCorrect
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              <p className={`font-semibold mb-2 ${
                answers.get(currentQuestion.id)?.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {answers.get(currentQuestion.id)?.isCorrect ? 'Correto!' : 'Incorreto'}
              </p>
              <p className="text-slate-300 text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          {!isConfirmed ? (
            <button
              onClick={() => handleConfirmAnswer()}
              disabled={!hasAnswer || !minTimeMet}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                hasAnswer && minTimeMet
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {!minTimeMet
                ? `Aguarde ${currentQuestion.minTimeSeconds - questionElapsed}s...`
                : 'Confirmar resposta'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer"
            >
              {currentIndex === questions.length - 1 ? (
                <>
                  <RotateCcw className="h-5 w-5 inline mr-2" />
                  Finalizar Prova
                </>
              ) : (
                <>
                  Proxima questao
                  <ChevronRight className="h-5 w-5 inline ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default FinalExamComponent;
