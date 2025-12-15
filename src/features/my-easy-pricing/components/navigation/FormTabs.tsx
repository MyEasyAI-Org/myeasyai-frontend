// =============================================================================
// FormTabs - Tab navigation for cost forms
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { TabType } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface FormTabsProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType | null) => void;
  showProductTab?: boolean;
  disabled?: boolean;
}

// =============================================================================
// Tab Configuration
// =============================================================================

type TabConfig = { id: TabType; labelKey: keyof typeof PRICING_LABELS.tabs };

const BASE_TABS: TabConfig[] = [
  { id: 'indirect', labelKey: 'indirectCosts' },
  { id: 'hidden', labelKey: 'hiddenCosts' },
  { id: 'taxes', labelKey: 'taxes' },
];

const PRODUCT_TAB: TabConfig = { id: 'product', labelKey: 'product' };

// =============================================================================
// Component
// =============================================================================

export function FormTabs({ activeTab, onTabChange, showProductTab = false, disabled = false }: FormTabsProps) {
  const labels = PRICING_LABELS;

  // Include product tab when a product is selected
  const tabs = showProductTab ? [...BASE_TABS, PRODUCT_TAB] : BASE_TABS;

  // Generate data-tutorial attribute for specific tabs
  const getTutorialAttr = (tabId: TabType) => {
    if (tabId === 'indirect') return 'indirect-costs-tab';
    if (tabId === 'hidden') return 'hidden-costs-tab';
    if (tabId === 'taxes') return 'taxes-tab';
    if (tabId === 'product') return 'product-section';
    return undefined;
  };

  const renderTabButton = (tab: TabConfig) => {
    const isActive = activeTab === tab.id;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => !disabled && onTabChange(isActive ? null : tab.id)}
        disabled={disabled}
        data-tutorial={getTutorialAttr(tab.id)}
        className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          isActive
            ? 'bg-yellow-600 border-yellow-500 text-white'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {labels.tabs[tab.labelKey]}
      </button>
    );
  };

  // Separate base tabs from taxes tab for mobile layout
  const mainTabs = tabs.filter(tab => tab.id !== 'taxes');
  const taxesTab = tabs.find(tab => tab.id === 'taxes');

  return (
    <div className="mb-6">
      {/* Desktop: all tabs in one row */}
      <div className="hidden sm:flex gap-2 flex-nowrap">
        {tabs.map(renderTabButton)}
      </div>

      {/* Mobile: taxes tab on second row */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex gap-2">
          {mainTabs.map(renderTabButton)}
        </div>
        {taxesTab && (
          <div className="flex">
            {renderTabButton(taxesTab)}
          </div>
        )}
      </div>
    </div>
  );
}
