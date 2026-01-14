import { useCallback, useEffect, useState } from 'react';
import type { StudyPlanLibraryItem, GeneratedStudyPlan } from '../types';

/**
 * Filter options for study plan library
 */
export interface StudyPlanLibraryFilters {
  search?: string;
  is_favorite?: boolean;
  tags?: string[];
}

/**
 * Hook for managing study plan library
 * Currently using localStorage, will be migrated to D1 backend later
 */
export function useStudyPlanLibrary(userId: string | null) {
  const [items, setItems] = useState<StudyPlanLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudyPlanLibraryFilters>({});

  const STORAGE_KEY = `myeasylearning_library_${userId}`;

  /**
   * Load library items from localStorage
   */
  const loadLibrary = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      let parsedItems: StudyPlanLibraryItem[] = [];

      if (storedData) {
        parsedItems = JSON.parse(storedData);
      }

      // Apply filters
      if (filters.is_favorite !== undefined) {
        parsedItems = parsedItems.filter((item) => item.is_favorite === filters.is_favorite);
      }

      if (filters.tags && filters.tags.length > 0) {
        parsedItems = parsedItems.filter((item) =>
          filters.tags!.some((tag) => item.tags.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        parsedItems = parsedItems.filter(
          (item) =>
            item.version_name.toLowerCase().includes(searchLower) ||
            item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Sort by created_at desc (most recent first)
      parsedItems.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(parsedItems);
    } catch (err) {
      console.error('Error loading study plan library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca de planos');
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters, STORAGE_KEY]);

  /**
   * Save all items to localStorage
   */
  const saveToStorage = useCallback(
    (items: StudyPlanLibraryItem[]) => {
      if (!userId) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    },
    [userId, STORAGE_KEY]
  );

  /**
   * Save generated study plan to library
   */
  const saveStudyPlan = useCallback(
    async (
      generatedPlan: GeneratedStudyPlan,
      profileId: string,
      versionName: string,
      options?: { tags?: string[]; is_favorite?: boolean }
    ): Promise<StudyPlanLibraryItem | null> => {
      if (!userId) {
        setError('Usuário não identificado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const newItem: StudyPlanLibraryItem = {
          id: crypto.randomUUID(),
          user_id: userId,
          profile_id: profileId,
          version_name: versionName,
          plan_data: generatedPlan,
          progress: {
            plan_id: generatedPlan.id,
            total_weeks: generatedPlan.weeks.length,
            completed_weeks: 0,
            current_week: 1,
            total_tasks: generatedPlan.weeks.reduce((sum, week) => sum + week.tasks.length, 0),
            completed_tasks: 0,
            progress_percentage: 0,
            total_hours_planned: generatedPlan.plan_summary.total_hours,
            hours_studied: 0,
            streak_days: 0,
            last_study_date: '',
            on_track: true,
            weeks_behind: 0,
          },
          tags: options?.tags || [],
          is_favorite: options?.is_favorite || false,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: null,
        };

        const currentItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedItems = [newItem, ...currentItems];
        saveToStorage(updatedItems);

        setItems((prev) => [newItem, ...prev]);
        return newItem;
      } catch (err) {
        console.error('Error saving study plan:', err);
        setError(err instanceof Error ? err.message : 'Erro ao salvar plano');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, STORAGE_KEY, saveToStorage]
  );

  /**
   * Update a library item
   */
  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<{
        version_name: string;
        tags: string[];
        is_archived: boolean;
      }>
    ): Promise<StudyPlanLibraryItem | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const currentItems: StudyPlanLibraryItem[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        const updatedItems = currentItems.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...updates,
              updated_at: new Date().toISOString(),
            };
          }
          return item;
        });

        saveToStorage(updatedItems);
        setItems(updatedItems);

        const updatedItem = updatedItems.find((item) => item.id === id);
        return updatedItem || null;
      } catch (err) {
        console.error('Error updating study plan:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar plano');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [STORAGE_KEY, saveToStorage]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const currentItems: StudyPlanLibraryItem[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        const updatedItems = currentItems.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              is_favorite: !item.is_favorite,
              updated_at: new Date().toISOString(),
            };
          }
          return item;
        });

        saveToStorage(updatedItems);
        setItems(updatedItems);

        return true;
      } catch (err) {
        console.error('Error toggling favorite:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar favorito');
        return false;
      }
    },
    [STORAGE_KEY, saveToStorage]
  );

  /**
   * Delete a library item
   */
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const currentItems: StudyPlanLibraryItem[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        const updatedItems = currentItems.filter((item) => item.id !== id);

        saveToStorage(updatedItems);
        setItems(updatedItems);

        return true;
      } catch (err) {
        console.error('Error deleting study plan:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar plano');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [STORAGE_KEY, saveToStorage]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<StudyPlanLibraryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load library when userId or filters change
  useEffect(() => {
    if (userId) {
      loadLibrary();
    } else {
      setItems([]);
    }
  }, [userId, loadLibrary]);

  return {
    // State
    items,
    isLoading,
    isSaving,
    error,
    filters,

    // Actions
    loadLibrary,
    saveStudyPlan,
    updateItem,
    toggleFavorite,
    deleteItem,
    updateFilters,
    clearFilters,

    // Helpers
    hasItems: items.length > 0,
    favoriteItems: items.filter((item) => item.is_favorite),
  };
}
