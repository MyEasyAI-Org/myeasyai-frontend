/**
 * TrophyGrid Component
 *
 * Displays a grid of trophies with tier progression.
 */

import { memo, useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { TrophyCard } from './TrophyCard';
import type { TrophyCategory } from '../../types/trophies';

interface TrophyWithProgress {
  id: string;
  name: string;
  icon: string;
  category: TrophyCategory;
  userProgress: {
    currentTier: 'none' | 'bronze' | 'silver' | 'gold';
    progress: number;
  };
  tiers: Array<{
    tier: 'bronze' | 'silver' | 'gold';
    name: string;
    description: string;
    requirement: number;
    xpReward: number;
  }>;
  isMaxed: boolean;
}

interface TrophyGridProps {
  trophies: TrophyWithProgress[];
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  trophyPoints: number;
  totalTiers: number;
  unlockedTiers: number;
  compact?: boolean;
}

export const TrophyGrid = memo(function TrophyGrid({
  trophies,
  goldCount,
  silverCount,
  bronzeCount,
  trophyPoints,
  totalTiers,
  unlockedTiers,
  compact = false,
}: TrophyGridProps) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 3;

  const visibleTrophies = expanded ? trophies : trophies.slice(0, INITIAL_COUNT);
  const hasMore = trophies.length > INITIAL_COUNT;

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="font-medium text-white">Trofeus</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-400">{goldCount}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{silverCount}</span>
            <span className="text-slate-400">/</span>
            <span className="text-amber-600">{bronzeCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {trophies.slice(0, 3).map((trophy) => (
            <TrophyCard
              key={trophy.id}
              id={trophy.id}
              name={trophy.name}
              icon={trophy.icon}
              category={trophy.category}
              currentTier={trophy.userProgress.currentTier}
              progress={trophy.userProgress.progress}
              tiers={trophy.tiers as [any, any, any]}
              compact
            />
          ))}
        </div>

        {trophies.length > 3 && (
          <p className="text-xs text-slate-500 text-center mt-2">
            +{trophies.length - 3} trofeus
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Compact header with inline stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="font-medium text-white">Trofeus</span>
          <span className="text-xs text-slate-500">
            ({unlockedTiers}/{totalTiers})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-yellow-400">{goldCount}🥇</span>
          <span className="text-slate-300">{silverCount}🥈</span>
          <span className="text-amber-600">{bronzeCount}🥉</span>
          <span className="text-amber-400 ml-1">{trophyPoints}pts</span>
        </div>
      </div>

      {/* Trophies grid - flat, no categories */}
      <div className="grid grid-cols-3 gap-1.5">
        {visibleTrophies.map((trophy) => (
          <TrophyCard
            key={trophy.id}
            id={trophy.id}
            name={trophy.name}
            icon={trophy.icon}
            category={trophy.category}
            currentTier={trophy.userProgress.currentTier}
            progress={trophy.userProgress.progress}
            tiers={trophy.tiers as [any, any, any]}
          />
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
              Ver mais ({trophies.length - INITIAL_COUNT})
            </>
          )}
        </button>
      )}

      {/* Empty state */}
      {trophies.length === 0 && (
        <div className="text-center py-6 bg-slate-800/30 rounded-lg border border-slate-700">
          <Trophy className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhum trofeu disponivel</p>
        </div>
      )}
    </div>
  );
});

export default TrophyGrid;
