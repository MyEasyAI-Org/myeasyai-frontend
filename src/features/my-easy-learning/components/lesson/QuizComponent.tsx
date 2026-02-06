/**
 * QuizComponent
 *
 * Interactive quiz with multiple choice and true/false questions.
 */

import { memo, useState, useCallback } from 'react';
import { HelpCircle, Check, X, Award, RotateCcw } from 'lucide-react';
import type { LessonQuiz, QuizQuestion, QuizAttempt } from '../../types/lesson';

interface QuizComponentProps {
  quiz: LessonQuiz;
  onComplete: (score: number, answers: Record<string, string>) => void;
  onXpEarned: (amount: number, reason: string) => void;
}

export const QuizComponent = memo(function QuizComponent({
  quiz,
  onComplete,
  onXpEarned,
}: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (showExplanation) return; // Can't change after submitting

      setSelectedAnswer(answer);
    },
    [showExplanation]
  );

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [question.id]: selectedAnswer,
    }));

    // Award XP for correct answer
    if (correct) {
      onXpEarned(question.xpReward, 'Resposta correta no quiz');
    }
  }, [selectedAnswer, question, onXpEarned]);

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      // Calculate final score
      const correctCount = Object.entries(answers).filter(([qId, ans]) => {
        const q = quiz.questions.find((q) => q.id === qId);
        return q && ans === q.correctAnswer;
      }).length + (isCorrect ? 1 : 0);

      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= quiz.passingScore;

      // Award completion XP
      if (passed) {
        onXpEarned(quiz.xpReward, 'Quiz aprovado!');
        if (score === 100) {
          onXpEarned(15, 'Quiz perfeito!');
        }
      }

      setShowResult(true);
      onComplete(score, { ...answers, [question.id]: selectedAnswer! });
    } else {
      // Move to next question
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  }, [
    isLastQuestion,
    answers,
    isCorrect,
    totalQuestions,
    quiz,
    onXpEarned,
    onComplete,
    question.id,
    selectedAnswer,
  ]);

  const handleRetry = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowResult(false);
  }, []);

  // Show results screen
  if (showResult) {
    const correctCount = Object.entries(answers).filter(([qId, ans]) => {
      const q = quiz.questions.find((q) => q.id === qId);
      return q && ans === q.correctAnswer;
    }).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {passed ? (
              <Award className="h-10 w-10 text-green-400" />
            ) : (
              <X className="h-10 w-10 text-red-400" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Parabens!' : 'Continue tentando!'}
          </h3>

          <p className="text-slate-400 mb-4">
            Voce acertou {correctCount} de {totalQuestions} perguntas
          </p>

          <div className="text-4xl font-bold mb-6">
            <span className={passed ? 'text-green-400' : 'text-red-400'}>{score}%</span>
          </div>

          {passed ? (
            <p className="text-green-400 mb-6">
              +{quiz.xpReward} XP ganhos!
              {score === 100 && ' (+15 XP bonus por nota maxima!)'}
            </p>
          ) : (
            <p className="text-slate-400 mb-6">
              Voce precisa de {quiz.passingScore}% para passar. Revise o conteudo e tente novamente!
            </p>
          )}

          {!passed && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <HelpCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{quiz.title}</h3>
              <p className="text-sm text-slate-400">
                Pergunta {currentQuestion + 1} de {totalQuestions}
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            +{question.xpReward} XP
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg text-white mb-6">{question.question}</p>

        {/* Code context if any */}
        {question.codeContext && (
          <div className="mb-6 p-4 rounded-lg bg-slate-900 border border-slate-700">
            <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
              {question.codeContext}
            </pre>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;

            let optionClass = 'border-slate-600 bg-slate-700/30 hover:border-slate-500';

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
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-lg border text-left transition-all ${optionClass} ${
                  showExplanation ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      showExplanation && isCorrectOption
                        ? 'border-green-500 bg-green-500'
                        : showExplanation && isSelected && !isCorrectOption
                        ? 'border-red-500 bg-red-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {showExplanation && isCorrectOption && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                    {showExplanation && isSelected && !isCorrectOption && (
                      <X className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isCorrect
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            }`}
          >
            <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correto!' : 'Incorreto'}
            </p>
            <p className="text-slate-300">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        {!showExplanation ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedAnswer
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
          >
            {isLastQuestion ? 'Ver resultado' : 'Proxima pergunta'}
          </button>
        )}
      </div>
    </div>
  );
});

export default QuizComponent;
