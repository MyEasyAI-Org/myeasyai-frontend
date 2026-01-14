import { useCallback, useEffect, useState } from 'react';
import { d1Client, type D1ResumeProfile } from '../../../lib/api-clients/d1-client';
import type {
  ResumeProfile,
  CreateResumeProfileInput,
} from '../types';

/**
 * Hook for managing resume profiles
 * Handles CRUD operations with D1 backend
 */
export function useResumeProfiles(userId: string | null) {
  const [profiles, setProfiles] = useState<ResumeProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ResumeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse profile from D1 response
   */
  const parseProfile = (raw: D1ResumeProfile): ResumeProfile => {
    return {
      id: String(raw.id || ''),
      user_id: String(raw.user_id || ''),
      name: String(raw.name || ''),
      career_level: String(raw.career_level || 'mid') as ResumeProfile['career_level'],
      target_role: String(raw.target_role || ''),
      industry: String(raw.industry || ''),
      template_style: String(raw.template_style || 'ats') as ResumeProfile['template_style'],
      preferred_language: String(raw.preferred_language || 'pt-BR') as ResumeProfile['preferred_language'],
      is_default: Boolean(raw.is_default),
      created_at: String(raw.created_at || ''),
      updated_at: raw.updated_at ? String(raw.updated_at) : null,
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
      const response = await d1Client.getResumeProfiles(userId);

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
      console.error('Error loading resume profiles:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis de currículo');
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
      const response = await d1Client.getDefaultResumeProfile(userId);
      if (response.data) {
        const parsed = parseProfile(response.data);
        setCurrentProfile(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading default resume profile:', err);
    }
    return null;
  }, [userId]);

  /**
   * Create a new profile
   */
  const createProfile = useCallback(
    async (input: CreateResumeProfileInput): Promise<ResumeProfile | null> => {
      if (!userId || !d1Client.isEnabled()) {
        setError('Usuário não autenticado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.createResumeProfile({
          user_id: userId,
          name: input.name,
          career_level: input.career_level,
          target_role: input.target_role,
          industry: input.industry,
          template_style: input.template_style,
          preferred_language: input.preferred_language,
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
        console.error('Error creating resume profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao criar perfil de currículo');
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
      updates: Partial<CreateResumeProfileInput>
    ): Promise<ResumeProfile | null> => {
      if (!d1Client.isEnabled()) {
        setError('D1 não configurado');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.updateResumeProfile(id, {
          name: updates.name,
          career_level: updates.career_level,
          target_role: updates.target_role,
          industry: updates.industry,
          template_style: updates.template_style,
          preferred_language: updates.preferred_language,
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
        console.error('Error updating resume profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil de currículo');
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
        setError('D1 não configurado');
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await d1Client.deleteResumeProfile(id);

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
        console.error('Error deleting resume profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao deletar perfil de currículo');
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
      if (!userId || !d1Client.isEnabled()) {
        setError('D1 não configurado');
        return false;
      }

      try {
        const response = await d1Client.setDefaultResumeProfile(id, userId);

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
        console.error('Error setting default resume profile:', err);
        setError(err instanceof Error ? err.message : 'Erro ao definir perfil padrão');
        return false;
      }
    },
    [userId]
  );

  /**
   * Select a profile as current (local state only)
   */
  const selectProfile = useCallback((profile: ResumeProfile) => {
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
