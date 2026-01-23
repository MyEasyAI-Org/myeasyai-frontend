/**
 * ChallengeCard Component
 *
 * Displays a single challenge with progress.
 */

import { memo, useMemo } from 'react';
import {
  Target,
  Dumbbell,
  Droplet,
  Salad,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Challenge } from '../../types/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete?: () => void;
  compact?: boolean;
}

// Icon mapping
const CHALLENGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Dumbbell,
  Droplet,
  Salad,
  Calendar,
  Star,
};

export const ChallengeCard = memo(function ChallengeCard({
  challenge,
  onComplete,
  compact = false,
}: ChallengeCardProps) {
  const Icon = CHALLENGE_ICONS[challenge.icon] || Target;

  const progressPercent = useMemo(() => {
    return Math.min(Math.round((challenge.progress / challenge.target) * 100), 100);
  }, [challenge.progress, challenge.target]);

  const isCompleted = challenge.status === 'completed';
  const isExpired = challenge.status === 'expired';

  // Time remaining
  const timeRemaining = useMemo(() => {
    if (isCompleted || isExpired) return null;

    const now = new Date();
    const expires = new Date(challenge.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d restante${days > 1 ? 's' : ''}`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }, [challenge.expiresAt, isCompleted, isExpired]);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
          isCompleted
            ? 'bg-green-500/10 border-green-500/30'
            : isExpired
            ? 'bg-slate-800/30 border-slate-700 opacity-50'
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            isCompleted ? 'bg-green-500/20' : 'bg-slate-700/50'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <Icon className={`h-4 w-4 ${isExpired ? 'text-slate-600' : 'text-lime-400'}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {challenge.title}
          </p>
          {!isCompleted && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">
                {challenge.progress}/{challenge.target}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-medium">+{challenge.xpReward} XP</span>
          {!isCompleted && !isExpired && onComplete && progressPercent >= 100 && (
            <button
              onClick={onComplete}
              className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-green-500/10 border-green-500/30'
          : isExpired
          ? 'bg-slate-800/30 border-slate-700 opacity-50'
          : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${
              isCompleted ? 'bg-green-500/20' : 'bg-slate-700/50'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <Icon className={`h-5 w-5 ${isExpired ? 'text-slate-600' : 'text-lime-400'}`} />
            )}
          </div>
          <div>
            <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
              {challenge.title}
            </h4>
            <p className="text-sm text-slate-500">{challenge.description}</p>
          </div>
        </div>

        {/* Type badge */}
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            challenge.type === 'daily'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}
        >
          {challenge.type === 'daily' ? 'Diario' : 'Semanal'}
        </span>
      </div>

      {/* Progress bar */}
      {!isCompleted && !isExpired && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">Progresso</span>
            <span className="text-white">
              {challenge.progress}/{challenge.target}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">+{challenge.xpReward} XP</span>
          </div>
          {timeRemaining && !isCompleted && (
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeRemaining}</span>
            </div>
          )}
        </div>

        {!isCompleted && !isExpired && onComplete && progressPercent >= 100 && (
          <button
            onClick={onComplete}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Completar
          </button>
        )}

        {isCompleted && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Completo
          </div>
        )}
      </div>
    </div>
  );
});

export default ChallengeCard;
