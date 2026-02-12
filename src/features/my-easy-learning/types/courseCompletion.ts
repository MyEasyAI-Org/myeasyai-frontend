/**
 * Course Completion Certificate Types
 *
 * Types for the final exam and course completion diploma system.
 * SEPARATE from gamification trophies in trophies.ts.
 */

// =============================================================================
// CERTIFICATE LEVEL
// =============================================================================

export type CertificateLevel = 'basico' | 'intermediario' | 'avancado';

export function toCertificateLevel(targetLevel: string): CertificateLevel {
  switch (targetLevel) {
    case 'basic':
      return 'basico';
    case 'intermediate':
      return 'intermediario';
    case 'advanced':
    case 'expert':
      return 'avancado';
    default:
      return 'basico';
  }
}

// =============================================================================
// FINAL EXAM TYPES
// =============================================================================

export type FinalExamQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'code_output'
  | 'multiple_select';

export interface FinalExamQuestion {
  id: string;
  question: string;
  type: FinalExamQuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer: string;
  correctAnswers?: string[]; // For multiple_select
  explanation: string;
  codeContext?: string;
  topic: string; // Which lesson/week this covers
  minTimeSeconds: number;
  maxTimeSeconds: number;
}

export interface FinalExamConfig {
  level: CertificateLevel;
  totalQuestions: number; // Pool size
  questionsPerAttempt: number; // Selected per attempt
  passingScore: number;
  maxTimeMinutes: number;
  minTimePerQuestion: number; // Seconds
  maxTimePerQuestion: number; // Seconds
  retryWaitHours: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface FinalExamAnswer {
  questionId: string;
  answer: string;
  answers?: string[]; // For multiple_select
  timeSpentSeconds: number;
  isCorrect: boolean;
}

export interface FinalExamAttempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
  completedAt: string;
  score: number; // 0-100
  passed: boolean;
  answers: FinalExamAnswer[];
  questionsUsed: string[]; // Question IDs
  totalTimeSeconds: number;
  tabAwayCount: number;
}

export interface FinalExam {
  id: string;
  planId: string;
  questionPool: FinalExamQuestion[];
  config: FinalExamConfig;
  attempts: FinalExamAttempt[];
  bestScore: number | null;
  isPassed: boolean;
  passedAt: string | null;
  lastAttemptAt: string | null;
  generatedAt: string;
}

// =============================================================================
// CERTIFICATE ELIGIBILITY
// =============================================================================

export interface CertificateEligibility {
  isEligible: boolean;
  reasons: string[];
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    exercisesCompleted: number;
    totalExercises: number;
    quizzesPassed: number;
    totalQuizzes: number;
    allWeeksCompleted: boolean;
    finalExamPassed: boolean;
    minimumExercisesMet: boolean;
  };
}

// =============================================================================
// COURSE COMPLETION DIPLOMA
// =============================================================================

export interface CourseDiploma {
  id: string; // MELA-2026-XXXX-YYYY
  planId: string;
  userId: string;
  studentName: string;
  skillName: string;
  skillCategory: string;
  certificateLevel: CertificateLevel;
  finalExamScore: number;
  totalHoursStudied: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  issuedAt: string;
  legalDisclaimerAcknowledged: boolean;
}

// =============================================================================
// CERTIFICATE LEVEL TABLE
// =============================================================================

export interface CertificateLevelDescription {
  level: CertificateLevel;
  label: string;
  description: string;
  whatItAttests: string[];
  minimumExercises: number;
  finalExamQuestions: number;
  passingScore: number;
}

