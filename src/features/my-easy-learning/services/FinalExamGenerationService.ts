/**
 * Final Exam Generation Service
 *
 * Generates comprehensive final exam using the backend Gemini proxy.
 * Creates a question pool covering all topics from the study plan.
 *
 * NOTE: The EXAM_GENERATION_PROMPT has been moved to the backend prompt registry
 * (workers/api-d1/src/prompts/learning.ts) — CyberShield finding 3.E.
 */

import { geminiProxyClient } from '../../../lib/api-clients/gemini-proxy-client';
import type { StudyPlanProfile } from '../types';
import type { LessonTopic } from '../types/lesson';
import type {
  CertificateLevel,
  FinalExam,
  FinalExamConfig,
  FinalExamQuestion,
} from '../types/courseCompletion';
import { FINAL_EXAM_CONFIGS } from '../types/courseCompletion';

// =============================================================================
// SERVICE CLASS
// =============================================================================

class FinalExamGenerationServiceClass {
  /**
   * Generate complete final exam with question pool
   */
  async generateFinalExam(
    profile: StudyPlanProfile,
    lessonTopics: LessonTopic[],
    certificateLevel: CertificateLevel
  ): Promise<FinalExam> {
    console.log('📝 [FINAL EXAM] Gerando prova final para:', profile.skill_name);

    const config = FINAL_EXAM_CONFIGS[certificateLevel];
    const questionPool = await this.generateQuestionPool(profile, lessonTopics, config);

    return {
      id: crypto.randomUUID(),
      planId: profile.id,
      questionPool,
      config,
      attempts: [],
      bestScore: null,
      isPassed: false,
      passedAt: null,
      lastAttemptAt: null,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Select random questions for an attempt, avoiding overlap with previous attempts
   */
  selectQuestionsForAttempt(
    exam: FinalExam,
    attemptNumber: number
  ): FinalExamQuestion[] {
    const { config, questionPool } = exam;
    const count = config.questionsPerAttempt;

    // Get question IDs from previous attempt to minimize overlap
    const previousAttempt = exam.attempts[exam.attempts.length - 1];
    const previousIds = new Set(previousAttempt?.questionsUsed || []);

    // Separate pool into fresh and already-used questions
    const fresh = questionPool.filter((q) => !previousIds.has(q.id));
    const used = questionPool.filter((q) => previousIds.has(q.id));

    // Prioritize fresh questions, fill with used if needed
    const shuffledFresh = this.shuffleArray([...fresh]);
    const shuffledUsed = this.shuffleArray([...used]);
    const combined = [...shuffledFresh, ...shuffledUsed];

    // Select while respecting difficulty distribution
    const selected = this.selectWithDifficultyBalance(combined, count, config);

    // Assign per-question timers from config
    return selected.map((q) => ({
      ...q,
      minTimeSeconds: config.minTimePerQuestion,
      maxTimeSeconds: config.maxTimePerQuestion,
    }));
  }

  // ---------------------------------------------------------------------------
  // PRIVATE METHODS
  // ---------------------------------------------------------------------------

  private async generateQuestionPool(
    profile: StudyPlanProfile,
    lessonTopics: LessonTopic[],
    config: FinalExamConfig
  ): Promise<FinalExamQuestion[]> {
    const topicsList = lessonTopics
      .map((t) => `- Semana ${t.weekNumber}, Licao ${t.lessonNumber}: ${t.title} (${t.description})`)
      .join('\n');

    // Generate in batches if needed (max ~15 per call for quality)
    const totalNeeded = config.totalQuestions;
    const batchSize = 15;
    const batches = Math.ceil(totalNeeded / batchSize);
    const allQuestions: FinalExamQuestion[] = [];

    for (let i = 0; i < batches; i++) {
      const questionsInBatch = Math.min(batchSize, totalNeeded - allQuestions.length);
      if (questionsInBatch <= 0) break;

      try {
        const response = await geminiProxyClient.call(
          'learning.generateFinalExam',
          {
            questionCount: String(questionsInBatch),
            skillName: profile.skill_name,
            level: config.level,
            category: profile.skill_category,
            topicsList,
            easyPct: String(config.difficultyDistribution.easy),
            mediumPct: String(config.difficultyDistribution.medium),
            hardPct: String(config.difficultyDistribution.hard),
          },
          0.7,
        );
        const parsed = this.parseExamResponse(response);
        allQuestions.push(...parsed);
      } catch (error) {
        console.error(`[FINAL EXAM] Erro no batch ${i + 1}:`, error);
      }
    }

    console.log(`📝 [FINAL EXAM] ${allQuestions.length} questoes geradas`);
    return allQuestions;
  }

  private parseExamResponse(response: string): FinalExamQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[FINAL EXAM] JSON nao encontrado na resposta');
        return [];
      }

      const data = JSON.parse(jsonMatch[0]);
      const questions = data.questions || [];

      return questions.map((q: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        question: String(q.question || ''),
        type: q.type || 'multiple_choice',
        difficulty: q.difficulty || 'medium',
        options: Array.isArray(q.options) ? q.options : undefined,
        correctAnswer: q.correctAnswer ? String(q.correctAnswer) : '',
        correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : undefined,
        explanation: String(q.explanation || ''),
        codeContext: q.codeContext ? String(q.codeContext) : undefined,
        topic: String(q.topic || ''),
        minTimeSeconds: 15,
        maxTimeSeconds: 120,
      })) as FinalExamQuestion[];
    } catch (error) {
      console.error('[FINAL EXAM] Erro ao parsear resposta:', error);
      return [];
    }
  }

  private selectWithDifficultyBalance(
    pool: FinalExamQuestion[],
    count: number,
    config: FinalExamConfig
  ): FinalExamQuestion[] {
    const { easy, medium, hard } = config.difficultyDistribution;
    const easyCount = Math.round((count * easy) / 100);
    const mediumCount = Math.round((count * medium) / 100);
    const hardCount = count - easyCount - mediumCount;

    const byDifficulty = {
      easy: pool.filter((q) => q.difficulty === 'easy'),
      medium: pool.filter((q) => q.difficulty === 'medium'),
      hard: pool.filter((q) => q.difficulty === 'hard'),
    };

    const selected: FinalExamQuestion[] = [
      ...byDifficulty.easy.slice(0, easyCount),
      ...byDifficulty.medium.slice(0, mediumCount),
      ...byDifficulty.hard.slice(0, hardCount),
    ];

    // Fill remaining from any difficulty if distribution doesn't match
    if (selected.length < count) {
      const selectedIds = new Set(selected.map((q) => q.id));
      const remaining = pool.filter((q) => !selectedIds.has(q.id));
      selected.push(...remaining.slice(0, count - selected.length));
    }

    return this.shuffleArray(selected);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const finalExamGenerationService = new FinalExamGenerationServiceClass();
