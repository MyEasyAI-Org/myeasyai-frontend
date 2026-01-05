// =============================================
// MyEasyCRM - Activity Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1CrmActivity } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Activity, ActivityFormData, ActivityType } from '../types';

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

  throw new Error('[ActivityService] User not authenticated');
}

/**
 * Converts D1 activity to frontend Activity type
 */
function mapD1ToActivity(d1Activity: D1CrmActivity): Activity {
  return {
    id: d1Activity.id,
    user_id: d1Activity.user_id,
    contact_id: d1Activity.contact_id,
    deal_id: d1Activity.deal_id,
    type: d1Activity.type as ActivityType,
    description: d1Activity.description,
    metadata: d1Activity.metadata ? JSON.parse(d1Activity.metadata) : undefined,
    created_at: d1Activity.created_at,
    contact: d1Activity.contact || undefined,
    deal: d1Activity.deal || undefined,
  };
}

export const ActivityService = {
  /**
   * Busca todas as atividades do usuário
   */
  async getAll(limit = 50): Promise<Activity[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmActivities(userId, { limit });

    if (result.error) {
      console.error('Error fetching activities:', result.error);
      throw new Error('Failed to fetch activities');
    }

    return (result.data || []).map(mapD1ToActivity);
  },

  /**
   * Busca uma atividade por ID
   */
  async getById(id: string): Promise<Activity | null> {
    const result = await d1Client.getCrmActivityById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('Error fetching activity:', result.error);
      throw new Error('Failed to fetch activity');
    }

    return result.data ? mapD1ToActivity(result.data) : null;
  },

  /**
   * Cria uma nova atividade
   */
  async create(data: ActivityFormData): Promise<Activity> {
    const userId = await getCurrentUserId();

    const result = await d1Client.createCrmActivity({
      user_id: userId,
      type: data.type,
      description: data.description,
      contact_id: data.contact_id,
      deal_id: data.deal_id,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });

    if (result.error || !result.data) {
      console.error('Error creating activity:', result.error);
      throw new Error('Failed to create activity');
    }

    return mapD1ToActivity(result.data);
  },

  /**
   * Deleta uma atividade
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteCrmActivity(id);

    if (result.error) {
      console.error('Error deleting activity:', result.error);
      throw new Error('Failed to delete activity');
    }
  },

  /**
   * Busca atividades por contato
   */
  async getByContact(contactId: string, limit = 20): Promise<Activity[]> {
    const result = await d1Client.getCrmActivitiesByContact(contactId, limit);

    if (result.error) {
      console.error('Error fetching activities by contact:', result.error);
      throw new Error('Failed to fetch contact activities');
    }

    return (result.data || []).map(mapD1ToActivity);
  },

  /**
   * Busca atividades por deal
   */
  async getByDeal(dealId: string, limit = 20): Promise<Activity[]> {
    const result = await d1Client.getCrmActivitiesByDeal(dealId, limit);

    if (result.error) {
      console.error('Error fetching activities by deal:', result.error);
      throw new Error('Failed to fetch deal activities');
    }

    return (result.data || []).map(mapD1ToActivity);
  },

  /**
   * Busca atividades por tipo
   */
  async getByType(type: ActivityType, limit = 20): Promise<Activity[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmActivities(userId, { type, limit });

    if (result.error) {
      console.error('Error fetching activities by type:', result.error);
      throw new Error('Failed to fetch activities by type');
    }

    return (result.data || []).map(mapD1ToActivity);
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
    const userId = await getCurrentUserId();
    const result = await d1Client.countCrmActivities(userId, startDate, endDate);

    if (result.error) {
      console.error('Error counting activities:', result.error);
      throw new Error('Failed to count activities');
    }

    return result.data?.count || 0;
  },

  /**
   * Busca estatísticas de atividades
   */
  async getStats(): Promise<Record<ActivityType, number>> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmActivityStats(userId);

    if (result.error) {
      console.error('Error fetching activity stats:', result.error);
      throw new Error('Failed to fetch activity statistics');
    }

    return (result.data || {}) as Record<ActivityType, number>;
  },
};
