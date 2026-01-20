import { useCallback, useEffect, useState } from 'react';
import { d1Client } from '../../../lib/api-clients/d1-client';
import type {
  BusinessNiche,
  ContentBusinessProfile,
  ContentTone,
  ContentType,
  CreateContentProfileInput,
  SocialNetwork,
} from '../types';

/**
 * Hook for managing content business profiles
 * Handles CRUD operations with D1 backend
 */
export function useContentProfiles(userId: string | null) {
  const [profiles, setProfiles] = useState<ContentBusinessProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ContentBusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse JSON arrays from D1 response
   * Handles both already-parsed arrays and JSON strings
   */
  const parseProfile = (raw: any): ContentBusinessProfile => {
    // Helper to safely parse JSON or return array as-is
    const parseArrayField = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // If it's a comma-separated string, split it
          return value.includes(',') ? value.split(',').map((s: string) => s.trim()) : [value];
        }
      }
      return [];
    };

    return {
      ...raw,
      selected_networks: parseArrayField(raw.selected_networks),
      preferred_content_types: parseArrayField(raw.preferred_content_types),
      brand_voice: raw.brand_voice || 'professional',
    };
  };

  /**
   * Load all profiles for the user
   */
  const loadProfiles = useCallback(async () => {
    if (!userId || !d1Client.isEnabled()) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await d1Client.getContentProfiles(userId);

      if (response.error) {
        throw new Error(response.error);
      }

      const parsedProfiles = (response.data || []).map(parseProfile);
      setProfiles(parsedProfiles);

      // Set default profile as current if none selected
      if (!currentProfile && parsedProfiles.length > 0) {
        const defaultProfile = parsedProfiles.find((p) => p.is_default) || parsedProfiles[0];
        setCurrentProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentProfile]);

  /**
   * Load default profile
   */
  const loadDefaultProfile = useCallback(async () => {
    if (!userId || !d1Client.isEnabled()) return null;

    try {
      const response = await d1Client.getDefaultContentProfile(userId);
      if (response.data) {
        const parsed = parseProfile(response.data);
        setCurrentProfile(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading default profile:', err);
    }
    return null;
  }, [userId]);

  /**
   * Create a new profile
   */
  const createProfile = useCallback(
    async (input: CreateContentProfileInput): Promise<ContentBusinessProfile | null> => {
      if (!userId || !d1Client.isEnabled()) {
        setError('Usuario nao autenticado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.createContentProfile({
          user_id: userId,
          name: input.name,
          business_niche: input.business_niche,
          target_audience: input.target_audience,
          brand_voice: input.brand_voice,
          selected_networks: input.selected_networks,
          preferred_content_types: input.preferred_content_types,
          icon: input.icon,
          is_default: input.is_default,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const newProfile = parseProfile(response.data);
          setProfiles((prev) => {
            // If new profile is default, unmark others
            if (newProfile.is_default) {
              return [...prev.map((p) => ({ ...p, is_default: false })), newProfile];
            }
            return [...prev, newProfile];
          });

          // Set as current if it's the first or default
          if (profiles.length === 0 || newProfile.is_default) {
            setCurrentProfile(newProfile);
          }

          return newProfile;
        }
      } catch (err) {
        console.error('Error creating profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao criar perfil');
      } finally {
        setIsSaving(false);
      }

      return null;
    },
    [userId, profiles.length]
  );

  /**
   * Update an existing profile
   */
  const updateProfile = useCallback(
    async (
      id: string,
      updates: Partial<CreateContentProfileInput>
    ): Promise<ContentBusinessProfile | null> => {
      if (!d1Client.isEnabled()) {
        setError('D1 nao configurado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.updateContentProfile(id, {
          name: updates.name,
          business_niche: updates.business_niche,
          target_audience: updates.target_audience,
          brand_voice: updates.brand_voice,
          selected_networks: updates.selected_networks,
          preferred_content_types: updates.preferred_content_types,
          icon: updates.icon,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          const updatedProfile = parseProfile(response.data);
          setProfiles((prev) =>
            prev.map((p) => (p.id === id ? updatedProfile : p))
          );

          // Update current if it's the one being edited
          if (currentProfile?.id === id) {
            setCurrentProfile(updatedProfile);
          }

          return updatedProfile;
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      } finally {
        setIsSaving(false);
      }

      return null;
    },
    [currentProfile?.id]
  );

  /**
   * Delete a profile
   */
  const deleteProfile = useCallback(
    async (id: string): Promise<boolean> => {
      if (!d1Client.isEnabled()) {
        setError('D1 nao configurado');
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.deleteContentProfile(id);

        if (response.error) {
          throw new Error(response.error);
        }

        setProfiles((prev) => prev.filter((p) => p.id !== id));

        // If deleted profile was current, select another
        if (currentProfile?.id === id) {
          const remaining = profiles.filter((p) => p.id !== id);
          setCurrentProfile(remaining.length > 0 ? remaining[0] : null);
        }

        return true;
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar perfil');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [currentProfile?.id, profiles]
  );

  /**
   * Set a profile as default
   */
  const setDefaultProfile = useCallback(
    async (id: string): Promise<boolean> => {
      if (!d1Client.isEnabled()) {
        setError('D1 nao configurado');
        return false;
      }

      try {
        const response = await d1Client.setDefaultContentProfile(id);

        if (response.error) {
          throw new Error(response.error);
        }

        // Update local state
        setProfiles((prev) =>
          prev.map((p) => ({
            ...p,
            is_default: p.id === id,
          }))
        );

        return true;
      } catch (err) {
        console.error('Error setting default profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao definir perfil padrao');
        return false;
      }
    },
    []
  );

  /**
   * Select a profile as current (local state only)
   */
  const selectProfile = useCallback((profile: ContentBusinessProfile) => {
    setCurrentProfile(profile);
  }, []);

  // Load profiles on mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadProfiles();
    } else {
      setProfiles([]);
      setCurrentProfile(null);
    }
  }, [userId, loadProfiles]);

  return {
    // State
    profiles,
    currentProfile,
    isLoading,
    isSaving,
    error,

    // Actions
    loadProfiles,
    loadDefaultProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
    selectProfile,

    // Helpers
    hasProfiles: profiles.length > 0,
    isD1Enabled: d1Client.isEnabled(),
  };
}
