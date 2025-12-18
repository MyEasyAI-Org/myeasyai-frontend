// =============================================================================
// LeftPanel - Left side panel with store/product navigation and forms
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type {
  Store,
  TabType,
  MainTabType,
  Product,
  IndirectCost,
  HiddenCost,
  TaxConfig,
  TaxItem,
  TaxRegime,
} from '../../types/pricing.types';
import type { ProductCalculation } from '../../utils/calculations';
import type { IndirectCostFormData } from '../../hooks/useIndirectCosts';
import type { HiddenCostFormData } from '../../hooks/useHiddenCosts';
import type { TaxItemFormData } from '../../hooks/useTaxConfig';
import { StoreSelector } from '../navigation/StoreSelector';
import { ProductSelector } from '../navigation/ProductSelector';
import { FormTabs } from '../navigation/FormTabs';
import { IndirectCostsForm } from '../forms/IndirectCostsForm';
import { HiddenCostsForm } from '../forms/HiddenCostsForm';
import { TaxConfigForm } from '../forms/TaxConfigForm';
import { PriceAdjustSliders } from '../forms/PriceAdjustSliders';

// =============================================================================
// Types
// =============================================================================

interface LeftPanelProps {
  // Store data
  stores: Store[];
  selectedStore: Store | null;
  isStoreLoading: boolean;
  onSelectStore: (storeId: string | null) => void;
  // Product data
  products: Product[];
  selectedProduct: Product | null;
  isProductLoading: boolean;
  onSelectProduct: (productId: string | null) => void;
  // Indirect costs data
  indirectCosts: IndirectCost[];
  indirectCostsLoading: boolean;
  indirectCostsTotalMonthly: number;
  onAddIndirectCost: (storeId: string, data: IndirectCostFormData) => Promise<IndirectCost | null>;
  onUpdateIndirectCost: (costId: string, data: Partial<IndirectCostFormData>) => Promise<boolean>;
  onDeleteIndirectCost: (costId: string) => Promise<boolean>;
  // Hidden costs data
  hiddenCosts: HiddenCost[];
  hiddenCostsLoading: boolean;
  hiddenCostsTotalMonthly: number;
  onAddHiddenCost: (storeId: string, data: HiddenCostFormData) => Promise<HiddenCost | null>;
  onUpdateHiddenCost: (costId: string, data: Partial<HiddenCostFormData>) => Promise<boolean>;
  onDeleteHiddenCost: (costId: string) => Promise<boolean>;
  // Tax data
  taxConfig: TaxConfig | null;
  taxItems: TaxItem[];
  taxLoading: boolean;
  taxTotalPercentage: number;
  onUpdateTaxRegime: (storeId: string, regime: TaxRegime) => Promise<boolean>;
  onAddTaxItem: (storeId: string, data: TaxItemFormData) => Promise<TaxItem | null>;
  onUpdateTaxItem: (itemId: string, data: Partial<TaxItemFormData>) => Promise<boolean>;
  onDeleteTaxItem: (itemId: string) => Promise<boolean>;
  // Calculation for the selected product (for sliders)
  selectedProductCalculation?: ProductCalculation;
  // Handler for margin change from sliders
  onProductMarginChange?: (productId: string, newMargin: number) => Promise<boolean>;
  // Tutorial: external tab control
  tutorialActiveTab?: TabType | null;
  // Tutorial: callback when tab changes
  onTabChange?: (tab: TabType | null) => void;
  // Tutorial: external main tab control
  tutorialMainTab?: MainTabType;
  // Tutorial: callback when main tab changes
  onMainTabChange?: (tab: MainTabType) => void;
  // Modal callbacks - modals are rendered at root level
  onOpenStoreModal: (store?: Store) => void;
  onOpenProductModal: (product?: Product) => void;
}

// =============================================================================
// Component
// =============================================================================

