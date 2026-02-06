/**
 * Certificate Types (Learning Trophies)
 *
 * Tier progression: Bronze -> Silver -> Gold (like academic certificates)
 */

// =============================================================================
// Certificate Tier Types
// =============================================================================

export type CertificateTier = 'none' | 'bronze' | 'silver' | 'gold';
export type CertificateCategory = 'streak' | 'volume' | 'consistency' | 'mastery';

export type CertificateMetric =
  | 'streak_days' // Consecutive study days
  | 'total_lessons' // Total lessons/weeks completed
  | 'total_tasks' // Total tasks completed
  | 'perfect_weeks' // Perfect study weeks
  | 'perfect_months' // Perfect study months
  | 'skill_categories' // Different subjects learned
  | 'early_sessions' // Early morning study sessions
  | 'night_sessions' // Night study sessions
  | 'practice_sessions'; // Practice/exercise sessions

// =============================================================================
// Certificate Configuration Types
// =============================================================================

export interface CertificateTierConfig {
  tier: Exclude<CertificateTier, 'none'>;
  name: string;
  description: string;
  requirement: number;
  xpReward: number;
}

export interface Certificate {
  id: string;
  name: string;
  category: CertificateCategory;
  icon: string;
  metric: CertificateMetric;
  tiers: [CertificateTierConfig, CertificateTierConfig, CertificateTierConfig];
}

// =============================================================================
// User Certificate State Types
// =============================================================================

export interface UserCertificate {
  certificateId: string;
  currentTier: CertificateTier;
  progress: number;
  tierUnlocks: {
    bronze?: string;
    silver?: string;
    gold?: string;
  };
  notified: boolean;
}

// =============================================================================
// Certificate Tier Visual Configuration
// =============================================================================

export const TIER_COLORS = {
  none: {
    bg: 'bg-slate-700/30',
    border: 'border-slate-600',
    icon: 'text-slate-500',
    glow: '',
    label: 'Bloqueado',
  },
  bronze: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700',
    icon: 'text-amber-600',
    glow: 'shadow-amber-900/30',
    label: 'Bronze',
  },
  silver: {
    bg: 'bg-slate-300/20',
    border: 'border-slate-400',
    icon: 'text-slate-300',
    glow: 'shadow-slate-400/30',
    label: 'Prata',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/40',
    label: 'Ouro',
  },
} as const;

export const TIER_ORDER: CertificateTier[] = ['none', 'bronze', 'silver', 'gold'];

export function getNextTier(currentTier: CertificateTier): CertificateTier | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex >= TIER_ORDER.length - 1) {
    return null;
  }
  return TIER_ORDER[currentIndex + 1];
}

export function getTierIndex(tier: CertificateTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function compareTiers(a: CertificateTier, b: CertificateTier): number {
  return getTierIndex(a) - getTierIndex(b);
}

export function createDefaultUserCertificate(certificateId: string): UserCertificate {
  return {
    certificateId,
    currentTier: 'none',
    progress: 0,
    tierUnlocks: {},
    notified: true,
  };
}
