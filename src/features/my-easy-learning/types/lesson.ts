/**
 * Lesson Types for MyEasyLearning
 *
 * Types for AI-generated educational content including theory, quizzes, and exercises.
 */

// =============================================================================
// CONTENT DELIVERY MODE
// =============================================================================

/** How content is delivered - native AI content vs external resources */
export type ContentDeliveryMode = 'native' | 'external' | 'hybrid';

/** Type of lesson content section */
export type LessonContentType =
  | 'theory' // Explanatory content
  | 'example' // Code/practical examples
  | 'tip' // Tips and best practices
  | 'warning' // Common mistakes to avoid
  | 'summary' // Key points recap
  | 'external_resource'; // Link to external content

/** Quiz question types */
export type QuizQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'code_output'; // What does this code output?

/** Content difficulty levels */
export type ContentDifficulty = 'easy' | 'medium' | 'hard';

// =============================================================================
// LESSON CONTENT SECTIONS
// =============================================================================

/** Code snippet with syntax highlighting */
export interface CodeSnippet {
  language: string;
  code: string;
  explanation?: string;
  filename?: string;
}

/** Single section of lesson content */
export interface LessonSection {
  id: string;
  type: LessonContentType;
  order: number;
  title: string;
  content: string; // Markdown content
  codeSnippet?: CodeSnippet;
  keyPoints?: string[]; // Bullet points for summaries
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt: string | null;
}

// =============================================================================
// QUIZ
// =============================================================================

/** Single quiz question */
export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  difficulty: ContentDifficulty;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string; // Shown after answering
  codeContext?: string; // For code-related questions
  xpReward: number;
}

/** Quiz attempt by user */
export interface QuizAttempt {
  attemptNumber: number;
  score: number; // Percentage 0-100
  answers: Record<string, string>; // questionId -> answer
  completedAt: string;
  timeSpentSeconds: number;
}

/** Complete quiz for a lesson */
export interface LessonQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // Percentage required to pass
  xpReward: number; // Bonus XP for passing
  attempts: QuizAttempt[];
  bestScore: number | null;
  isPassed: boolean;
}

// =============================================================================
// PRACTICE EXERCISES
// =============================================================================

/** Practice exercise */
export interface PracticeExercise {
  id: string;
  title: string;
  description: string; // Markdown with instructions
  difficulty: ContentDifficulty;
  starterCode?: string;
  solution?: string;
  hints: string[];
  hintsUsed: number;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  completedAt: string | null;
  userSolution?: string;
}

// =============================================================================
// EXTERNAL RESOURCES
// =============================================================================

/** External resource type */
export type ExternalResourceType =
  | 'video'
  | 'article'
  | 'course'
  | 'book'
  | 'documentation'
  | 'tutorial';

/** External resource recommendation */
export interface ExternalResource {
  id: string;
  type: ExternalResourceType;
  title: string;
  url: string;
  source: string; // YouTube, Udemy, etc.
  description: string;
  whyRecommended: string; // AI explanation
  estimatedMinutes: number;
  isFree: boolean;
  language: 'pt' | 'en';
  isAccessed: boolean;
  accessedAt: string | null;
}

// =============================================================================
// GENERATED LESSON
// =============================================================================

/** Complete lesson with all content */
export interface GeneratedLesson {
  id: string;
  weekId: string;
  lessonNumber: number;
  title: string;
  objective: string; // Learning objective
  deliveryMode: ContentDeliveryMode;
  prerequisiteConcepts?: string[];

  // Native content (when mode is 'native' or 'hybrid')
  sections: LessonSection[];

  // Quiz for this lesson
  quiz: LessonQuiz | null;

  // Practice exercises
  exercises: PracticeExercise[];

  // External resources (when mode is 'external' or 'hybrid')
  externalResources: ExternalResource[];

  // Progress tracking
  totalXpAvailable: number;
  xpEarned: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt: string | null;

  // Timestamps
  generatedAt: string;
  lastAccessedAt: string | null;
}

// =============================================================================
// LESSON TOPIC (for generation)
// =============================================================================

/** Topic info for lesson generation */
export interface LessonTopic {
  weekNumber: number;
  lessonNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  suggestedDeliveryMode: ContentDeliveryMode;
}

// =============================================================================
// ENHANCED STUDY PLAN WEEK
// =============================================================================

/** Enhanced week with lessons instead of tasks */
export interface EnhancedStudyPlanWeek {
  id: string;
  planId: string;
  weekNumber: number;
  title: string;
  focus: string;
  learningObjectives: string[];
  estimatedHours: number;
  deliveryMode: ContentDeliveryMode;

  // Lesson topics (generated with plan, content generated on demand)
  lessonTopics: LessonTopic[];

  // Generated lessons (populated when user opens them)
  lessons: Map<number, GeneratedLesson>; // lessonNumber -> GeneratedLesson

  // Progress
  lessonsCompleted: number;
  totalLessons: number;
  isCompleted: boolean;
  completedAt: string | null;
}

// =============================================================================
// CONTENT STRATEGY
// =============================================================================

