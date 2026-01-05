// =============================================
// MyEasyCRM - Deal Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1CrmDeal } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Deal, DealFormData, DealFilters, DealStage, Pipeline, PipelineColumn } from '../types';
import { DEAL_STAGES } from '../constants';

/**
 * Gets the current authenticated user ID.
 * Works with both Cloudflare and Supabase auth sources.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[DealService] User not authenticated');
}

/**
 * Converts D1 deal to frontend Deal type
 */
function mapD1ToDeal(d1Deal: D1CrmDeal): Deal {
  return {
    id: d1Deal.id,
    user_id: d1Deal.user_id,
    contact_id: d1Deal.contact_id,
    company_id: d1Deal.company_id,
    title: d1Deal.title,
    value: d1Deal.value,
    stage: d1Deal.stage as DealStage,
    probability: d1Deal.probability,
    expected_close_date: d1Deal.expected_close_date,
    actual_close_date: d1Deal.actual_close_date,
    lost_reason: d1Deal.lost_reason,
    source: d1Deal.source,
    notes: d1Deal.notes,
    products: d1Deal.products ? JSON.parse(d1Deal.products) : undefined,
    created_at: d1Deal.created_at,
    updated_at: d1Deal.updated_at,
    contact: d1Deal.contact || undefined,
    company: d1Deal.company || undefined,
  };
}

export const DealService = {
  /**
   * Busca todos os deals do usuário
   */
  async getAll(filters?: DealFilters): Promise<Deal[]> {
    const userId = await getCurrentUserId();

    // Get stage filter
    let stageFilter: string | undefined;
    if (filters?.stage) {
      stageFilter = Array.isArray(filters.stage) ? filters.stage[0] : filters.stage;
    }

    const result = await d1Client.getCrmDeals(userId, {
      stage: stageFilter,
      contact_id: filters?.contact_id,
      company_id: filters?.company_id,
    });

    if (result.error) {
      console.error('Error fetching deals:', result.error);
      throw new Error('Failed to fetch deals');
    }

    let deals = (result.data || []).map(mapD1ToDeal);

    // Apply additional filters client-side
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      deals = deals.filter((d) => d.title.toLowerCase().includes(searchLower));
    }

    if (filters?.stage && Array.isArray(filters.stage) && filters.stage.length > 1) {
      deals = deals.filter((d) => (filters.stage as DealStage[]).includes(d.stage));
    }

    if (filters?.min_value !== undefined) {
      const minValue = filters.min_value;
      deals = deals.filter((d) => d.value >= minValue);
    }

    if (filters?.max_value !== undefined) {
      const maxValue = filters.max_value;
      deals = deals.filter((d) => d.value <= maxValue);
    }

    if (filters?.expected_close_after) {
      const closeAfter = filters.expected_close_after;
      deals = deals.filter(
        (d) => d.expected_close_date && d.expected_close_date >= closeAfter
      );
    }

    if (filters?.expected_close_before) {
      const closeBefore = filters.expected_close_before;
      deals = deals.filter(
        (d) => d.expected_close_date && d.expected_close_date <= closeBefore
      );
    }

    return deals;
  },

  /**
   * Busca um deal por ID
   */
  async getById(id: string): Promise<Deal | null> {
    const result = await d1Client.getCrmDealById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('Error fetching deal:', result.error);
      throw new Error('Failed to fetch deal');
    }

    return result.data ? mapD1ToDeal(result.data) : null;
  },

  /**
   * Cria um novo deal
   */
  async create(data: DealFormData): Promise<Deal> {
    const userId = await getCurrentUserId();

    const stage = data.stage || 'lead';
    const probability = data.probability ?? DEAL_STAGES[stage].probability;

    const result = await d1Client.createCrmDeal({
      user_id: userId,
      title: data.title,
      value: data.value,
      stage,
      probability,
      contact_id: data.contact_id,
      company_id: data.company_id,
      expected_close_date: data.expected_close_date,
      source: data.source,
      notes: data.notes,
    });

    if (result.error || !result.data) {
      console.error('Error creating deal:', result.error);
      throw new Error('Failed to create deal');
    }

    return mapD1ToDeal(result.data);
  },

  /**
   * Atualiza um deal existente
   */
  async update(id: string, data: Partial<DealFormData>): Promise<Deal> {
    const result = await d1Client.updateCrmDeal(id, data as Partial<D1CrmDeal>);

    if (result.error || !result.data) {
      console.error('Error updating deal:', result.error);
      throw new Error('Failed to update deal');
    }

    return mapD1ToDeal(result.data);
  },

  /**
   * Move um deal para outro estágio
   */
  async moveToStage(id: string, stage: DealStage, lostReason?: string): Promise<Deal> {
    const updateData: Partial<DealFormData> & { lost_reason?: string } = {
      stage,
      probability: DEAL_STAGES[stage].probability,
    };

    if (stage === 'closed_lost' && lostReason) {
      updateData.lost_reason = lostReason;
    }

    return this.update(id, updateData);
  },

  /**
   * Deleta um deal
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteCrmDeal(id);

    if (result.error) {
      console.error('Error deleting deal:', result.error);
      throw new Error('Failed to delete deal');
    }
  },

  /**
   * Busca deals para o Pipeline (Kanban)
   */
  async getPipeline(): Promise<Pipeline> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmPipeline(userId);

    if (result.error || !result.data) {
      console.error('Error fetching pipeline:', result.error);
      throw new Error('Failed to fetch pipeline');
    }

    // Map the columns with proper labels
    const columns: PipelineColumn[] = result.data.columns.map((col) => ({
      id: col.id as DealStage,
      title: DEAL_STAGES[col.id as DealStage]?.label || col.id,
      deals: col.deals.map(mapD1ToDeal),
      total_value: col.total_value,
      count: col.count,
    }));

    return {
      columns,
      total_value: result.data.total_value,
      total_deals: result.data.total_deals,
    };
  },

  /**
   * Busca deals por contato
   */
  async getByContact(contactId: string): Promise<Deal[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmDeals(userId, { contact_id: contactId });

    if (result.error) {
      console.error('Error fetching deals by contact:', result.error);
      throw new Error('Failed to fetch deals by contact');
    }

    return (result.data || []).map(mapD1ToDeal);
  },

  /**
   * Busca deals por empresa
   */
  async getByCompany(companyId: string): Promise<Deal[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmDeals(userId, { company_id: companyId });

    if (result.error) {
      console.error('Error fetching deals by company:', result.error);
      throw new Error('Failed to fetch deals by company');
    }

    return (result.data || []).map(mapD1ToDeal);
  },

  /**
   * Calcula métricas do pipeline
   */
  async getMetrics(): Promise<{
    total_value: number;
    weighted_value: number;
    open_deals: number;
    won_this_month: number;
    lost_this_month: number;
    revenue_this_month: number;
  }> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmMetrics(userId);

    if (result.error || !result.data) {
      console.error('Error fetching metrics:', result.error);
      throw new Error('Failed to fetch metrics');
    }

    return result.data;
  },

  /**
   * Conta total de deals
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.countCrmDeals(userId);

    if (result.error) {
      console.error('Error counting deals:', result.error);
      throw new Error('Failed to count deals');
    }

    return result.data?.count || 0;
  },
};
