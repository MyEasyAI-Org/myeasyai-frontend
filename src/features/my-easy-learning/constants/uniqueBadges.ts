/**
 * Unique Achievement Definitions
 *
 * Special one-time achievements for learning milestones
 */

export type AchievementCategory = 'milestone' | 'special' | 'hidden';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  hint?: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  notified: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // -------------------------------------------------------------------------
  // Milestone Achievements
  // -------------------------------------------------------------------------
  {
    id: 'first_task',
    name: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa de estudo',
    category: 'milestone',
    icon: 'Sparkles',
    rarity: 'common',
    xpReward: 100,
  },
  {
    id: 'plan_created',
    name: 'Planejador',
    description: 'Crie seu primeiro plano de estudos',
    category: 'milestone',
    icon: 'FileText',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'first_week_complete',
    name: 'Primeira Semana',
    description: 'Complete a primeira semana do plano',
    category: 'milestone',
    icon: 'CalendarCheck',
    rarity: 'common',
    xpReward: 75,
  },
  {
    id: 'plan_complete',
    name: 'Missao Cumprida',
    description: 'Complete 100% de um plano de estudos',
    category: 'milestone',
    icon: 'Trophy',
    rarity: 'epic',
    xpReward: 500,
  },
  {
    id: 'legendary_streak',
    name: 'Lendario',
    description: '365 dias consecutivos de estudo',
    category: 'milestone',
    icon: 'Crown',
    rarity: 'legendary',
    xpReward: 5000,
  },
  {
    id: 'supreme_scholar',
    name: 'Mestre Supremo',
    description: 'Conquiste todos os certificados em Ouro',
    category: 'milestone',
    icon: 'Award',
    rarity: 'legendary',
    xpReward: 10000,
  },

  // -------------------------------------------------------------------------
  // Special Achievements
  // -------------------------------------------------------------------------
  {
    id: 'comeback',
    name: 'Retorno aos Estudos',
    description: 'Volte a estudar apos 30 dias de inatividade',
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
    name: 'Aniversario de Aprendizado',
    description: 'Complete 1 ano usando o aplicativo',
    category: 'special',
    icon: 'Cake',
    rarity: 'epic',
    xpReward: 1000,
  },
  {
    id: 'multi_skill',
    name: 'Polimata',
    description: 'Tenha planos ativos em 3 categorias diferentes',
    category: 'special',
    icon: 'Layers',
    rarity: 'rare',
    xpReward: 200,
  },

  // -------------------------------------------------------------------------
  // Hidden Achievements
  // -------------------------------------------------------------------------
  {
    id: 'seven_days',
    name: '7 de 7',
    description: 'Estude todos os dias da semana',
    category: 'hidden',
    icon: 'CalendarRange',
    rarity: 'rare',
    xpReward: 200,
    hint: 'Estude todos os dias de uma semana...',
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
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Estude antes das 6h da manha',
    category: 'hidden',
    icon: 'Sunrise',
    rarity: 'rare',
    xpReward: 100,
    hint: 'O conhecimento nao dorme...',
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Estude apos a meia-noite',
    category: 'hidden',
    icon: 'Moon',
    rarity: 'rare',
    xpReward: 100,
    hint: 'Quando todos dormem...',
  },
];

export const ACHIEVEMENTS_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS_MAP.get(id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category !== 'hidden');
}

export function getHiddenAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === 'hidden');
}

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  milestone: 'Marcos',
  special: 'Especiais',
  hidden: 'Ocultas',
};

export const ACHIEVEMENT_RARITY_COLORS = {
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
