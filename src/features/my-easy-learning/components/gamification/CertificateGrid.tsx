/**
 * CertificateGrid Component
 *
 * Displays a grid of certificates with tier progression.
 */

import { memo, useState } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import { CertificateCard } from './CertificateCard';
import type { CertificateCategory, CertificateTier } from '../../types/trophies';

interface CertificateWithProgress {
  id: string;
  name: string;
  icon: string;
  category: CertificateCategory;
  userProgress: {
    currentTier: CertificateTier;
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

interface CertificateGridProps {
  certificates: CertificateWithProgress[];
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  certificatePoints: number;
  totalTiers: number;
  unlockedTiers: number;
  compact?: boolean;
}

export const CertificateGrid = memo(function CertificateGrid({
  certificates,
  goldCount,
  silverCount,
  bronzeCount,
  certificatePoints,
  totalTiers,
  unlockedTiers,
  compact = false,
}: CertificateGridProps) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 3;

  const visibleCertificates = expanded ? certificates : certificates.slice(0, INITIAL_COUNT);
  const hasMore = certificates.length > INITIAL_COUNT;

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="font-medium text-white">Certificados</span>
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
          {certificates.slice(0, 3).map((certificate) => (
            <CertificateCard
              key={certificate.id}
              id={certificate.id}
              name={certificate.name}
              icon={certificate.icon}
              category={certificate.category}
              currentTier={certificate.userProgress.currentTier}
              progress={certificate.userProgress.progress}
              tiers={certificate.tiers as [any, any, any]}
              compact
            />
          ))}
        </div>

        {certificates.length > 3 && (
          <p className="text-xs text-slate-500 text-center mt-2">
            +{certificates.length - 3} certificados
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
          <Award className="h-5 w-5 text-amber-400" />
          <span className="font-medium text-white">Certificados</span>
          <span className="text-xs text-slate-500">
            ({unlockedTiers}/{totalTiers})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-yellow-400">{goldCount}🥇</span>
          <span className="text-slate-300">{silverCount}🥈</span>
          <span className="text-amber-600">{bronzeCount}🥉</span>
          <span className="text-amber-400 ml-1">{certificatePoints}pts</span>
        </div>
      </div>

      {/* Certificates grid - flat, no categories */}
      <div className="grid grid-cols-3 gap-1.5">
        {visibleCertificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            id={certificate.id}
            name={certificate.name}
            icon={certificate.icon}
            category={certificate.category}
            currentTier={certificate.userProgress.currentTier}
            progress={certificate.userProgress.progress}
            tiers={certificate.tiers as [any, any, any]}
          />
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
              Ver mais ({certificates.length - INITIAL_COUNT})
            </>
          )}
        </button>
      )}

      {/* Empty state */}
      {certificates.length === 0 && (
        <div className="text-center py-6 bg-slate-800/30 rounded-lg border border-slate-700">
          <Award className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhum certificado disponivel</p>
        </div>
      )}
    </div>
  );
});

export default CertificateGrid;
