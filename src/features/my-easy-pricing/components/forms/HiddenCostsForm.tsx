// =============================================================================
// HiddenCostsForm - Form for managing hidden costs of a store
// =============================================================================

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PRICING_LABELS, COST_SUGGESTIONS, CALCULATION_CONSTANTS } from '../../constants/pricing.constants';
import { CostSuggestionChips } from '../shared/CostSuggestionChips';
import { HiddenCostRow } from '../shared/HiddenCostRow';
import { Tooltip } from '../shared/Tooltip';
import { getDefaultAuxiliaryData, hasAuxiliaryCalculator } from '../../utils/hiddenCostCalculators';
import type { HiddenCost, HiddenCostCategory, HiddenCostAuxiliaryData, CostFrequency } from '../../types/pricing.types';
import type { HiddenCostFormData } from '../../hooks/useHiddenCosts';

// =============================================================================
// Types
// =============================================================================

interface HiddenCostsFormProps {
  storeId: string | null;
  costs: HiddenCost[];
  isLoading: boolean;
  totalMonthly: number;
  addCost: (storeId: string, data: HiddenCostFormData) => Promise<HiddenCost | null>;
  updateCost: (costId: string, data: Partial<HiddenCostFormData>) => Promise<boolean>;
  deleteCost: (costId: string) => Promise<boolean>;
}

// =============================================================================
// Component
// =============================================================================

export function HiddenCostsForm({
  storeId,
  costs,
  isLoading,
  totalMonthly,
  addCost,
  updateCost,
  deleteCost,
}: HiddenCostsFormProps) {
  const labels = PRICING_LABELS;

  // Track newly added costs (for auto-focus)
  const [newCostId, setNewCostId] = useState<string | null>(null);

  // Get used categories to filter suggestions
  const usedCategories = costs.map(c => c.category);

  // Handle suggestion click
  const handleSuggestionSelect = async (suggestion: { id: string; label: string; category: string }) => {
    if (!storeId) return;

    const category = suggestion.category as HiddenCostCategory;
    const hasCalc = hasAuxiliaryCalculator(category);

    const newCost = await addCost(storeId, {
      name: suggestion.label,
      category: category,
      amount: 0,
      frequency: 'monthly' as CostFrequency,
      amortization_months: CALCULATION_CONSTANTS.defaults.amortizationMonths,
      is_auto_calculated: hasCalc,
      auxiliary_data: hasCalc ? getDefaultAuxiliaryData(category) : null,
    });

    if (newCost) {
      setNewCostId(newCost.id);
      setTimeout(() => setNewCostId(null), 100);
    }
  };

  // Handle add custom cost
  const handleAddCustom = async () => {
    if (!storeId) return;

    const newCost = await addCost(storeId, {
      name: '',
      category: 'other' as HiddenCostCategory,
      amount: 0,
      frequency: 'monthly' as CostFrequency,
      amortization_months: CALCULATION_CONSTANTS.defaults.amortizationMonths,
      is_auto_calculated: false,
      auxiliary_data: null,
    });

    if (newCost) {
      setNewCostId(newCost.id);
      setTimeout(() => setNewCostId(null), 100);
    }
  };

  // Handle update cost
  const handleUpdateCost = async (
    costId: string,
    data: {
      name?: string;
      amount?: number;
      frequency?: CostFrequency;
      amortization_months?: number;
      is_auto_calculated?: boolean;
      auxiliary_data?: HiddenCostAuxiliaryData | null;
    }
  ): Promise<boolean> => {
    return await updateCost(costId, data);
  };

  // Handle delete cost
  const handleDeleteCost = async (costId: string): Promise<boolean> => {
    return await deleteCost(costId);
  };

  // No store selected
  if (!storeId) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="text-center text-slate-500">
          <p className="text-sm">Selecione uma loja primeiro</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-white">
          {labels.hiddenCosts.title}
          <Tooltip content={labels.tooltips.hiddenCost} position="right" />
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {labels.hiddenCosts.subtitle}
        </p>
      </div>

      {/* Suggestion Chips */}
      <CostSuggestionChips
        suggestions={COST_SUGGESTIONS.hidden}
        usedCategories={usedCategories}
        onSelect={handleSuggestionSelect}
        onAddCustom={handleAddCustom}
        addCustomLabel={labels.hiddenCosts.addCustom}
        disabled={isLoading}
      />

      {/* Loading State */}
      {isLoading && costs.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
        </div>
      )}

      {/* Cost Rows */}
      {costs.length > 0 && (
        <div className="space-y-2">
          {costs.map((cost) => (
            <HiddenCostRow
              key={cost.id}
              id={cost.id}
              name={cost.name}
              category={cost.category}
              amount={cost.amount}
              frequency={cost.frequency}
              amortizationMonths={cost.amortization_months}
              isAutoCalculated={cost.is_auto_calculated}
              auxiliaryData={cost.auxiliary_data}
              onUpdate={handleUpdateCost}
              onDelete={handleDeleteCost}
              isNew={cost.id === newCostId}
              disabled={isLoading}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && costs.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-6">
          <div className="text-center text-slate-500">
            <p className="text-sm">{labels.empty.noCosts}</p>
            <p className="text-xs mt-1">Clique nas sugestões acima para adicionar custos ocultos</p>
          </div>
        </div>
      )}

      {/* Total Monthly */}
      {costs.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {labels.forms.monthlyTotal}
            </span>
            <span className="text-lg font-semibold text-yellow-400">
              R$ {totalMonthly.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
