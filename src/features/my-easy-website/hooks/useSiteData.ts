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
 * Social media links structure
 */
export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

/**
 * Business hours structure
 */
export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

/**
 * SEO data structure
 */
export interface SEOData {
  keywords?: string[];
  metaDescription?: string;
  ogImage?: string;
  ogTitle?: string;
}

/**
 * Analytics data structure
 */
export interface AnalyticsData {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleTagManagerId?: string;
}

/**
 * WhatsApp customization
 */
export interface WhatsAppConfig {
  welcomeMessage?: string;
  buttonText?: string;
  showOnMobile?: boolean;
}

/**
 * Custom domain config
 */
export interface DomainConfig {
  customDomain?: string;
  hasCustomDomain?: boolean;
  dnsConfigured?: boolean;
}

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
  templateId?: number; // ID do template selecionado (1-11)
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
  // New fields
  logo?: string; // URL da logo
  socialLinks?: SocialLinks;
  businessHours?: BusinessHours;
  showMap?: boolean; // Mostrar mapa do Google Maps
  mapCoordinates?: { lat: number; lng: number }; // Coordenadas para o mapa
  // New features (1-7)
  whatsappConfig?: WhatsAppConfig;
  customDomain?: DomainConfig;
  seoData?: SEOData;
  analyticsData?: AnalyticsData;
}

/**
 * Default site data
 * Note: Arrays that need to be "processed" are left undefined to distinguish
 * between "not yet asked" and "user chose to skip"
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
  templateId: 1, // Template Original por padrão
  sections: [],
  services: [],
  gallery: [],
  appPlayStore: '',
  appAppStore: '',
  showPlayStore: false,
  showAppStore: false,
  testimonials: [],
  address: '', // Empty string = not yet asked
  phone: '',   // Empty string = not yet asked
  email: '',   // Empty string = not yet asked
  faq: [],
  pricing: [], // Empty array = not yet asked (will be set to [] when skipped)
  team: [],    // Empty array = not yet asked (will be set to [] when skipped)
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

  const updateTemplateId = useCallback((templateId: number) => {
    setSiteData((prev) => ({ ...prev, templateId }));
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

  // New field updaters
  const updateLogo = useCallback((logo: string) => {
    setSiteData((prev) => ({ ...prev, logo }));
  }, []);

  const updateSocialLinks = useCallback((socialLinks: SocialLinks) => {
    setSiteData((prev) => ({ ...prev, socialLinks }));
  }, []);

  const updateSocialLink = useCallback((platform: keyof SocialLinks, url: string) => {
    setSiteData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
  }, []);

  const updateBusinessHours = useCallback((businessHours: BusinessHours) => {
    setSiteData((prev) => ({ ...prev, businessHours }));
  }, []);

  const updateShowMap = useCallback((showMap: boolean) => {
    setSiteData((prev) => ({ ...prev, showMap }));
  }, []);

  const updateMapCoordinates = useCallback((lat: number, lng: number) => {
    setSiteData((prev) => ({ ...prev, mapCoordinates: { lat, lng } }));
  }, []);

  // New features (1-7) updaters
  const updateWhatsAppConfig = useCallback((config: WhatsAppConfig) => {
    setSiteData((prev) => ({ ...prev, whatsappConfig: config }));
  }, []);

  const updateWhatsAppMessage = useCallback((message: string) => {
    setSiteData((prev) => ({
      ...prev,
      whatsappConfig: { ...prev.whatsappConfig, welcomeMessage: message },
    }));
  }, []);

  const updateCustomDomain = useCallback((domain: DomainConfig) => {
    setSiteData((prev) => ({ ...prev, customDomain: domain }));
  }, []);

  const updateSEOData = useCallback((seo: SEOData) => {
    setSiteData((prev) => ({ ...prev, seoData: seo }));
  }, []);

  const updateSEOKeywords = useCallback((keywords: string[]) => {
    setSiteData((prev) => ({
      ...prev,
      seoData: { ...prev.seoData, keywords },
    }));
  }, []);

  const updateSEOMetaDescription = useCallback((metaDescription: string) => {
    setSiteData((prev) => ({
      ...prev,
      seoData: { ...prev.seoData, metaDescription },
    }));
  }, []);

  const updateAnalyticsData = useCallback((analytics: AnalyticsData) => {
    setSiteData((prev) => ({ ...prev, analyticsData: analytics }));
  }, []);

  const updateGoogleAnalyticsId = useCallback((gaId: string) => {
    setSiteData((prev) => ({
      ...prev,
      analyticsData: { ...prev.analyticsData, googleAnalyticsId: gaId },
    }));
  }, []);

  const updateFacebookPixelId = useCallback((pixelId: string) => {
    setSiteData((prev) => ({
      ...prev,
      analyticsData: { ...prev.analyticsData, facebookPixelId: pixelId },
    }));
  }, []);

  const updatePricing = useCallback((pricing: Array<{ name: string; price: string; features: string[] }>) => {
    setSiteData((prev) => ({ ...prev, pricing }));
  }, []);

  const updateTeam = useCallback((team: Array<{ name: string; role: string; photo?: string }>) => {
    setSiteData((prev) => ({ ...prev, team }));
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
    updateTemplateId,

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

    // New fields
    updateLogo,
    updateSocialLinks,
    updateSocialLink,
    updateBusinessHours,
    updateShowMap,
    updateMapCoordinates,

    // New features (1-7)
    updateWhatsAppConfig,
    updateWhatsAppMessage,
    updateCustomDomain,
    updateSEOData,
    updateSEOKeywords,
    updateSEOMetaDescription,
    updateAnalyticsData,
    updateGoogleAnalyticsId,
    updateFacebookPixelId,
    updatePricing,
    updateTeam,

    // Validation helpers
    hasSection,
    isServicesSectionComplete,
    isGallerySectionComplete,
    isContactSectionComplete,
    isBasicInfoComplete,
  };
}
