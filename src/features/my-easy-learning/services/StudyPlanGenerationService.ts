import { geminiProxyClient } from '../../../lib/api-clients/gemini-proxy-client';
import type {
  StudyPlanProfile,
  GeneratedStudyPlan,
  StudyPlanWeek,
  StudyTask,
  StudyMilestone,
} from '../types';
import type {
  LessonTopic,
  ContentStrategy,
  ContentDeliveryMode,
} from '../types/lesson';
import { getContentStrategy } from '../types/lesson';

/**
 * Service for generating personalized study plans using Gemini AI (via backend proxy).
 *
 * NOTE: All prompt templates have been moved to the backend prompt registry
 * (workers/api-d1/src/prompts/learning.ts) — CyberShield finding 3.E.
 */
export class StudyPlanGenerationService {
  /**
   * Generate a complete study plan based on user profile
   */
  async generateStudyPlan(profile: StudyPlanProfile): Promise<GeneratedStudyPlan> {
    console.log('🎓 [STUDY PLAN] Generating study plan for:', profile.skill_name);

    const motivationLabels: Record<string, string> = {
      career_change: 'Mudar de carreira',
      promotion: 'Conseguir promoção',
      income_increase: 'Aumentar renda',
      personal_project: 'Projeto pessoal',
      personal_satisfaction: 'Satisfação pessoal',
    };

    const levelLabels: Record<string, string> = {
      none: 'Nenhum (nunca estudei)',
      basic: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Especialista',
    };

    const response = await geminiProxyClient.call(
      'learning.generateStudyPlan',
      {
        skillName: profile.skill_name,
        skillCategory: profile.skill_category,
        currentLevel: levelLabels[profile.current_level] || 'Iniciante',
        targetLevel: levelLabels[profile.target_level] || 'Intermediário',
        weeklyHours: String(profile.weekly_hours),
        deadlineWeeks: String(profile.deadline_weeks),
        motivation: motivationLabels[profile.motivation] || 'Aprendizado',
      },
      0.85,
    );

    console.log('✅ [STUDY PLAN] AI response received, parsing...');

    const parsedPlan = this.parseStudyPlanResponse(response, profile);

    console.log('✅ [STUDY PLAN] Study plan generated successfully!');
    console.log('📊 Plan summary:', {
      weeks: parsedPlan.weeks.length,
      totalHours: parsedPlan.plan_summary.total_hours,
      milestones: parsedPlan.milestones.length,
    });

    return parsedPlan;
  }

