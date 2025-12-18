// =============================================
// MyEasyCRM - useTasks Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { TaskService } from '../services';
import type { Task, TaskFormData, TaskFilters } from '../types';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<Task>;
  uncompleteTask: (id: string) => Promise<Task>;
  setFilters: (filters: TaskFilters) => void;
  filters: TaskFilters;
}

export function useTasks(initialFilters?: TaskFilters): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await TaskService.getAll(filters);
      setTasks(data);
      setTotalCount(data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar tarefas';
      setError(message);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: TaskFormData): Promise<Task> => {
    const task = await TaskService.create(data);
    setTasks((prev) => [task, ...prev].sort((a, b) =>
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    ));
    setTotalCount((prev) => prev + 1);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<TaskFormData>): Promise<Task> => {
    const updated = await TaskService.update(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await TaskService.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTotalCount((prev) => prev - 1);
  }, []);

  const completeTask = useCallback(async (id: string): Promise<Task> => {
    const updated = await TaskService.complete(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const uncompleteTask = useCallback(async (id: string): Promise<Task> => {
    const updated = await TaskService.uncomplete(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  return {
    tasks,
    isLoading,
    error,
    totalCount,
    refresh: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    setFilters,
    filters,
  };
}

// Hook para tarefas pendentes
export function usePendingTasks(): {
  tasks: Task[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  completeTask: (id: string) => Promise<Task>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TaskService.getPending();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completeTask = useCallback(async (id: string): Promise<Task> => {
    const updated = await TaskService.complete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return updated;
  }, []);

  return {
    tasks,
    isLoading,
    refresh: fetchTasks,
    completeTask,
  };
}

// Hook para tarefas de hoje
export function useTodayTasks(): {
  tasks: Task[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TaskService.getToday();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching today tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    refresh: fetchTasks,
  };
}

// Hook para tarefas atrasadas
export function useOverdueTasks(): {
  tasks: Task[];
  isLoading: boolean;
  count: number;
  refresh: () => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TaskService.getOverdue();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching overdue tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    count: tasks.length,
    refresh: fetchTasks,
  };
}

// Hook para contadores de tarefas
export function useTaskCounts(): {
  pending: number;
  overdue: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [pending, setPending] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingCount, overdueCount] = await Promise.all([
        TaskService.countPending(),
        TaskService.countOverdue(),
      ]);
      setPending(pendingCount);
      setOverdue(overdueCount);
    } catch (err) {
      console.error('Error fetching task counts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    pending,
    overdue,
    isLoading,
    refresh: fetchCounts,
  };
}
