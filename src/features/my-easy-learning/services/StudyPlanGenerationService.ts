import { geminiClient } from '../../../lib/api-clients/gemini-client';
import type {
  StudyPlanProfile,
  GeneratedStudyPlan,
  StudyPlanWeek,
  StudyTask,
  StudyMilestone,
} from '../types';

/**
 * Service for generating personalized study plans using Gemini AI
 */
export class StudyPlanGenerationService {
  /**
   * Generate a complete study plan based on user profile
   */
  async generateStudyPlan(profile: StudyPlanProfile): Promise<GeneratedStudyPlan> {
    console.log('🎓 [STUDY PLAN] Generating study plan for:', profile.skill_name);

    const prompt = this.buildStudyPlanPrompt(profile);
    const response = await geminiClient.call(prompt, 0.85);

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
   * Build the AI prompt for study plan generation
   */
  private buildStudyPlanPrompt(profile: StudyPlanProfile): string {
    const motivationLabels = {
      career_change: 'Mudar de carreira',
      promotion: 'Conseguir promoção',
      income_increase: 'Aumentar renda',
      personal_project: 'Projeto pessoal',
      personal_satisfaction: 'Satisfação pessoal',
    };

    const levelLabels = {
      none: 'Nenhum (nunca estudei)',
      basic: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Especialista',
    };

    return `
Você é um especialista em educação e planejamento de estudos. Sua missão é criar um plano de estudos personalizado, estruturado e realista.

PERFIL DO ALUNO:
- Habilidade a Aprender: ${profile.skill_name}
- Categoria: ${profile.skill_category}
- Nível Atual: ${levelLabels[profile.current_level]}
- Nível Desejado: ${levelLabels[profile.target_level]}
- Tempo Disponível: ${profile.weekly_hours} horas por semana
- Prazo: ${profile.deadline_weeks} semanas
- Motivação: ${motivationLabels[profile.motivation]}

INSTRUÇÕES PARA CRIAR O PLANO:

1. ESTRUTURA DO PLANO:
   - Crie um plano com EXATAMENTE ${profile.deadline_weeks} semanas
   - Cada semana deve ter aproximadamente ${profile.weekly_hours} horas de estudo
   - Progrida do nível ${levelLabels[profile.current_level]} até ${levelLabels[profile.target_level]}

2. FORMATO DE CADA SEMANA:
   Para cada semana, forneça:

   SEMANA [número]:
   TÍTULO: [título da semana, ex: "Fundamentos de Python"]
   FOCO: [breve descrição do foco da semana]
   HORAS: ${profile.weekly_hours}

   TAREFAS:
   - TAREFA 1:
     * Descrição: [descrição clara da tarefa]
     * Tipo: [video/article/practice/project/book/course]
     * Recurso: [nome do recurso recomendado - curso específico, canal do YouTube, site, etc.]
     * URL: [URL real do recurso, se possível. Use URLs de recursos gratuitos conhecidos quando disponível]
     * Duração: [tempo estimado em minutos]

   - TAREFA 2:
     [mesmo formato...]

   [Continue com 3-5 tarefas por semana]

3. MILESTONES (MARCOS):
   Defina 2-3 milestones importantes ao longo do plano:

   MILESTONE [número]:
   SEMANA: [número da semana]
   TÍTULO: [título do milestone]
   DESCRIÇÃO: [descrição do que deve ser alcançado]
   ENTREGÁVEL: [projeto ou resultado concreto esperado]

4. TÓPICOS PRINCIPAIS:
   Liste 5-8 tópicos principais que serão cobertos no plano.

DIRETRIZES IMPORTANTES:
- Seja ESPECÍFICO com recursos reais (cursos do YouTube, Udemy, Coursera, freeCodeCamp, etc.)
- Para vídeos, recomende canais/cursos conhecidos e de qualidade
- Para artigos, sugira sites respeitáveis (Medium, Dev.to, documentação oficial, etc.)
- Para prática, sugira plataformas como LeetCode, HackerRank, exercism.io, etc.
- Distribua os tipos de recursos: 40% vídeos, 30% prática, 20% leitura, 10% projetos
- Considere a motivação "${motivationLabels[profile.motivation]}" ao escolher projetos e exemplos
- Seja realista com o tempo: não sobrecarregue o aluno
- Progrida gradualmente: conceitos básicos → intermediários → avançados

FORMATO DA RESPOSTA:
Use EXATAMENTE o formato especificado acima para facilitar o parsing.
Separe cada semana claramente com "SEMANA [número]:" e cada milestone com "MILESTONE [número]:".

IMPORTANTE:
- Retorne APENAS o plano estruturado, sem introduções ou conclusões
- Use URLs reais sempre que possível (YouTube, Coursera, freeCodeCamp, etc.)
- Seja prático e objetivo
`;
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

// Export singleton instance
export const studyPlanGenerationService = new StudyPlanGenerationService();
