import { useCallback, useEffect, useState } from 'react';
import { d1Client, type D1Resume } from '../../../lib/api-clients/d1-client';
import type { ResumeLibraryItem, GeneratedResume } from '../types';

/**
 * Filter options for resume library
 */
export interface ResumeLibraryFilters {
  search?: string;
  is_favorite?: boolean;
  tags?: string[];
}

/**
 * Hook for managing resume library
 * Handles CRUD operations with D1 backend
 */
export function useResumeLibrary(profileId: string | null, userId: string | null) {
  const [items, setItems] = useState<ResumeLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResumeLibraryFilters>({});

  /**
   * Parse JSON fields from D1 response
   */
  const parseLibraryItem = (raw: D1Resume): ResumeLibraryItem => {
    const parseArrayField = (value: unknown): unknown[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const parseObjectField = (value: unknown): object => {
      if (!value) return {};
      if (typeof value === 'object' && value !== null) return value as object;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      }
      return {};
    };

    const parseStringArray = (value: unknown): string[] => {
      const arr = parseArrayField(value);
      return arr.filter((item): item is string => typeof item === 'string');
    };

    return {
      id: raw.id,
      user_id: raw.user_id,
      profile_id: raw.profile_id,
      version_name: raw.version_name,
      personalInfo: parseObjectField(raw.personal_info) as unknown as ResumeLibraryItem['personalInfo'],
      professionalSummary: raw.professional_summary,
      experiences: parseArrayField(raw.experiences) as ResumeLibraryItem['experiences'],
      education: parseArrayField(raw.education) as ResumeLibraryItem['education'],
      skills: parseArrayField(raw.skills) as ResumeLibraryItem['skills'],
      languages: parseArrayField(raw.languages) as ResumeLibraryItem['languages'],
      certifications: parseArrayField(raw.certifications) as ResumeLibraryItem['certifications'],
      projects: parseArrayField(raw.projects) as ResumeLibraryItem['projects'],
      is_favorite: raw.is_favorite,
      tags: parseStringArray(raw.tags),
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    };
  };

  /**
   * Load library items with filters
   */
  const loadLibrary = useCallback(async () => {
    if (!profileId || !d1Client.isEnabled()) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await d1Client.getResumeLibrary(profileId, {
        is_favorite: filters.is_favorite,
        tags: filters.tags,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      let parsedItems = (response.data || []).map(parseLibraryItem);

      // Apply local search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        parsedItems = parsedItems.filter(
          (item) =>
            item.version_name.toLowerCase().includes(searchLower) ||
            item.professionalSummary.toLowerCase().includes(searchLower) ||
            item.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
            item.personalInfo.fullName?.toLowerCase().includes(searchLower)
        );
      }

      setItems(parsedItems);
    } catch (err) {
      console.error('Error loading resume library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca de currículos');
    } finally {
      setIsLoading(false);
    }
  }, [profileId, filters]);

  /**
   * Save generated resume to library
   */
  const saveResume = useCallback(
    async (
      generatedResume: GeneratedResume,
      versionName: string,
      options?: { tags?: string[]; is_favorite?: boolean }
    ): Promise<ResumeLibraryItem | null> => {
      if (!profileId || !userId || !d1Client.isEnabled()) {
        setError('Perfil ou usuário não selecionado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.createResume({
          user_id: userId,
          profile_id: profileId,
          version_name: versionName,
          personal_info: generatedResume.personalInfo,
          professional_summary: generatedResume.professionalSummary,
          experiences: generatedResume.experiences,
          education: generatedResume.education,
          skills: generatedResume.skills,
          languages: generatedResume.languages || [],
          certifications: generatedResume.certifications || [],
          projects: generatedResume.projects || [],
          is_favorite: options?.is_favorite || false,
          tags: options?.tags || [],
        });

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const newItem = parseLibraryItem(response.data);
          setItems((prev) => [newItem, ...prev]);
          return newItem;
        }
      } catch (err) {
        console.error('Error saving resume:', err);
        setError(err instanceof Error ? err.message : 'Erro ao salvar currículo');
      } finally {
        setIsSaving(false);
      }

      return null;
    },
    [profileId, userId]
  );

  /**
   * Update a library item
   */
  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<{
        version_name: string;
        professional_summary: string;
        tags: string[];
      }>
    ): Promise<ResumeLibraryItem | null> => {
      if (!d1Client.isEnabled()) {
        setError('D1 não configurado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.updateResume(id, updates);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const updatedItem = parseLibraryItem(response.data);
          setItems((prev) =>
            prev.map((item) => (item.id === id ? updatedItem : item))
          );
          return updatedItem;
        }
      } catch (err) {
        console.error('Error updating resume:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar currículo');
      } finally {
        setIsSaving(false);
      }

      return null;
    },
    []
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (id: string): Promise<boolean> => {
      if (!d1Client.isEnabled()) {
        setError('D1 não configurado');
        return false;
      }

      try {
        const response = await d1Client.toggleResumeFavorite(id);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const updatedItem = parseLibraryItem(response.data);
          setItems((prev) =>
            prev.map((item) => (item.id === id ? updatedItem : item))
          );
          return true;
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar favorito');
      }

      return false;
    },
    []
  );

  /**
   * Delete a library item
   */
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      if (!d1Client.isEnabled()) {
        setError('D1 não configurado');
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.deleteResume(id);

        if (response.error) {
          throw new Error(response.error);
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        return true;
      } catch (err) {
        console.error('Error deleting resume:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar currículo');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<ResumeLibraryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load library when profile or filters change
  useEffect(() => {
    if (profileId) {
      loadLibrary();
    } else {
      setItems([]);
    }
  }, [profileId, loadLibrary]);

  return {
    // State
    items,
    isLoading,
    isSaving,
    error,
    filters,

    // Actions
    loadLibrary,
    saveResume,
    updateItem,
    toggleFavorite,
    deleteItem,
    updateFilters,
    clearFilters,

    // Helpers
    hasItems: items.length > 0,
    favoriteItems: items.filter((item) => item.is_favorite),
    isD1Enabled: d1Client.isEnabled(),
  };
}
