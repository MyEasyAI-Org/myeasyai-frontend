/**
 * UniqueBadgeGrid Component
 *
 * Displays a grid of unique badges (special achievements without progression).
 */

import { memo, useState, useMemo } from 'react';
import {
  Footprints,
  UserCheck,
  Crown,
  Award,
  RotateCcw,
  TrendingUp,
  Cake,
  CalendarRange,
  Zap,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  UNIQUE_BADGE_RARITY_COLORS,
  type UniqueBadgeCategory,
  type UniqueBadgeRarity,
} from '../../constants/uniqueBadges';

interface UniqueBadgeWithStatus {
  id: string;
  name: string;
  description: string;
  category: UniqueBadgeCategory;
  icon: string;
  rarity: UniqueBadgeRarity;
  hint?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface UniqueBadgeGridProps {
  badges: UniqueBadgeWithStatus[];
  showHidden?: boolean;
  compact?: boolean;
}

// Icon mapping
const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  UserCheck,
  Crown,
  Award,
  RotateCcw,
  TrendingUp,
  Cake,
  CalendarRange,
  Zap,
};

interface BadgeItemProps {
  badge: UniqueBadgeWithStatus;
  compact?: boolean;
}

const BadgeItem = memo(function BadgeItem({
  badge,
  compact = false,
}: BadgeItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = BADGE_ICONS[badge.icon] || Award;
  const colors = UNIQUE_BADGE_RARITY_COLORS[badge.rarity];
  const isHidden = badge.category === 'hidden' && !badge.isUnlocked;

  if (compact) {
    return (
      <div
        className={`relative p-2 rounded-lg ${
          badge.isUnlocked ? colors.bg : 'bg-slate-800/50'
        } border ${badge.isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
          badge.isUnlocked ? 'hover:scale-105' : 'opacity-50'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {badge.isUnlocked ? (
          <Icon className={`h-6 w-6 ${colors.text}`} />
        ) : isHidden ? (
          <HelpCircle className="h-6 w-6 text-slate-600" />
        ) : (
          <Lock className="h-6 w-6 text-slate-600" />
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-44">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-lg">
              <p
                className={`text-xs font-medium ${
                  badge.isUnlocked ? colors.text : 'text-slate-400'
                }`}
              >
                {isHidden ? '???' : badge.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isHidden && badge.hint ? badge.hint : badge.description}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative p-2.5 rounded-lg ${
        badge.isUnlocked ? colors.bg : 'bg-slate-800/30'
      } border ${badge.isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
        badge.isUnlocked ? 'hover:scale-102' : 'opacity-60'
      }`}
    >
      {/* Badge icon and name */}
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 rounded-md ${
            badge.isUnlocked ? 'bg-slate-800/80' : 'bg-slate-700/50'
          }`}
        >
          {badge.isUnlocked ? (
            <Icon className={`h-4 w-4 ${colors.text}`} />
          ) : isHidden ? (
            <HelpCircle className="h-4 w-4 text-slate-600" />
          ) : (
            <Lock className="h-4 w-4 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium ${
              badge.isUnlocked ? 'text-white' : 'text-slate-500'
            } truncate`}
          >
            {isHidden ? '???' : badge.name}
          </h4>
          <p className="text-[10px] text-slate-500 truncate">
            {isHidden && badge.hint ? badge.hint : badge.description}
          </p>
        </div>
      </div>

      {/* Rarity indicator - inline */}
      <div className="mt-1.5 flex items-center justify-between text-[9px]">
        <span
          className={`uppercase tracking-wider ${
            badge.isUnlocked ? colors.text : 'text-slate-600'
          }`}
        >
          {badge.rarity === 'common' && 'Comum'}
          {badge.rarity === 'rare' && 'Rara'}
          {badge.rarity === 'epic' && 'Epica'}
          {badge.rarity === 'legendary' && 'Lendaria'}
        </span>
        {badge.isUnlocked && badge.unlockedAt && (
          <span className="text-slate-500">
            {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
        {isHidden && !badge.isUnlocked && (
          <span className="text-purple-400/60">Oculta</span>
        )}
      </div>
    </div>
  );
});

export const UniqueBadgeGrid = memo(function UniqueBadgeGrid({
  badges,
  compact = false,
}: UniqueBadgeGridProps) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 3;

  // Sort badges: unlocked first, then by rarity
  const sortedBadges = useMemo(() => {
    const rarityOrder: Record<UniqueBadgeRarity, number> = {
      legendary: 0,
      epic: 1,
      rare: 2,
      common: 3,
    };

    return [...badges].sort((a, b) => {
      // Unlocked first
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      // Then by rarity
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }, [badges]);

  const stats = useMemo(() => ({
    total: badges.length,
    unlocked: badges.filter((b) => b.isUnlocked).length,
    percentage: badges.length > 0
      ? Math.round((badges.filter((b) => b.isUnlocked).length / badges.length) * 100)
      : 0,
  }), [badges]);

  const visibleBadges = expanded ? sortedBadges : sortedBadges.slice(0, INITIAL_COUNT);
  const hasMore = sortedBadges.length > INITIAL_COUNT;

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            <span className="font-medium text-white">Conquistas</span>
          </div>
          <span className="text-sm text-slate-400">
            {stats.unlocked}/{stats.total}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sortedBadges.slice(0, 3).map((badge) => (
            <BadgeItem key={badge.id} badge={badge} compact />
          ))}
        </div>

        {sortedBadges.length > 3 && (
          <p className="text-xs text-slate-500 text-center mt-2">
            +{sortedBadges.length - 3} conquistas
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Compact header with inline stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          <span className="font-medium text-white">Conquistas</span>
          <span className="text-xs text-slate-500">
            ({stats.unlocked}/{stats.total})
          </span>
        </div>
        <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Badges grid - flat, no categories */}
      <div className="grid grid-cols-3 gap-1.5">
        {visibleBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>

      {/* Ver mais button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Ver mais ({sortedBadges.length - INITIAL_COUNT})
            </>
          )}
        </button>
      )}

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-6 bg-slate-800/30 rounded-lg border border-slate-700">
          <Award className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma conquista disponivel</p>
        </div>
      )}
    </div>
  );
});

export default UniqueBadgeGrid;
