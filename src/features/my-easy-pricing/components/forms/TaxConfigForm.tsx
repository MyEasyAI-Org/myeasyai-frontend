// =============================================================================
// TaxConfigForm - Form for managing taxes and fees configuration
// =============================================================================

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PRICING_LABELS, COST_SUGGESTIONS } from '../../constants/pricing.constants';
import { CostSuggestionChips } from '../shared/CostSuggestionChips';
import { TaxItemRow } from '../shared/TaxItemRow';
import { Tooltip } from '../shared/Tooltip';
import type { TaxConfig, TaxItem, TaxRegime, TaxCategory } from '../../types/pricing.types';
import type { TaxItemFormData } from '../../hooks/useTaxConfig';

// =============================================================================
// Types
// =============================================================================

interface TaxConfigFormProps {
  storeId: string | null;
  taxConfig: TaxConfig | null;
  taxItems: TaxItem[];
  isLoading: boolean;
  totalTaxPercentage: number;
  updateTaxRegime: (storeId: string, regime: TaxRegime) => Promise<boolean>;
  addTaxItem: (storeId: string, data: TaxItemFormData) => Promise<TaxItem | null>;
  updateTaxItem: (itemId: string, data: Partial<TaxItemFormData>) => Promise<boolean>;
  deleteTaxItem: (itemId: string) => Promise<boolean>;
}

// =============================================================================
// Tax Regime Options
// =============================================================================

const TAX_REGIME_OPTIONS: { value: TaxRegime; label: string }[] = [
  { value: 'simples', label: PRICING_LABELS.taxes.regimes.simples },
  { value: 'mei', label: PRICING_LABELS.taxes.regimes.mei },
  { value: 'lucro_presumido', label: PRICING_LABELS.taxes.regimes.lucro_presumido },
  { value: 'lucro_real', label: PRICING_LABELS.taxes.regimes.lucro_real },
];

// =============================================================================
// Tax Suggestions with Category (adapted for CostSuggestionChips)
// =============================================================================

const TAX_SUGGESTIONS = COST_SUGGESTIONS.taxes.map(s => ({
  id: s.id,
  label: s.label,
  category: s.id === 'card' ? 'card_fee' : s.id === 'marketplace' ? 'marketplace_fee' : s.id === 'commission' ? 'commission' : 'other',
}));

// =============================================================================
// Component
// =============================================================================

export function TaxConfigForm({
  storeId,
  taxConfig,
  taxItems,
  isLoading,
  totalTaxPercentage,
  updateTaxRegime,
  addTaxItem,
  updateTaxItem,
  deleteTaxItem,
}: TaxConfigFormProps) {
  const labels = PRICING_LABELS;

  // Track newly added items (for auto-focus)
  const [newItemId, setNewItemId] = useState<string | null>(null);

  // Get used categories to filter chips
  const usedCategories = taxItems.map(item => item.category);

  // Handle regime change
  const handleRegimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!storeId) return;
    const regime = e.target.value as TaxRegime;
    await updateTaxRegime(storeId, regime);
  };

  // Handle suggestion click
  const handleSuggestionSelect = async (suggestion: { id: string; label: string; category: string }) => {
    if (!storeId) return;

    const newItem = await addTaxItem(storeId, {
      name: suggestion.label,
      category: suggestion.category as TaxCategory,
      percentage: 0,
    });

    if (newItem) {
      setNewItemId(newItem.id);
      setTimeout(() => setNewItemId(null), 100);
    }
  };

  // Handle add custom tax
  const handleAddCustom = async () => {
    if (!storeId) return;

    const newItem = await addTaxItem(storeId, {
      name: '',
      category: 'other' as TaxCategory,
      percentage: 0,
    });

    if (newItem) {
      setNewItemId(newItem.id);
      setTimeout(() => setNewItemId(null), 100);
    }
  };

  // Handle update item
  const handleUpdateItem = async (
    itemId: string,
    data: { name?: string; percentage?: number }
  ): Promise<boolean> => {
    return await updateTaxItem(itemId, data);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string): Promise<boolean> => {
    return await deleteTaxItem(itemId);
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
          {labels.taxes.title}
          <Tooltip content={labels.tooltips.taxImpact} position="right" />
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {labels.taxes.subtitle}
        </p>
      </div>

      {/* Tax Regime Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          {labels.taxes.regimeLabel}
        </label>
        <select
          value={taxConfig?.tax_regime || 'simples'}
          onChange={handleRegimeChange}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50"
        >
          {TAX_REGIME_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700" />

      {/* Suggestion Chips */}
      <CostSuggestionChips
        suggestions={TAX_SUGGESTIONS}
        usedCategories={usedCategories}
        onSelect={handleSuggestionSelect}
        onAddCustom={handleAddCustom}
        addCustomLabel={labels.taxes.addCustom}
        disabled={isLoading}
      />

      {/* Loading State */}
      {isLoading && taxItems.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
        </div>
      )}

      {/* Tax Item Rows */}
      {taxItems.length > 0 && (
        <div className="space-y-2">
          {taxItems.map(item => (
            <TaxItemRow
              key={item.id}
              id={item.id}
              name={item.name}
              percentage={item.percentage}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              isNew={item.id === newItemId}
              disabled={isLoading}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && taxItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-6">
          <div className="text-center text-slate-500">
            <p className="text-sm">{labels.empty.noTaxes}</p>
            <p className="text-xs mt-1">Clique nas sugestoes acima para adicionar taxas</p>
          </div>
        </div>
      )}

      {/* Total Tax Percentage */}
      {taxItems.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {labels.forms.taxTotal}
            </span>
            <span className="text-lg font-semibold text-yellow-400">
              {totalTaxPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
