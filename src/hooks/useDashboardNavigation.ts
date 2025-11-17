import { useState, useCallback } from 'react';

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
 * - **Feature navigation**: Navigate to external features (MyEasyWebsite, BusinessGuru)
 * - **Product routing**: Smart routing based on product names
 * - **Fallback handling**: Gracefully handles missing callbacks with URL fallbacks
 *
 * @param {UseDashboardNavigationOptions} [options] - Configuration options
 * @param {() => void} [options.onGoHome] - Callback to navigate to home
 * @param {() => void} [options.onGoToMyEasyWebsite] - Callback to navigate to MyEasyWebsite
 * @param {() => void} [options.onGoToBusinessGuru] - Callback to navigate to BusinessGuru
 * @param {DashboardTab} [options.initialTab='overview'] - Initial active tab
 * @returns {Object} Navigation state and control functions
 * @returns {DashboardTab} returns.activeTab - Currently active tab
 * @returns {Function} returns.setActiveTab - Change active tab
 * @returns {Function} returns.navigateToProduct - Navigate based on product name
 * @returns {Function} returns.goToHome - Navigate to home view
 * @returns {Function} returns.goToWebsite - Navigate to MyEasyWebsite
 * @returns {Function} returns.goToGuru - Navigate to BusinessGuru
 */
export function useDashboardNavigation(
  options: UseDashboardNavigationOptions = {},
) {
  const {
    onGoHome,
    onGoToMyEasyWebsite,
    onGoToBusinessGuru,
    initialTab = DEFAULT_INITIAL_TAB,
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  /**
   * Navigate to home view
   * @description
   * Attempts to use the provided callback. If not available, falls back to
   * changing window location to root path.
   *
   * @returns {void}
   */
  const goToHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  }, [onGoHome]);

  /**
   * Navigate to MyEasyWebsite feature
   * @description
   * Attempts to use the provided callback. If not available, falls back to
   * hash-based routing.
   *
   * @returns {void}
   */
  const goToWebsite = useCallback(() => {
    if (onGoToMyEasyWebsite) {
      onGoToMyEasyWebsite();
    } else {
      window.location.href = '/#myeasywebsite';
    }
  }, [onGoToMyEasyWebsite]);

  /**
   * Navigate to BusinessGuru feature
   * @description
   * Attempts to use the provided callback. If not available, falls back to
   * hash-based routing.
   *
   * @returns {void}
   */
  const goToGuru = useCallback(() => {
    if (onGoToBusinessGuru) {
      onGoToBusinessGuru();
    } else {
      window.location.href = '/#businessguru';
    }
  }, [onGoToBusinessGuru]);

  /**
   * Navigate to a feature based on product name
   * @description
   * Smart routing that analyzes the product name and navigates to the appropriate feature:
   * - Names containing "website" or "site" → MyEasyWebsite
   * - Names containing "guru" or "business" → BusinessGuru
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
      } else {
        goToHome();
      }
    },
    [goToWebsite, goToGuru, goToHome],
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
  };
}
