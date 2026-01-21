/**
 * MyEasyFitness Types
 *
 * Type definitions for the fitness assistant module.
 */

/**
 * Biological sex assigned at birth options
 */
export type BiologicalSex = 'masculino' | 'feminino' | 'prefiro-nao-declarar' | '';

/**
 * Gender identity options
 */
export type GenderIdentity = 'mulher-cis' | 'mulher-trans' | 'homem-cis' | 'homem-trans' | 'outro' | 'prefiro-nao-declarar' | '';

/**
 * Activity level options
 */
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | '';

/**
 * Training modality options
 */
export type TrainingModality = 'musculacao' | 'corrida' | 'crossfit' | 'caminhada' | 'funcional' | 'calistenia' | '';

/**
 * Personal info flow steps (grouped questions)
 */
export type PersonalInfoStep =
  | 'info_basica' // nome, sexo, idade
  | 'info_basica_sem_nome' // sexo, idade (quando nome já é conhecido)
  | 'medidas' // peso, altura
  | 'objetivo' // objetivo principal
  | 'atividade' // nivel de atividade
  | 'treino_preferencias' // dias na semana, tempo disponível, preferências
  | 'dieta_preferencias' // restrições alimentares, comidas favoritas/evitar
  | 'saude' // restricoes medicas e lesoes
  | 'complete';

/**
 * User personal info data
 */
export interface UserPersonalInfo {
  nome: string;
  idade: number;
  sexo: BiologicalSex; // Sexo atribuído no nascimento
  genero: GenderIdentity; // Identidade de gênero
  generoOutro: string; // Texto livre quando genero === 'outro'
  peso: number;
  altura: number;
  objetivo: string;
  nivelAtividade: ActivityLevel;
  restricoesMedicas: string[];
  lesoes: string[];
  // Training preferences
  diasTreinoSemana: number; // 1-7
  tempoTreinoMinutos: number; // tempo disponível por sessão
  preferenciaTreino: string; // ex: "musculação", "funcional", "cardio"
  experienciaTreino: 'iniciante' | 'intermediario' | 'avancado' | '';
  localTreino: 'academia' | 'casa' | ''; // onde o usuario treina
  modalidade: TrainingModality; // modalidade de treino selecionada
  // Diet preferences
  restricoesAlimentares: string[]; // ex: "lactose", "gluten", "vegetariano"
  comidasFavoritas: string[]; // comidas que gosta e quer incluir
  comidasEvitar: string[]; // comidas que não gosta ou quer evitar
  numeroRefeicoes: number; // quantas refeições por dia
  horarioTreino: 'manha' | 'tarde' | 'noite' | ''; // para ajustar refeições
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
 * Workout modification request
 */
export interface WorkoutModification {
  type: 'substituir' | 'adicionar' | 'remover' | 'ajustar';
  exercicioIndex: number; // index of exercise to modify
  exercicioNovo?: string; // new exercise name (for substituir/adicionar)
  motivo?: string; // reason for modification
  ajustes?: {
    series?: number;
    repeticoes?: string;
    descanso?: string;
    observacao?: string;
  };
}

/**
 * Suggested alternative exercise
 */
export interface ExerciseAlternative {
  nome: string;
  motivo: string; // why this is a good alternative
  categoria: string; // muscle group
}

/**
 * Food item with nutritional info and quantity
 */
export interface Alimento {
  nome: string;
  gramas: number;
  proteinas?: number; // calculated based on gramas
  carboidratos?: number;
  gorduras?: number;
  calorias?: number;
}

/**
 * Meal in a diet plan
 */
export interface Refeicao {
  nome: string;
  horario: string;
  alimentos: Alimento[];
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
  id?: string;
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

// Re-export gamification types
export * from './gamification';
