// =============================================================================
// CostsBreakdownTable - Detailed costs breakdown table
// =============================================================================

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { IndirectCost, HiddenCost, TaxItem } from '../../types/pricing.types';
import type { StoreCostsSummary } from '../../hooks/useCalculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { calculateMonthlyCost } from '../../utils/calculations';

// =============================================================================
// Types
// =============================================================================

interface CostsBreakdownTableProps {
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
  summary: StoreCostsSummary;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getFrequencyLabel(frequency: 'monthly' | 'yearly' | 'one_time'): string {
  return PRICING_LABELS.forms.frequencies[frequency] || frequency;
}

function getCategoryLabel(category: string): string {
  const categories = PRICING_LABELS.table.costsBreakdown.categories as Record<string, string>;
  return categories[category] || category;
}

function formatOriginalValue(
  amount: number,
  frequency: 'monthly' | 'yearly' | 'one_time',
  amortizationMonths?: number
): string {
  const value = formatCurrency(amount);

  switch (frequency) {
    case 'yearly':
      return `${value}/ano`;
    case 'one_time':
      return amortizationMonths && amortizationMonths !== 12
        ? `${value} (${amortizationMonths}m)`
        : value;
    default:
      return value;
  }
}

// =============================================================================
// Sub-Components
// =============================================================================

interface CostsSectionProps {
  title: string;
  colorClass: string;
  borderColorClass: string;
  children: React.ReactNode;
  subtotalLabel: string;
  subtotalValue: string;
  isExpanded: boolean;
  onToggle: () => void;
  itemCount: number;
}

function CostsSection({
  title,
  colorClass,
  borderColorClass,
  children,
  subtotalLabel,
  subtotalValue,
  isExpanded,
  onToggle,
  itemCount,
}: CostsSectionProps) {
  return (
    <div className={`border ${borderColorClass} rounded-lg overflow-hidden`}>
      {/* Clickable Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-4 py-2 ${colorClass} hover:brightness-110 transition-all flex items-center justify-between cursor-pointer`}
      >
        <h4 className="text-sm font-medium text-white">{title} ({itemCount})</h4>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-white" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Section Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {children}
            </table>
          </div>

          {/* Subtotal */}
          <div className={`px-4 py-2 border-t ${borderColorClass} bg-slate-800/50 flex justify-between`}>
            <span className="text-sm text-slate-400">{subtotalLabel}</span>
            <span className="text-sm font-medium text-slate-200">{subtotalValue}</span>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CostsBreakdownTable({
  indirectCosts,
  hiddenCosts,
  taxItems,
  summary,
}: CostsBreakdownTableProps) {
  const labels = PRICING_LABELS.table.costsBreakdown;

  // Collapsible state for each section
  const [isIndirectExpanded, setIsIndirectExpanded] = useState(true);
  const [isHiddenExpanded, setIsHiddenExpanded] = useState(true);
  const [isTaxesExpanded, setIsTaxesExpanded] = useState(true);

  const hasAnyCosts = indirectCosts.length > 0 || hiddenCosts.length > 0 || taxItems.length > 0;

  if (!hasAnyCosts) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-slate-200 px-4">
        {labels.title}
      </h3>

      <div className="grid gap-4 px-4 pb-4">
        {/* Indirect Costs */}
        {indirectCosts.length > 0 && (
          <CostsSection
            title={labels.indirectCosts}
            colorClass="bg-blue-600/80"
            borderColorClass="border-blue-600/30"
            subtotalLabel={labels.subtotal}
            subtotalValue={formatCurrency(summary.totalIndirectCostsMonthly)}
            isExpanded={isIndirectExpanded}
            onToggle={() => setIsIndirectExpanded(!isIndirectExpanded)}
            itemCount={indirectCosts.length}
          >
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.name}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.category}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.originalValue}
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.frequency}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.monthlyValue}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {indirectCosts.map((cost) => {
                const monthlyValue = calculateMonthlyCost(
                  cost.amount,
                  cost.frequency,
                  cost.amortization_months
                );
                return (
                  <tr key={cost.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 text-sm text-slate-200">
                      {cost.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400">
                      {getCategoryLabel(cost.category)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400 text-right">
                      {formatOriginalValue(cost.amount, cost.frequency, cost.amortization_months)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400 text-center">
                      {getFrequencyLabel(cost.frequency)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-200 text-right font-medium">
                      {formatCurrency(monthlyValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </CostsSection>
        )}

        {/* Hidden Costs */}
        {hiddenCosts.length > 0 && (
          <CostsSection
            title={labels.hiddenCosts}
            colorClass="bg-amber-600/80"
            borderColorClass="border-amber-600/30"
            subtotalLabel={labels.subtotal}
            subtotalValue={formatCurrency(summary.totalHiddenCostsMonthly)}
            isExpanded={isHiddenExpanded}
            onToggle={() => setIsHiddenExpanded(!isHiddenExpanded)}
            itemCount={hiddenCosts.length}
          >
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.name}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.category}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.originalValue}
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.frequency}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.monthlyValue}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {hiddenCosts.map((cost) => {
                const monthlyValue = calculateMonthlyCost(
                  cost.amount,
                  cost.frequency,
                  cost.amortization_months
                );
                return (
                  <tr key={cost.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 text-sm text-slate-200">
                      {cost.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400">
                      {getCategoryLabel(cost.category)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400 text-right">
                      {formatOriginalValue(cost.amount, cost.frequency, cost.amortization_months)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-400 text-center">
                      {getFrequencyLabel(cost.frequency)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-200 text-right font-medium">
                      {formatCurrency(monthlyValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </CostsSection>
        )}

        {/* Taxes */}
        {taxItems.length > 0 && (
          <CostsSection
            title={labels.taxes}
            colorClass="bg-red-600/80"
            borderColorClass="border-red-600/30"
            subtotalLabel={labels.subtotal}
            subtotalValue={formatPercentage(summary.totalTaxPercentage, 2)}
            isExpanded={isTaxesExpanded}
            onToggle={() => setIsTaxesExpanded(!isTaxesExpanded)}
            itemCount={taxItems.length}
          >
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.name}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.category}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                  {labels.columns.percentage}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {taxItems.map((tax) => (
                <tr key={tax.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2 text-sm text-slate-200">
                    {tax.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-400">
                    {getCategoryLabel(tax.category)}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-200 text-right font-medium">
                    {formatPercentage(tax.percentage, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </CostsSection>
        )}

        {/* Total Geral */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <span className="text-sm font-medium text-slate-300">{labels.total}</span>
          <div className="flex gap-6 text-sm">
            <span className="text-slate-400">
              Fixos: <span className="text-slate-200 font-medium">
                {formatCurrency(summary.totalIndirectCostsMonthly + summary.totalHiddenCostsMonthly)}/mes
              </span>
            </span>
            <span className="text-slate-400">
              Taxas: <span className="text-slate-200 font-medium">
                {formatPercentage(summary.totalTaxPercentage, 2)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
