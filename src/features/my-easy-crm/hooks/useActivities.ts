// =============================================
// MyEasyCRM - useActivities Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { ActivityService } from '../services';
import type { Activity, ActivityFormData, ActivityType } from '../types';

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createActivity: (data: ActivityFormData) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  logCall: (contactId: string, description: string, incoming?: boolean, dealId?: string) => Promise<Activity>;
  logEmail: (contactId: string, description: string, incoming?: boolean, dealId?: string) => Promise<Activity>;
  logMeeting: (contactId: string, description: string, dealId?: string) => Promise<Activity>;
  logNote: (description: string, contactId?: string, dealId?: string) => Promise<Activity>;
}

export function useActivities(limit = 50): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await ActivityService.getAll(limit);
      setActivities(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar atividades';
      setError(message);
      console.error('Error fetching activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const createActivity = useCallback(async (data: ActivityFormData): Promise<Activity> => {
    const activity = await ActivityService.create(data);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    await ActivityService.delete(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const logCall = useCallback(async (
    contactId: string,
    description: string,
    incoming = false,
    dealId?: string
  ): Promise<Activity> => {
    const activity = await ActivityService.logCall(contactId, description, incoming, dealId);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const logEmail = useCallback(async (
    contactId: string,
    description: string,
    incoming = false,
    dealId?: string
  ): Promise<Activity> => {
    const activity = await ActivityService.logEmail(contactId, description, incoming, dealId);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const logMeeting = useCallback(async (
    contactId: string,
    description: string,
    dealId?: string
  ): Promise<Activity> => {
    const activity = await ActivityService.logMeeting(contactId, description, dealId);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const logNote = useCallback(async (
    description: string,
    contactId?: string,
    dealId?: string
  ): Promise<Activity> => {
    const activity = await ActivityService.logNote(description, contactId, dealId);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities,
    createActivity,
    deleteActivity,
    logCall,
    logEmail,
    logMeeting,
    logNote,
  };
}

// Hook para atividades de um contato
export function useContactActivities(contactId: string | null, limit = 20): {
  activities: Activity[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!contactId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ActivityService.getByContact(contactId, limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching contact activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contactId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    refresh: fetchActivities,
  };
}

// Hook para atividades de um deal
export function useDealActivities(dealId: string | null, limit = 20): {
  activities: Activity[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!dealId) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ActivityService.getByDeal(dealId, limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching deal activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dealId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    refresh: fetchActivities,
  };
}

// Hook para atividades recentes
export function useRecentActivities(limit = 10): {
  activities: Activity[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ActivityService.getRecent(limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    refresh: fetchActivities,
  };
}

// Hook para estatísticas de atividades
export function useActivityStats(): {
  stats: Record<ActivityType, number>;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState<Record<ActivityType, number>>({} as Record<ActivityType, number>);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ActivityService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refresh: fetchStats,
  };
}