export function LeftPanel({
  stores,
  selectedStore,
  isStoreLoading,
  onSelectStore,
  products,
  selectedProduct,
  isProductLoading,
  onSelectProduct,
  indirectCosts,
  indirectCostsLoading,
  indirectCostsTotalMonthly,
  onAddIndirectCost,
  onUpdateIndirectCost,
  onDeleteIndirectCost,
  hiddenCosts,
  hiddenCostsLoading,
  hiddenCostsTotalMonthly,
  onAddHiddenCost,
  onUpdateHiddenCost,
  onDeleteHiddenCost,
  taxConfig,
  taxItems,
  taxLoading,
  taxTotalPercentage,
  onUpdateTaxRegime,
  onAddTaxItem,
  onUpdateTaxItem,
  onDeleteTaxItem,
  selectedProductCalculation,
  onProductMarginChange,
  tutorialActiveTab,
  onTabChange,
  tutorialMainTab,
  onMainTabChange,
  onOpenStoreModal,
  onOpenProductModal,
}: LeftPanelProps) {
  const labels = PRICING_LABELS;

  // Main tab state (store | product | costs)
  // Use external tutorialMainTab if provided, otherwise use internal state
  const [internalMainTab, setInternalMainTab] = useState<MainTabType>('store');
  const mainTab = tutorialMainTab !== undefined ? tutorialMainTab : internalMainTab;

  const handleMainTabChange = (tab: MainTabType) => {
    if (onMainTabChange) {
      onMainTabChange(tab);
    } else {
      setInternalMainTab(tab);
    }
  };

  // Sub-tab state (null = no tab selected initially)
  // Use external tutorialActiveTab if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState<TabType | null>(null);
  const activeTab = tutorialActiveTab !== undefined ? tutorialActiveTab : internalActiveTab;

  const handleTabChange = (tab: TabType | null) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Track previous store ID to reset tab when store changes
  const prevStoreIdRef = useRef<string | null>(null);

  // Reset tab when store changes (only for internal state)
  useEffect(() => {
    const currentStoreId = selectedStore?.id ?? null;
    const prevStoreId = prevStoreIdRef.current;

    if (currentStoreId !== prevStoreId) {
      prevStoreIdRef.current = currentStoreId;
      setInternalActiveTab(null);
    }
  }, [selectedStore]);

  // Store Handlers
  const handleCreateNewStore = () => {
    onOpenStoreModal();
  };

  const handleEditStore = () => {
    if (selectedStore) {
      onOpenStoreModal(selectedStore);
    }
  };

  // Product Handlers
  const handleCreateNewProduct = () => {
    onOpenProductModal();
  };

  const handleEditProduct = (product: Product) => {
    onOpenProductModal(product);
  };

  const handleSelectProduct = (productId: string | null) => {
    onSelectProduct(productId);
  };

  const hasSelectedStore = !!selectedStore;
  const hasSelectedProduct = !!selectedProduct;

  return (
    <div className="h-full flex flex-col">
      {/* Main Tabs - Loja | Custos | Produto (Fixed) */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-1 pb-0">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => handleMainTabChange('store')}
            data-tutorial="store-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mainTab === 'store'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {labels.mainTabs.store}
          </button>
          <button
            onClick={() => handleMainTabChange('costs')}
            disabled={!hasSelectedStore}
            data-tutorial="costs-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mainTab === 'costs'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-slate-400 hover:text-slate-300'
            } ${!hasSelectedStore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {labels.mainTabs.costs}
          </button>
          <button
            onClick={() => handleMainTabChange('product')}
            disabled={!hasSelectedStore}
            data-tutorial="product-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mainTab === 'product'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-slate-400 hover:text-slate-300'
            } ${!hasSelectedStore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {labels.mainTabs.product}
          </button>
          <button
            onClick={() => handleMainTabChange('insights')}
            disabled={!hasSelectedStore}
            data-tutorial="insights-tab"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mainTab === 'insights'
                ? 'text-yellow-400 border-b-2 border-yellow-400 -mb-px'
                : 'text-slate-400 hover:text-slate-300'
            } ${!hasSelectedStore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {labels.mainTabs.insights}
          </button>
        </div>
      </div>

      {/* Tab Content (Scrollable) - scrollbar-gutter reserves space for scrollbar */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6" style={{ scrollbarGutter: 'stable' }}>
        {/* Store Tab Content */}
        {mainTab === 'store' && (
          <div data-tutorial="store-selector">
            <StoreSelector
              stores={stores}
              selectedStore={selectedStore}
              isLoading={isStoreLoading}
              onSelectStore={onSelectStore}
              onCreateNew={handleCreateNewStore}
              onEditStore={handleEditStore}
            />
          </div>
        )}

        {/* Product Tab Content */}
        {mainTab === 'product' && hasSelectedStore && (
          <>
            {/* Product Selector */}
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              isLoading={isProductLoading}
              onSelectProduct={handleSelectProduct}
              onCreateNew={handleCreateNewProduct}
            />

            {/* Product Info + Sliders - Only when product is selected */}
            {hasSelectedProduct && (
              <>
                {/* Product Info Card */}
                <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  {selectedProduct.name}
                </h3>
                <button
                  onClick={() => handleEditProduct(selectedProduct)}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {labels.products.editProduct}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  label="Custo Direto"
                  value={`R$ ${selectedProduct.direct_cost.toFixed(2)}`}
                />
                <InfoCard
                  label="Margem Desejada"
                  value={`${selectedProduct.desired_margin}%`}
                />
                <InfoCard
                  label="Tipo de Unidade"
                  value={labels.products.modal.unitTypes[selectedProduct.unit_type]}
                />
                <InfoCard
                  label="Posicionamento"
                  value={labels.products.modal.positionings[selectedProduct.positioning]}
                />
                <InfoCard
                  label="Vendas/Mes"
                  value={`${selectedProduct.monthly_units_estimate} un`}
                />
                <InfoCard
                  label="Peso (rateio)"
                  value={selectedProduct.weight.toString()}
                />
              </div>

              {selectedProduct.market_price && (
                <InfoCard
                  label="Preco de Mercado (referencia)"
                  value={`R$ ${selectedProduct.market_price.toFixed(2)}`}
                />
              )}
            </div>

            {/* Price Adjustment Sliders */}
            {selectedProductCalculation && onProductMarginChange && (
              <PriceAdjustSliders
                product={selectedProduct}
                calculation={selectedProductCalculation}
                onMarginChange={onProductMarginChange}
              />
            )}
              </>
            )}
          </>
        )}

        {/* Costs Tab Content */}
        {mainTab === 'costs' && hasSelectedStore && (
          <>
            {/* Sub-Tabs (Indirect, Hidden, Taxes) */}
            <FormTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showProductTab={false}
            />

            {/* Tab Content - Only show when a sub-tab is selected */}
            {activeTab && (
              <TabContent
                activeTab={activeTab}
                storeId={selectedStore.id}
                indirectCosts={indirectCosts}
                indirectCostsLoading={indirectCostsLoading}
                indirectCostsTotalMonthly={indirectCostsTotalMonthly}
                onAddIndirectCost={onAddIndirectCost}
                onUpdateIndirectCost={onUpdateIndirectCost}
                onDeleteIndirectCost={onDeleteIndirectCost}
                hiddenCosts={hiddenCosts}
                hiddenCostsLoading={hiddenCostsLoading}
                hiddenCostsTotalMonthly={hiddenCostsTotalMonthly}
                onAddHiddenCost={onAddHiddenCost}
                onUpdateHiddenCost={onUpdateHiddenCost}
                onDeleteHiddenCost={onDeleteHiddenCost}
                taxConfig={taxConfig}
                taxItems={taxItems}
                taxLoading={taxLoading}
                taxTotalPercentage={taxTotalPercentage}
                onUpdateTaxRegime={onUpdateTaxRegime}
                onAddTaxItem={onAddTaxItem}
                onUpdateTaxItem={onUpdateTaxItem}
                onDeleteTaxItem={onDeleteTaxItem}
              />
            )}

            {/* Empty state when no sub-tab is selected */}
            {!activeTab && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Selecione uma categoria acima para configurar</p>
              </div>
            )}
          </>
        )}

        {/* Insights Tab Content - Chat Interface (Placeholder) */}
        {mainTab === 'insights' && hasSelectedStore && (
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white">
                {labels.insights.chat.title}
              </h3>
              <p className="text-sm text-slate-400">
                {labels.insights.chat.subtitle}
              </p>
            </div>

            {/* Chat Placeholder - To be implemented */}
            <div className="flex-1 flex items-center justify-center rounded-lg bg-slate-800/30 border border-slate-700/50 min-h-[300px]">
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">
                  {labels.insights.chat.welcome}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  (Chat em desenvolvimento)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// TabContent - Content for each costs sub-tab
// =============================================================================

interface TabContentProps {
  activeTab: TabType;
  storeId: string;
  // Indirect costs
  indirectCosts: IndirectCost[];
  indirectCostsLoading: boolean;
  indirectCostsTotalMonthly: number;
  onAddIndirectCost: (storeId: string, data: IndirectCostFormData) => Promise<IndirectCost | null>;
  onUpdateIndirectCost: (costId: string, data: Partial<IndirectCostFormData>) => Promise<boolean>;
  onDeleteIndirectCost: (costId: string) => Promise<boolean>;
  // Hidden costs
  hiddenCosts: HiddenCost[];
  hiddenCostsLoading: boolean;
  hiddenCostsTotalMonthly: number;
  onAddHiddenCost: (storeId: string, data: HiddenCostFormData) => Promise<HiddenCost | null>;
  onUpdateHiddenCost: (costId: string, data: Partial<HiddenCostFormData>) => Promise<boolean>;
  onDeleteHiddenCost: (costId: string) => Promise<boolean>;
  // Taxes
  taxConfig: TaxConfig | null;
  taxItems: TaxItem[];
  taxLoading: boolean;
  taxTotalPercentage: number;
  onUpdateTaxRegime: (storeId: string, regime: TaxRegime) => Promise<boolean>;
  onAddTaxItem: (storeId: string, data: TaxItemFormData) => Promise<TaxItem | null>;
  onUpdateTaxItem: (itemId: string, data: Partial<TaxItemFormData>) => Promise<boolean>;
  onDeleteTaxItem: (itemId: string) => Promise<boolean>;
}

function TabContent({
  activeTab,
  storeId,
  indirectCosts,
  indirectCostsLoading,
  indirectCostsTotalMonthly,
  onAddIndirectCost,
  onUpdateIndirectCost,
  onDeleteIndirectCost,
  hiddenCosts,
  hiddenCostsLoading,
  hiddenCostsTotalMonthly,
  onAddHiddenCost,
  onUpdateHiddenCost,
  onDeleteHiddenCost,
  taxConfig,
  taxItems,
  taxLoading,
  taxTotalPercentage,
  onUpdateTaxRegime,
  onAddTaxItem,
  onUpdateTaxItem,
  onDeleteTaxItem,
}: TabContentProps) {
  // Render IndirectCostsForm for indirect tab
  if (activeTab === 'indirect') {
    return (
      <IndirectCostsForm
        storeId={storeId}
        costs={indirectCosts}
        isLoading={indirectCostsLoading}
        totalMonthly={indirectCostsTotalMonthly}
        addCost={onAddIndirectCost}
        updateCost={onUpdateIndirectCost}
        deleteCost={onDeleteIndirectCost}
      />
    );
  }

  // Render HiddenCostsForm for hidden tab
  if (activeTab === 'hidden') {
    return (
      <HiddenCostsForm
        storeId={storeId}
        costs={hiddenCosts}
        isLoading={hiddenCostsLoading}
        totalMonthly={hiddenCostsTotalMonthly}
        addCost={onAddHiddenCost}
        updateCost={onUpdateHiddenCost}
        deleteCost={onDeleteHiddenCost}
      />
    );
  }

  // Render TaxConfigForm for taxes tab
  if (activeTab === 'taxes') {
    return (
      <TaxConfigForm
        storeId={storeId}
        taxConfig={taxConfig}
        taxItems={taxItems}
        isLoading={taxLoading}
        totalTaxPercentage={taxTotalPercentage}
        updateTaxRegime={onUpdateTaxRegime}
        addTaxItem={onAddTaxItem}
        updateTaxItem={onUpdateTaxItem}
        deleteTaxItem={onDeleteTaxItem}
      />
    );
  }

  return null;
}

// =============================================================================
// InfoCard - Small card for displaying product info
// =============================================================================

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
