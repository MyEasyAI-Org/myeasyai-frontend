// =============================================================================
// ProductsTable - Main products table with all columns
// =============================================================================

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Product, IndirectCost, HiddenCost, TaxItem } from '../../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../../hooks/useCalculations';
import { TableRow } from './TableRow';
import { CostsBreakdownTable } from './CostsBreakdownTable';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

// =============================================================================
// Types
// =============================================================================

interface ProductsTableProps {
  products: Product[];
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
}

// =============================================================================
// Component
// =============================================================================

export function ProductsTable({
  products,
  calculations,
  summary,
  indirectCosts,
  hiddenCosts,
  taxItems,
}: ProductsTableProps) {
  const labels = PRICING_LABELS;

  // Collapsible state for products table
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);

  // Create a map for quick product lookup by ID
  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="space-y-4">
      {/* Products Section */}
      <div className="mx-2 sm:mx-4 mt-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          {labels.table.title}
        </h3>

        {/* Products Table Container */}
        <div className="border border-yellow-600/30 rounded-lg overflow-hidden">
          {/* Clickable Header */}
          <button
            type="button"
            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
            className="w-full px-4 py-2 bg-yellow-600/80 hover:bg-yellow-600/90 transition-colors flex items-center justify-between cursor-pointer"
          >
            <h4 className="text-sm font-medium text-white">Produtos ({calculations.length})</h4>
            {isProductsExpanded ? (
              <ChevronDown className="w-4 h-4 text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Collapsible Content */}
          {isProductsExpanded && (
            <>
              {/* Store Costs Summary */}
              <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-yellow-600/20 bg-slate-800/50">
                <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400">{labels.table.summary.indirectCostsMonthly}: </span>
                    <span className="text-slate-200 font-medium">
                      {formatCurrency(summary.totalIndirectCostsMonthly)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">{labels.table.summary.hiddenCostsMonthly}: </span>
                    <span className="text-slate-200 font-medium">
                      {formatCurrency(summary.totalHiddenCostsMonthly)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">{labels.table.summary.taxesTotal}: </span>
                    <span className="text-slate-200 font-medium">
                      {formatPercentage(summary.totalTaxPercentage, 2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table with horizontal scroll */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/30">
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.product}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.directCost}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.indirectCost}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.hiddenCost}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.taxes}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.totalCost}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap bg-yellow-600/10">
                        {labels.table.columns.price}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.grossMargin}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.netMargin}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.profit}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.breakEven}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                        {labels.table.columns.marketComparison}
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-800">
                    {calculations.map((calculation) => {
                      const product = productMap.get(calculation.productId);
                      return (
                        <TableRow
                          key={calculation.productId}
                          calculation={calculation}
                          productDescription={product?.description ?? undefined}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Costs Breakdown Section */}
      <CostsBreakdownTable
        indirectCosts={indirectCosts}
        hiddenCosts={hiddenCosts}
        taxItems={taxItems}
        summary={summary}
      />
    </div>
  );
}
