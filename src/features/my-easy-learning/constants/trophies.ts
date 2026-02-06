/**
 * Certificate Definitions (Learning Trophies)
 *
 * Academic-themed certificates with Bronze -> Silver -> Gold progression
 */

import type { Certificate, CertificateCategory } from '../types/trophies';

export const CERTIFICATES: Certificate[] = [
  // -------------------------------------------------------------------------
  // Streak Category
  // -------------------------------------------------------------------------
  {
    id: 'streak_scholar',
    name: 'Estudante Dedicado',
    category: 'streak',
    icon: 'Flame',
    metric: 'streak_days',
    tiers: [
      {
        tier: 'bronze',
        name: 'Estudante Dedicado I',
        description: '7 dias consecutivos de estudo',
        requirement: 7,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Estudante Dedicado II',
        description: '30 dias consecutivos de estudo',
        requirement: 30,
        xpReward: 300,
      },
      {
        tier: 'gold',
        name: 'Estudante Dedicado III',
        description: '100 dias consecutivos de estudo',
        requirement: 100,
        xpReward: 1000,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Volume Category
  // -------------------------------------------------------------------------
  {
    id: 'volume_scholar',
    name: 'Academico',
    category: 'volume',
    icon: 'GraduationCap',
    metric: 'total_lessons',
    tiers: [
      {
        tier: 'bronze',
        name: 'Academico Bronze',
        description: 'Complete 10 semanas de estudo',
        requirement: 10,
        xpReward: 150,
      },
      {
        tier: 'silver',
        name: 'Academico Prata',
        description: 'Complete 50 semanas de estudo',
        requirement: 50,
        xpReward: 500,
      },
      {
        tier: 'gold',
        name: 'Academico Ouro',
        description: 'Complete 200 semanas de estudo',
        requirement: 200,
        xpReward: 2000,
      },
    ],
  },
  {
    id: 'volume_tasks',
    name: 'Executor',
    category: 'volume',
    icon: 'CheckSquare',
    metric: 'total_tasks',
    tiers: [
      {
        tier: 'bronze',
        name: 'Executor Bronze',
        description: 'Complete 50 tarefas',
        requirement: 50,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Executor Prata',
        description: 'Complete 200 tarefas',
        requirement: 200,
        xpReward: 350,
      },
      {
        tier: 'gold',
        name: 'Executor Ouro',
        description: 'Complete 1000 tarefas',
        requirement: 1000,
        xpReward: 1500,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Consistency Category
  // -------------------------------------------------------------------------
  {
    id: 'consistency_week',
    name: 'Semana Exemplar',
    category: 'consistency',
    icon: 'CalendarCheck',
    metric: 'perfect_weeks',
    tiers: [
      {
        tier: 'bronze',
        name: 'Semana Exemplar I',
        description: '1 semana perfeita',
        requirement: 1,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Semana Exemplar II',
        description: '5 semanas perfeitas',
        requirement: 5,
        xpReward: 250,
      },
      {
        tier: 'gold',
        name: 'Semana Exemplar III',
        description: '20 semanas perfeitas',
        requirement: 20,
        xpReward: 750,
      },
    ],
  },
  {
    id: 'consistency_month',
    name: 'Mes Academico',
    category: 'consistency',
    icon: 'Star',
    metric: 'perfect_months',
    tiers: [
      {
        tier: 'bronze',
        name: 'Mes Academico I',
        description: '1 mes perfeito',
        requirement: 1,
        xpReward: 200,
      },
      {
        tier: 'silver',
        name: 'Mes Academico II',
        description: '3 meses perfeitos',
        requirement: 3,
        xpReward: 500,
      },
      {
        tier: 'gold',
        name: 'Mes Academico III',
        description: '12 meses perfeitos',
        requirement: 12,
        xpReward: 1500,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Mastery Category
  // -------------------------------------------------------------------------
  {
    id: 'mastery_explorer',
    name: 'Explorador do Conhecimento',
    category: 'mastery',
    icon: 'Compass',
    metric: 'skill_categories',
    tiers: [
      {
        tier: 'bronze',
        name: 'Explorador Bronze',
        description: 'Estude 2 categorias diferentes',
        requirement: 2,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Explorador Prata',
        description: 'Estude 4 categorias diferentes',
        requirement: 4,
        xpReward: 250,
      },
      {
        tier: 'gold',
        name: 'Explorador Ouro',
        description: 'Estude 6 categorias diferentes',
        requirement: 6,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'mastery_early',
    name: 'Estudante Matinal',
    category: 'mastery',
    icon: 'Sunrise',
    metric: 'early_sessions',
    tiers: [
      {
        tier: 'bronze',
        name: 'Estudante Matinal I',
        description: '5 sessoes de estudo antes das 7h',
        requirement: 5,
        xpReward: 75,
      },
      {
        tier: 'silver',
        name: 'Estudante Matinal II',
        description: '20 sessoes de estudo antes das 7h',
        requirement: 20,
        xpReward: 200,
      },
      {
        tier: 'gold',
        name: 'Estudante Matinal III',
        description: '50 sessoes de estudo antes das 7h',
        requirement: 50,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'mastery_night',
    name: 'Coruja Estudiosa',
    category: 'mastery',
    icon: 'Moon',
    metric: 'night_sessions',
    tiers: [
      {
        tier: 'bronze',
        name: 'Coruja Estudiosa I',
        description: '5 sessoes de estudo apos as 21h',
        requirement: 5,
        xpReward: 75,
      },
      {
        tier: 'silver',
        name: 'Coruja Estudiosa II',
        description: '20 sessoes de estudo apos as 21h',
        requirement: 20,
        xpReward: 200,
      },
      {
        tier: 'gold',
        name: 'Coruja Estudiosa III',
        description: '50 sessoes de estudo apos as 21h',
        requirement: 50,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'mastery_practice',
    name: 'Praticante',
    category: 'mastery',
    icon: 'PenTool',
    metric: 'practice_sessions',
    tiers: [
      {
        tier: 'bronze',
        name: 'Praticante I',
        description: '10 sessoes de pratica',
        requirement: 10,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Praticante II',
        description: '50 sessoes de pratica',
        requirement: 50,
        xpReward: 300,
      },
      {
        tier: 'gold',
        name: 'Praticante III',
        description: '150 sessoes de pratica',
        requirement: 150,
        xpReward: 750,
      },
    ],
  },
];

export const CERTIFICATES_MAP = new Map(CERTIFICATES.map((cert) => [cert.id, cert]));

export function getCertificateById(id: string): Certificate | undefined {
  return CERTIFICATES_MAP.get(id);
}

export function getCertificatesByCategory(category: CertificateCategory): Certificate[] {
  return CERTIFICATES.filter((cert) => cert.category === category);
}

export const CERTIFICATE_CATEGORY_LABELS: Record<CertificateCategory, string> = {
  streak: 'Sequencia',
  volume: 'Volume',
  consistency: 'Consistencia',
  mastery: 'Maestria',
};

export const CERTIFICATE_CATEGORY_ICONS: Record<CertificateCategory, string> = {
  streak: 'Flame',
  volume: 'GraduationCap',
  consistency: 'CalendarCheck',
  mastery: 'Brain',
};