  /**
   * Parse the AI response into a structured study plan
   */
  private parseStudyPlanResponse(
    response: string,
    profile: StudyPlanProfile
  ): GeneratedStudyPlan {
    const weeks: StudyPlanWeek[] = [];
    const milestones: StudyMilestone[] = [];
    const mainTopics: string[] = [];

    // Split response into sections
    const lines = response.split('\n').map((l) => l.trim());

    let currentWeek: Partial<StudyPlanWeek> | null = null;
    let currentTask: Partial<StudyTask> | null = null;
    let currentMilestone: Partial<StudyMilestone> | null = null;
    let inTasks = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse week header
      if (line.match(/^SEMANA\s+(\d+):/i)) {
        if (currentWeek && currentWeek.week_number) {
          weeks.push(this.finalizeWeek(currentWeek, profile.id));
        }
        const weekNum = parseInt(line.match(/\d+/)?.[0] || '0');
        currentWeek = {
          week_number: weekNum,
          tasks: [],
          is_completed: false,
          completed_at: null,
        };
        inTasks = false;
        continue;
      }

      if (!currentWeek) continue;

      // Parse week properties
      if (line.match(/^TÍTULO:/i)) {
        currentWeek.title = line.replace(/^TÍTULO:\s*/i, '').trim();
      } else if (line.match(/^FOCO:/i)) {
        currentWeek.focus = line.replace(/^FOCO:\s*/i, '').trim();
      } else if (line.match(/^HORAS:/i)) {
        const hours = parseInt(line.replace(/^HORAS:\s*/i, '').trim());
        currentWeek.estimated_hours = hours || profile.weekly_hours;
      } else if (line.match(/^TAREFAS:/i)) {
        inTasks = true;
      } else if (inTasks && line.match(/^-\s*TAREFA\s+\d+:/i)) {
        if (currentTask && currentTask.description) {
          (currentWeek.tasks as StudyTask[]).push(this.finalizeTask(currentTask, ''));
        }
        currentTask = {};
      } else if (currentTask && line.match(/^\*\s*Descrição:/i)) {
        currentTask.description = line.replace(/^\*\s*Descrição:\s*/i, '').trim();
      } else if (currentTask && line.match(/^\*\s*Tipo:/i)) {
        const type = line.replace(/^\*\s*Tipo:\s*/i, '').trim().toLowerCase();
        currentTask.resource_type = type as any;
      } else if (currentTask && line.match(/^\*\s*Recurso:/i)) {
        currentTask.resource_title = line.replace(/^\*\s*Recurso:\s*/i, '').trim();
      } else if (currentTask && line.match(/^\*\s*URL:/i)) {
        currentTask.resource_url = line.replace(/^\*\s*URL:\s*/i, '').trim();
      } else if (currentTask && line.match(/^\*\s*Duração:/i)) {
        const duration = parseInt(line.replace(/^\*\s*Duração:\s*/i, '').match(/\d+/)?.[0] || '30');
        currentTask.estimated_minutes = duration;
      }

      // Parse milestones
      if (line.match(/^MILESTONE\s+\d+:/i)) {
        if (currentMilestone && currentMilestone.title) {
          milestones.push(this.finalizeMilestone(currentMilestone, profile.id));
        }
        currentMilestone = {};
      } else if (currentMilestone && line.match(/^SEMANA:/i)) {
        const weekNum = parseInt(line.replace(/^SEMANA:\s*/i, '').match(/\d+/)?.[0] || '0');
        currentMilestone.week_number = weekNum;
      } else if (currentMilestone && line.match(/^TÍTULO:/i)) {
        currentMilestone.title = line.replace(/^TÍTULO:\s*/i, '').trim();
      } else if (currentMilestone && line.match(/^DESCRIÇÃO:/i)) {
        currentMilestone.description = line.replace(/^DESCRIÇÃO:\s*/i, '').trim();
      } else if (currentMilestone && line.match(/^ENTREGÁVEL:/i)) {
        currentMilestone.deliverable = line.replace(/^ENTREGÁVEL:\s*/i, '').trim();
      }
    }

    // Finalize last week and milestone
    if (currentTask && currentTask.description && currentWeek) {
      (currentWeek.tasks as StudyTask[]).push(this.finalizeTask(currentTask, ''));
    }
    if (currentWeek && currentWeek.week_number) {
      weeks.push(this.finalizeWeek(currentWeek, profile.id));
    }
    if (currentMilestone && currentMilestone.title) {
      milestones.push(this.finalizeMilestone(currentMilestone, profile.id));
    }

    // Extract main topics from week titles and focuses
    const topicsSet = new Set<string>();
    weeks.forEach((week) => {
      const titleWords = week.title.split(/[:-]/);
      if (titleWords.length > 1) {
        topicsSet.add(titleWords[1].trim());
      }
    });
    mainTopics.push(...Array.from(topicsSet).slice(0, 8));

    // If AI didn't generate enough weeks, fill with defaults
    while (weeks.length < profile.deadline_weeks) {
      weeks.push(this.createDefaultWeek(weeks.length + 1, profile));
    }

    // Calculate total hours
    const totalHours = weeks.reduce((sum, week) => sum + week.estimated_hours, 0);

