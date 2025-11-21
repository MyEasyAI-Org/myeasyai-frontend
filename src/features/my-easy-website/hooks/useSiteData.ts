import { useCallback, useState } from 'react';

/**
 * Section keys for the website
 */
export type SectionKey =
  | 'hero'
  | 'about'
  | 'services'
  | 'gallery'
  | 'app'
  | 'testimonials'
  | 'contact'
  | 'faq'
  | 'pricing'
  | 'team';

/**
 * Business area types
 */
export type BusinessArea =
  | 'technology'
  | 'retail'
  | 'services'
  | 'food'
  | 'health'
  | 'education';

/**
 * Site data structure
 */
export interface SiteData {
  area: string;
  name: string;
  slogan: string;
  description: string;
  vibe: string; // Vibração/emoção do site (dark, vibrant, light, corporate, fun, elegant)
  colors: string; // JSON string com { primary, secondary, accent, dark, light }
  selectedPaletteId?: string;
  sections: SectionKey[];
  services: string[];
  gallery: string[];
  appPlayStore: string;
  appAppStore: string;
  showPlayStore: boolean;
  showAppStore: boolean;
  testimonials: Array<{ name: string; role: string; text: string }>;
  address: string;
  phone: string;
  email: string;
  faq: Array<{ question: string; answer: string }>;
  pricing: Array<{ name: string; price: string; features: string[] }>;
  team: Array<{ name: string; role: string; photo?: string }>;
  heroStats?: Array<{ value: string; label: string }>;
  features?: Array<{ title: string; description: string }>;
  aboutContent?: { title: string; subtitle: string; checklist: string[] };
  serviceDescriptions?: Array<{ name: string; description: string }>;
}

/**
 * Default site data
 */
const DEFAULT_SITE_DATA: SiteData = {
  area: '',
  name: '',
  slogan: '',
  description: '',
  vibe: 'vibrant',
  colors: JSON.stringify({
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    dark: '#1E293B',
    light: '#F1F5F9',
  }),
  sections: [],
  services: [],
  gallery: [],
  appPlayStore: '',
  appAppStore: '',
  showPlayStore: false,
  showAppStore: false,
  testimonials: [],
  address: '',
  phone: '',
  email: '',
  faq: [],
  pricing: [],
  team: [],
};

/**
 * Hook for managing site data in MyEasyWebsite
 * Centralizes all site data state and provides type-safe update methods
 *
 * @example
 * const {
 *   siteData,
 *   updateSiteData,
 *   updateName,
 *   updateSlogan,
 *   addSection,
 *   removeSection,
 *   addService,
 *   addGalleryImage,
 * } = useSiteData();
 */
