/**
 * Final Exam Generation Service
 *
 * Generates comprehensive final exam using Gemini AI.
 * Creates a question pool covering all topics from the study plan.
 */

import { geminiClient } from '../../../lib/api-clients/gemini-client';
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
// PROMPT
// =============================================================================

const EXAM_GENERATION_PROMPT = `Voce e um avaliador educacional rigoroso. Crie {questionCount} perguntas para uma PROVA FINAL abrangente sobre "{skillName}".

PERFIL DO ALUNO:
- Habilidade: {skillName}
- Nivel: {level}
- Categoria: {category}

TOPICOS DO CURSO QUE DEVEM SER COBERTOS:
{topicsList}

INSTRUCOES RIGOROSAS:
1. As perguntas devem cobrir TODOS os topicos listados acima de forma equilibrada
2. As perguntas devem testar COMPREENSAO PROFUNDA, nao memorizacao
3. Distribuicao de dificuldade: {easyPct}% facil, {mediumPct}% medio, {hardPct}% dificil
4. Use TODOS os tipos de pergunta de forma variada:
   - "multiple_choice": 4 opcoes, apenas 1 correta
   - "true_false": afirmacao para avaliar verdadeiro/falso (opcoes: ["Verdadeiro", "Falso"])
   - "fill_blank": preencher lacuna (correctAnswer e a palavra/frase que completa)
   - "code_output": qual a saida deste codigo? (inclua codeContext)
   - "multiple_select": selecionar TODAS as opcoes corretas (use correctAnswers como array)
5. Para "fill_blank": a pergunta deve conter "___" indicando onde vai a resposta
6. Para "multiple_select": marque 2-3 opcoes corretas em correctAnswers
7. Inclua explicacoes detalhadas para TODAS as respostas
8. Cada pergunta deve indicar qual topico do curso ela cobre (campo "topic")
9. As perguntas devem ser desafiadoras o suficiente para validar conhecimento real

FORMATO DA RESPOSTA (JSON):
{
  "questions": [
    {
      "question": "texto da pergunta",
      "type": "multiple_choice",
      "difficulty": "easy",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": "resposta correta exata",
      "correctAnswers": null,
      "explanation": "explicacao detalhada",
      "codeContext": null,
      "topic": "nome do topico coberto"
    },
    {
      "question": "Verdadeiro ou Falso: afirmacao aqui",
      "type": "true_false",
      "difficulty": "medium",
      "options": ["Verdadeiro", "Falso"],
      "correctAnswer": "Verdadeiro",
      "correctAnswers": null,
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    },
    {
      "question": "Complete: O ___ e responsavel por...",
      "type": "fill_blank",
      "difficulty": "hard",
      "options": null,
      "correctAnswer": "palavra correta",
      "correctAnswers": null,
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    },
    {
      "question": "Selecione TODAS as opcoes corretas sobre X:",
      "type": "multiple_select",
      "difficulty": "hard",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": null,
      "correctAnswers": ["opcao1", "opcao3"],
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    }
  ]
}

Gere o JSON agora:`;

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

      const prompt = EXAM_GENERATION_PROMPT
        .replace(/{questionCount}/g, String(questionsInBatch))
        .replace(/{skillName}/g, profile.skill_name)
        .replace(/{level}/g, config.level)
        .replace(/{category}/g, profile.skill_category)
        .replace(/{topicsList}/g, topicsList)
        .replace(/{easyPct}/g, String(config.difficultyDistribution.easy))
        .replace(/{mediumPct}/g, String(config.difficultyDistribution.medium))
        .replace(/{hardPct}/g, String(config.difficultyDistribution.hard));

      try {
        const response = await geminiClient.call(prompt, 0.7);
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