    return {
      id: crypto.randomUUID(),
      profile_id: profile.id,
      plan_summary: {
        total_weeks: weeks.length,
        estimated_completion: new Date(profile.deadline_date).toLocaleDateString('pt-BR'),
        total_hours: totalHours,
        main_topics: mainTopics.length > 0 ? mainTopics : ['Fundamentos', 'Prática', 'Projetos'],
      },
      weeks,
      milestones,
      created_at: new Date(),
    };
  }

  /**
   * Finalize a week object with required fields
   */
  private finalizeWeek(week: Partial<StudyPlanWeek>, planId: string): StudyPlanWeek {
    return {
      id: crypto.randomUUID(),
      plan_id: planId,
      week_number: week.week_number || 1,
      title: week.title || `Semana ${week.week_number}`,
      focus: week.focus || 'Aprendizado contínuo',
      estimated_hours: week.estimated_hours || 4,
      is_completed: false,
      completed_at: null,
      tasks: (week.tasks as StudyTask[]) || [],
    };
  }

  /**
   * Finalize a task object with required fields
   */
  private finalizeTask(task: Partial<StudyTask>, weekId: string): StudyTask {
    return {
      id: crypto.randomUUID(),
      week_id: weekId,
      description: task.description || 'Tarefa de estudo',
      resource_type: task.resource_type || 'article',
      resource_url: task.resource_url || '',
      resource_title: task.resource_title || 'Recurso de estudo',
      estimated_minutes: task.estimated_minutes || 30,
      is_completed: false,
      completed_at: null,
    };
  }

  /**
   * Finalize a milestone object with required fields
   */
  private finalizeMilestone(
    milestone: Partial<StudyMilestone>,
    planId: string
  ): StudyMilestone {
    return {
      id: crypto.randomUUID(),
      plan_id: planId,
      week_number: milestone.week_number || 1,
      title: milestone.title || 'Marco do plano',
      description: milestone.description || 'Checkpoint importante',
      deliverable: milestone.deliverable || 'Projeto prático',
      is_completed: false,
      completed_at: null,
    };
  }

  /**
   * Create a default week when AI doesn't generate enough
   */
  private createDefaultWeek(weekNumber: number, profile: StudyPlanProfile): StudyPlanWeek {
    return {
      id: crypto.randomUUID(),
      plan_id: profile.id,
      week_number: weekNumber,
      title: `Semana ${weekNumber}: Continuação`,
      focus: 'Aprofundamento e prática',
      estimated_hours: profile.weekly_hours,
      is_completed: false,
      completed_at: null,
      tasks: [
        {
          id: crypto.randomUUID(),
          week_id: crypto.randomUUID(),
          description: 'Revisar conceitos da semana anterior',
          resource_type: 'practice',
          resource_url: '',
          resource_title: 'Exercícios de revisão',
          estimated_minutes: 60,
          is_completed: false,
          completed_at: null,
        },
        {
          id: crypto.randomUUID(),
          week_id: crypto.randomUUID(),
          description: 'Praticar com projeto pessoal',
          resource_type: 'project',
          resource_url: '',
          resource_title: 'Projeto prático',
          estimated_minutes: profile.weekly_hours * 60 - 60,
          is_completed: false,
          completed_at: null,
        },
      ],
    };
  }
}

// =============================================================================
// ENHANCED PLAN GENERATION (with lessons)
// =============================================================================

/** Enhanced plan with lesson topics instead of tasks */
export interface EnhancedGeneratedStudyPlan extends Omit<GeneratedStudyPlan, 'weeks'> {
  weeks: EnhancedStudyPlanWeekData[];
  contentStrategy: ContentStrategy;
}

/** Enhanced week with lesson topics */
export interface EnhancedStudyPlanWeekData {
  id: string;
  plan_id: string;
  week_number: number;
  title: string;
  focus: string;
  learningObjectives: string[];
  estimated_hours: number;
  deliveryMode: ContentDeliveryMode;
  lessonTopics: LessonTopic[];
  is_completed: boolean;
  completed_at: string | null;
}

// Extended service class with enhanced plan generation
StudyPlanGenerationService.prototype.generateEnhancedStudyPlan = async function (
  profile: StudyPlanProfile
): Promise<EnhancedGeneratedStudyPlan> {
  console.log('🎓 [ENHANCED PLAN] Generating enhanced study plan with lessons for:', profile.skill_name);

  // Get content strategy based on skill and level
  const contentStrategy = getContentStrategy(
    profile.skill_category,
    profile.current_level,
    profile.target_level
  );

  const motivationLabels: Record<string, string> = {
    career_change: 'Mudar de carreira',
    promotion: 'Conseguir promocao',
    income_increase: 'Aumentar renda',
    personal_project: 'Projeto pessoal',
    personal_satisfaction: 'Satisfacao pessoal',
  };

  const levelLabels: Record<string, string> = {
    none: 'Iniciante',
    basic: 'Basico',
    intermediate: 'Intermediario',
    advanced: 'Avancado',
    expert: 'Especialista',
  };

  try {
    const response = await geminiProxyClient.call(
      'learning.generateEnhancedStudyPlan',
      {
        skillName: profile.skill_name,
        category: profile.skill_category,
        currentLevel: levelLabels[profile.current_level] || 'Iniciante',
        targetLevel: levelLabels[profile.target_level] || 'Intermediario',
        weeklyHours: String(profile.weekly_hours),
        deadlineWeeks: String(profile.deadline_weeks),
        motivation: motivationLabels[profile.motivation] || 'Aprendizado',
        contentStrategy: contentStrategy.reasoning,
      },
      0.8,
    );
    const plan = parseEnhancedPlanResponse(response, profile, contentStrategy);

    console.log('✅ [ENHANCED PLAN] Plan generated with', plan.weeks.length, 'weeks');
    return plan;
  } catch (error) {
    console.error('❌ [ENHANCED PLAN] Error generating plan:', error);
    // Return fallback plan
    return createFallbackEnhancedPlan(profile, contentStrategy);
  }
};

