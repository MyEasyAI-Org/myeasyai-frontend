/**
 * Lesson Content Generation Service
 *
 * Generates educational content using Gemini AI including:
 * - Theory sections with clear explanations
 * - Code examples with explanations
 * - Quiz questions to test understanding
 * - Practice exercises
 * - External resource recommendations
 */

import { geminiClient } from '../../../lib/api-clients/gemini-client';
import type {
  GeneratedLesson,
  LessonSection,
  LessonQuiz,
  QuizQuestion,
  PracticeExercise,
  ExternalResource,
  ContentDeliveryMode,
  LessonTopic,
  ContentStrategy,
  LESSON_XP_REWARDS,
} from '../types/lesson';
import type { StudyPlanProfile } from '../types';

// =============================================================================
// PROMPTS
// =============================================================================

const THEORY_GENERATION_PROMPT = `Voce e um professor especialista e vai criar uma licao completa sobre o topico solicitado.

PERFIL DO ALUNO:
- Habilidade: {skillName}
- Nivel atual: {currentLevel}
- Nivel objetivo: {targetLevel}

TOPICO DA LICAO:
- Titulo: {lessonTitle}
- Objetivos: {objectives}

INSTRUCOES:
1. Crie uma licao clara e didatica em portugues brasileiro
2. Use analogias do dia-a-dia para explicar conceitos abstratos
3. Seja amigavel e encorajador, como um mentor
4. Inclua exemplos praticos sempre que possivel
5. Destaque erros comuns e como evita-los
6. Se for sobre programacao, inclua codigo comentado

FORMATO DA RESPOSTA (use exatamente este formato):

===SECAO_TEORIA===
[Explicacao do conceito principal em Markdown. Seja claro e use paragrafos curtos.]

===SECAO_EXEMPLO===
[Se aplicavel, codigo de exemplo com comentarios explicativos]
LINGUAGEM: [linguagem do codigo, ex: python, javascript]
EXPLICACAO: [explicacao do que o codigo faz]

===SECAO_DICA===
[Dica importante ou boa pratica relacionada ao topico]

===SECAO_ALERTA===
[Erro comum que iniciantes cometem e como evitar]

===SECAO_RESUMO===
PONTO1: [primeiro ponto chave]
PONTO2: [segundo ponto chave]
PONTO3: [terceiro ponto chave]

Gere o conteudo agora:`;

const QUIZ_GENERATION_PROMPT = `Com base no conteudo da licao sobre "{lessonTitle}", crie {questionCount} perguntas de quiz para testar o entendimento do aluno.

CONTEUDO DA LICAO:
{lessonContent}

NIVEL DO ALUNO: {level}

INSTRUCOES:
1. Crie perguntas que testem compreensao, nao memorizacao
2. Varie os tipos: multipla escolha, verdadeiro/falso
3. Dificuldade: 40% facil, 40% medio, 20% dificil
4. Inclua explicacoes detalhadas para cada resposta
5. Se for sobre codigo, inclua snippets nas perguntas

FORMATO DA RESPOSTA (JSON):
{
  "questions": [
    {
      "question": "texto da pergunta",
      "type": "multiple_choice" ou "true_false",
      "difficulty": "easy" ou "medium" ou "hard",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": "resposta correta (exatamente como nas opcoes)",
      "explanation": "explicacao de por que esta e a resposta correta",
      "codeContext": "codigo relacionado, se aplicavel"
    }
  ]
}

Gere o JSON agora:`;

const EXERCISE_GENERATION_PROMPT = `Crie {exerciseCount} exercicios praticos para o aluno aplicar o que aprendeu sobre "{lessonTitle}".

CONTEUDO DA LICAO:
{lessonContent}

NIVEL DO ALUNO: {level}
CATEGORIA: {category}

INSTRUCOES:
1. Crie exercicios praticos que reforcem o aprendizado
2. Comece com exercicios simples e aumente a dificuldade
3. Inclua codigo inicial (starter code) quando aplicavel
4. Forneca dicas uteis para ajudar o aluno
5. Inclua a solucao esperada

FORMATO DA RESPOSTA (JSON):
{
  "exercises": [
    {
      "title": "titulo do exercicio",
      "description": "descricao detalhada do que fazer (Markdown)",
      "difficulty": "easy" ou "medium" ou "hard",
      "starterCode": "codigo inicial, se aplicavel",
      "solution": "solucao esperada",
      "hints": ["dica 1", "dica 2"],
      "estimatedMinutes": numero
    }
  ]
}

Gere o JSON agora:`;

