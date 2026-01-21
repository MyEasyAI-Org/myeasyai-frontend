/**
 * Watermark Icons Constants
 *
 * Mapping of watermark icons for fitness module tabs and cards.
 * Icons are from the Olympic Sports Events Silhouette collection.
 */

import type { TrainingModality } from '../types';

// Base path for sports icons (located in public folder)
const ICONS_BASE = '/sports-icons';

/**
 * Watermark icons for each training modality card
 */
export const MODALITY_WATERMARKS: Record<TrainingModality, string> = {
  musculacao: `${ICONS_BASE}/Weightlifting_3.svg`,
  corrida: `${ICONS_BASE}/Athletics running_3.svg`,
  crossfit: `${ICONS_BASE}/Weightlifting_2.svg`,
  caminhada: `${ICONS_BASE}/Athletics running_1.svg`,
  funcional: `${ICONS_BASE}/Gymnastics_2.svg`,
  calistenia: `${ICONS_BASE}/Sport climbing_2.svg`,
  '': '',
};

/**
 * Watermark icons for each tab
 */
export const TAB_WATERMARKS = {
  visaoGeral: `${ICONS_BASE}/Olympic Games.svg`,
  personalInfo: `${ICONS_BASE}/Gymnastics_1.svg`,
  modalidade: `${ICONS_BASE}/Weightlifting_3.svg`,
  treinos: `${ICONS_BASE}/Weightlifting_3.svg`,
  dieta: `${ICONS_BASE}/Athletics running_2.svg`,
  exercicios: `${ICONS_BASE}/Gymnastics_5.svg`,
} as const;
