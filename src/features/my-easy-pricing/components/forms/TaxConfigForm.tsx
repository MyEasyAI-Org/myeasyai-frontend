// =============================================================================
// TaxConfigForm - Form for managing taxes and fees configuration
// =============================================================================

import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { PRICING_LABELS, COST_SUGGESTIONS } from '../../constants/pricing.constants';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { TaxItemRow } from '../shared/TaxItemRow';
import type { TaxRegime, TaxCategory } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface TaxConfigFormProps {
  storeId: string | null;
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
// Tax Category Mapping
// =============================================================================

const SUGGESTION_TO_CATEGORY: Record<string, TaxCategory> = {
  card: 'card_fee',
  marketplace: 'marketplace_fee',
  commission: 'commission',
};

// =============================================================================
// Component
// =============================================================================

export function TaxConfigForm({ storeId }: TaxConfigFormProps) {
  const labels = PRICING_LABELS;

  // Hook for managing tax config
  const {
    taxConfig,
    taxItems,
    isLoading,
    totalTaxPercentage,
    loadTaxData,
    updateTaxRegime,
    addTaxItem,
    updateTaxItem,
    deleteTaxItem,
    clearTaxData,
  } = useTaxConfig();

  // Track newly added items (for auto-focus)
  const [newItemId, setNewItemId] = useState<string | null>(null);

  // Load data when store changes
  useEffect(() => {
    if (storeId) {
      loadTaxData(storeId);
    } else {
      clearTaxData();
    }
  }, [storeId, loadTaxData, clearTaxData]);

  // Get used suggestion IDs to filter chips
  const usedSuggestionIds = taxItems
    .map(item => {
      // Map category back to suggestion id
      if (item.category === 'card_fee') return 'card';
      if (item.category === 'marketplace_fee') return 'marketplace';
      if (item.category === 'commission') return 'commission';
      return null;
    })
    .filter(Boolean) as string[];

  // Handle regime change
  const handleRegimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!storeId) return;
    const regime = e.target.value as TaxRegime;
    await updateTaxRegime(storeId, regime);
  };

  // Handle suggestion click
  const handleSuggestionSelect = async (suggestion: { id: string; label: string }) => {
    if (!storeId) return;

    const category = SUGGESTION_TO_CATEGORY[suggestion.id] || 'other';
    const newItem = await addTaxItem(storeId, {
      name: suggestion.label,
      category,
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
        <h3 className="text-lg font-medium text-white">
          {labels.taxes.title}
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
      <div className="flex flex-wrap gap-2">
        {COST_SUGGESTIONS.taxes.map(suggestion => {
          const isUsed = usedSuggestionIds.includes(suggestion.id);
          return (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              disabled={isLoading || isUsed}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-all
                ${isUsed
                  ? 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-400/10'
                }
                disabled:cursor-not-allowed
              `}
            >
              + {suggestion.label}
            </button>
          );
        })}

        {/* Add Custom Button */}
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm rounded-full border border-dashed border-slate-600 text-slate-400 hover:border-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          {labels.taxes.addCustom}
        </button>
      </div>

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
