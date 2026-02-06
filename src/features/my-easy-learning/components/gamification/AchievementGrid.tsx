/**
 * AchievementGrid Component
 *
 * Displays a grid of unique achievements (special one-time badges).
 */

import { memo, useState, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  CalendarCheck,
  Trophy,
  Crown,
  Award,
  RotateCcw,
  TrendingUp,
  Cake,
  Layers,
  CalendarRange,
  Zap,
  Sunrise,
  Moon,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ACHIEVEMENT_RARITY_COLORS,
  type AchievementCategory,
  type AchievementRarity,
} from '../../constants/uniqueBadges';

interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  hint?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementGridProps {
  achievements: AchievementWithStatus[];
  showHidden?: boolean;
  compact?: boolean;
}

// Icon mapping
const ACHIEVEMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  FileText,
  CalendarCheck,
  Trophy,
  Crown,
  Award,
  RotateCcw,
  TrendingUp,
  Cake,
  Layers,
  CalendarRange,
  Zap,
  Sunrise,
  Moon,
};

interface AchievementItemProps {
  achievement: AchievementWithStatus;
  compact?: boolean;
}

const AchievementItem = memo(function AchievementItem({
  achievement,
  compact = false,
}: AchievementItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] || Award;
  const colors = ACHIEVEMENT_RARITY_COLORS[achievement.rarity];
  const isHidden = achievement.category === 'hidden' && !achievement.isUnlocked;

  if (compact) {
    return (
      <div
        className={`relative p-2 rounded-lg ${
          achievement.isUnlocked ? colors.bg : 'bg-slate-800/50'
        } border ${achievement.isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
          achievement.isUnlocked ? 'hover:scale-105' : 'opacity-50'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {achievement.isUnlocked ? (
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
                  achievement.isUnlocked ? colors.text : 'text-slate-400'
                }`}
              >
                {isHidden ? '???' : achievement.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isHidden && achievement.hint ? achievement.hint : achievement.description}
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
        achievement.isUnlocked ? colors.bg : 'bg-slate-800/30'
      } border ${achievement.isUnlocked ? colors.border : 'border-slate-700'} transition-all ${
        achievement.isUnlocked ? 'hover:scale-102' : 'opacity-60'
      }`}
    >
      {/* Badge icon and name */}
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 rounded-md ${
            achievement.isUnlocked ? 'bg-slate-800/80' : 'bg-slate-700/50'
          }`}
        >
          {achievement.isUnlocked ? (
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
              achievement.isUnlocked ? 'text-white' : 'text-slate-500'
            } truncate`}
          >
            {isHidden ? '???' : achievement.name}
          </h4>
          <p className="text-[10px] text-slate-500 truncate">
            {isHidden && achievement.hint ? achievement.hint : achievement.description}
          </p>
        </div>
      </div>

      {/* Rarity indicator - inline */}
      <div className="mt-1.5 flex items-center justify-between text-[9px]">
        <span
          className={`uppercase tracking-wider ${
            achievement.isUnlocked ? colors.text : 'text-slate-600'
          }`}
        >
          {achievement.rarity === 'common' && 'Comum'}
          {achievement.rarity === 'rare' && 'Rara'}
          {achievement.rarity === 'epic' && 'Epica'}
          {achievement.rarity === 'legendary' && 'Lendaria'}
        </span>
        {achievement.isUnlocked && achievement.unlockedAt && (
          <span className="text-slate-500">
            {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
        {isHidden && !achievement.isUnlocked && (
          <span className="text-purple-400/60">Oculta</span>
        )}
      </div>
    </div>
  );
});

export const AchievementGrid = memo(function AchievementGrid({
  achievements,
  compact = false,
}: AchievementGridProps) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 3;

  // Sort achievements: unlocked first, then by rarity
  const sortedAchievements = useMemo(() => {
    const rarityOrder: Record<AchievementRarity, number> = {
      legendary: 0,
      epic: 1,
      rare: 2,
      common: 3,
    };

    return [...achievements].sort((a, b) => {
      // Unlocked first
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      // Then by rarity
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }, [achievements]);

  const stats = useMemo(() => ({
    total: achievements.length,
    unlocked: achievements.filter((a) => a.isUnlocked).length,
    percentage: achievements.length > 0
      ? Math.round((achievements.filter((a) => a.isUnlocked).length / achievements.length) * 100)
      : 0,
  }), [achievements]);

  const visibleAchievements = expanded ? sortedAchievements : sortedAchievements.slice(0, INITIAL_COUNT);
  const hasMore = sortedAchievements.length > INITIAL_COUNT;

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="font-medium text-white">Conquistas</span>
          </div>
          <span className="text-sm text-slate-400">
            {stats.unlocked}/{stats.total}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sortedAchievements.slice(0, 3).map((achievement) => (
            <AchievementItem key={achievement.id} achievement={achievement} compact />
          ))}
        </div>

        {sortedAchievements.length > 3 && (
          <p className="text-xs text-slate-500 text-center mt-2">
            +{sortedAchievements.length - 3} conquistas
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
          <Trophy className="h-5 w-5 text-purple-400" />
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

      {/* Achievements grid - flat, no categories */}
      <div className="grid grid-cols-3 gap-1.5">
        {visibleAchievements.map((achievement) => (
          <AchievementItem key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Ver mais button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Ver mais ({sortedAchievements.length - INITIAL_COUNT})
            </>
          )}
        </button>
      )}

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-6 bg-slate-800/30 rounded-lg border border-slate-700">
          <Trophy className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma conquista disponivel</p>
        </div>
      )}
    </div>
  );
});

export default AchievementGrid;
