import { useCallback, useState } from 'react';
import type {
  BusinessNiche,
  CalendarEntry,
  ContentData,
  ContentIdea,
  ContentTone,
  ContentType,
  GeneratedContent,
  SavedContent,
  SocialNetwork,
} from '../types';
import { DEFAULT_CONTENT_DATA } from '../constants';

/**
 * Hook for managing content data in MyEasyContent
 * Centralizes all content state and provides type-safe update methods
 */
export function useContentData(initialData?: Partial<ContentData>) {
  const [contentData, setContentData] = useState<ContentData>({
    ...DEFAULT_CONTENT_DATA,
    ...initialData,
  });

  /**
   * Update content data (partial update)
   */
  const updateContentData = useCallback((updates: Partial<ContentData>) => {
    setContentData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Replace all content data
   */
  const setAllContentData = useCallback((data: ContentData) => {
    setContentData(data);
  }, []);

  /**
   * Reset content data to default
   */
  const resetContentData = useCallback(() => {
    setContentData(DEFAULT_CONTENT_DATA);
  }, []);

  // Business info updaters
  const updateBusinessName = useCallback((name: string) => {
    setContentData((prev) => ({ ...prev, businessName: name }));
  }, []);

  const updateBusinessNiche = useCallback((niche: BusinessNiche) => {
    setContentData((prev) => ({ ...prev, businessNiche: niche }));
  }, []);

  const updateTargetAudience = useCallback((audience: string) => {
    setContentData((prev) => ({ ...prev, targetAudience: audience }));
  }, []);

  const updateBrandVoice = useCallback((tone: ContentTone) => {
    setContentData((prev) => ({ ...prev, brandVoice: tone }));
  }, []);

  // Network management
  const addNetwork = useCallback((network: SocialNetwork) => {
    setContentData((prev) => {
      if (prev.selectedNetworks.includes(network)) {
        return prev;
      }
      return {
        ...prev,
        selectedNetworks: [...prev.selectedNetworks, network],
      };
    });
  }, []);

  const removeNetwork = useCallback((network: SocialNetwork) => {
    setContentData((prev) => ({
      ...prev,
      selectedNetworks: prev.selectedNetworks.filter((n) => n !== network),
    }));
  }, []);

  const toggleNetwork = useCallback((network: SocialNetwork) => {
    setContentData((prev) => {
      const networks = prev.selectedNetworks.includes(network)
        ? prev.selectedNetworks.filter((n) => n !== network)
        : [...prev.selectedNetworks, network];
      return { ...prev, selectedNetworks: networks };
    });
  }, []);

  const setNetworks = useCallback((networks: SocialNetwork[]) => {
    setContentData((prev) => ({ ...prev, selectedNetworks: networks }));
  }, []);

  // Content type management
  const addContentType = useCallback((contentType: ContentType) => {
    setContentData((prev) => {
      if (prev.selectedContentTypes.includes(contentType)) {
        return prev;
      }
      return {
        ...prev,
        selectedContentTypes: [...prev.selectedContentTypes, contentType],
      };
    });
  }, []);

  const removeContentType = useCallback((contentType: ContentType) => {
    setContentData((prev) => ({
      ...prev,
      selectedContentTypes: prev.selectedContentTypes.filter(
        (ct) => ct !== contentType,
      ),
    }));
  }, []);

  const toggleContentType = useCallback((contentType: ContentType) => {
    setContentData((prev) => {
      const types = prev.selectedContentTypes.includes(contentType)
        ? prev.selectedContentTypes.filter((ct) => ct !== contentType)
        : [...prev.selectedContentTypes, contentType];
      return { ...prev, selectedContentTypes: types };
    });
  }, []);

  const setContentTypes = useCallback((contentTypes: ContentType[]) => {
    setContentData((prev) => ({ ...prev, selectedContentTypes: contentTypes }));
  }, []);

  // Generated content management
  const addGeneratedContent = useCallback((content: GeneratedContent) => {
    setContentData((prev) => ({
      ...prev,
      generatedContents: [...prev.generatedContents, content],
    }));
  }, []);

  const removeGeneratedContent = useCallback((id: string) => {
    setContentData((prev) => ({
      ...prev,
      generatedContents: prev.generatedContents.filter((c) => c.id !== id),
    }));
  }, []);

  const clearGeneratedContents = useCallback(() => {
    setContentData((prev) => ({ ...prev, generatedContents: [] }));
  }, []);

  // Calendar management
  const setCalendar = useCallback((calendar: CalendarEntry[]) => {
    setContentData((prev) => ({ ...prev, calendar }));
  }, []);

  const addCalendarEntry = useCallback((entry: CalendarEntry) => {
    setContentData((prev) => ({
      ...prev,
      calendar: [...prev.calendar, entry],
    }));
  }, []);

  const updateCalendarEntry = useCallback(
    (id: string, updates: Partial<CalendarEntry>) => {
      setContentData((prev) => ({
        ...prev,
        calendar: prev.calendar.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        ),
      }));
    },
    [],
  );

  const removeCalendarEntry = useCallback((id: string) => {
    setContentData((prev) => ({
      ...prev,
      calendar: prev.calendar.filter((e) => e.id !== id),
    }));
  }, []);

  // Ideas management
  const setIdeas = useCallback((ideas: ContentIdea[]) => {
    setContentData((prev) => ({ ...prev, ideas }));
  }, []);

  const addIdea = useCallback((idea: ContentIdea) => {
    setContentData((prev) => ({
      ...prev,
      ideas: [...prev.ideas, idea],
    }));
  }, []);

  const removeIdea = useCallback((id: string) => {
    setContentData((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== id),
    }));
  }, []);

  // Library management
  const saveContent = useCallback((content: GeneratedContent) => {
    const savedContent: SavedContent = {
      id: `saved-${Date.now()}`,
      content,
      savedAt: new Date(),
      tags: [],
      isFavorite: false,
    };
    setContentData((prev) => ({
      ...prev,
      savedContents: [...prev.savedContents, savedContent],
    }));
    return savedContent;
  }, []);

  const removeSavedContent = useCallback((id: string) => {
    setContentData((prev) => ({
      ...prev,
      savedContents: prev.savedContents.filter((sc) => sc.id !== id),
    }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setContentData((prev) => ({
      ...prev,
      savedContents: prev.savedContents.map((sc) =>
        sc.id === id ? { ...sc, isFavorite: !sc.isFavorite } : sc,
      ),
    }));
  }, []);

  const updateSavedContentTags = useCallback((id: string, tags: string[]) => {
    setContentData((prev) => ({
      ...prev,
      savedContents: prev.savedContents.map((sc) =>
        sc.id === id ? { ...sc, tags } : sc,
      ),
    }));
  }, []);

  // Current session
  const updateCurrentTopic = useCallback((topic: string) => {
    setContentData((prev) => ({ ...prev, currentTopic: topic }));
  }, []);

  const updateCurrentObjective = useCallback((objective: string) => {
    setContentData((prev) => ({ ...prev, currentObjective: objective }));
  }, []);

  // Validation helpers
  const hasNetwork = useCallback(
    (network: SocialNetwork) => {
      return contentData.selectedNetworks.includes(network);
    },
    [contentData.selectedNetworks],
  );

  const hasContentType = useCallback(
    (contentType: ContentType) => {
      return contentData.selectedContentTypes.includes(contentType);
    },
    [contentData.selectedContentTypes],
  );

  const isBusinessInfoComplete = useCallback(() => {
    return (
      !!contentData.businessName &&
      contentData.businessNiche !== 'other' &&
      !!contentData.targetAudience
    );
  }, [
    contentData.businessName,
    contentData.businessNiche,
    contentData.targetAudience,
  ]);

  const isReadyToGenerate = useCallback(() => {
    return (
      contentData.selectedNetworks.length > 0 &&
      contentData.selectedContentTypes.length > 0 &&
      !!contentData.currentTopic
    );
  }, [
    contentData.selectedNetworks,
    contentData.selectedContentTypes,
    contentData.currentTopic,
  ]);

  return {
    // State
    contentData,

    // General updates
    updateContentData,
    setAllContentData,
    resetContentData,

    // Business info
    updateBusinessName,
    updateBusinessNiche,
    updateTargetAudience,
    updateBrandVoice,

    // Networks
    addNetwork,
    removeNetwork,
    toggleNetwork,
    setNetworks,

    // Content types
    addContentType,
    removeContentType,
    toggleContentType,
    setContentTypes,

    // Generated content
    addGeneratedContent,
    removeGeneratedContent,
    clearGeneratedContents,

    // Calendar
    setCalendar,
    addCalendarEntry,
    updateCalendarEntry,
    removeCalendarEntry,

    // Ideas
    setIdeas,
    addIdea,
    removeIdea,

    // Library
    saveContent,
    removeSavedContent,
    toggleFavorite,
    updateSavedContentTags,

    // Current session
    updateCurrentTopic,
    updateCurrentObjective,

    // Validation
    hasNetwork,
    hasContentType,
    isBusinessInfoComplete,
    isReadyToGenerate,
  };
}
