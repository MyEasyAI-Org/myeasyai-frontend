/**
 * DEV ONLY - Mock completed course for testing certificate flow.
 * Remove this file before production!
 */

import type { EnhancedGeneratedStudyPlan } from '../services/StudyPlanGenerationService';
import type { StudyPlanProfile } from '../types';
import type { GeneratedLesson } from '../types/lesson';
import type { FinalExam } from '../types/courseCompletion';
import { FINAL_EXAM_CONFIGS } from '../types/courseCompletion';

const MOCK_PLAN_ID = 'mock-plan-completed';
const MOCK_PROFILE_ID = 'mock-profile-dev';

export function createMockProfile(): StudyPlanProfile {
  return {
    id: MOCK_PROFILE_ID,
    user_id: 'dev-user',
    plan_name: 'Python Basico (DEV)',
    skill_name: 'Python',
    skill_category: 'technology',
    current_level: 'none',
    target_level: 'basic',
    weekly_hours: 4,
    deadline_weeks: 4,
    deadline_date: new Date().toISOString(),
    motivation: 'personal_satisfaction',
    is_active: true,
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  };
}

export function createMockCompletedPlan(): EnhancedGeneratedStudyPlan {
  return {
    id: MOCK_PLAN_ID,
    profile_id: MOCK_PROFILE_ID,
    plan_summary: {
      total_weeks: 2,
      estimated_completion: '2 semanas',
      total_hours: 8,
      main_topics: ['Variaveis', 'Tipos de dados', 'Funcoes', 'Loops'],
    },
    milestones: [],
    created_at: new Date(),
    contentStrategy: {
      overallMode: 'native',
      nativePercentage: 95,
      reasoning: '[DEV MOCK] Curso completo para teste de certificado.',
      skillComplexity: 'basic',
    },
    weeks: [
      {
        id: `week-1`,
        plan_id: MOCK_PLAN_ID,
        week_number: 1,
        title: 'Fundamentos do Python',
        focus: 'Variaveis, tipos de dados e operadores',
        learningObjectives: ['Entender variaveis', 'Conhecer tipos de dados'],
        estimated_hours: 4,
        deliveryMode: 'native',
        is_completed: true,
        completed_at: new Date().toISOString(),
        lessonTopics: [
          {
            weekNumber: 1,
            lessonNumber: 1,
            title: 'Variaveis e Tipos',
            description: 'Aprenda sobre variaveis e tipos de dados em Python',
            learningObjectives: ['Criar variaveis', 'Entender tipos'],
            suggestedDeliveryMode: 'native',
          },
          {
            weekNumber: 1,
            lessonNumber: 2,
            title: 'Operadores e Expressoes',
            description: 'Operadores aritmeticos, logicos e de comparacao',
            learningObjectives: ['Usar operadores', 'Criar expressoes'],
            suggestedDeliveryMode: 'native',
          },
        ],
      },
      {
        id: `week-2`,
        plan_id: MOCK_PLAN_ID,
        week_number: 2,
        title: 'Funcoes e Loops',
        focus: 'Funcoes, for, while',
        learningObjectives: ['Criar funcoes', 'Usar loops'],
        estimated_hours: 4,
        deliveryMode: 'native',
        is_completed: true,
        completed_at: new Date().toISOString(),
        lessonTopics: [
          {
            weekNumber: 2,
            lessonNumber: 1,
            title: 'Funcoes em Python',
            description: 'Criando e utilizando funcoes',
            learningObjectives: ['Definir funcoes', 'Parametros e retorno'],
            suggestedDeliveryMode: 'native',
          },
          {
            weekNumber: 2,
            lessonNumber: 2,
            title: 'Loops e Iteracao',
            description: 'For, while e compreensao de lista',
            learningObjectives: ['Usar for', 'Usar while'],
            suggestedDeliveryMode: 'native',
          },
        ],
      },
    ],
  };
}

