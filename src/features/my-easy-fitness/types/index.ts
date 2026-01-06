/**
 * MyEasyFitness Types
 *
 * Type definitions for the fitness assistant module.
 */

/**
 * Biological sex options
 */
export type BiologicalSex = 'masculino' | 'feminino' | '';

/**
 * Activity level options
 */
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | '';

/**
 * Personal info flow steps (grouped questions)
 */
export type PersonalInfoStep =
  | 'info_basica' // nome, sexo, idade
  | 'medidas' // peso, altura
  | 'objetivo' // objetivo principal
  | 'atividade' // nivel de atividade
  | 'saude' // restricoes e lesoes
  | 'complete';

/**
 * User personal info data
 */
export interface UserPersonalInfo {
  nome: string;
  idade: number;
  sexo: BiologicalSex;
  peso: number;
  altura: number;
  objetivo: string;
  nivelAtividade: ActivityLevel;
  restricoesMedicas: string[];
  lesoes: string[];
}

/**
 * Exercise in a workout
 */
export interface Exercise {
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
  observacao?: string;
}

/**
 * Workout plan
 */
export interface Treino {
  id: string;
  nome: string;
  diaSemana: string;
  exercicios: Exercise[];
}

/**
 * Meal in a diet plan
 */
export interface Refeicao {
  nome: string;
  horario: string;
  alimentos: string[];
}

/**
 * Diet plan with macros
 */
export interface Dieta {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  refeicoes: Refeicao[];
}

/**
 * Chat message in fitness assistant
 */
export interface FitnessMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Complete fitness data state
 */
export interface FitnessData {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  personalInfoStep: PersonalInfoStep;
  messages: FitnessMessage[];
}

/**
 * Activity level configuration
 */
export interface ActivityLevelConfig {
  id: ActivityLevel;
  name: string;
  description: string;
  factor: number; // Harris-Benedict multiplier
}

/**
 * Personal info question configuration
 */
export interface PersonalInfoQuestionConfig {
  step: PersonalInfoStep;
  question: string;
  errorMessage: string;
}

/**
 * Parsed personal info response result
 */
export type PersonalInfoParseResult = Partial<UserPersonalInfo> | null;

/**
 * BMI classification
 */
export interface BMIClassification {
  value: number;
  label: string;
  color: string;
}

/**
 * Macros calculation result
 */
export interface MacrosResult {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  tmb: number;
}