export const CERTIFICATE_LEVELS: CertificateLevelDescription[] = [
  {
    level: 'basico',
    label: 'Basico',
    description: 'Fundamentos e conceitos essenciais',
    whatItAttests: [
      'Compreensao dos conceitos fundamentais',
      'Capacidade de executar tarefas simples',
      'Familiaridade com a terminologia da area',
    ],
    minimumExercises: 10,
    finalExamQuestions: 15,
    passingScore: 80,
  },
  {
    level: 'intermediario',
    label: 'Intermediario',
    description: 'Aplicacao pratica e resolucao de problemas',
    whatItAttests: [
      'Capacidade de aplicar conhecimentos em situacoes reais',
      'Resolucao de problemas de complexidade moderada',
      'Compreensao de boas praticas e padroes',
      'Autonomia para trabalhos do dia-a-dia',
    ],
    minimumExercises: 20,
    finalExamQuestions: 20,
    passingScore: 82,
  },
  {
    level: 'avancado',
    label: 'Avancado',
    description: 'Dominio tecnico e pensamento critico',
    whatItAttests: [
      'Dominio avancado de conceitos e tecnicas',
      'Capacidade de resolver problemas complexos',
      'Pensamento critico e tomada de decisao',
      'Habilidade de otimizar e melhorar processos',
      'Capacidade de ensinar conceitos a outros',
    ],
    minimumExercises: 30,
    finalExamQuestions: 25,
    passingScore: 85,
  },
];

// =============================================================================
// FINAL EXAM CONFIGURATIONS
// =============================================================================

export const FINAL_EXAM_CONFIGS: Record<CertificateLevel, FinalExamConfig> = {
  basico: {
    level: 'basico',
    totalQuestions: 30,
    questionsPerAttempt: 15,
    passingScore: 80,
    maxTimeMinutes: 30,
    minTimePerQuestion: 15,
    maxTimePerQuestion: 120,
    retryWaitHours: 24,
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
  },
  intermediario: {
    level: 'intermediario',
    totalQuestions: 35,
    questionsPerAttempt: 20,
    passingScore: 82,
    maxTimeMinutes: 45,
    minTimePerQuestion: 20,
    maxTimePerQuestion: 150,
    retryWaitHours: 24,
    difficultyDistribution: { easy: 25, medium: 45, hard: 30 },
  },
  avancado: {
    level: 'avancado',
    totalQuestions: 40,
    questionsPerAttempt: 25,
    passingScore: 85,
    maxTimeMinutes: 60,
    minTimePerQuestion: 20,
    maxTimePerQuestion: 180,
    retryWaitHours: 48,
    difficultyDistribution: { easy: 15, medium: 40, hard: 45 },
  },
};

// =============================================================================
// LEGAL DISCLAIMER
// =============================================================================

export const LEGAL_DISCLAIMER_TEXT = `AVISO LEGAL IMPORTANTE

Este certificado atesta a conclusao de um programa de estudo autodidata assistido por inteligencia artificial, oferecido pela plataforma MyEasyAI. Este documento NAO possui validade como diploma de graduacao, pos-graduacao, curso tecnico ou qualquer formacao regulamentada por orgaos oficiais de educacao (MEC, CREA, CRM, OAB, COREN, CRC ou similares).

A conclusao deste curso NAO habilita o portador ao exercicio de profissoes regulamentadas. O conhecimento aqui atestado refere-se exclusivamente ao conteudo programatico do curso, gerado e avaliado por inteligencia artificial, sem supervisao de instituicao de ensino credenciada.

O uso indevido deste certificado para fins de exercicio ilegal de profissao e de exclusiva responsabilidade do portador, estando sujeito as penalidades previstas na legislacao brasileira, incluindo os artigos 282 e 284 do Codigo Penal.

A plataforma MyEasyAI nao se responsabiliza pelo uso inadequado deste certificado, incluindo, mas nao se limitando a: exercicio ilegal de medicina, advocacia, engenharia, contabilidade, enfermagem, psicologia ou qualquer outra profissao regulamentada por conselho de classe.

Este certificado possui carater exclusivamente informativo e de desenvolvimento pessoal.`;

export const LEGAL_DISCLAIMER_CHECKBOX_TEXT =
  'Li e compreendo que este certificado NAO substitui formacao profissional regulamentada e NAO habilita ao exercicio de profissoes regulamentadas.';

// =============================================================================
// XP REWARDS FOR FINAL EXAM
// =============================================================================

export const FINAL_EXAM_XP_REWARDS: Record<CertificateLevel, number> = {
  basico: 200,
  intermediario: 350,
  avancado: 500,
};

// =============================================================================
// HELPER: Generate diploma ID
// =============================================================================

export function generateDiplomaId(): string {
  const year = new Date().getFullYear();
  const hex1 = Math.random().toString(16).substring(2, 6).toUpperCase();
  const hex2 = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `MELA-${year}-${hex1}-${hex2}`;
}