function createMockLesson(weekNumber: number, lessonNumber: number, title: string): GeneratedLesson {
  const now = new Date().toISOString();
  return {
    id: `mock-lesson-${weekNumber}-${lessonNumber}`,
    weekId: `week-${weekNumber}`,
    lessonNumber,
    title,
    objective: `Objetivo da licao ${title}`,
    deliveryMode: 'native',
    prerequisiteConcepts: [],
    sections: [
      {
        id: `section-${weekNumber}-${lessonNumber}-1`,
        type: 'theory',
        order: 1,
        title: 'Teoria',
        content: 'Conteudo teorico mock.',
        estimatedMinutes: 10,
        isCompleted: true,
        completedAt: now,
      },
      {
        id: `section-${weekNumber}-${lessonNumber}-2`,
        type: 'example',
        order: 2,
        title: 'Exemplo Pratico',
        content: 'Exemplo pratico mock.',
        estimatedMinutes: 5,
        isCompleted: true,
        completedAt: now,
      },
    ],
    quiz: {
      id: `quiz-${weekNumber}-${lessonNumber}`,
      title: `Quiz - ${title}`,
      questions: [
        {
          id: `q-${weekNumber}-${lessonNumber}-1`,
          question: 'Pergunta mock 1?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'A e a resposta correta.',
          xpReward: 10,
        },
      ],
      passingScore: 70,
      xpReward: 35,
      attempts: [{ attemptNumber: 1, score: 100, answers: { [`q-${weekNumber}-${lessonNumber}-1`]: 'A' }, completedAt: now, timeSpentSeconds: 30 }],
      bestScore: 100,
      isPassed: true,
    },
    exercises: Array.from({ length: 3 }, (_, i) => ({
      id: `ex-${weekNumber}-${lessonNumber}-${i + 1}`,
      title: `Exercicio ${i + 1}`,
      description: 'Exercicio mock.',
      difficulty: 'easy' as const,
      hints: ['Dica 1'],
      hintsUsed: 0,
      estimatedMinutes: 5,
      xpReward: 25,
      isCompleted: true,
      completedAt: now,
    })),
    externalResources: [],
    totalXpAvailable: 200,
    xpEarned: 200,
    progressPercentage: 100,
    isCompleted: true,
    completedAt: now,
    generatedAt: now,
    lastAccessedAt: now,
  };
}

export function createMockGeneratedLessons(): Map<string, GeneratedLesson> {
  const map = new Map<string, GeneratedLesson>();

  // Week 1
  map.set('1-1', createMockLesson(1, 1, 'Variaveis e Tipos'));
  map.set('1-2', createMockLesson(1, 2, 'Operadores e Expressoes'));

  // Week 2
  map.set('2-1', createMockLesson(2, 1, 'Funcoes em Python'));
  map.set('2-2', createMockLesson(2, 2, 'Loops e Iteracao'));

  return map;
}

/**
 * Creates a mock FinalExam that is already PASSED.
 * So the user goes straight to "Emitir Certificado" flow.
 */
export function createMockPassedExam(): FinalExam {
  const now = new Date().toISOString();
  const config = FINAL_EXAM_CONFIGS.basico;

  // Minimal question pool (just enough to satisfy the type)
  const questionPool = Array.from({ length: 15 }, (_, i) => ({
    id: `mock-q-${i + 1}`,
    question: `[MOCK] Pergunta ${i + 1} sobre Python?`,
    type: 'multiple_choice' as const,
    difficulty: (i < 5 ? 'easy' : i < 10 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'Resposta mock.',
    topic: `Topico ${(i % 4) + 1}`,
    minTimeSeconds: config.minTimePerQuestion,
    maxTimeSeconds: config.maxTimePerQuestion,
  }));

  return {
    id: 'mock-exam-passed',
    planId: MOCK_PLAN_ID,
    questionPool,
    config,
    attempts: [
      {
        id: 'mock-attempt-1',
        attemptNumber: 1,
        startedAt: now,
        completedAt: now,
        score: 93,
        passed: true,
        answers: questionPool.slice(0, config.questionsPerAttempt).map((q) => ({
          questionId: q.id,
          answer: 'A',
          timeSpentSeconds: 25,
          isCorrect: true,
        })),
        questionsUsed: questionPool.slice(0, config.questionsPerAttempt).map((q) => q.id),
        totalTimeSeconds: 420,
        tabAwayCount: 0,
      },
    ],
    bestScore: 93,
    isPassed: true,
    passedAt: now,
    lastAttemptAt: now,
    generatedAt: now,
  };
}
