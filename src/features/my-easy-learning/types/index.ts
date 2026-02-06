// ============================================================================
// MyEasyLearning - Type Definitions
// ============================================================================

// Skill Levels
export type SkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';

// Skill Categories
export type SkillCategory =
  | 'technology'    // Python, React, SQL
  | 'language'      // Inglês, Espanhol
  | 'soft_skill'    // Liderança, Comunicação
  | 'tool'          // Excel, Power BI, Figma
  | 'business'      // Gestão, Marketing
  | 'other';

// Resource Types
export type ResourceType = 'video' | 'article' | 'practice' | 'project' | 'book' | 'course';

// Study Motivation
export type StudyMotivation =
  | 'career_change'
  | 'promotion'
  | 'income_increase'
  | 'personal_project'
  | 'personal_satisfaction';

// Conversation Steps
export type ConversationStep =
  | 'welcome'
  | 'skill_selection'
  | 'current_level'
  | 'target_level'
  | 'time_availability'
  | 'deadline'
  | 'motivation'
  | 'review'
  | 'generating'
  | 'result';

// ============================================================================
// CORE ENTITIES
// ============================================================================

// Study Plan Profile
export interface StudyPlanProfile {
  id: string;
  user_id: string;
  plan_name: string;                 // "Aprender Python para Data Science"
  skill_name: string;                // "Python", "Excel Avançado"
  skill_category: SkillCategory;
  current_level: SkillLevel;
  target_level: SkillLevel;
  weekly_hours: number;              // 2, 5, 10
  deadline_weeks: number;            // 12, 24, 52
  deadline_date: string;             // "2026-06-14"
  motivation: StudyMotivation;
  is_active: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

// Study Plan Week
export interface StudyPlanWeek {
  id: string;
  plan_id: string;
  week_number: number;               // 1, 2, 3...
  title: string;                     // "Semana 1: Fundamentos de Python"
  focus: string;                     // "Variáveis, tipos de dados, operadores"
  estimated_hours: number;           // 4
  is_completed: boolean;
  completed_at: string | null;
  tasks: StudyTask[];
}

// Study Task
export interface StudyTask {
  id: string;
  week_id: string;
  description: string;               // "Assistir tutorial sobre funções"
  resource_type: ResourceType;
  resource_url: string;
  resource_title: string;            // "Python Functions - Corey Schafer"
  estimated_minutes: number;         // 45
  is_completed: boolean;
  completed_at: string | null;
}

// Milestone (Marco do Plano)
export interface StudyMilestone {
  id: string;
  plan_id: string;
  week_number: number;               // Semana em que ocorre
  title: string;                     // "Mini-projeto: Calculadora"
  description: string;
  deliverable: string;               // "Criar calculadora com 4 operações"
  is_completed: boolean;
  completed_at: string | null;
}

// Progress Tracking
export interface StudyProgress {
  plan_id: string;
  total_weeks: number;
  completed_weeks: number;
  current_week: number;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;       // 0-100
  total_hours_planned: number;
  hours_studied: number;
  streak_days: number;               // Dias consecutivos estudando
  last_study_date: string;
  on_track: boolean;                 // Se está dentro do prazo
  weeks_behind: number;              // Semanas de atraso (se houver)
}

// Generated Study Plan (Response da IA)
export interface GeneratedStudyPlan {
  id: string;
  profile_id: string;
  plan_summary: {
    total_weeks: number;
    estimated_completion: string;
    total_hours: number;
    main_topics: string[];
  };
  weeks: StudyPlanWeek[];
  milestones: StudyMilestone[];
  created_at: Date;
}

// Base Study Plan type that works for both original and enhanced plans
export interface BaseStudyPlan {
  id: string;
  profile_id: string;
  plan_summary: {
    total_weeks: number;
    estimated_completion: string;
    total_hours: number;
    main_topics: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weeks: any[]; // Using any[] to accommodate both StudyPlanWeek[] and EnhancedStudyPlanWeekData[]
  milestones: StudyMilestone[];
  created_at: Date;
}

// Study Plan Library Item (Saved Plan)
export interface StudyPlanLibraryItem {
  id: string;
  user_id: string;
  profile_id: string;
  version_name: string;              // "Python - Janeiro 2026"
  plan_data: BaseStudyPlan;          // Accepts both GeneratedStudyPlan and EnhancedGeneratedStudyPlan
  progress: StudyProgress;
  tags: string[];                    // ["Tecnologia", "Programação"]
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string | null;
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  step?: ConversationStep;
  timestamp: Date;
  isError?: boolean;
}

// Study Plan Generation Request (Para a IA)
export interface StudyPlanGenerationRequest {
  profile: StudyPlanProfile;
  user_context?: {
    current_resume_skills?: string[];  // Para integração com MyEasyResume
    target_job_role?: string;
  };
}

// Study Plan Data State
export interface StudyPlanData {
  profile: StudyPlanProfile | null;
  generatedPlan: GeneratedStudyPlan | null;
  progress: StudyProgress | null;
  currentStep: ConversationStep;
  conversationHistory: ChatMessage[];
}

// Create Study Plan Profile Input
export interface CreateStudyPlanProfileInput {
  skill_name: string;
  skill_category: SkillCategory;
  current_level: SkillLevel;
  target_level: SkillLevel;
  weekly_hours: number;
  deadline_weeks: number;
  motivation: StudyMotivation;
}

// ============================================================================
// D1 DATABASE TYPES
// ============================================================================

export interface D1StudyPlanProfile {
  id: string;
  user_id: string;
  plan_name: string;
  skill_name: string;
  skill_category: string;
  current_level: string;
  target_level: string;
  weekly_hours: number;
  deadline_weeks: number;
  deadline_date: string;
  motivation: string;
  is_active: number;
  is_favorite: number;
  created_at: string;
  updated_at: string | null;
}

export interface D1StudyPlanWeek {
  id: string;
  plan_id: string;
  week_number: number;
  title: string;
  focus: string;
  estimated_hours: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface D1StudyTask {
  id: string;
  week_id: string;
  description: string;
  resource_type: string;
  resource_url: string;
  resource_title: string;
  estimated_minutes: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}
