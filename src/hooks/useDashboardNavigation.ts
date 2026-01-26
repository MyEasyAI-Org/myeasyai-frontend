import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../router';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Available dashboard tab identifiers
 * @description Defines all possible tabs in the dashboard interface
 */
export type DashboardTab =
  | 'overview'
  | 'subscription'
  | 'products'
  | 'usage'
  | 'settings'
  | 'profile';

/**
 * Configuration options for useDashboardNavigation hook
 * @description Customize navigation behavior with optional callbacks and initial state
 */
export type UseDashboardNavigationOptions = {
  /** Callback function to navigate to home view */
  onGoHome?: () => void;
  /** Callback function to navigate to MyEasyWebsite feature */
  onGoToMyEasyWebsite?: () => void;
  /** Callback function to navigate to BusinessGuru feature */
  onGoToBusinessGuru?: () => void;
  /** Callback function to navigate to MyEasyPricing feature */
  onGoToMyEasyPricing?: () => void;
  /** Callback function to navigate to MyEasyCRM feature */
  onGoToMyEasyCRM?: () => void;
  /** Callback function to navigate to MyEasyContent feature */
  onGoToMyEasyContent?: () => void;
  /** Callback function to navigate to MyEasyFitness feature */
  onGoToMyEasyFitness?: () => void;
  /** Callback function to navigate to MyEasyAvatar feature */
  onGoToMyEasyAvatar?: () => void;
  /** Callback function to navigate to MyEasyCode feature */
  onGoToMyEasyCode?: () => void;
  /** Callback function to navigate to MyEasyResume feature */
  onGoToMyEasyResume?: () => void;
  /** Callback function to navigate to MyEasyLearning feature */
  onGoToMyEasyLearning?: () => void;
  /** Callback function to navigate to MyEasyDocs feature */
  onGoToMyEasyDocs?: () => void;
  /** Initial active tab (default: 'overview') */
  initialTab?: DashboardTab;
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default initial tab
 * @constant {DashboardTab}
 */
const DEFAULT_INITIAL_TAB: DashboardTab = 'overview';

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing dashboard navigation and tab switching
 *
 * @description
 * Provides centralized navigation logic for the dashboard, including:
 * - **Tab management**: Switch between dashboard tabs
 * - **Feature navigation**: Navigate to external features (MyEasyWebsite, BusinessGuru, MyEasyCRM, etc)
 * - **Product routing**: Smart routing based on product names
 * - **React Router integration**: Uses react-router-dom for URL-based navigation
 *
 * @param {UseDashboardNavigationOptions} [options] - Configuration options
 * @param {() => void} [options.onGoHome] - Callback to navigate to home
 * @param {() => void} [options.onGoToMyEasyWebsite] - Callback to navigate to MyEasyWebsite
 * @param {() => void} [options.onGoToBusinessGuru] - Callback to navigate to BusinessGuru
 * @param {() => void} [options.onGoToMyEasyCRM] - Callback to navigate to MyEasyCRM
 * @param {DashboardTab} [options.initialTab='overview'] - Initial active tab
 * @returns {Object} Navigation state and control functions
 * @returns {DashboardTab} returns.activeTab - Currently active tab
 * @returns {Function} returns.setActiveTab - Change active tab
 * @returns {Function} returns.navigateToProduct - Navigate based on product name
 * @returns {Function} returns.goToHome - Navigate to home view
 * @returns {Function} returns.goToWebsite - Navigate to MyEasyWebsite
 * @returns {Function} returns.goToGuru - Navigate to BusinessGuru
 * @returns {Function} returns.goToCRM - Navigate to MyEasyCRM
 */
export function useDashboardNavigation(
  options: UseDashboardNavigationOptions = {},
) {
  const {
    onGoHome,
    onGoToMyEasyWebsite,
    onGoToBusinessGuru,
    onGoToMyEasyPricing,
    onGoToMyEasyCRM,
    onGoToMyEasyContent,
    onGoToMyEasyFitness,
    onGoToMyEasyAvatar,
    onGoToMyEasyCode,
    onGoToMyEasyResume,
    onGoToMyEasyLearning,
    onGoToMyEasyDocs,
    initialTab = DEFAULT_INITIAL_TAB,
  } = options;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ============================================================================
  // STATE
  // ============================================================================

  // Get initial tab from URL param or use provided initialTab
  const getInitialTab = (): DashboardTab => {
    const urlTab = searchParams.get('tab');
    const validTabs: DashboardTab[] = ['overview', 'subscription', 'products', 'usage', 'settings', 'profile'];
    if (urlTab && validTabs.includes(urlTab as DashboardTab)) {
      return urlTab as DashboardTab;
    }
    return initialTab;
  };

  const [activeTab, setActiveTabState] = useState<DashboardTab>(getInitialTab);

  // Listen for URL changes and update tab accordingly
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const validTabs: DashboardTab[] = ['overview', 'subscription', 'products', 'usage', 'settings', 'profile'];
    if (urlTab && validTabs.includes(urlTab as DashboardTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab as DashboardTab);
    }
  }, [searchParams, activeTab]);

  // Custom setActiveTab that also updates URL
  const setActiveTab = useCallback((tab: DashboardTab) => {
    setActiveTabState(tab);
    // Update URL without navigation (just update the query param)
    setSearchParams({ tab }, { replace: true });
  }, [setSearchParams]);

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  /**
   * Navigate to home view
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the home route.
   *
   * @returns {void}
   */
  const goToHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate(ROUTES.HOME);
    }
  }, [onGoHome, navigate]);

  /**
   * Navigate to MyEasyWebsite feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyWebsite route.
   *
   * @returns {void}
   */
  const goToWebsite = useCallback(() => {
    if (onGoToMyEasyWebsite) {
      onGoToMyEasyWebsite();
    } else {
      navigate(ROUTES.MY_EASY_WEBSITE);
    }
  }, [onGoToMyEasyWebsite, navigate]);

  /**
   * Navigate to BusinessGuru feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the BusinessGuru route.
   *
   * @returns {void}
   */
  const goToGuru = useCallback(() => {
    if (onGoToBusinessGuru) {
      onGoToBusinessGuru();
    } else {
      navigate(ROUTES.BUSINESS_GURU);
    }
  }, [onGoToBusinessGuru, navigate]);

  /**
   * Navigate to MyEasyCRM feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyCRM route.
   *
   * @returns {void}
   */
  const goToCRM = useCallback(() => {
    if (onGoToMyEasyCRM) {
      onGoToMyEasyCRM();
    } else {
      navigate(ROUTES.MY_EASY_CRM);
    }
  }, [onGoToMyEasyCRM, navigate]);

  /**
   * Navigate to MyEasyPricing feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyPricing route.
   *
   * @returns {void}
   */
  const goToPricing = useCallback(() => {
    if (onGoToMyEasyPricing) {
      onGoToMyEasyPricing();
    } else {
      navigate(ROUTES.MY_EASY_PRICING);
    }
  }, [onGoToMyEasyPricing, navigate]);

  /**
   * Navigate to MyEasyContent feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyContent route.
   *
   * @returns {void}
   */
  const goToContent = useCallback(() => {
    if (onGoToMyEasyContent) {
      onGoToMyEasyContent();
    } else {
      navigate(ROUTES.MY_EASY_CONTENT);
    }
  }, [onGoToMyEasyContent, navigate]);

  /**
   * Navigate to MyEasyFitness feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyFitness route.
   *
   * @returns {void}
   */
  const goToFitness = useCallback(() => {
    if (onGoToMyEasyFitness) {
      onGoToMyEasyFitness();
    } else {
      navigate(ROUTES.MY_EASY_FITNESS);
    }
  }, [onGoToMyEasyFitness, navigate]);

  /**
   * Navigate to MyEasyAvatar feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyAvatar route.
   *
   * @returns {void}
   */
  const goToAvatar = useCallback(() => {
    if (onGoToMyEasyAvatar) {
      onGoToMyEasyAvatar();
    } else {
      navigate(ROUTES.MY_EASY_AVATAR);
    }
  }, [onGoToMyEasyAvatar, navigate]);

  /**
   * Navigate to MyEasyCode feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyCode route.
   *
   * @returns {void}
   */
  const goToCode = useCallback(() => {
    if (onGoToMyEasyCode) {
      onGoToMyEasyCode();
    } else {
      navigate(ROUTES.MY_EASY_CODE);
    }
  }, [onGoToMyEasyCode, navigate]);

  /**
   * Navigate to MyEasyResume feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyResume route.
   *
   * @returns {void}
   */
  const goToResume = useCallback(() => {
    if (onGoToMyEasyResume) {
      onGoToMyEasyResume();
    } else {
      navigate(ROUTES.MY_EASY_RESUME);
    }
  }, [onGoToMyEasyResume, navigate]);

  /**
   * Navigate to MyEasyLearning feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyLearning route.
   *
   * @returns {void}
   */
  const goToLearning = useCallback(() => {
    if (onGoToMyEasyLearning) {
      onGoToMyEasyLearning();
    } else {
      navigate(ROUTES.MY_EASY_LEARNING);
    }
  }, [onGoToMyEasyLearning, navigate]);

  /**
   * Navigate to MyEasyDocs feature
   * @description
   * Attempts to use the provided callback. If not available, uses React Router
   * to navigate to the MyEasyDocs route.
   *
   * @returns {void}
   */
  const goToDocs = useCallback(() => {
    if (onGoToMyEasyDocs) {
      onGoToMyEasyDocs();
    } else {
      navigate(ROUTES.MY_EASY_DOCS);
    }
  }, [onGoToMyEasyDocs, navigate]);

  /**
   * Navigate to a feature based on product name
   * @description
   * Smart routing that analyzes the product name and navigates to the appropriate feature:
   * - Names containing "website" or "site" → MyEasyWebsite
   * - Names containing "guru" or "business" → BusinessGuru
   * - Names containing "pricing" or "preco" → MyEasyPricing
   * - Names containing "crm" → MyEasyCRM
   * - Names containing "content" → MyEasyContent
   * - Names containing "fitness" → MyEasyFitness
   * - Names containing "avatar" → MyEasyAvatar
   * - Names containing "code" → MyEasyCode
   * - Names containing "resume" or "curriculo" → MyEasyResume
   * - Names containing "learning" or "aprendizado" or "estudo" → MyEasyLearning
   * - Names containing "docs" or "documentos" or "arquivos" → MyEasyDocs
   * - Other names → Home
   *
   * @param {string} productName - Name of the product to access
   * @returns {void}
   */
  const navigateToProduct = useCallback(
    (productName: string) => {
      const name = productName.toLowerCase();

      if (name.includes('website') || name.includes('site')) {
        goToWebsite();
      } else if (name.includes('guru') || name.includes('business')) {
        goToGuru();
      } else if (name.includes('pricing') || name.includes('preco')) {
        goToPricing();
      } else if (name.includes('crm')) {
        goToCRM();
      } else if (name.includes('content')) {
        goToContent();
      } else if (name.includes('fitness')) {
        goToFitness();
      } else if (name.includes('avatar')) {
        goToAvatar();
      } else if (name.includes('code')) {
        goToCode();
      } else if (name.includes('resume') || name.includes('curriculo')) {
        goToResume();
      } else if (name.includes('learning') || name.includes('aprendizado') || name.includes('estudo')) {
        goToLearning();
      } else if (name.includes('docs') || name.includes('documentos') || name.includes('arquivos')) {
        goToDocs();
      } else {
        goToHome();
      }
    },
    [goToWebsite, goToGuru, goToPricing, goToCRM, goToContent, goToFitness, goToAvatar, goToCode, goToResume, goToLearning, goToDocs, goToHome],
  );

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    activeTab,
    setActiveTab,
    navigateToProduct,
    goToHome,
    goToWebsite,
    goToGuru,
    goToPricing,
    goToCRM,
    goToContent,
    goToFitness,
    goToAvatar,
    goToCode,
    goToResume,
    goToLearning,
    goToDocs,
  };
}
