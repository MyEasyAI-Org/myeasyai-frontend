// =============================================
// MyEasyCRM - Activity Service
// =============================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Activity, ActivityFormData, ActivityType } from '../types';

const TABLE_NAME = 'crm_activities';

export const ActivityService = {
  /**
   * Busca todas as atividades do usuário
   */
  async getAll(limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }

    return data || [];
  },

  /**
   * Busca uma atividade por ID
   */
  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }

    return data;
  },

  /**
   * Cria uma nova atividade
   */
  async create(data: ActivityFormData): Promise<Activity> {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error('[ActivityService] User not authenticated');
    }

    const { data: activity, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...data,
        user_id: user.user.id,
      })
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }

    return activity;
  },

  /**
   * Deleta uma atividade
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity:', error);
      throw new Error('Failed to delete activity');
    }
  },

  /**
   * Busca atividades por contato
   */
  async getByContact(contactId: string, limit = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities by contact:', error);
      throw new Error('Failed to fetch contact activities');
    }

    return data || [];
  },

  /**
   * Busca atividades por deal
   */
  async getByDeal(dealId: string, limit = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email)
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities by deal:', error);
      throw new Error('Failed to fetch deal activities');
    }

    return data || [];
  },

  /**
   * Busca atividades por tipo
   */
  async getByType(type: ActivityType, limit = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities by type:', error);
      throw new Error('Failed to fetch activities by type');
    }

    return data || [];
  },

  /**
   * Busca atividades recentes
   */
  async getRecent(limit = 10): Promise<Activity[]> {
    return this.getAll(limit);
  },

  /**
   * Registra uma ligação
   */
  async logCall(
    contactId: string,
    description: string,
    incoming = false,
    dealId?: string
  ): Promise<Activity> {
    return this.create({
      type: incoming ? 'call_received' : 'call_made',
      description,
      contact_id: contactId,
      deal_id: dealId,
    });
  },

  /**
   * Registra um email
   */
  async logEmail(
    contactId: string,
    description: string,
    incoming = false,
    dealId?: string
  ): Promise<Activity> {
    return this.create({
      type: incoming ? 'email_received' : 'email_sent',
      description,
      contact_id: contactId,
      deal_id: dealId,
    });
  },

  /**
   * Registra uma reunião
   */
  async logMeeting(
    contactId: string,
    description: string,
    dealId?: string
  ): Promise<Activity> {
    return this.create({
      type: 'meeting',
      description,
      contact_id: contactId,
      deal_id: dealId,
    });
  },

  /**
   * Registra uma nota
   */
  async logNote(
    description: string,
    contactId?: string,
    dealId?: string
  ): Promise<Activity> {
    return this.create({
      type: 'note',
      description,
      contact_id: contactId,
      deal_id: dealId,
    });
  },

  /**
   * Conta atividades por período
   */
  async countByPeriod(startDate: string, endDate: string): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('Error counting activities:', error);
      throw new Error('Failed to count activities');
    }

    return count || 0;
  },

  /**
   * Busca estatísticas de atividades
   */
  async getStats(): Promise<Record<ActivityType, number>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('type');

    if (error) {
      console.error('Error fetching activity stats:', error);
      throw new Error('Failed to fetch activity statistics');
    }

    const stats: Record<string, number> = {};
    (data || []).forEach((activity) => {
      stats[activity.type] = (stats[activity.type] || 0) + 1;
    });

    return stats as Record<ActivityType, number>;
  },
};
