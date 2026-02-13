// ============================================================================
// JOB POSTING TYPES
// ============================================================================

export type JobStatus = 'draft' | 'open' | 'paused' | 'closed' | 'filled';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

export type WorkMode = 'on_site' | 'remote' | 'hybrid';

export interface JobPosting {
  id: string;
  user_id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  department?: string;
  location?: string;
  work_mode: WorkMode;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  skills_required: string[];
  skills_preferred: string[];
  benefits: string[];
  status: JobStatus;
  applications_count: number;
  created_at: string;
  updated_at: string;
  closes_at?: string;
}

export interface JobPostingFormData {
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  department?: string;
  location?: string;
  work_mode?: WorkMode;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  skills_required?: string[];
  skills_preferred?: string[];
  benefits?: string[];
  status?: JobStatus;
  closes_at?: string;
}

export interface JobPostingFilters {
  search?: string;
  status?: JobStatus;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
}

// ============================================================================
// CANDIDATE TYPES
// ============================================================================

export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export type ScreeningScore = 'excellent' | 'good' | 'average' | 'below_average' | 'poor';

export interface Candidate {
  id: string;
  user_id: string;
  job_id: string;
  name: string;
  email: string;
  phone?: string;
  resume_data?: string;
  resume_file_url?: string;
  cover_letter?: string;
  status: CandidateStatus;
  screening_score?: number;
  screening_grade?: ScreeningScore;
  ai_notes?: string;
  recruiter_notes?: string;
  tags: string[];
  applied_at: string;
  updated_at: string;
}

export interface CandidateFilters {
  search?: string;
  job_id?: string;
  status?: CandidateStatus;
  min_score?: number;
  max_score?: number;
}

// ============================================================================
// SCREENING & ANALYSIS TYPES
// ============================================================================

export interface ScreeningResult {
  candidate_id: string;
  job_id: string;
  overall_score: number;
  grade: ScreeningScore;
  skills_match: { skill: string; matched: boolean; notes: string }[];
  experience_match: { score: number; notes: string };
  education_match: { score: number; notes: string };
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  generated_at: string;
}

// ============================================================================
// METRICS TYPES
// ============================================================================

export interface EmployerMetrics {
  total_jobs: number;
  open_jobs: number;
  total_candidates: number;
  new_candidates_this_week: number;
  average_screening_score: number;
  candidates_by_status: Record<CandidateStatus, number>;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export type EmployerView = 'overview' | 'jobs' | 'candidates' | 'screening';
