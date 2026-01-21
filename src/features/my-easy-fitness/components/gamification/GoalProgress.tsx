/**
 * GoalProgress Component
 *
 * Displays active goals with progress tracking.
 */

import { memo, useMemo } from 'react';
import {
  Flag,
  Dumbbell,
  Flame,
  CheckCircle,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { Goal, GoalCategory } from '../../types/gamification';

interface GoalProgressProps {
  activeGoals: Goal[];
  completedGoals: Goal[];
  overallProgress: number;
  compact?: boolean;
}

// Icon mapping for goal categories
const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Dumbbell,
  Flame,
  CheckCircle,
  Calendar,
  Flag,
  TrendingUp,
  Target,
};

// Category colors
const CATEGORY_COLORS: Record<GoalCategory, { bg: string; text: string; border: string }> = {
  workout: {
    bg: 'bg-lime-500/20',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
  },
  consistency: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  nutrition: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  progress: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
};

interface GoalCardProps {
  goal: Goal;
  compact?: boolean;
}

const GoalCard = memo(function GoalCard({ goal, compact = false }: GoalCardProps) {
  const Icon = GOAL_ICONS[goal.icon] || Flag;
  const colors = CATEGORY_COLORS[goal.category];

  const progressPercent = useMemo(() => {
    return Math.min(Math.round((goal.progress / goal.target) * 100), 100);
  }, [goal.progress, goal.target]);

  const isCompleted = goal.status === 'completed';

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          isCompleted ? 'bg-green-500/10 border-green-500/30' : `${colors.bg} ${colors.border}`
        }`}
      >
        <div className={`p-1.5 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-slate-800/80'}`}>
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <Icon className={`h-4 w-4 ${colors.text}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {goal.title}
          </p>
          {!isCompleted && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-lime-500'} transition-all`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">
                {goal.progress}/{goal.target} {goal.unit}
              </span>
            </div>
          )}
        </div>

        {isCompleted && (
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCompleted ? 'bg-green-500/10 border-green-500/30' : `${colors.bg} ${colors.border}`
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-slate-800/80'}`}>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <Icon className={`h-5 w-5 ${colors.text}`} />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {goal.title}
          </h4>
          <p className="text-sm text-slate-500">{goal.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-400">Progresso</span>
          <span className={isCompleted ? 'text-green-400' : 'text-white'}>
            {goal.progress}/{goal.target} {goal.unit}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-lime-500'} transition-all`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{progressPercent}% concluido</span>
        {isCompleted && goal.completedAt && (
          <span className="text-green-400">
            Concluido em {new Date(goal.completedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
});

export const GoalProgress = memo(function GoalProgress({
  activeGoals,
  completedGoals,
  overallProgress,
  compact = false,
}: GoalProgressProps) {
  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Metas</span>
          </div>
          <span className="text-sm text-slate-400">{overallProgress}% geral</span>
        </div>

        {activeGoals.length > 0 ? (
          <div className="space-y-2">
            {activeGoals.slice(0, 2).map((goal) => (
              <GoalCard key={goal.id} goal={goal} compact />
            ))}
            {activeGoals.length > 2 && (
              <p className="text-xs text-slate-500 text-center pt-2">
                +{activeGoals.length - 2} meta(s) a mais
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma meta ativa
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-lime-500/20">
            <Flag className="h-6 w-6 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Metas</h3>
            <p className="text-sm text-slate-400">
              {activeGoals.length} ativa{activeGoals.length !== 1 ? 's' : ''} - {overallProgress}%
              progresso geral
            </p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="hidden md:block w-32">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-500 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-700">
          <Flag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma meta ativa</p>
          <p className="text-sm text-slate-500 mt-1">
            As metas serao geradas automaticamente com base no seu perfil
          </p>
        </div>
      )}

      {/* Completed goals (collapsed by default) */}
      {completedGoals.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-3">
            Metas Concluidas ({completedGoals.length})
          </h4>
          <div className="space-y-2">
            {completedGoals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} compact />
            ))}
            {completedGoals.length > 3 && (
              <p className="text-xs text-slate-500 text-center pt-2">
                +{completedGoals.length - 3} meta(s) concluida(s)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default GoalProgress;