function parseEnhancedPlanResponse(
  response: string,
  profile: StudyPlanProfile,
  contentStrategy: ContentStrategy
): EnhancedGeneratedStudyPlan {
  const weeks: EnhancedStudyPlanWeekData[] = [];
  const mainTopics: string[] = [];
  const lines = response.split('\n').map((l) => l.trim());

  let currentWeek: Partial<EnhancedStudyPlanWeekData> | null = null;
  let currentLesson: Partial<LessonTopic> | null = null;
  let lessonNumber = 0;

  for (const line of lines) {
    // Parse week header
    if (line.match(/^SEMANA\s+\d+:/i)) {
      if (currentWeek && currentWeek.week_number) {
        if (currentLesson && currentLesson.title) {
          currentWeek.lessonTopics = currentWeek.lessonTopics || [];
          currentWeek.lessonTopics.push(finalizeLessonTopic(currentLesson, lessonNumber));
        }
        weeks.push(finalizeEnhancedWeek(currentWeek, profile.id, contentStrategy));
      }
      const weekNum = parseInt(line.match(/\d+/)?.[0] || '0');
      currentWeek = {
        week_number: weekNum,
        lessonTopics: [],
        learningObjectives: [],
      };
      currentLesson = null;
      lessonNumber = 0;
      continue;
    }

    if (!currentWeek) continue;

    // Parse week properties
    if (line.match(/^TITULO:/i)) {
      currentWeek.title = line.replace(/^TITULO:\s*/i, '').trim();
    } else if (line.match(/^FOCO:/i)) {
      currentWeek.focus = line.replace(/^FOCO:\s*/i, '').trim();
    } else if (line.match(/^OBJETIVOS:/i)) {
      const objectives = line.replace(/^OBJETIVOS:\s*/i, '').split(',').map((o) => o.trim());
      currentWeek.learningObjectives = objectives;
    } else if (line.match(/^MODO:/i)) {
      const mode = line.replace(/^MODO:\s*/i, '').trim().toLowerCase();
      currentWeek.deliveryMode = mode as ContentDeliveryMode;
    } else if (line.match(/^LICAO\s+\d+:/i)) {
      // Save previous lesson
      if (currentLesson && currentLesson.title) {
        currentWeek.lessonTopics = currentWeek.lessonTopics || [];
        currentWeek.lessonTopics.push(finalizeLessonTopic(currentLesson, lessonNumber));
      }
      lessonNumber++;
      currentLesson = { lessonNumber };
    } else if (currentLesson && line.match(/^-\s*TITULO:/i)) {
      currentLesson.title = line.replace(/^-\s*TITULO:\s*/i, '').trim();
    } else if (currentLesson && line.match(/^-\s*DESCRICAO:/i)) {
      currentLesson.description = line.replace(/^-\s*DESCRICAO:\s*/i, '').trim();
    } else if (currentLesson && line.match(/^-\s*OBJETIVOS:/i)) {
      const objs = line.replace(/^-\s*OBJETIVOS:\s*/i, '').split(',').map((o) => o.trim());
      currentLesson.learningObjectives = objs;
    }

    // Parse main topics
    if (line.match(/^TOPICOS_PRINCIPAIS:/i)) {
      const topics = line.replace(/^TOPICOS_PRINCIPAIS:\s*/i, '').split(',').map((t) => t.trim());
      mainTopics.push(...topics);
    }
  }

  // Finalize last week and lesson
  if (currentLesson && currentLesson.title && currentWeek) {
    currentWeek.lessonTopics = currentWeek.lessonTopics || [];
    currentWeek.lessonTopics.push(finalizeLessonTopic(currentLesson, lessonNumber));
  }
  if (currentWeek && currentWeek.week_number) {
    weeks.push(finalizeEnhancedWeek(currentWeek, profile.id, contentStrategy));
  }

  // Fill missing weeks if needed
  while (weeks.length < profile.deadline_weeks) {
    weeks.push(createDefaultEnhancedWeek(weeks.length + 1, profile, contentStrategy));
  }

  const totalHours = weeks.reduce((sum, w) => sum + w.estimated_hours, 0);

  return {
    id: crypto.randomUUID(),
    profile_id: profile.id,
    plan_summary: {
      total_weeks: weeks.length,
      estimated_completion: new Date(profile.deadline_date).toLocaleDateString('pt-BR'),
      total_hours: totalHours,
      main_topics: mainTopics.length > 0 ? mainTopics : [profile.skill_name, 'Fundamentos', 'Pratica'],
    },
    weeks,
    milestones: [],
    contentStrategy,
    created_at: new Date(),
  };
}