export function useSiteData(initialData?: Partial<SiteData>) {
  const [siteData, setSiteData] = useState<SiteData>({
    ...DEFAULT_SITE_DATA,
    ...initialData,
  });

  /**
   * Update site data (partial update)
   */
  const updateSiteData = useCallback((updates: Partial<SiteData>) => {
    setSiteData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Replace all site data
   */
  const setAllSiteData = useCallback((data: SiteData) => {
    setSiteData(data);
  }, []);

  /**
   * Reset site data to default
   */
  const resetSiteData = useCallback(() => {
    setSiteData(DEFAULT_SITE_DATA);
  }, []);

  // Individual field updaters
  const updateArea = useCallback((area: string) => {
    setSiteData((prev) => ({ ...prev, area }));
  }, []);

  const updateName = useCallback((name: string) => {
    setSiteData((prev) => ({ ...prev, name }));
  }, []);

  const updateSlogan = useCallback((slogan: string) => {
    setSiteData((prev) => ({ ...prev, slogan }));
  }, []);

  const updateDescription = useCallback((description: string) => {
    setSiteData((prev) => ({ ...prev, description }));
  }, []);

  const updateVibe = useCallback((vibe: string) => {
    setSiteData((prev) => ({ ...prev, vibe }));
  }, []);

  const updateColors = useCallback((colors: string) => {
    setSiteData((prev) => ({ ...prev, colors }));
  }, []);

  const updateSelectedPaletteId = useCallback((paletteId: string) => {
    setSiteData((prev) => ({ ...prev, selectedPaletteId: paletteId }));
  }, []);

  // Section management
  const addSection = useCallback((section: SectionKey) => {
    setSiteData((prev) => {
      if (prev.sections.includes(section)) {
        return prev;
      }
      return { ...prev, sections: [...prev.sections, section] };
    });
  }, []);

  const removeSection = useCallback((section: SectionKey) => {
    setSiteData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s !== section),
    }));
  }, []);

  const toggleSection = useCallback((section: SectionKey) => {
    setSiteData((prev) => {
      const sections = prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section];
      return { ...prev, sections };
    });
  }, []);

  const setSections = useCallback((sections: SectionKey[]) => {
    setSiteData((prev) => ({ ...prev, sections }));
  }, []);

  // Services management
  const addService = useCallback((service: string) => {
    setSiteData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));
  }, []);

  const setServices = useCallback((services: string[]) => {
    setSiteData((prev) => ({ ...prev, services }));
  }, []);

  const removeService = useCallback((index: number) => {
    setSiteData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }, []);

  // Gallery management
  const addGalleryImage = useCallback((imageUrl: string) => {
    setSiteData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, imageUrl],
    }));
  }, []);

  const addGalleryImages = useCallback((imageUrls: string[]) => {
    setSiteData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...imageUrls],
    }));
  }, []);

  const removeGalleryImage = useCallback((index: number) => {
    setSiteData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }, []);

  const setGallery = useCallback((gallery: string[]) => {
    setSiteData((prev) => ({ ...prev, gallery }));
  }, []);

  // Contact information
  const updateAddress = useCallback((address: string) => {
    setSiteData((prev) => ({ ...prev, address }));
  }, []);

  const updatePhone = useCallback((phone: string) => {
    setSiteData((prev) => ({ ...prev, phone }));
  }, []);

  const updateEmail = useCallback((email: string) => {
    setSiteData((prev) => ({ ...prev, email }));
  }, []);

  // App store links
  const updateAppPlayStore = useCallback((url: string) => {
    setSiteData((prev) => ({
      ...prev,
      appPlayStore: url,
      showPlayStore: !!url,
    }));
  }, []);

  const updateAppAppStore = useCallback((url: string) => {
    setSiteData((prev) => ({
      ...prev,
      appAppStore: url,
      showAppStore: !!url,
    }));
  }, []);

  // Advanced content (AI-generated)
  const updateHeroStats = useCallback((stats: Array<{ value: string; label: string }>) => {
    setSiteData((prev) => ({ ...prev, heroStats: stats }));
  }, []);

  const updateFeatures = useCallback((features: Array<{ title: string; description: string }>) => {
    setSiteData((prev) => ({ ...prev, features }));
  }, []);

  const updateAboutContent = useCallback((content: { title: string; subtitle: string; checklist: string[] }) => {
    setSiteData((prev) => ({ ...prev, aboutContent: content }));
  }, []);

  const updateServiceDescriptions = useCallback((descriptions: Array<{ name: string; description: string }>) => {
    setSiteData((prev) => ({ ...prev, serviceDescriptions: descriptions }));
  }, []);

  const updateTestimonials = useCallback((testimonials: Array<{ name: string; role: string; text: string }>) => {
    setSiteData((prev) => ({ ...prev, testimonials }));
  }, []);

  const updateFAQ = useCallback((faq: Array<{ question: string; answer: string }>) => {
    setSiteData((prev) => ({ ...prev, faq }));
  }, []);

  // Validation helpers
  const hasSection = useCallback((section: SectionKey) => {
    return siteData.sections.includes(section);
  }, [siteData.sections]);

  const isServicesSectionComplete = useCallback(() => {
    return siteData.services.length > 0;
  }, [siteData.services]);

  const isGallerySectionComplete = useCallback(() => {
    return siteData.gallery.length > 0;
  }, [siteData.gallery]);

  const isContactSectionComplete = useCallback(() => {
    return !!siteData.address;
  }, [siteData.address]);

  const isBasicInfoComplete = useCallback(() => {
    return !!siteData.name && !!siteData.slogan && !!siteData.description;
  }, [siteData.name, siteData.slogan, siteData.description]);

  return {
    // State
    siteData,

    // General updates
    updateSiteData,
    setAllSiteData,
    resetSiteData,

    // Individual field updates
    updateArea,
    updateName,
    updateSlogan,
    updateDescription,
    updateVibe,
    updateColors,
    updateSelectedPaletteId,

    // Sections
    addSection,
    removeSection,
    toggleSection,
    setSections,

    // Services
    addService,
    setServices,
    removeService,

    // Gallery
    addGalleryImage,
    addGalleryImages,
    removeGalleryImage,
    setGallery,

    // Contact
    updateAddress,
    updatePhone,
    updateEmail,

    // App stores
    updateAppPlayStore,
    updateAppAppStore,

    // Advanced content
    updateHeroStats,
    updateFeatures,
    updateAboutContent,
    updateServiceDescriptions,
    updateTestimonials,
    updateFAQ,

    // Validation helpers
    hasSection,
    isServicesSectionComplete,
    isGallerySectionComplete,
    isContactSectionComplete,
    isBasicInfoComplete,
  };
}
