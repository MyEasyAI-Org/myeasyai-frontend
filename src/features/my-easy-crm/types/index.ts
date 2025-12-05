// =============================================
// MyEasyCRM - Tipos TypeScript
// =============================================

// =============================================
// CONTATO
// =============================================
export interface Contact {
  id: string;
  user_id: string;
  company_id?: string;
  company?: Company;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  role?: string;
  tags: string[];
  notes?: string;
  lead_source?: LeadSource;
  source?: LeadSource;
  birth_date?: string;
  address?: string;
  linkedin?: string;
  instagram?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company_id?: string;
  position?: string;
  role?: string;
  tags?: string[];
  notes?: string;
  lead_source?: LeadSource;
  source?: LeadSource;
  birth_date?: string;
  address?: string;
  linkedin?: string;
  instagram?: string;
}

// =============================================
// EMPRESA
// =============================================
export interface Company {
  id: string;
  user_id: string;
  name: string;
  cnpj?: string;
  segment?: IndustryType;
  industry?: IndustryType;
  size?: CompanySize;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  notes?: string;
  contacts_count?: number;
  deals_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  name: string;
  cnpj?: string;
  segment?: IndustryType;
  industry?: IndustryType;
  size?: CompanySize;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  notes?: string;
}

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

// =============================================
// DEAL / OPORTUNIDADE
// =============================================
export interface Deal {
  id: string;
  user_id: string;
  contact_id: string;
  contact?: Contact;
  company_id?: string;
  company?: Company;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  lost_reason?: string;
  source?: LeadSource;
  notes?: string;
  products: string[];
  created_at: string;
  updated_at: string;
}

export interface DealFormData {
  title: string;
  value: number;
  contact_id?: string;
  company_id?: string;
  stage?: DealStage;
  probability?: number;
  expected_close_date?: string;
  source?: LeadSource;
  notes?: string;
  products?: string[];
}

export type DealStage =
  | 'lead'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

// =============================================
// TAREFA
// =============================================
export interface Task {
  id: string;
  user_id: string;
  contact_id?: string;
  contact?: Contact;
  deal_id?: string;
  deal?: Deal;
  title: string;
  description?: string;
  due_date: string;
  type: TaskType;
  priority: TaskPriority;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  due_date: string;
  type: TaskType;
  priority?: TaskPriority;
  contact_id?: string;
  deal_id?: string;
}

export type TaskType = 'call' | 'email' | 'meeting' | 'visit' | 'follow_up' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// =============================================
// ATIVIDADE
// =============================================
export interface Activity {
  id: string;
  user_id: string;
  contact_id?: string;
  contact?: Contact;
  deal_id?: string;
  deal?: Deal;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ActivityFormData {
  type: ActivityType;
  description: string;
  contact_id?: string;
  deal_id?: string;
  incoming?: boolean;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | 'call'
  | 'email'
  | 'call_made'
  | 'call_received'
  | 'email_sent'
  | 'email_received'
  | 'meeting'
  | 'note'
  | 'deal_created'
  | 'deal_moved'
  | 'deal_won'
  | 'deal_lost'
  | 'task_completed';

// Simple types for user forms
export type UserActivityType = 'call' | 'email' | 'meeting' | 'note';

// =============================================
// ENUMS E CONSTANTES DE TIPO
// =============================================
export type LeadSource =
  | 'website'
  | 'referral'
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'google'
  | 'event'
  | 'cold_call'
  | 'email_campaign'
  | 'other';

export type IndustryType =
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'retail'
  | 'manufacturing'
  | 'services'
  | 'construction'
  | 'food'
  | 'logistics'
  | 'marketing'
  | 'legal'
  | 'consulting'
  | 'real_estate'
  | 'other';

// =============================================
// MÉTRICAS E DASHBOARD
// =============================================
export interface CRMMetrics {
  total_contacts: number;
  new_contacts_this_month: number;
  total_companies: number;
  total_deals: number;
  open_deals: number;
  pipeline_value: number;
  weighted_pipeline_value: number;
  deals_won_this_month: number;
  deals_lost_this_month: number;
  revenue_won_this_month: number;
  conversion_rate: number;
  average_deal_value: number;
  average_closing_time: number;
  deals_by_stage: Record<DealStage, number>;
  pending_tasks: number;
  overdue_tasks: number;
}

export interface RevenueByMonth {
  month: string;
  value: number;
  deals_count: number;
}

// =============================================
// FILTROS E BUSCA
// =============================================
export interface ContactFilters {
  search?: string;
  company_id?: string;
  tags?: string[];
  lead_source?: LeadSource;
  source?: LeadSource;
  created_after?: string;
  created_before?: string;
}

export interface DealFilters {
  search?: string;
  stage?: DealStage | DealStage[];
  contact_id?: string;
  company_id?: string;
  min_value?: number;
  max_value?: number;
  expected_close_after?: string;
  expected_close_before?: string;
}

export interface TaskFilters {
  search?: string;
  type?: TaskType;
  priority?: TaskPriority;
  completed?: boolean;
  overdue?: boolean;
  contact_id?: string;
  deal_id?: string;
  due_after?: string;
  due_before?: string;
}

// =============================================
// PIPELINE (KANBAN)
// =============================================
export interface PipelineColumn {
  id: DealStage;
  title: string;
  deals: Deal[];
  total_value: number;
  count: number;
}

export interface Pipeline {
  columns: PipelineColumn[];
  total_value: number;
  total_deals: number;
}

// =============================================
// NAVEGAÇÃO DO CRM
// =============================================
export type CRMView =
  | 'dashboard'
  | 'contacts'
  | 'contact-detail'
  | 'companies'
  | 'company-detail'
  | 'deals'
  | 'deal-detail'
  | 'tasks'
  | 'activities';

export interface CRMNavigationItem {
  id: CRMView;
  label: string;
  icon: string;
  count?: number;
}