function finalizeLessonTopic(lesson: Partial<LessonTopic>, lessonNumber: number): LessonTopic {
  return {
    weekNumber: 0, // Will be set by week
    lessonNumber,
    title: lesson.title || `Licao ${lessonNumber}`,
    description: lesson.description || 'Conteudo da licao',
    learningObjectives: lesson.learningObjectives || ['Aprender o conteudo'],
    suggestedDeliveryMode: 'native',
  };
}

function finalizeEnhancedWeek(
  week: Partial<EnhancedStudyPlanWeekData>,
  planId: string,
  contentStrategy: ContentStrategy
): EnhancedStudyPlanWeekData {
  const weekNum = week.week_number || 1;

  // Update lesson topics with week number
  const lessonTopics = (week.lessonTopics || []).map((lesson, idx) => ({
    ...lesson,
    weekNumber: weekNum,
    lessonNumber: idx + 1,
    suggestedDeliveryMode: week.deliveryMode || contentStrategy.overallMode,
  }));

  // Ensure at least one lesson
  if (lessonTopics.length === 0) {
    lessonTopics.push({
      weekNumber: weekNum,
      lessonNumber: 1,
      title: `Introducao - Semana ${weekNum}`,
      description: week.focus || 'Conteudo da semana',
      learningObjectives: week.learningObjectives || ['Aprender o conteudo'],
      suggestedDeliveryMode: contentStrategy.overallMode,
    });
  }

  return {
    id: crypto.randomUUID(),
    plan_id: planId,
    week_number: weekNum,
    title: week.title || `Semana ${weekNum}`,
    focus: week.focus || 'Aprendizado continuo',
    learningObjectives: week.learningObjectives || [],
    estimated_hours: 4,
    deliveryMode: week.deliveryMode || contentStrategy.overallMode,
    lessonTopics,
    is_completed: false,
    completed_at: null,
  };
}

function createDefaultEnhancedWeek(
  weekNumber: number,
  profile: StudyPlanProfile,
  contentStrategy: ContentStrategy
): EnhancedStudyPlanWeekData {
  return {
    id: crypto.randomUUID(),
    plan_id: profile.id,
    week_number: weekNumber,
    title: `Semana ${weekNumber}: Continuacao`,
    focus: 'Aprofundamento e pratica',
    learningObjectives: ['Consolidar conhecimentos', 'Praticar o aprendido'],
    estimated_hours: profile.weekly_hours,
    deliveryMode: contentStrategy.overallMode,
    lessonTopics: [
      {
        weekNumber,
        lessonNumber: 1,
        title: 'Revisao e Pratica',
        description: 'Revisao dos conceitos e pratica guiada',
        learningObjectives: ['Revisar conceitos', 'Aplicar na pratica'],
        suggestedDeliveryMode: contentStrategy.overallMode,
      },
    ],
    is_completed: false,
    completed_at: null,
  };
}

function createFallbackEnhancedPlan(
  profile: StudyPlanProfile,
  contentStrategy: ContentStrategy
): EnhancedGeneratedStudyPlan {
  const weeks: EnhancedStudyPlanWeekData[] = [];

  for (let i = 1; i <= profile.deadline_weeks; i++) {
    weeks.push(createDefaultEnhancedWeek(i, profile, contentStrategy));
  }

  return {
    id: crypto.randomUUID(),
    profile_id: profile.id,
    plan_summary: {
      total_weeks: weeks.length,
      estimated_completion: new Date(profile.deadline_date).toLocaleDateString('pt-BR'),
      total_hours: weeks.length * profile.weekly_hours,
      main_topics: [profile.skill_name, 'Fundamentos', 'Pratica', 'Projetos'],
    },
    weeks,
    milestones: [],
    contentStrategy,
    created_at: new Date(),
  };
}

// Extend the class type
declare module './StudyPlanGenerationService' {
  interface StudyPlanGenerationService {
    generateEnhancedStudyPlan(profile: StudyPlanProfile): Promise<EnhancedGeneratedStudyPlan>;
  }
}

// Export singleton instance
export const studyPlanGenerationService = new StudyPlanGenerationService();
