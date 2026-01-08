import { useCallback, useEffect, useState } from 'react';
import { d1Client, type D1ContentLibraryItem } from '../../../lib/api-clients/d1-client';
import type { ContentType, GeneratedContent, SocialNetwork } from '../types';

/**
 * Parsed content library item with proper types
 */
export interface ContentLibraryItem {
  id: string;
  user_id: string;
  profile_id: string;
  content_type: ContentType;
  network: SocialNetwork;
  title: string | null;
  content: string;
  hashtags: string[];
  image_description: string | null;
  best_time: string | null;
  variations: string[];
  is_favorite: boolean;
  tags: string[];
  folder: string | null;
  created_at: string;
}

/**
 * Filter options for content library
 */
export interface ContentLibraryFilters {
  search?: string;
  content_type?: ContentType | null;
  network?: SocialNetwork | null;
  is_favorite?: boolean;
  folder?: string | null;
}

/**
 * Hook for managing content library
 * Handles CRUD operations with D1 backend
 */
export function useContentLibrary(profileId: string | null, userId: string | null) {
  const [items, setItems] = useState<ContentLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentLibraryFilters>({});

  /**
   * Parse JSON arrays from D1 response
   */
  const parseLibraryItem = (raw: D1ContentLibraryItem): ContentLibraryItem => {
    const parseArrayField = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return value.includes(',') ? value.split(',').map((s: string) => s.trim()) : [value];
        }
      }
      return [];
    };

    return {
      ...raw,
      content_type: raw.content_type as ContentType,
      network: raw.network as SocialNetwork,
      hashtags: parseArrayField(raw.hashtags),
      variations: parseArrayField(raw.variations),
      tags: parseArrayField(raw.tags),
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
      const response = await d1Client.getContentLibrary(profileId, {
        is_favorite: filters.is_favorite,
        content_type: filters.content_type || undefined,
        network: filters.network || undefined,
        folder: filters.folder || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      let parsedItems = (response.data || []).map(parseLibraryItem);

      // Apply local search filter (not supported by API)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        parsedItems = parsedItems.filter(
          (item) =>
            item.content.toLowerCase().includes(searchLower) ||
            item.title?.toLowerCase().includes(searchLower) ||
            item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      setItems(parsedItems);
    } catch (err) {
      console.error('Error loading library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca');
    } finally {
      setIsLoading(false);
    }
  }, [profileId, filters]);

  /**
   * Save generated content to library
   */
  const saveContent = useCallback(
    async (
      generatedContent: GeneratedContent,
      options?: { tags?: string[]; folder?: string }
    ): Promise<ContentLibraryItem | null> => {
      if (!profileId || !userId || !d1Client.isEnabled()) {
        setError('Perfil ou usuario nao selecionado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.createContentLibraryItem({
          user_id: userId,
          profile_id: profileId,
          content_type: generatedContent.type,
          network: generatedContent.network,
          title: generatedContent.title,
          content: generatedContent.content,
          hashtags: generatedContent.hashtags,
          image_description: generatedContent.imageDescription,
          best_time: generatedContent.bestTime,
          variations: generatedContent.variations,
          tags: options?.tags,
          folder: options?.folder,
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
        console.error('Error saving content:', err);
        setError(err instanceof Error ? err.message : 'Erro ao salvar conteudo');
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
        title: string;
        content: string;
        hashtags: string[];
        image_description: string;
        best_time: string;
        variations: string[];
        tags: string[];
        folder: string;
      }>
    ): Promise<ContentLibraryItem | null> => {
      if (!d1Client.isEnabled()) {
        setError('D1 nao configurado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.updateContentLibraryItem(id, updates);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const updatedItem = parseLibraryItem(response.data);
          setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
          return updatedItem;
        }
      } catch (err) {
        console.error('Error updating item:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
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
  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    if (!d1Client.isEnabled()) {
      setError('D1 nao configurado');
      return false;
    }

    try {
      const response = await d1Client.toggleContentLibraryFavorite(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const updatedItem = parseLibraryItem(response.data);
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
        return true;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Erro ao favoritar');
    }

    return false;
  }, []);

  /**
   * Delete a library item
   */
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    if (!d1Client.isEnabled()) {
      setError('D1 nao configurado');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await d1Client.deleteContentLibraryItem(id);

      if (response.error) {
        throw new Error(response.error);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<ContentLibraryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load library when profile changes or filters change
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
    saveContent,
    updateItem,
    toggleFavorite,
    deleteItem,
    updateFilters,
    clearFilters,

    // Helpers
    hasItems: items.length > 0,
    favoriteCount: items.filter((i) => i.is_favorite).length,
    isD1Enabled: d1Client.isEnabled(),
  };
}
