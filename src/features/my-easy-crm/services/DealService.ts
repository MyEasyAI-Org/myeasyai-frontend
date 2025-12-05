// =============================================
// MyEasyCRM - Deal Service
// =============================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Deal, DealFormData, DealFilters, DealStage, Pipeline, PipelineColumn } from '../types';
import { DEAL_STAGES, OPEN_DEAL_STAGES } from '../constants';

const TABLE_NAME = 'crm_deals';

export const DealService = {
  /**
   * Busca todos os deals do usuário
   */
  async getAll(filters?: DealFilters): Promise<Deal[]> {
    let query = supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email, phone),
        company:crm_companies(id, name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.stage) {
      if (Array.isArray(filters.stage)) {
        query = query.in('stage', filters.stage);
      } else {
        query = query.eq('stage', filters.stage);
      }
    }

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.min_value !== undefined) {
      query = query.gte('value', filters.min_value);
    }

    if (filters?.max_value !== undefined) {
      query = query.lte('value', filters.max_value);
    }

    if (filters?.expected_close_after) {
      query = query.gte('expected_close_date', filters.expected_close_after);
    }

    if (filters?.expected_close_before) {
      query = query.lte('expected_close_date', filters.expected_close_before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching deals:', error);
      throw new Error('Erro ao buscar deals');
    }

    return data || [];
  },

  /**
   * Busca um deal por ID
   */
  async getById(id: string): Promise<Deal | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email, phone, mobile, position),
        company:crm_companies(id, name, industry, website)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching deal:', error);
      throw new Error('Erro ao buscar deal');
    }

    return data;
  },

  /**
   * Cria um novo deal
   */
  async create(data: DealFormData): Promise<Deal> {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const stage = data.stage || 'lead';
    const probability = data.probability ?? DEAL_STAGES[stage].probability;

    const { data: deal, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...data,
        user_id: user.user.id,
        stage,
        probability,
        products: data.products || [],
      })
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        company:crm_companies(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      throw new Error('Erro ao criar deal');
    }

    return deal;
  },

  /**
   * Atualiza um deal existente
   */
  async update(id: string, data: Partial<DealFormData>): Promise<Deal> {
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Se mudou o estágio para fechado, registra a data
    if (data.stage === 'closed_won' || data.stage === 'closed_lost') {
      updateData.actual_close_date = new Date().toISOString().split('T')[0];
    }

    const { data: deal, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        company:crm_companies(id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      throw new Error('Erro ao atualizar deal');
    }

    return deal;
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
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deal:', error);
      throw new Error('Erro ao deletar deal');
    }
  },

  /**
   * Busca deals para o Pipeline (Kanban)
   */
  async getPipeline(): Promise<Pipeline> {
    const { data: deals, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        company:crm_companies(id, name)
      `)
      .in('stage', OPEN_DEAL_STAGES)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pipeline:', error);
      throw new Error('Erro ao buscar pipeline');
    }

    // Organizar deals por estágio
    const columns: PipelineColumn[] = OPEN_DEAL_STAGES.map((stage) => {
      const stageDeals = (deals || []).filter((d) => d.stage === stage);
      const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

      return {
        id: stage,
        title: DEAL_STAGES[stage].label,
        deals: stageDeals,
        total_value: totalValue,
        count: stageDeals.length,
      };
    });

    const totalValue = columns.reduce((sum, col) => sum + col.total_value, 0);
    const totalDeals = columns.reduce((sum, col) => sum + col.count, 0);

    return {
      columns,
      total_value: totalValue,
      total_deals: totalDeals,
    };
  },

  /**
   * Busca deals por contato
   */
  async getByContact(contactId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        company:crm_companies(id, name)
      `)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals by contact:', error);
      throw new Error('Erro ao buscar deals do contato');
    }

    return data || [];
  },

  /**
   * Busca deals por empresa
   */
  async getByCompany(companyId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals by company:', error);
      throw new Error('Erro ao buscar deals da empresa');
    }

    return data || [];
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
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Deals abertos
    const { data: openDeals } = await supabase
      .from(TABLE_NAME)
      .select('value, probability')
      .in('stage', OPEN_DEAL_STAGES);

    // Deals fechados este mês
    const { data: closedDeals } = await supabase
      .from(TABLE_NAME)
      .select('value, stage')
      .in('stage', ['closed_won', 'closed_lost'])
      .gte('actual_close_date', startOfMonth.toISOString());

    const totalValue = (openDeals || []).reduce((sum, d) => sum + (d.value || 0), 0);
    const weightedValue = (openDeals || []).reduce(
      (sum, d) => sum + ((d.value || 0) * (d.probability || 0)) / 100,
      0
    );

    const wonThisMonth = (closedDeals || []).filter((d) => d.stage === 'closed_won').length;
    const lostThisMonth = (closedDeals || []).filter((d) => d.stage === 'closed_lost').length;
    const revenueThisMonth = (closedDeals || [])
      .filter((d) => d.stage === 'closed_won')
      .reduce((sum, d) => sum + (d.value || 0), 0);

    return {
      total_value: totalValue,
      weighted_value: weightedValue,
      open_deals: (openDeals || []).length,
      won_this_month: wonThisMonth,
      lost_this_month: lostThisMonth,
      revenue_this_month: revenueThisMonth,
    };
  },

  /**
   * Conta total de deals
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting deals:', error);
      throw new Error('Erro ao contar deals');
    }

    return count || 0;
  },
};
