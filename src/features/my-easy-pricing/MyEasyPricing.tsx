// =============================================================================
// MyEasyPricing - Main component for the pricing tool
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PRICING_LABELS } from './constants/pricing.constants';
import { useStoreData } from './hooks/useStoreData';
import { useProducts } from './hooks/useProducts';
import { useIndirectCosts } from './hooks/useIndirectCosts';
import { useHiddenCosts } from './hooks/useHiddenCosts';
import { useTaxConfig } from './hooks/useTaxConfig';
import { useCalculations } from './hooks/useCalculations';
import { LeftPanel } from './components/layout/LeftPanel';
import { RightPanel } from './components/layout/RightPanel';

// =============================================================================
// Types
// =============================================================================

interface MyEasyPricingProps {
  onBackToDashboard?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function MyEasyPricing({ onBackToDashboard }: MyEasyPricingProps) {
  const labels = PRICING_LABELS;

  // Store data hook
  const {
    stores,
    selectedStore,
    isLoading: isStoreLoading,
    selectStore,
    createStore,
    updateStore,
    deleteStore,
  } = useStoreData();

  // Products hook
  const {
    products,
    selectedProduct,
    isLoading: isProductLoading,
    loadProducts,
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearProducts,
  } = useProducts();

  // Indirect costs hook
  const {
    costs: indirectCosts,
    isLoading: isIndirectCostsLoading,
    totalMonthly: indirectCostsTotalMonthly,
    loadCosts: loadIndirectCosts,
    addCost: addIndirectCost,
    updateCost: updateIndirectCost,
    deleteCost: deleteIndirectCost,
    clearCosts: clearIndirectCosts,
  } = useIndirectCosts();

  // Hidden costs hook
  const {
    costs: hiddenCosts,
    isLoading: isHiddenCostsLoading,
    totalMonthly: hiddenCostsTotalMonthly,
    loadCosts: loadHiddenCosts,
    addCost: addHiddenCost,
    updateCost: updateHiddenCost,
    deleteCost: deleteHiddenCost,
    clearCosts: clearHiddenCosts,
  } = useHiddenCosts();

  // Tax config hook
  const {
    taxConfig,
    taxItems,
    isLoading: isTaxLoading,
    totalTaxPercentage,
    loadTaxData,
    updateTaxRegime,
    addTaxItem,
    updateTaxItem,
    deleteTaxItem,
    clearTaxData,
  } = useTaxConfig();

  // Calculations hook - computes pricing for all products
  const { calculations, summary, getCalculationByProductId } = useCalculations({
    products,
    indirectCosts,
    hiddenCosts,
    taxItems,
    allocationMethod: selectedStore?.cost_allocation_method || 'equal',
  });

  // Get calculation for the selected product (for sliders)
  const selectedProductCalculation = selectedProduct
    ? getCalculationByProductId(selectedProduct.id)
    : undefined;

  // Track previous store ID to handle store changes
  const prevStoreIdRef = useRef<string | null>(null);

  // Trigger to open product modal from RightPanel
  const [productModalTrigger, setProductModalTrigger] = useState(0);

  // Trigger to open store modal from RightPanel
  const [storeModalTrigger, setStoreModalTrigger] = useState(0);

  // Load all data when store changes
  useEffect(() => {
    const currentStoreId = selectedStore?.id ?? null;
    const prevStoreId = prevStoreIdRef.current;

    if (currentStoreId !== prevStoreId) {
      prevStoreIdRef.current = currentStoreId;

      if (selectedStore) {
        // Clear previous data
        selectProduct(null);

        // Load all data for the new store
        loadProducts(selectedStore.id);
        loadIndirectCosts(selectedStore.id);
        loadHiddenCosts(selectedStore.id);
        loadTaxData(selectedStore.id);
      } else {
        // Clear all data when no store is selected
        clearProducts();
        clearIndirectCosts();
        clearHiddenCosts();
        clearTaxData();
      }
    }
  }, [
    selectedStore,
    loadProducts,
    clearProducts,
    selectProduct,
    loadIndirectCosts,
    clearIndirectCosts,
    loadHiddenCosts,
    clearHiddenCosts,
    loadTaxData,
    clearTaxData,
  ]);

  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/';
    }
  };

  // Handler for creating product from RightPanel empty state
  const handleCreateProductFromTable = () => {
    setProductModalTrigger(prev => prev + 1);
  };

  // Handler for creating store from RightPanel empty state
  const handleCreateStoreFromPanel = () => {
    setStoreModalTrigger(prev => prev + 1);
  };

  // Handler for margin change from sliders
  const handleProductMarginChange = async (productId: string, newMargin: number): Promise<boolean> => {
    return updateProduct(productId, { desired_margin: newMargin });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Title (Left) */}
            <div className="flex items-center space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-xl font-bold text-transparent">
                  {labels.header.title}
                </span>
                <p className="text-xs text-slate-400">
                  {labels.header.subtitle}
                </p>
              </div>
            </div>

            {/* Back Button (Right) */}
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{labels.header.backToDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="max-w-[1800px] mx-auto h-[calc(100vh-64px)]">
        <div className="flex h-full">
          {/* Left Panel - 30% */}
          <aside className="w-[30%] min-w-[320px] max-w-[450px] border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
            <LeftPanel
              stores={stores}
              selectedStore={selectedStore}
              isStoreLoading={isStoreLoading}
              onSelectStore={selectStore}
              onCreateStore={createStore}
              onUpdateStore={updateStore}
              onDeleteStore={deleteStore}
              products={products}
              selectedProduct={selectedProduct}
              isProductLoading={isProductLoading}
              onSelectProduct={selectProduct}
              onCreateProduct={createProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              indirectCosts={indirectCosts}
              indirectCostsLoading={isIndirectCostsLoading}
              indirectCostsTotalMonthly={indirectCostsTotalMonthly}
              onAddIndirectCost={addIndirectCost}
              onUpdateIndirectCost={updateIndirectCost}
              onDeleteIndirectCost={deleteIndirectCost}
              hiddenCosts={hiddenCosts}
              hiddenCostsLoading={isHiddenCostsLoading}
              hiddenCostsTotalMonthly={hiddenCostsTotalMonthly}
              onAddHiddenCost={addHiddenCost}
              onUpdateHiddenCost={updateHiddenCost}
              onDeleteHiddenCost={deleteHiddenCost}
              taxConfig={taxConfig}
              taxItems={taxItems}
              taxLoading={isTaxLoading}
              taxTotalPercentage={totalTaxPercentage}
              onUpdateTaxRegime={updateTaxRegime}
              onAddTaxItem={addTaxItem}
              onUpdateTaxItem={updateTaxItem}
              onDeleteTaxItem={deleteTaxItem}
              openProductModalTrigger={productModalTrigger}
              openStoreModalTrigger={storeModalTrigger}
              selectedProductCalculation={selectedProductCalculation}
              onProductMarginChange={handleProductMarginChange}
            />
          </aside>

          {/* Right Panel - 70% */}
          <section className="flex-1 overflow-y-auto">
            <RightPanel
              selectedStore={selectedStore}
              products={products}
              calculations={calculations}
              summary={summary}
              indirectCosts={indirectCosts}
              hiddenCosts={hiddenCosts}
              taxItems={taxItems}
              onCreateProduct={handleCreateProductFromTable}
              onCreateStore={handleCreateStoreFromPanel}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyEasyPricing;
