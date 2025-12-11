// =============================================================================
// RightPanel - Right side panel with products table
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem } from '../../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../../hooks/useCalculations';
import { TableHeader } from '../table/TableHeader';
import { ProductsTable } from '../table/ProductsTable';
import { CostsBreakdownTable } from '../table/CostsBreakdownTable';
import { EmptyState } from '../shared/EmptyState';
import { ExportModal } from '../export/ExportModal';

// =============================================================================
// Types
// =============================================================================

export type ViewMode = 'simple' | 'advanced';

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
  onStartTutorial?: () => void;
  isTutorialLoading?: boolean;
  // Tutorial: external control to open export modal
  tutorialOpenExportModal?: boolean;
}

// =============================================================================
// ViewModeToggle - Toggle switch between Simple and Advanced views
// =============================================================================

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
      <button
        type="button"
        onClick={() => onViewModeChange('simple')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          viewMode === 'simple'
            ? 'bg-yellow-600 text-white'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        Simplificado
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('advanced')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          viewMode === 'advanced'
            ? 'bg-yellow-600 text-white'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        Avançado
      </button>
    </div>
  );
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
  onStartTutorial,
  isTutorialLoading = false,
  tutorialOpenExportModal = false,
}: RightPanelProps) {
  const labels = PRICING_LABELS;

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('simple');

  // Track if the modal was opened by tutorial
  const modalOpenedByTutorialRef = useRef(false);

  // Open/close export modal when tutorial requests it
  useEffect(() => {
    if (tutorialOpenExportModal && selectedStore) {
      setIsExportModalOpen(true);
      modalOpenedByTutorialRef.current = true;
    } else if (!tutorialOpenExportModal && modalOpenedByTutorialRef.current) {
      // Close modal when tutorial moves away from exportHide step or ends
      setIsExportModalOpen(false);
      modalOpenedByTutorialRef.current = false;
    }
  }, [tutorialOpenExportModal, selectedStore]);

  // No store selected
  if (!selectedStore) {
    return (
      <div className="p-4 sm:p-6">
        {/* Top Bar - Toggle + Tutorial Button */}
        <div className="flex items-center justify-between mb-4">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <button
            onClick={onStartTutorial}
            disabled={isTutorialLoading || !onStartTutorial}
            className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTutorialLoading ? 'Carregando...' : labels.tutorial.button}
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
    <div className="p-4 sm:p-6">
      {/* Disclaimer */}
      <div className="mb-4 px-3 py-2 bg-amber-900/20 border border-amber-700/30 rounded-lg">
        <p className="text-xs text-amber-300/80">
          <span className="font-medium">Aviso:</span> Os valores apresentados sao estimativas e podem variar de acordo com as condicoes reais do mercado.
        </p>
      </div>

      {/* Top Bar - Toggle + Tutorial Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        <button
          onClick={onStartTutorial}
          disabled={isTutorialLoading || !onStartTutorial}
          className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTutorialLoading ? 'Carregando...' : labels.tutorial.button}
        </button>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
        data-tutorial="pricing-table"
      >
        {/* Table Header */}
        <TableHeader
          storeName={selectedStore.name}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

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

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        store={selectedStore}
        products={products}
        calculations={calculations}
        summary={summary || DEFAULT_SUMMARY}
        indirectCosts={indirectCosts}
        hiddenCosts={hiddenCosts}
        taxItems={taxItems}
      />
    </div>
  );
}
