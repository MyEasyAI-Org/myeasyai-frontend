// =============================================
// MyEasyCRM - Task Service
// =============================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Task, TaskFormData, TaskFilters } from '../types';

const TABLE_NAME = 'crm_tasks';

export const TaskService = {
  /**
   * Busca todas as tarefas do usuário
   */
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    let query = supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .order('due_date', { ascending: true });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.due_after) {
      query = query.gte('due_date', filters.due_after);
    }

    if (filters?.due_before) {
      query = query.lte('due_date', filters.due_before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }

    return data || [];
  },

  /**
   * Busca uma tarefa por ID
   */
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email, phone),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }

    return data;
  },

  /**
   * Cria uma nova tarefa
   */
  async create(data: TaskFormData): Promise<Task> {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error('[TaskService] User not authenticated');
    }

    const { data: task, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...data,
        user_id: user.user.id,
        priority: data.priority || 'medium',
        completed: false,
      })
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }

    return task;
  },

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const { data: task, error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('id', id)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }

    return task;
  },

  /**
   * Marca tarefa como concluída
   */
  async complete(id: string): Promise<Task> {
    const { data: task, error } = await supabase
      .from(TABLE_NAME)
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .single();

    if (error) {
      console.error('Error completing task:', error);
      throw new Error('Failed to complete task');
    }

    return task;
  },

  /**
   * Marca tarefa como não concluída
   */
  async uncomplete(id: string): Promise<Task> {
    const { data: task, error } = await supabase
      .from(TABLE_NAME)
      .update({
        completed: false,
        completed_at: null,
      })
      .eq('id', id)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .single();

    if (error) {
      console.error('Error uncompleting task:', error);
      throw new Error('Failed to reopen task');
    }

    return task;
  },

  /**
   * Deleta uma tarefa
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },

  /**
   * Busca tarefas pendentes (não concluídas)
   */
  async getPending(): Promise<Task[]> {
    return this.getAll({ completed: false });
  },

  /**
   * Busca tarefas atrasadas
   */
  async getOverdue(): Promise<Task[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('completed', false)
      .lt('due_date', now)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching overdue tasks:', error);
      throw new Error('Failed to fetch overdue tasks');
    }

    return data || [];
  },

  /**
   * Busca tarefas de hoje
   */
  async getToday(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('completed', false)
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching today tasks:', error);
      throw new Error('Failed to fetch today tasks');
    }

    return data || [];
  },

  /**
   * Busca tarefas desta semana
   */
  async getThisWeek(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        contact:crm_contacts(id, name, email),
        deal:crm_deals(id, title, value, stage)
      `)
      .eq('completed', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', endOfWeek.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching this week tasks:', error);
      throw new Error('Failed to fetch this week tasks');
    }

    return data || [];
  },

  /**
   * Busca tarefas por contato
   */
  async getByContact(contactId: string): Promise<Task[]> {
    return this.getAll({ contact_id: contactId });
  },

  /**
   * Busca tarefas por deal
   */
  async getByDeal(dealId: string): Promise<Task[]> {
    return this.getAll({ deal_id: dealId });
  },

  /**
   * Conta tarefas pendentes
   */
  async countPending(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('completed', false);

    if (error) {
      console.error('Error counting pending tasks:', error);
      throw new Error('Failed to count pending tasks');
    }

    return count || 0;
  },

  /**
   * Conta tarefas atrasadas
   */
  async countOverdue(): Promise<number> {
    const now = new Date().toISOString();

    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('completed', false)
      .lt('due_date', now);

    if (error) {
      console.error('Error counting overdue tasks:', error);
      throw new Error('Failed to count overdue tasks');
    }

    return count || 0;
  },
};
