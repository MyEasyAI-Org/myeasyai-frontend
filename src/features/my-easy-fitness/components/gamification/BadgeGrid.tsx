/**
 * BadgeGrid Component
 *
 * Displays a grid of badges (unlocked and locked).
 */

import { memo, useState, useMemo } from 'react';
import {
  Flame,
  Dumbbell,
  CalendarCheck,
  Footprints,
  UserCheck,
  Sunrise,
  Moon,
  RotateCcw,
  Trophy,
  Medal,
  Crown,
  Star,
  Stars,
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Badge, BadgeRarity } from '../../types/gamification';
import { RARITY_COLORS } from '../../constants/gamification';

interface BadgeGridProps {
  unlockedBadges: Array<Badge & { unlockedAt: string }>;
  lockedBadges: Badge[];
  showLocked?: boolean;
  compact?: boolean;
}

// Icon mapping
const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Dumbbell,
  CalendarCheck,
  Footprints,
  UserCheck,
  Sunrise,
  Moon,
  RotateCcw,
  Trophy,
  Medal,
  Crown,
  Star,
  Stars,
  Award,
};

interface BadgeItemProps {
  badge: Badge;
  isUnlocked: boolean;
  unlockedAt?: string;
  compact?: boolean;
}

const BadgeItem = memo(function BadgeItem({
  badge,
  isUnlocked,
  unlockedAt,
  compact = false,
}: BadgeItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = BADGE_ICONS[badge.icon] || Award;
  const colors = RARITY_COLORS[badge.rarity];

  if (compact) {
    return (
      <div
        className={`relative p-2 rounded-lg ${
          isUnlocked ? colors.bg : 'bg-slate-800/50'
        } border ${isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
          isUnlocked ? 'hover:scale-105' : 'opacity-50'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isUnlocked ? (
          <Icon className={`h-6 w-6 ${colors.text}`} />
        ) : (
          <Lock className="h-6 w-6 text-slate-600" />
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-40">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-lg">
              <p className={`text-xs font-medium ${isUnlocked ? colors.text : 'text-slate-400'}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{badge.description}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl ${
        isUnlocked ? colors.bg : 'bg-slate-800/30'
      } border ${isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
        isUnlocked ? 'hover:scale-102 shadow-lg' : 'opacity-60'
      } ${isUnlocked ? colors.glow : ''}`}
    >
      {/* Badge icon */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-lg ${
            isUnlocked ? 'bg-slate-800/80' : 'bg-slate-700/50'
          }`}
        >
          {isUnlocked ? (
            <Icon className={`h-6 w-6 ${colors.text}`} />
          ) : (
            <Lock className="h-6 w-6 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'} truncate`}>
            {badge.name}
          </h4>
          <p className="text-xs text-slate-500 truncate">{badge.description}</p>
        </div>
      </div>

      {/* Rarity indicator */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-[10px] uppercase tracking-wider ${
            isUnlocked ? colors.text : 'text-slate-600'
          }`}
        >
          {badge.rarity}
        </span>
        {isUnlocked && unlockedAt && (
          <span className="text-[10px] text-slate-500">
            {new Date(unlockedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
});

export const BadgeGrid = memo(function BadgeGrid({
  unlockedBadges,
  lockedBadges,
  showLocked = true,
  compact = false,
}: BadgeGridProps) {
  const [expanded, setExpanded] = useState(false);

  // Group badges by rarity for display
  const groupedUnlocked = useMemo(() => {
    const groups: Record<BadgeRarity, Array<Badge & { unlockedAt: string }>> = {
      legendary: [],
      epic: [],
      rare: [],
      common: [],
    };

    for (const badge of unlockedBadges) {
      groups[badge.rarity].push(badge);
    }

    return groups;
  }, [unlockedBadges]);

  const stats = useMemo(() => ({
    total: unlockedBadges.length + lockedBadges.length,
    unlocked: unlockedBadges.length,
    percentage: Math.round(
      (unlockedBadges.length / (unlockedBadges.length + lockedBadges.length)) * 100
    ),
  }), [unlockedBadges, lockedBadges]);

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="font-medium text-white">Conquistas</span>
          </div>
          <span className="text-sm text-slate-400">
            {stats.unlocked}/{stats.total}
          </span>
        </div>

        {/* Compact grid */}
        <div className="flex flex-wrap gap-2">
          {unlockedBadges.slice(0, 8).map((badge) => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              isUnlocked={true}
              unlockedAt={badge.unlockedAt}
              compact
            />
          ))}
          {unlockedBadges.length > 8 && (
            <div className="p-2 rounded-lg bg-slate-700/50 text-slate-400 text-xs flex items-center justify-center min-w-[40px]">
              +{unlockedBadges.length - 8}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Award className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Conquistas</h3>
            <p className="text-sm text-slate-400">
              {stats.unlocked} de {stats.total} desbloqueadas ({stats.percentage}%)
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden md:block w-32">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked badges by rarity */}
      {(['legendary', 'epic', 'rare', 'common'] as BadgeRarity[]).map((rarity) => {
        const badges = groupedUnlocked[rarity];
        if (badges.length === 0) return null;

        return (
          <div key={rarity}>
            <h4 className={`text-sm font-medium ${RARITY_COLORS[rarity].text} mb-3 uppercase tracking-wider`}>
              {rarity === 'legendary' && 'Lendarias'}
              {rarity === 'epic' && 'Epicas'}
              {rarity === 'rare' && 'Raras'}
              {rarity === 'common' && 'Comuns'}
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <BadgeItem
                  key={badge.id}
                  badge={badge}
                  isUnlocked={true}
                  unlockedAt={badge.unlockedAt}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Locked badges */}
      {showLocked && lockedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">
            Bloqueadas ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(expanded ? lockedBadges : lockedBadges.slice(0, 6)).map((badge) => (
              <BadgeItem key={badge.id} badge={badge} isUnlocked={false} />
            ))}
          </div>
          {lockedBadges.length > 6 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 w-full py-2 px-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Ver mais ({lockedBadges.length - 6})
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {unlockedBadges.length === 0 && (
        <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700">
          <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma conquista desbloqueada ainda</p>
          <p className="text-sm text-slate-500 mt-1">
            Continue treinando para ganhar suas primeiras conquistas!
          </p>
        </div>
      )}
    </div>
  );
});

export default BadgeGrid;
