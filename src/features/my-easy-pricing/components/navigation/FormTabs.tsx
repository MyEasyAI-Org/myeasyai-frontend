// =============================================================================
// FormTabs - Tab navigation for cost forms
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { TabType } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface FormTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  disabled?: boolean;
}

// =============================================================================
// Tab Configuration
// =============================================================================

const TABS: { id: TabType; labelKey: keyof typeof PRICING_LABELS.tabs }[] = [
  { id: 'indirect', labelKey: 'indirectCosts' },
  { id: 'hidden', labelKey: 'hiddenCosts' },
  { id: 'taxes', labelKey: 'taxes' },
];

// =============================================================================
// Component
// =============================================================================

export function FormTabs({ activeTab, onTabChange, disabled = false }: FormTabsProps) {
  const labels = PRICING_LABELS;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !disabled && onTabChange(tab.id)}
              disabled={disabled}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                isActive
                  ? 'bg-yellow-600 border-yellow-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {labels.tabs[tab.labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
