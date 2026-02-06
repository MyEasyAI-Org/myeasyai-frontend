/**
 * ExerciseCard Component
 *
 * Displays practice exercises with hints and solution reveal.
 */

import { memo, useState } from 'react';
import { PenTool, Lightbulb, Eye, EyeOff, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { PracticeExercise } from '../../types/lesson';

interface ExerciseCardProps {
  exercise: PracticeExercise;
  onComplete: (usedHints: boolean) => void;
  onXpEarned: (amount: number, reason: string) => void;
}

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  onComplete,
  onXpEarned,
}: ExerciseCardProps) {
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCompleted, setIsCompleted] = useState(exercise.isCompleted);

  const difficultyColors = {
    easy: 'text-green-400 bg-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    hard: 'text-red-400 bg-red-500/20',
  };

  const difficultyLabels = {
    easy: 'Facil',
    medium: 'Medio',
    hard: 'Dificil',
  };

  const handleRevealHint = () => {
    if (hintsRevealed < exercise.hints.length) {
      setHintsRevealed((prev) => prev + 1);
    }
  };

  const handleMarkComplete = () => {
    if (isCompleted) return;

    setIsCompleted(true);
    const usedHints = hintsRevealed > 0 || showSolution;

    // Calculate XP
    let xp = exercise.xpReward;
    let reason = 'Exercicio concluido';

    if (!usedHints) {
      xp = Math.round(xp * 1.5); // 50% bonus for no hints
      reason = 'Exercicio concluido sem dicas!';
    }

    onXpEarned(xp, reason);
    onComplete(usedHints);
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isCompleted
          ? 'border-green-500/30 bg-green-900/10'
          : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
            {isCompleted ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <PenTool className="h-5 w-5 text-orange-400" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">{exercise.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  difficultyColors[exercise.difficulty]
                }`}
              >
                {difficultyLabels[exercise.difficulty]}
              </span>
              <span className="text-xs text-slate-500">
                ~{exercise.estimatedMinutes} min
              </span>
              <span className="text-xs text-amber-400">+{exercise.xpReward} XP</span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          {/* Description */}
          <div className="py-4">
            <p className="text-slate-300 whitespace-pre-wrap">{exercise.description}</p>
          </div>

          {/* Starter code */}
          {exercise.starterCode && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Codigo inicial:</p>
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
                  {exercise.starterCode}
                </pre>
              </div>
            </div>
          )}

          {/* Hints section */}
          {exercise.hints.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Lightbulb className="h-4 w-4" />
                {showHints ? 'Esconder dicas' : `Ver dicas (${exercise.hints.length})`}
              </button>

              {showHints && (
                <div className="mt-3 space-y-2">
                  {exercise.hints.slice(0, hintsRevealed).map((hint, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                    >
                      <p className="text-sm text-amber-200">
                        <span className="font-semibold">Dica {index + 1}:</span> {hint}
                      </p>
                    </div>
                  ))}

                  {hintsRevealed < exercise.hints.length && (
                    <button
                      onClick={handleRevealHint}
                      className="text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Revelar proxima dica ({hintsRevealed + 1}/{exercise.hints.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Solution */}
          {exercise.solution && (
            <div className="mb-4">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {showSolution ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showSolution ? 'Esconder solucao' : 'Ver solucao'}
              </button>

              {showSolution && (
                <div className="mt-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-slate-400 mb-2">Solucao:</p>
                  <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
                    {exercise.solution}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Complete button */}
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Marcar como concluido
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 py-3 text-green-400">
              <Check className="h-5 w-5" />
              <span className="font-semibold">Exercicio concluido!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ExerciseCard;
