// =============================================
// MyEasyCRM - Task Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1CrmTask } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Task, TaskFormData, TaskFilters } from '../types';

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

  throw new Error('[TaskService] User not authenticated');
}

/** Helper to convert null to undefined */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Converts D1 task to frontend Task type
 */
function mapD1ToTask(d1Task: D1CrmTask): Task {
  return {
    id: d1Task.id,
    user_id: d1Task.user_id,
    contact_id: nullToUndefined(d1Task.contact_id),
    deal_id: nullToUndefined(d1Task.deal_id),
    title: d1Task.title,
    description: nullToUndefined(d1Task.description),
    due_date: d1Task.due_date,
    type: d1Task.type as Task['type'],
    priority: d1Task.priority as Task['priority'],
    completed: d1Task.completed,
    completed_at: nullToUndefined(d1Task.completed_at),
    created_at: d1Task.created_at ?? new Date().toISOString(),
    contact: undefined, // Contact relation handled separately if needed
    deal: undefined, // Deal relation handled separately if needed
  };
}

export const TaskService = {
  /**
   * Busca todas as tarefas do usuário
   */
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmTasks(userId, {
      completed: filters?.completed,
      type: filters?.type,
      priority: filters?.priority,
      contact_id: filters?.contact_id,
      deal_id: filters?.deal_id,
    });

    if (result.error) {
      console.error('Error fetching tasks:', result.error);
      throw new Error('Failed to fetch tasks');
    }

    let tasks = (result.data || []).map(mapD1ToTask);

    // Apply additional filters client-side
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(searchLower));
    }

    if (filters?.due_after) {
      const dueAfter = filters.due_after;
      tasks = tasks.filter((t) => t.due_date >= dueAfter);
    }

    if (filters?.due_before) {
      const dueBefore = filters.due_before;
      tasks = tasks.filter((t) => t.due_date <= dueBefore);
    }

    return tasks;
  },

  /**
   * Busca uma tarefa por ID
   */
  async getById(id: string): Promise<Task | null> {
    const result = await d1Client.getCrmTaskById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('Error fetching task:', result.error);
      throw new Error('Failed to fetch task');
    }

    return result.data ? mapD1ToTask(result.data) : null;
  },

  /**
   * Cria uma nova tarefa
   */
  async create(data: TaskFormData): Promise<Task> {
    const userId = await getCurrentUserId();

    const result = await d1Client.createCrmTask({
      user_id: userId,
      title: data.title,
      due_date: data.due_date,
      contact_id: data.contact_id,
      deal_id: data.deal_id,
      description: data.description,
      type: data.type,
      priority: data.priority,
    });

    if (result.error || !result.data) {
      console.error('Error creating task:', result.error);
      throw new Error('Failed to create task');
    }

    return mapD1ToTask(result.data);
  },

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const result = await d1Client.updateCrmTask(id, data as Partial<D1CrmTask>);

    if (result.error || !result.data) {
      console.error('Error updating task:', result.error);
      throw new Error('Failed to update task');
    }

    return mapD1ToTask(result.data);
  },

  /**
   * Marca tarefa como concluída
   */
  async complete(id: string): Promise<Task> {
    const result = await d1Client.completeCrmTask(id);

    if (result.error || !result.data) {
      console.error('Error completing task:', result.error);
      throw new Error('Failed to complete task');
    }

    return mapD1ToTask(result.data);
  },

  /**
   * Marca tarefa como não concluída
   */
  async uncomplete(id: string): Promise<Task> {
    const result = await d1Client.uncompleteCrmTask(id);

    if (result.error || !result.data) {
      console.error('Error uncompleting task:', result.error);
      throw new Error('Failed to reopen task');
    }

    return mapD1ToTask(result.data);
  },

  /**
   * Deleta uma tarefa
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteCrmTask(id);

    if (result.error) {
      console.error('Error deleting task:', result.error);
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
    const userId = await getCurrentUserId();
    const result = await d1Client.getOverdueCrmTasks(userId);

    if (result.error) {
      console.error('Error fetching overdue tasks:', result.error);
      throw new Error('Failed to fetch overdue tasks');
    }

    return (result.data || []).map(mapD1ToTask);
  },

  /**
   * Busca tarefas de hoje
   */
  async getToday(): Promise<Task[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getTodayCrmTasks(userId);

    if (result.error) {
      console.error('Error fetching today tasks:', result.error);
      throw new Error('Failed to fetch today tasks');
    }

    return (result.data || []).map(mapD1ToTask);
  },

  /**
   * Busca tarefas desta semana
   */
  async getThisWeek(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    return this.getAll({
      completed: false,
      due_after: today.toISOString(),
      due_before: endOfWeek.toISOString(),
    });
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
    const userId = await getCurrentUserId();
    const result = await d1Client.countPendingCrmTasks(userId);

    if (result.error) {
      console.error('Error counting pending tasks:', result.error);
      throw new Error('Failed to count pending tasks');
    }

    return result.data?.count || 0;
  },

  /**
   * Conta tarefas atrasadas
   */
  async countOverdue(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.countOverdueCrmTasks(userId);

    if (result.error) {
      console.error('Error counting overdue tasks:', result.error);
      throw new Error('Failed to count overdue tasks');
    }

    return result.data?.count || 0;
  },
};
