// =============================================================================
// RightPanel - Right side panel with products table
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem } from '../../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../../hooks/useCalculations';
import { TableHeader } from '../table/TableHeader';
import { ProductsTable } from '../table/ProductsTable';
import { CostsBreakdownTable } from '../table/CostsBreakdownTable';
import { EmptyState } from '../shared/EmptyState';

// =============================================================================
// Types
// =============================================================================

interface RightPanelProps {
  selectedStore: Store | null;
  products: Product[];
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
  onCreateProduct?: () => void;
  onCreateStore?: () => void;
}

// =============================================================================
// Default summary for when no store is selected
// =============================================================================

const DEFAULT_SUMMARY: StoreCostsSummary = {
  totalIndirectCostsMonthly: 0,
  totalHiddenCostsMonthly: 0,
  totalTaxPercentage: 0,
};

// =============================================================================
// Component
// =============================================================================

export function RightPanel({
  selectedStore,
  products,
  calculations,
  summary,
  indirectCosts,
  hiddenCosts,
  taxItems,
  onCreateProduct,
  onCreateStore,
}: RightPanelProps) {
  const labels = PRICING_LABELS;

  // No store selected
  if (!selectedStore) {
    return (
      <div className="p-6">
        {/* Tutorial Button */}
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            disabled
          >
            {labels.tutorial.button}
          </button>
        </div>

        {/* Empty State - No store */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <EmptyState
            icon="store"
            title="Selecione uma loja para comecar"
            description="Crie ou selecione uma loja no painel esquerdo para configurar custos e ver a tabela de precificacao."
            actionLabel={labels.stores.createFirstButton}
            onAction={onCreateStore}
          />
        </div>
      </div>
    );
  }

  // Store selected but no products
  const hasProducts = products.length > 0;

  return (
    <div className="p-6">
      {/* Tutorial Button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          disabled
        >
          {labels.tutorial.button}
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        {/* Table Header */}
        <TableHeader storeName={selectedStore.name} />

        {/* Products Table or Empty State */}
        {hasProducts ? (
          <ProductsTable
            products={products}
            calculations={calculations}
            summary={summary || DEFAULT_SUMMARY}
            indirectCosts={indirectCosts}
            hiddenCosts={hiddenCosts}
            taxItems={taxItems}
          />
        ) : (
          <>
            {/* Show costs breakdown even without products */}
            <CostsBreakdownTable
              indirectCosts={indirectCosts}
              hiddenCosts={hiddenCosts}
              taxItems={taxItems}
              summary={summary || DEFAULT_SUMMARY}
            />

            {/* Empty state for products */}
            <EmptyState
              icon="product"
              title={labels.products.noProducts}
              description={labels.products.createFirst}
              actionLabel={labels.products.createFirstButton}
              onAction={onCreateProduct}
            />
          </>
        )}
      </div>
    </div>
  );
}
