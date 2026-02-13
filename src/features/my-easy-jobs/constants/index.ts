import type { EmployerView } from '../types';

// ============================================================================
// EMPLOYER NAVIGATION
// ============================================================================

export interface EmployerNavigationItem {
  id: EmployerView;
  label: string;
  icon: string;
}

export const EMPLOYER_NAVIGATION: EmployerNavigationItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: 'LayoutDashboard' },
  { id: 'jobs', label: 'Vagas', icon: 'Briefcase' },
  { id: 'candidates', label: 'Candidatos', icon: 'Users' },
  { id: 'screening', label: 'Triagem IA', icon: 'Brain' },
];

// ============================================================================
// JOB STATUS LABELS
// ============================================================================

export const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  open: 'Aberta',
  paused: 'Pausada',
  closed: 'Encerrada',
  filled: 'Preenchida',
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  draft: 'text-slate-400 bg-slate-400/20',
  open: 'text-emerald-400 bg-emerald-400/20',
  paused: 'text-amber-400 bg-amber-400/20',
  closed: 'text-red-400 bg-red-400/20',
  filled: 'text-blue-400 bg-blue-400/20',
};

// ============================================================================
// JOB TYPE LABELS
// ============================================================================

export const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Tempo Integral',
  part_time: 'Meio Período',
  contract: 'Contrato',
  internship: 'Estágio',
  temporary: 'Temporário',
};

// ============================================================================
// EXPERIENCE LEVEL LABELS
// ============================================================================

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: 'Júnior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Líder/Tech Lead',
  executive: 'Executivo',
};

// ============================================================================
// WORK MODE LABELS
// ============================================================================

export const WORK_MODE_LABELS: Record<string, string> = {
  on_site: 'Presencial',
  remote: 'Remoto',
  hybrid: 'Híbrido',
};

// ============================================================================
// CANDIDATE STATUS LABELS
// ============================================================================

export const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  screening: 'Em Triagem',
  interview: 'Entrevista',
  offer: 'Proposta',
  hired: 'Contratado',
  rejected: 'Rejeitado',
};

export const CANDIDATE_STATUS_COLORS: Record<string, string> = {
  new: 'text-blue-400 bg-blue-400/20',
  screening: 'text-amber-400 bg-amber-400/20',
  interview: 'text-purple-400 bg-purple-400/20',
  offer: 'text-emerald-400 bg-emerald-400/20',
  hired: 'text-green-400 bg-green-400/20',
  rejected: 'text-red-400 bg-red-400/20',
};
