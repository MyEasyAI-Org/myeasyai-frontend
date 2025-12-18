// =============================================================================
// RightPanel - Right side panel with products table
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem, MainTabType } from '../../types/pricing.types';
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
  // Current main tab - controls what to display
  mainTab?: MainTabType;
}

// =============================================================================
// ViewModeToggle - Apple-style toggle switch between Simple and Advanced views
// =============================================================================

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const isAdvanced = viewMode === 'advanced';

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          !isAdvanced ? 'text-white' : 'text-slate-500'
        }`}
      >
        Simplificado
      </span>

      {/* Apple-style toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isAdvanced}
        data-tutorial="view-mode-toggle"
        onClick={() => onViewModeChange(isAdvanced ? 'simple' : 'advanced')}
        className={`
          relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer
          rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${isAdvanced ? 'bg-yellow-500' : 'bg-yellow-500'}
        `}
      >
        {/* Sliding knob */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-[27px] w-[27px]
            transform rounded-full bg-white shadow-lg ring-0
            transition-transform duration-200 ease-in-out
            ${isAdvanced ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>

      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          isAdvanced ? 'text-white' : 'text-slate-500'
        }`}
      >
        Avançado
      </span>
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
  mainTab = 'store',
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

  // Insights Dashboard View
  if (mainTab === 'insights' && selectedStore) {
    return (
      <div className="p-4 sm:p-6">
        {/* Insights Dashboard Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            {labels.insights.title}
          </h2>
          <p className="text-sm text-slate-400">
            {labels.insights.subtitle}
          </p>
        </div>

        {/* Health Score Placeholder */}
        <div className="mb-6 p-6 rounded-xl border border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              {labels.insights.healthScore.title}
            </h3>
            <span className="px-3 py-1 text-sm font-medium bg-slate-700 text-slate-300 rounded-full">
              Em desenvolvimento
            </span>
          </div>

          {/* Placeholder Health Score Circle */}
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${0.7 * 283} 283`}
                  strokeLinecap="round"
                  className="text-yellow-400"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">--</span>
              </div>
            </div>

            {/* Placeholder Factors */}
            <div className="flex-1 space-y-2">
              {Object.entries(labels.insights.healthScore.factors).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Cards Placeholder */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Insights</h3>

          {/* Placeholder Cards */}
          <div className="grid gap-4">
            {/* Critical placeholder */}
            <div className="p-4 rounded-lg border border-red-900/30 bg-red-950/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-300">Exemplo de Insight Critico</h4>
                  <p className="text-xs text-slate-400 mt-1">Os insights serao gerados com base nos dados da sua loja.</p>
                </div>
              </div>
            </div>

            {/* Warning placeholder */}
            <div className="p-4 rounded-lg border border-amber-900/30 bg-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-300">Exemplo de Insight de Atencao</h4>
                  <p className="text-xs text-slate-400 mt-1">Analises automaticas identificarao oportunidades de melhoria.</p>
                </div>
              </div>
            </div>

            {/* Positive placeholder */}
            <div className="p-4 rounded-lg border border-emerald-900/30 bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-emerald-300">Exemplo de Insight Positivo</h4>
                  <p className="text-xs text-slate-400 mt-1">Pontos fortes da sua precificacao tambem serao destacados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
