/**
 * Unique Badge Definitions
 *
 * Special badges that don't have tier progression - one-time achievements.
 */

// =============================================================================
// Unique Badge Types
// =============================================================================

export type UniqueBadgeCategory = 'milestone' | 'special' | 'hidden';
export type UniqueBadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UniqueBadge {
  id: string;
  name: string;
  description: string;
  category: UniqueBadgeCategory;
  icon: string; // Icon name from lucide-react
  rarity: UniqueBadgeRarity;
  xpReward: number;
  // For hidden badges, this shows as hint before unlock
  hint?: string;
}

export interface UserUniqueBadge {
  badgeId: string;
  unlockedAt: string; // ISO timestamp
  notified: boolean;
}

// =============================================================================
// Unique Badge Definitions
// =============================================================================

export const UNIQUE_BADGES: UniqueBadge[] = [
  // -------------------------------------------------------------------------
  // Milestone Badges
  // -------------------------------------------------------------------------
  {
    id: 'first_workout',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro treino',
    category: 'milestone',
    icon: 'Footprints',
    rarity: 'common',
    xpReward: 100,
  },
  {
    id: 'profile_complete',
    name: 'Perfil Completo',
    description: 'Preencha todas as informacoes do perfil',
    category: 'milestone',
    icon: 'UserCheck',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'legendary_streak',
    name: 'Lendario',
    description: '365 dias consecutivos de treino',
    category: 'milestone',
    icon: 'Crown',
    rarity: 'legendary',
    xpReward: 5000,
  },
  {
    id: 'supreme_master',
    name: 'Mestre Supremo',
    description: 'Conquiste todos os trofeus em Ouro',
    category: 'milestone',
    icon: 'Award',
    rarity: 'legendary',
    xpReward: 10000,
  },

  // -------------------------------------------------------------------------
  // Special Badges
  // -------------------------------------------------------------------------
  {
    id: 'comeback',
    name: 'Retorno Triunfante',
    description: 'Volte a treinar apos 30 dias de inatividade',
    category: 'special',
    icon: 'RotateCcw',
    rarity: 'rare',
    xpReward: 150,
  },
  {
    id: 'beat_record',
    name: 'Superacao',
    description: 'Bata seu recorde pessoal de sequencia',
    category: 'special',
    icon: 'TrendingUp',
    rarity: 'rare',
    xpReward: 100,
  },
  {
    id: 'anniversary',
    name: 'Aniversario Fitness',
    description: 'Complete 1 ano usando o aplicativo',
    category: 'special',
    icon: 'Cake',
    rarity: 'epic',
    xpReward: 1000,
  },

  // -------------------------------------------------------------------------
  // Hidden Badges (Surprise!)
  // -------------------------------------------------------------------------
  {
    id: 'seven_days',
    name: '7 de 7',
    description: 'Treine todos os dias da semana',
    category: 'hidden',
    icon: 'CalendarRange',
    rarity: 'rare',
    xpReward: 200,
    hint: 'Treine todos os dias de uma semana...',
  },
  {
    id: 'combo_perfect',
    name: 'Combo Perfeito',
    description: '3 semanas perfeitas consecutivas',
    category: 'hidden',
    icon: 'Zap',
    rarity: 'epic',
    xpReward: 500,
    hint: 'Mantenha a perfeicao por varias semanas...',
  },
];

// =============================================================================
// Unique Badge Helpers
// =============================================================================

/**
 * Map for quick badge lookup by ID
 */
export const UNIQUE_BADGES_MAP = new Map(
  UNIQUE_BADGES.map((badge) => [badge.id, badge])
);

/**
 * Get badge by ID
 */
export function getUniqueBadgeById(id: string): UniqueBadge | undefined {
  return UNIQUE_BADGES_MAP.get(id);
}

/**
 * Get all badges in a category
 */
export function getUniqueBadgesByCategory(
  category: UniqueBadgeCategory
): UniqueBadge[] {
  return UNIQUE_BADGES.filter((badge) => badge.category === category);
}

/**
 * Get visible badges (excludes hidden for display before unlock)
 */
export function getVisibleUniqueBadges(): UniqueBadge[] {
  return UNIQUE_BADGES.filter((badge) => badge.category !== 'hidden');
}

/**
 * Get hidden badges only
 */
export function getHiddenUniqueBadges(): UniqueBadge[] {
  return UNIQUE_BADGES.filter((badge) => badge.category === 'hidden');
}

/**
 * Category labels for display
 */
export const UNIQUE_BADGE_CATEGORY_LABELS: Record<UniqueBadgeCategory, string> =
  {
    milestone: 'Marcos',
    special: 'Especiais',
    hidden: 'Ocultas',
  };

/**
 * Rarity colors for badges
 */
export const UNIQUE_BADGE_RARITY_COLORS = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/50',
    text: 'text-slate-300',
    glow: 'shadow-slate-500/20',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/40',
  },
} as const;