/** Content generation strategy based on skill and level */
export interface ContentStrategy {
  overallMode: ContentDeliveryMode;
  nativePercentage: number; // 0-100
  reasoning: string; // Portuguese explanation
  skillComplexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

// =============================================================================
// XP CONFIGURATION FOR LESSONS
// =============================================================================

export const LESSON_XP_REWARDS = {
  SECTION_COMPLETED: 15,
  QUIZ_PASSED: 35,
  QUIZ_PERFECT_SCORE: 50,
  EXERCISE_COMPLETED: 25,
  EXERCISE_NO_HINTS: 40, // Bonus for not using hints
  EXTERNAL_RESOURCE_ACCESSED: 20,
  LESSON_COMPLETED: 50,
  FIRST_TRY_BONUS_MULTIPLIER: 1.5,
} as const;

// =============================================================================
// CONTENT DECISION MATRIX
// =============================================================================

/** Matrix for deciding native vs external content */
export const CONTENT_DECISION_MATRIX: Record<
  ContentStrategy['skillComplexity'],
  Record<string, { mode: ContentDeliveryMode; nativePercentage: number }>
> = {
  basic: {
    technology: { mode: 'native', nativePercentage: 95 },
    language: { mode: 'native', nativePercentage: 90 },
    soft_skill: { mode: 'native', nativePercentage: 85 },
    tool: { mode: 'native', nativePercentage: 90 },
    business: { mode: 'native', nativePercentage: 85 },
  },
  intermediate: {
    technology: { mode: 'hybrid', nativePercentage: 70 },
    language: { mode: 'hybrid', nativePercentage: 65 },
    soft_skill: { mode: 'native', nativePercentage: 80 },
    tool: { mode: 'hybrid', nativePercentage: 70 },
    business: { mode: 'hybrid', nativePercentage: 65 },
  },
  advanced: {
    technology: { mode: 'hybrid', nativePercentage: 45 },
    language: { mode: 'external', nativePercentage: 35 },
    soft_skill: { mode: 'hybrid', nativePercentage: 55 },
    tool: { mode: 'external', nativePercentage: 40 },
    business: { mode: 'external', nativePercentage: 45 },
  },
  expert: {
    technology: { mode: 'external', nativePercentage: 25 },
    language: { mode: 'external', nativePercentage: 20 },
    soft_skill: { mode: 'hybrid', nativePercentage: 35 },
    tool: { mode: 'external', nativePercentage: 25 },
    business: { mode: 'external', nativePercentage: 30 },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get default content strategy based on skill and level */
export function getContentStrategy(
  skillCategory: string,
  currentLevel: string,
  targetLevel: string
): ContentStrategy {
  // Determine complexity based on target level
  const complexityMap: Record<string, ContentStrategy['skillComplexity']> = {
    none: 'basic',
    basic: 'basic',
    intermediate: 'intermediate',
    advanced: 'advanced',
    expert: 'expert',
  };

  const complexity = complexityMap[targetLevel] || 'intermediate';
  const category = skillCategory || 'technology';

  const decision = CONTENT_DECISION_MATRIX[complexity][category] ||
    CONTENT_DECISION_MATRIX[complexity]['technology'];

  const reasonings: Record<ContentStrategy['skillComplexity'], string> = {
    basic:
      'Para nivel basico, a IA vai ensinar todo o conteudo diretamente, com teoria clara e exemplos praticos.',
    intermediate:
      'Para nivel intermediario, a IA ensina os conceitos principais e complementa com recursos externos selecionados.',
    advanced:
      'Para nivel avancado, a IA resume os conceitos e indica recursos externos especializados para aprofundamento.',
    expert:
      'Para nivel especialista, a IA guia seu estudo com recursos externos de alta qualidade e certificacoes.',
  };

  return {
    overallMode: decision.mode,
    nativePercentage: decision.nativePercentage,
    reasoning: reasonings[complexity],
    skillComplexity: complexity,
  };
}

/** Calculate lesson progress percentage */
export function calculateLessonProgress(lesson: GeneratedLesson): number {
  let completed = 0;
  let total = 0;

  // Sections
  total += lesson.sections.length;
  completed += lesson.sections.filter((s) => s.isCompleted).length;

  // Quiz
  if (lesson.quiz) {
    total += 1;
    if (lesson.quiz.isPassed) completed += 1;
  }

  // Exercises
  total += lesson.exercises.length;
  completed += lesson.exercises.filter((e) => e.isCompleted).length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/** Create empty generated lesson */
export function createEmptyLesson(
  topic: LessonTopic,
  weekId: string
): GeneratedLesson {
  return {
    id: crypto.randomUUID(),
    weekId,
    lessonNumber: topic.lessonNumber,
    title: topic.title,
    objective: topic.learningObjectives[0] || '',
    deliveryMode: topic.suggestedDeliveryMode,
    prerequisiteConcepts: [],
    sections: [],
    quiz: null,
    exercises: [],
    externalResources: [],
    totalXpAvailable: 0,
    xpEarned: 0,
    progressPercentage: 0,
    isCompleted: false,
    completedAt: null,
    generatedAt: new Date().toISOString(),
    lastAccessedAt: null,
  };
}
