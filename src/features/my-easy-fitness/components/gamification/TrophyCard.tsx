/**
 * TrophyCard Component
 *
 * Compact trophy card with click-to-expand details.
 * Shows tier progression (Bronze → Silver → Gold).
 */

import { memo, useState } from 'react';
import {
  Flame,
  Trophy as TrophyIcon,
  CalendarCheck,
  Star,
  Compass,
  Sunrise,
  Moon,
  Salad,
  Check,
  Lock,
  X,
  ChevronRight,
} from 'lucide-react';
import type { TrophyTier } from '../../types/trophies';
import { TIER_COLORS, getTierIndex } from '../../types/trophies';

interface TrophyTierInfo {
  tier: Exclude<TrophyTier, 'none'>;
  name: string;
  description: string;
  requirement: number;
  xpReward: number;
}

interface TrophyCardProps {
  id: string;
  name: string;
  icon: string;
  category: string;
  currentTier: TrophyTier;
  progress: number;
  tiers: [TrophyTierInfo, TrophyTierInfo, TrophyTierInfo];
  compact?: boolean;
}

// Icon mapping
const TROPHY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Trophy: TrophyIcon,
  CalendarCheck,
  Star,
  Compass,
  Sunrise,
  Moon,
  Salad,
};

// Tier badge colors
const TIER_BADGE_COLORS: Record<Exclude<TrophyTier, 'none'>, { bg: string; text: string; border: string }> = {
  bronze: {
    bg: 'bg-amber-900/40',
    text: 'text-amber-600',
    border: 'border-amber-700/50',
  },
  silver: {
    bg: 'bg-slate-400/20',
    text: 'text-slate-300',
    border: 'border-slate-400/50',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/50',
  },
};

// Category labels in Portuguese
const CATEGORY_LABELS: Record<string, string> = {
  streak: 'Sequência',
  volume: 'Volume',
  consistency: 'Consistência',
  variety: 'Variedade',
};

interface TrophyDetailModalProps {
  name: string;
  icon: string;
  category: string;
  currentTier: TrophyTier;
  progress: number;
  tiers: [TrophyTierInfo, TrophyTierInfo, TrophyTierInfo];
  onClose: () => void;
}

const TrophyDetailModal = memo(function TrophyDetailModal({
  name,
  icon,
  category,
  currentTier,
  progress,
  tiers,
  onClose,
}: TrophyDetailModalProps) {
  const Icon = TROPHY_ICONS[icon] || TrophyIcon;
  const currentTierIndex = getTierIndex(currentTier);
  const isMaxed = currentTier === 'gold';
  const tierColors = currentTier !== 'none' ? TIER_COLORS[currentTier] : TIER_COLORS.none;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-slate-900 rounded-2xl border ${tierColors.border} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 ${tierColors.bg} border-b ${tierColors.border}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80">
              <Icon className={`h-8 w-8 ${tierColors.icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-sm text-slate-400">{CATEGORY_LABELS[category] || category}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current progress */}
          <div className="text-center">
            <p className="text-sm text-slate-400">Seu progresso atual</p>
            <p className="text-3xl font-bold text-white">{progress}</p>
          </div>

          {/* Tier progression */}
          <div className="space-y-2">
            {tiers.map((tier, index) => {
              const isUnlocked = index < currentTierIndex;
              const isCurrent = index === currentTierIndex && !isMaxed;
              const tierBadgeColors = TIER_BADGE_COLORS[tier.tier];
              const progressPercent = isCurrent
                ? Math.min(100, Math.round((progress / tier.requirement) * 100))
                : isUnlocked
                ? 100
                : 0;

              return (
                <div
                  key={tier.tier}
                  className={`p-3 rounded-xl border transition-all ${
                    isUnlocked
                      ? `${tierBadgeColors.bg} ${tierBadgeColors.border}`
                      : isCurrent
                      ? 'bg-slate-800/80 border-slate-600'
                      : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <div className={`w-6 h-6 rounded-full ${tierBadgeColors.bg} flex items-center justify-center`}>
                          <Check className={`w-4 h-4 ${tierBadgeColors.text}`} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-slate-500" />
                        </div>
                      )}
                      <span className={`font-medium ${isUnlocked ? tierBadgeColors.text : 'text-slate-300'}`}>
                        {tier.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">+{tier.xpReward} XP</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">{tier.description}</p>

                  {/* Progress bar for current tier */}
                  {(isCurrent || isUnlocked) && (
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          tier.tier === 'bronze'
                            ? 'bg-amber-600'
                            : tier.tier === 'silver'
                            ? 'bg-slate-400'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  {isCurrent && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {progress}/{tier.requirement} ({progressPercent}%)
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Maxed badge */}
          {isMaxed && (
            <div className="text-center py-2 px-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <span className="text-sm font-medium text-yellow-400">
                🏆 Troféu completo!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const TrophyCard = memo(function TrophyCard({
  id,
  name,
  icon,
  category,
  currentTier,
  progress,
  tiers,
  compact = false,
}: TrophyCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const Icon = TROPHY_ICONS[icon] || TrophyIcon;
  const currentTierIndex = getTierIndex(currentTier);
  const isMaxed = currentTier === 'gold';

  // Find the next tier to unlock
  const nextTierIndex = currentTierIndex < 3 ? currentTierIndex : 2;
  const nextTier = tiers[nextTierIndex];

  // Calculate progress percentage to next tier
  const prevRequirement = currentTierIndex > 0 ? tiers[currentTierIndex - 1].requirement : 0;
  const progressToNext = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((progress - prevRequirement) / (nextTier.requirement - prevRequirement)) * 100
          )
        )
      )
    : 100;

  // Get tier colors
  const tierColors = currentTier !== 'none' ? TIER_COLORS[currentTier] : TIER_COLORS.none;

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className={`relative w-full p-3 rounded-xl ${tierColors.bg} border ${tierColors.border} transition-all hover:scale-[1.02] hover:brightness-110 text-left group`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="p-2 rounded-lg bg-slate-800/60 flex-shrink-0">
            <Icon className={`h-5 w-5 ${tierColors.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white text-sm truncate">{name}</h4>
              {isMaxed && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 rounded">
                  MAX
                </span>
              )}
            </div>

            {/* Mini tier badges */}
            <div className="flex items-center gap-1 mt-1">
              {tiers.map((t, i) => {
                const isUnlocked = i < currentTierIndex;
                const badgeColors = TIER_BADGE_COLORS[t.tier];
                return (
                  <div
                    key={t.tier}
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isUnlocked ? badgeColors.bg : 'bg-slate-700/50'
                    }`}
                  >
                    {isUnlocked ? (
                      <Check className={`w-2.5 h-2.5 ${badgeColors.text}`} />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        i === currentTierIndex ? 'bg-slate-400' : 'bg-slate-600'
                      }`} />
                    )}
                  </div>
                );
              })}

              {/* Progress indicator */}
              {!isMaxed && (
                <span className="text-[10px] text-slate-500 ml-1">
                  {progress}/{nextTier.requirement}
                </span>
              )}
            </div>
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
        </div>

        {/* Progress bar */}
        {!isMaxed && (
          <div className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                currentTierIndex === 0
                  ? 'bg-amber-600'
                  : currentTierIndex === 1
                  ? 'bg-slate-400'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        )}
      </button>

      {/* Detail Modal */}
      {showDetail && (
        <TrophyDetailModal
          name={name}
          icon={icon}
          category={category}
          currentTier={currentTier}
          progress={progress}
          tiers={tiers}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
});

export default TrophyCard;