const EXTERNAL_RESOURCES_PROMPT = `Recomende {resourceCount} recursos externos de alta qualidade para o aluno aprofundar seus conhecimentos sobre "{lessonTitle}".

CONTEXTO:
- Habilidade: {skillName}
- Nivel: {level}
- Categoria: {category}

INSTRUCOES:
1. Recomende recursos reais e de qualidade (YouTube, Udemy, Coursera, documentacao oficial, etc)
2. Prefira recursos em portugues, mas inclua em ingles se forem essenciais
3. Inclua mix de gratuitos e pagos
4. Explique por que cada recurso e recomendado

FORMATO DA RESPOSTA (JSON):
{
  "resources": [
    {
      "type": "video" ou "article" ou "course" ou "documentation" ou "tutorial",
      "title": "titulo do recurso",
      "url": "URL do recurso",
      "source": "nome da plataforma (YouTube, Udemy, etc)",
      "description": "breve descricao do conteudo",
      "whyRecommended": "por que este recurso e util para o aluno",
      "estimatedMinutes": numero,
      "isFree": true ou false,
      "language": "pt" ou "en"
    }
  ]
}

Gere o JSON agora:`;

// =============================================================================
// SERVICE CLASS
// =============================================================================

class LessonContentGenerationServiceClass {
  /**
   * Generate complete lesson content
   */
  async generateLessonContent(
    profile: StudyPlanProfile,
    topic: LessonTopic,
    weekId: string
  ): Promise<GeneratedLesson> {
    console.log('📚 [LESSON SERVICE] Gerando conteudo da licao:', topic.title);

    const lessonId = crypto.randomUUID();

    // 1. Generate theory sections
    const sections = await this.generateTheorySections(profile, topic);

    // 2. Generate quiz
    const sectionContent = sections.map((s) => s.content).join('\n\n');
    const quiz = await this.generateQuiz(topic.title, sectionContent, profile.target_level);

    // 3. Generate exercises
    const exercises = await this.generateExercises(
      topic.title,
      sectionContent,
      profile.target_level,
      profile.skill_category
    );

    // 4. Generate external resources if hybrid/external mode
    let externalResources: ExternalResource[] = [];
    if (topic.suggestedDeliveryMode !== 'native') {
      externalResources = await this.generateExternalResources(
        topic.title,
        profile.skill_name,
        profile.target_level,
        profile.skill_category
      );
    }

    // Calculate total XP available
    const totalXp = this.calculateTotalXp(sections, quiz, exercises, externalResources);

    const lesson: GeneratedLesson = {
      id: lessonId,
      weekId,
      lessonNumber: topic.lessonNumber,
      title: topic.title,
      objective: topic.learningObjectives[0] || '',
      deliveryMode: topic.suggestedDeliveryMode,
      prerequisiteConcepts: [],
      sections,
      quiz,
      exercises,
      externalResources,
      totalXpAvailable: totalXp,
      xpEarned: 0,
      progressPercentage: 0,
      isCompleted: false,
      completedAt: null,
      generatedAt: new Date().toISOString(),
      lastAccessedAt: null,
    };

    console.log('✅ [LESSON SERVICE] Licao gerada com sucesso!');
    return lesson;
  }

