// =============================================================================
// LeftPanel - Left side panel with store/product navigation and forms
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type {
  Store,
  StoreFormData,
  ProductFormData,
  TabType,
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
import { StoreForm } from '../forms/StoreForm';
import { ProductSelector } from '../navigation/ProductSelector';
import { ProductModal } from '../forms/ProductModal';
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
  onCreateStore: (data: StoreFormData) => Promise<Store | null>;
  onUpdateStore: (storeId: string, data: StoreFormData) => Promise<boolean>;
  onDeleteStore: (storeId: string) => Promise<boolean>;
  // Product data
  products: Product[];
  selectedProduct: Product | null;
  isProductLoading: boolean;
  onSelectProduct: (productId: string | null) => void;
  onCreateProduct: (storeId: string, data: ProductFormData) => Promise<Product | null>;
  onUpdateProduct: (productId: string, data: Partial<ProductFormData>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
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
  // External trigger to open product modal
  openProductModalTrigger?: number;
  // External trigger to open store modal
  openStoreModalTrigger?: number;
  // Calculation for the selected product (for sliders)
  selectedProductCalculation?: ProductCalculation;
  // Handler for margin change from sliders
  onProductMarginChange?: (productId: string, newMargin: number) => Promise<boolean>;
}

// =============================================================================
// Component
// =============================================================================

export function LeftPanel({
  stores,
  selectedStore,
  isStoreLoading,
  onSelectStore,
  onCreateStore,
  onUpdateStore,
  onDeleteStore,
  products,
  selectedProduct,
  isProductLoading,
  onSelectProduct,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
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
  openProductModalTrigger,
  openStoreModalTrigger,
  selectedProductCalculation,
  onProductMarginChange,
}: LeftPanelProps) {
  const labels = PRICING_LABELS;

  // Store Modal state
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Tab state (null = no tab selected initially)
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  // Track previous store ID to reset tab when store changes
  const prevStoreIdRef = useRef<string | null>(null);

  // Track previous trigger values to avoid re-opening modals on store change
  const prevProductTriggerRef = useRef<number>(0);
  const prevStoreTriggerRef = useRef<number>(0);

  // Reset tab when store changes
  useEffect(() => {
    const currentStoreId = selectedStore?.id ?? null;
    const prevStoreId = prevStoreIdRef.current;

    if (currentStoreId !== prevStoreId) {
      prevStoreIdRef.current = currentStoreId;
      setActiveTab(null);
    }
  }, [selectedStore]);

  // Open product modal when triggered externally (only when trigger value changes)
  useEffect(() => {
    const currentTrigger = openProductModalTrigger ?? 0;
    if (currentTrigger > prevProductTriggerRef.current && selectedStore) {
      setEditingProduct(null);
      setIsProductModalOpen(true);
    }
    prevProductTriggerRef.current = currentTrigger;
  }, [openProductModalTrigger, selectedStore]);

  // Open store modal when triggered externally (only when trigger value changes)
  useEffect(() => {
    const currentTrigger = openStoreModalTrigger ?? 0;
    if (currentTrigger > prevStoreTriggerRef.current) {
      setEditingStore(null);
      setIsStoreModalOpen(true);
    }
    prevStoreTriggerRef.current = currentTrigger;
  }, [openStoreModalTrigger]);

  // Store Handlers
  const handleCreateNewStore = () => {
    setEditingStore(null);
    setIsStoreModalOpen(true);
  };

  const handleEditStore = () => {
    if (selectedStore) {
      setEditingStore(selectedStore);
      setIsStoreModalOpen(true);
    }
  };

  const handleStoreFormSubmit = async (data: StoreFormData) => {
    if (editingStore) {
      const success = await onUpdateStore(editingStore.id, data);
      if (success) {
        setIsStoreModalOpen(false);
        setEditingStore(null);
      }
    } else {
      const newStore = await onCreateStore(data);
      if (newStore) {
        setIsStoreModalOpen(false);
      }
    }
  };

  const handleCloseStoreModal = () => {
    setIsStoreModalOpen(false);
    setEditingStore(null);
  };

  // Product Handlers
  const handleCreateNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (data: ProductFormData) => {
    if (!selectedStore) return;

    if (editingProduct) {
      const success = await onUpdateProduct(editingProduct.id, data);
      if (success) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
      }
    } else {
      const newProduct = await onCreateProduct(selectedStore.id, data);
      if (newProduct) {
        setIsProductModalOpen(false);
      }
    }
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSelectProduct = (productId: string | null) => {
    onSelectProduct(productId);
    // When selecting a product, switch to product tab if it exists
    if (productId) {
      setActiveTab('product');
    }
  };

  const hasSelectedStore = !!selectedStore;
  const hasSelectedProduct = !!selectedProduct;

  return (
    <div className="p-6">
      {/* Store Selector - Always visible */}
      <StoreSelector
        stores={stores}
        selectedStore={selectedStore}
        isLoading={isStoreLoading}
        onSelectStore={onSelectStore}
        onCreateNew={handleCreateNewStore}
      />


      {/* Components that only appear when a store is selected */}
      {hasSelectedStore && (
        <>
          {/* Store Info Header */}
          <div className="mb-6 p-4 rounded-lg border border-yellow-600/30 bg-yellow-900/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{selectedStore.name}</h3>
                {selectedStore.description && (
                  <p className="text-xs text-slate-400 mt-1">{selectedStore.description}</p>
                )}
              </div>
              <button
                onClick={handleEditStore}
                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                {labels.stores.editStore}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <FormTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showProductTab={hasSelectedProduct}
          />

          {/* Tab Content - Only show when a tab is selected */}
          {activeTab && (
            <TabContent
              activeTab={activeTab}
              storeId={selectedStore.id}
              selectedProduct={selectedProduct}
              onEditProduct={handleEditProduct}
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

          {/* Product Selector */}
          <ProductSelector
            products={products}
            selectedProduct={selectedProduct}
            isLoading={isProductLoading}
            onSelectProduct={handleSelectProduct}
            onCreateNew={handleCreateNewProduct}
          />

          {/* Price Adjustment Sliders - Only when product is selected */}
          {hasSelectedProduct && selectedProductCalculation && onProductMarginChange && (
            <PriceAdjustSliders
              product={selectedProduct}
              calculation={selectedProductCalculation}
              onMarginChange={onProductMarginChange}
            />
          )}
        </>
      )}

      {/* Store Form Modal */}
      <StoreForm
        isOpen={isStoreModalOpen}
        onClose={handleCloseStoreModal}
        onSubmit={handleStoreFormSubmit}
        onDelete={onDeleteStore}
        editStore={editingStore}
        isLoading={isStoreLoading}
      />

      {/* Product Form Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleProductFormSubmit}
        onDelete={onDeleteProduct}
        editProduct={editingProduct}
        isLoading={isProductLoading}
      />
    </div>
  );
}

// =============================================================================
// TabContent - Content for each tab
// =============================================================================

interface TabContentProps {
  activeTab: TabType;
  storeId: string;
  selectedProduct: Product | null;
  onEditProduct: (product: Product) => void;
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
  selectedProduct,
  onEditProduct,
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
  const labels = PRICING_LABELS;

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

  // Render Product info for product tab
  if (activeTab === 'product' && selectedProduct) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            {selectedProduct.name}
          </h3>
          <button
            onClick={() => onEditProduct(selectedProduct)}
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
    );
  }

  // No product selected for product tab - show nothing
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
