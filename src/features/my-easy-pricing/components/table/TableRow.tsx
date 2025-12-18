// =============================================================================
// TableRow - Individual product row with calculations
// =============================================================================

import type { ProductCalculation } from '../../hooks/useCalculations';
import {
  formatCurrency,
  formatPercentage,
  formatTaxDisplay,
  formatBreakEven,
  formatMarketComparison,
} from '../../utils/formatters';

// =============================================================================
// Types
// =============================================================================

interface TableRowProps {
  calculation: ProductCalculation;
  productDescription?: string;
}

// =============================================================================
// Component
// =============================================================================

export function TableRow({ calculation, productDescription }: TableRowProps) {
  const {
    productName,
    directCost,
    indirectCostAllocated,
    hiddenCostAllocated,
    totalCost,
    taxPercentage,
    taxValue,
    suggestedPrice,
    grossMargin,
    netMargin,
    profitPerUnit,
    breakEvenUnits,
    marketComparison,
  } = calculation;

  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      {/* Product Name */}
      <td className="px-4 py-2 whitespace-nowrap">
        <div>
          <p className="text-sm font-medium text-slate-200">{productName}</p>
          {productDescription && (
            <p className="text-xs text-slate-500 truncate max-w-[200px]">
              {productDescription}
            </p>
          )}
        </div>
      </td>

      {/* Direct Cost */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-slate-300">{formatCurrency(directCost)}</span>
      </td>

      {/* Indirect Cost (allocated per unit) */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-slate-400">
          {indirectCostAllocated > 0 ? formatCurrency(indirectCostAllocated) : '-'}
        </span>
      </td>

      {/* Hidden Cost (allocated per unit) */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-slate-400">
          {hiddenCostAllocated > 0 ? formatCurrency(hiddenCostAllocated) : '-'}
        </span>
      </td>

      {/* Taxes - Shows both percentage and value */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-slate-400">
          {formatTaxDisplay(taxPercentage, taxValue)}
        </span>
      </td>

      {/* Total Cost */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm font-medium text-slate-200">{formatCurrency(totalCost)}</span>
      </td>

      {/* Suggested Price - Highlighted column */}
      <td className="px-4 py-2 text-right whitespace-nowrap bg-yellow-600/10">
        <span className="text-sm font-semibold text-yellow-400">{formatCurrency(suggestedPrice)}</span>
      </td>

      {/* Gross Margin */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-green-400">{formatPercentage(grossMargin)}</span>
      </td>

      {/* Net Margin */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className={`text-sm ${netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercentage(netMargin)}
        </span>
      </td>

      {/* Profit per Unit */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className={`text-sm font-medium ${profitPerUnit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(profitPerUnit)}
        </span>
      </td>

      {/* Break-Even Units */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className="text-sm text-slate-400">
          {formatBreakEven(breakEvenUnits)}
        </span>
      </td>

      {/* Market Comparison */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <span className={`text-sm ${
          marketComparison === null
            ? 'text-slate-500'
            : marketComparison > 0
              ? 'text-amber-400'
              : 'text-blue-400'
        }`}>
          {formatMarketComparison(marketComparison)}
        </span>
      </td>
    </tr>
  );
}