  /**
   * Generate theory sections using AI
   */
  private async generateTheorySections(
    profile: StudyPlanProfile,
    topic: LessonTopic
  ): Promise<LessonSection[]> {
    const prompt = THEORY_GENERATION_PROMPT
      .replace('{skillName}', profile.skill_name)
      .replace('{currentLevel}', profile.current_level)
      .replace('{targetLevel}', profile.target_level)
      .replace('{lessonTitle}', topic.title)
      .replace('{objectives}', topic.learningObjectives.join(', '));

    try {
      const response = await geminiClient.call(prompt, 0.7);
      return this.parseTheorySections(response);
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao gerar teoria:', error);
      // Return fallback section
      return [
        {
          id: crypto.randomUUID(),
          type: 'theory',
          order: 1,
          title: topic.title,
          content: `# ${topic.title}\n\nConteudo em geracao. Por favor, tente novamente.`,
          estimatedMinutes: 10,
          isCompleted: false,
          completedAt: null,
        },
      ];
    }
  }

  /**
   * Parse AI response into lesson sections
   */
  private parseTheorySections(response: string): LessonSection[] {
    const sections: LessonSection[] = [];
    let order = 1;

    // Parse theory section
    const theoryMatch = response.match(/===SECAO_TEORIA===\s*([\s\S]*?)(?====|$)/);
    if (theoryMatch) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'theory',
        order: order++,
        title: 'Conceito',
        content: theoryMatch[1].trim(),
        estimatedMinutes: 5,
        isCompleted: false,
        completedAt: null,
      });
    }

    // Parse example section
    const exampleMatch = response.match(/===SECAO_EXEMPLO===\s*([\s\S]*?)(?====|$)/);
    if (exampleMatch) {
      const exampleContent = exampleMatch[1].trim();
      const langMatch = exampleContent.match(/LINGUAGEM:\s*(\w+)/i);
      const explMatch = exampleContent.match(/EXPLICACAO:\s*([\s\S]*?)$/i);

      // Extract code (everything before LINGUAGEM)
      const codeMatch = exampleContent.match(/^([\s\S]*?)(?=LINGUAGEM:|$)/);
      const code = codeMatch ? codeMatch[1].trim() : exampleContent;

      sections.push({
        id: crypto.randomUUID(),
        type: 'example',
        order: order++,
        title: 'Exemplo Pratico',
        content: explMatch ? explMatch[1].trim() : '',
        codeSnippet: {
          language: langMatch ? langMatch[1].toLowerCase() : 'text',
          code: code.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim(),
          explanation: explMatch ? explMatch[1].trim() : undefined,
        },
        estimatedMinutes: 3,
        isCompleted: false,
        completedAt: null,
      });
    }

    // Parse tip section
    const tipMatch = response.match(/===SECAO_DICA===\s*([\s\S]*?)(?====|$)/);
    if (tipMatch) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'tip',
        order: order++,
        title: 'Dica',
        content: tipMatch[1].trim(),
        estimatedMinutes: 2,
        isCompleted: false,
        completedAt: null,
      });
    }

    // Parse warning section
    const warningMatch = response.match(/===SECAO_ALERTA===\s*([\s\S]*?)(?====|$)/);
    if (warningMatch) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'warning',
        order: order++,
        title: 'Cuidado',
        content: warningMatch[1].trim(),
        estimatedMinutes: 2,
        isCompleted: false,
        completedAt: null,
      });
    }

    // Parse summary section
    const summaryMatch = response.match(/===SECAO_RESUMO===\s*([\s\S]*?)(?====|$)/);
    if (summaryMatch) {
      const summaryContent = summaryMatch[1].trim();
      const points = summaryContent
        .split('\n')
        .filter((line) => line.match(/^PONTO\d+:/i))
        .map((line) => line.replace(/^PONTO\d+:\s*/i, '').trim());

      sections.push({
        id: crypto.randomUUID(),
        type: 'summary',
        order: order++,
        title: 'Resumo',
        content: 'Pontos-chave desta licao:',
        keyPoints: points.length > 0 ? points : ['Revise o conteudo acima'],
        estimatedMinutes: 2,
        isCompleted: false,
        completedAt: null,
      });
    }

    // Fallback if no sections parsed
    if (sections.length === 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'theory',
        order: 1,
        title: 'Conteudo',
        content: response,
        estimatedMinutes: 10,
        isCompleted: false,
        completedAt: null,
      });
    }

    return sections;
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(
    lessonTitle: string,
    lessonContent: string,
    level: string
  ): Promise<LessonQuiz> {
    const questionCount = level === 'basic' || level === 'none' ? 3 : level === 'intermediate' ? 4 : 5;

    const prompt = QUIZ_GENERATION_PROMPT
      .replace('{lessonTitle}', lessonTitle)
      .replace('{questionCount}', questionCount.toString())
      .replace('{lessonContent}', lessonContent.substring(0, 2000))
      .replace('{level}', level);

    try {
      const response = await geminiClient.call(prompt, 0.6);
      const questions = this.parseQuizResponse(response);

      return {
        id: crypto.randomUUID(),
        title: `Quiz: ${lessonTitle}`,
        questions,
        passingScore: 70,
        xpReward: 35,
        attempts: [],
        bestScore: null,
        isPassed: false,
      };
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao gerar quiz:', error);
      return this.createFallbackQuiz(lessonTitle);
    }
  }

  /**
   * Parse quiz JSON response
   */
  private parseQuizResponse(response: string): QuizQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const questions: QuizQuestion[] = [];

      for (const q of parsed.questions || []) {
        questions.push({
          id: crypto.randomUUID(),
          question: q.question || '',
          type: q.type === 'true_false' ? 'true_false' : 'multiple_choice',
          difficulty: this.mapDifficulty(q.difficulty),
          options: q.options || ['Verdadeiro', 'Falso'],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || 'Revise o conteudo da licao.',
          codeContext: q.codeContext,
          xpReward: this.mapDifficulty(q.difficulty) === 'easy' ? 5 : q.difficulty === 'medium' ? 8 : 12,
        });
      }

      return questions;
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao parsear quiz:', error);
      return [];
    }
  }

  /**
   * Create fallback quiz if generation fails
   */
  private createFallbackQuiz(lessonTitle: string): LessonQuiz {
    return {
      id: crypto.randomUUID(),
      title: `Quiz: ${lessonTitle}`,
      questions: [
        {
          id: crypto.randomUUID(),
          question: `Voce entendeu os conceitos principais de "${lessonTitle}"?`,
          type: 'true_false',
          difficulty: 'easy',
          options: ['Sim, entendi', 'Preciso revisar'],
          correctAnswer: 'Sim, entendi',
          explanation: 'Continue praticando para fixar o conteudo!',
          xpReward: 5,
        },
      ],
      passingScore: 70,
      xpReward: 35,
      attempts: [],
      bestScore: null,
      isPassed: false,
    };
  }

  /**
   * Generate practice exercises
   */
  async generateExercises(
    lessonTitle: string,
    lessonContent: string,
    level: string,
    category: string
  ): Promise<PracticeExercise[]> {
    const exerciseCount = level === 'basic' || level === 'none' ? 2 : 3;

    const prompt = EXERCISE_GENERATION_PROMPT
      .replace('{exerciseCount}', exerciseCount.toString())
      .replace('{lessonTitle}', lessonTitle)
      .replace('{lessonContent}', lessonContent.substring(0, 2000))
      .replace('{level}', level)
      .replace('{category}', category);

    try {
      const response = await geminiClient.call(prompt, 0.7);
      return this.parseExercisesResponse(response);
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao gerar exercicios:', error);
      return this.createFallbackExercises(lessonTitle);
    }
  }

  /**
   * Parse exercises JSON response
   */
  private parseExercisesResponse(response: string): PracticeExercise[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const exercises: PracticeExercise[] = [];

      for (const e of parsed.exercises || []) {
        exercises.push({
          id: crypto.randomUUID(),
          title: e.title || 'Exercicio',
          description: e.description || '',
          difficulty: this.mapDifficulty(e.difficulty),
          starterCode: e.starterCode,
          solution: e.solution,
          hints: e.hints || [],
          hintsUsed: 0,
          estimatedMinutes: e.estimatedMinutes || 10,
          xpReward: this.mapDifficulty(e.difficulty) === 'easy' ? 15 : e.difficulty === 'medium' ? 25 : 35,
          isCompleted: false,
          completedAt: null,
        });
      }

      return exercises;
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao parsear exercicios:', error);
      return [];
    }
  }

  /**
   * Create fallback exercises
   */
  private createFallbackExercises(lessonTitle: string): PracticeExercise[] {
    return [
      {
        id: crypto.randomUUID(),
        title: 'Pratica livre',
        description: `Pratique os conceitos de "${lessonTitle}" criando seu proprio exemplo.`,
        difficulty: 'easy',
        hints: ['Revise os exemplos da licao', 'Comece com algo simples'],
        hintsUsed: 0,
        estimatedMinutes: 15,
        xpReward: 25,
        isCompleted: false,
        completedAt: null,
      },
    ];
  }

  /**
   * Generate external resource recommendations
   */
  async generateExternalResources(
    lessonTitle: string,
    skillName: string,
    level: string,
    category: string
  ): Promise<ExternalResource[]> {
    const resourceCount = level === 'advanced' || level === 'expert' ? 4 : 2;

    const prompt = EXTERNAL_RESOURCES_PROMPT
      .replace('{resourceCount}', resourceCount.toString())
      .replace('{lessonTitle}', lessonTitle)
      .replace('{skillName}', skillName)
      .replace('{level}', level)
      .replace('{category}', category);

    try {
      const response = await geminiClient.call(prompt, 0.8);
      return this.parseResourcesResponse(response);
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao gerar recursos:', error);
      return [];
    }
  }

  /**
   * Parse external resources JSON response
   */
  private parseResourcesResponse(response: string): ExternalResource[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const resources: ExternalResource[] = [];

      for (const r of parsed.resources || []) {
        resources.push({
          id: crypto.randomUUID(),
          type: this.mapResourceType(r.type),
          title: r.title || 'Recurso externo',
          url: r.url || '#',
          source: r.source || 'Web',
          description: r.description || '',
          whyRecommended: r.whyRecommended || 'Recurso recomendado para aprofundamento.',
          estimatedMinutes: r.estimatedMinutes || 30,
          isFree: r.isFree !== false,
          language: r.language === 'en' ? 'en' : 'pt',
          isAccessed: false,
          accessedAt: null,
        });
      }

      return resources;
    } catch (error) {
      console.error('❌ [LESSON SERVICE] Erro ao parsear recursos:', error);
      return [];
    }
  }

  /**
   * Helper: Map difficulty string
   */
  private mapDifficulty(difficulty?: string): 'easy' | 'medium' | 'hard' {
    if (difficulty === 'hard' || difficulty === 'dificil') return 'hard';
    if (difficulty === 'medium' || difficulty === 'medio') return 'medium';
    return 'easy';
  }

  /**
   * Helper: Map resource type
   */
  private mapResourceType(type?: string): ExternalResource['type'] {
    const typeMap: Record<string, ExternalResource['type']> = {
      video: 'video',
      article: 'article',
      course: 'course',
      book: 'book',
      documentation: 'documentation',
      tutorial: 'tutorial',
    };
    return typeMap[type?.toLowerCase() || ''] || 'article';
  }

  /**
   * Calculate total XP available in lesson
   */
  private calculateTotalXp(
    sections: LessonSection[],
    quiz: LessonQuiz | null,
    exercises: PracticeExercise[],
    resources: ExternalResource[]
  ): number {
    let total = 0;

    // Sections: 15 XP each
    total += sections.length * 15;

    // Quiz: sum of question XP + passing bonus
    if (quiz) {
      total += quiz.questions.reduce((sum, q) => sum + q.xpReward, 0);
      total += quiz.xpReward;
    }

    // Exercises: sum of exercise XP
    total += exercises.reduce((sum, e) => sum + e.xpReward, 0);

    // External resources: 20 XP each
    total += resources.length * 20;

    // Lesson completion bonus
    total += 50;

    return total;
  }
}

// Export singleton
export const lessonContentGenerationService = new LessonContentGenerationServiceClass();
