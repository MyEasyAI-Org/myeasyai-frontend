// =============================================================================
// MyEasyPricing - Main component for the pricing tool
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { PRICING_LABELS } from './constants/pricing.constants';
import { useStoreData } from './hooks/useStoreData';
import { useProducts } from './hooks/useProducts';
import { useIndirectCosts } from './hooks/useIndirectCosts';
import { useHiddenCosts } from './hooks/useHiddenCosts';
import { useTaxConfig } from './hooks/useTaxConfig';
import { useCalculations } from './hooks/useCalculations';
import { useTutorial } from './hooks/useTutorial';
import { LeftPanel } from './components/layout/LeftPanel';
import { RightPanel } from './components/layout/RightPanel';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { TutorialTooltip } from './components/tutorial/TutorialTooltip';
import { StoreForm } from './components/forms/StoreForm';
import { ProductModal } from './components/forms/ProductModal';
import { tutorialDemoService } from './services/TutorialDemoService';
import { pricingService } from './services/PricingService';
import { supabase } from '../../lib/api-clients/supabase-client';
import { toast } from 'sonner';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem, TabType, MainTabType, StoreFormData, ProductFormData } from './types/pricing.types';

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
    refreshStores,
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

  // Tutorial hook
  const {
    tutorialState,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    finishTutorial,
    resetTutorial,
  } = useTutorial();

  // Get calculation for the selected product (for sliders)
  const selectedProductCalculation = selectedProduct
    ? getCalculationByProductId(selectedProduct.id)
    : undefined;

  // Track previous store ID to handle store changes
  const prevStoreIdRef = useRef<string | null>(null);

  // Store Modal state (rendered at root level for proper centering)
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Product Modal state (rendered at root level for proper centering)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Tutorial state
  const [isTutorialLoading, setIsTutorialLoading] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null);

  // Tutorial-controlled tab state
  const [tutorialActiveTab, setTutorialActiveTab] = useState<TabType | null>(null);
  const [tutorialMainTab, setTutorialMainTab] = useState<MainTabType>('store');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Get user UUID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserUuid(user.id);
      }
    };
    getUser();
  }, []);

  // Track previous tutorial state to detect when exiting tutorial mode
  const wasTutorialActiveRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Tutorial Auto-Navigation
  // ---------------------------------------------------------------------------
  // Automatically navigate to the appropriate section based on tutorial step
  useEffect(() => {
    // Only reset tabs when transitioning FROM tutorial mode TO non-tutorial mode
    if (!tutorialState.isActive) {
      if (wasTutorialActiveRef.current) {
        // Was in tutorial, now exiting - reset to store tab
        setTutorialActiveTab(null);
        setTutorialMainTab('store');
        wasTutorialActiveRef.current = false;
      }
      // Don't do anything else when tutorial is not active
      return;
    }

    // Tutorial is active
    wasTutorialActiveRef.current = true;

    if (!currentStep) {
      return;
    }

    // Determine if current step needs the left panel (for mobile sidebar)
    const needsLeftPanel = [
      'storeTab', 'store', 'costsTabIntro', 'indirectCosts',
      'hiddenCosts', 'taxes', 'productTabIntro', 'product'
    ].includes(currentStep.id);

    // On mobile, open sidebar when step needs left panel elements
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIsMobileSidebarOpen(needsLeftPanel);
    }

    // Map tutorial step ID to the appropriate main tab, sub-tab, and actions
    switch (currentStep.id) {
      case 'storeTab':
        // Show the store tab button
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
        break;

      case 'store':
        // Show the store selector in Store tab
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
        break;

      case 'viewModeToggle':
        // Show the view mode toggle in right panel - close sidebar on mobile
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
        break;

      case 'costsTabIntro':
        // Introduction to Costs tab - select the costs tab to highlight it
        setTutorialMainTab('costs');
        setTutorialActiveTab(null);
        break;

      case 'indirectCosts':
        // Open Costs tab and select indirect costs sub-tab
        setTutorialMainTab('costs');
        setTutorialActiveTab('indirect');
        break;

      case 'hiddenCosts':
        // Open Costs tab and select hidden costs sub-tab
        setTutorialMainTab('costs');
        setTutorialActiveTab('hidden');
        break;

      case 'taxes':
        // Open Costs tab and select taxes sub-tab
        setTutorialMainTab('costs');
        setTutorialActiveTab('taxes');
        break;

      case 'productTabIntro':
        // Introduction to Product tab - select the product tab to highlight it
        setTutorialMainTab('product');
        setTutorialActiveTab(null);
        break;

      case 'product':
        // Open Product tab and select demo product
        setTutorialMainTab('product');
        setTutorialActiveTab(null);
        // Auto-select the demo product if not already selected
        if (tutorialState.demoProductId && selectedProduct?.id !== tutorialState.demoProductId) {
          selectProduct(tutorialState.demoProductId);
        }
        break;

      case 'table':
        // Go back to Store tab to show the table clearly
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
        break;

      case 'export':
      case 'exportHide':
        // Stay in Store tab to show the export button
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
        break;

      default:
        setTutorialMainTab('store');
        setTutorialActiveTab(null);
    }
  }, [tutorialState.isActive, currentStep, tutorialState.demoProductId, selectedProduct?.id, selectProduct]);

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

  // ---------------------------------------------------------------------------
  // Store Modal Handlers
  // ---------------------------------------------------------------------------

  const handleOpenStoreModal = (store?: Store) => {
    setEditingStore(store || null);
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setIsStoreModalOpen(false);
    setEditingStore(null);
  };

  const handleStoreFormSubmit = async (data: StoreFormData) => {
    if (editingStore) {
      const success = await updateStore(editingStore.id, data);
      if (success) {
        setIsStoreModalOpen(false);
        setEditingStore(null);
      }
    } else {
      const newStore = await createStore(data);
      if (newStore) {
        setIsStoreModalOpen(false);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Product Modal Handlers
  // ---------------------------------------------------------------------------

  const handleOpenProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductFormSubmit = async (data: ProductFormData) => {
    if (!selectedStore) return;

    if (editingProduct) {
      const success = await updateProduct(editingProduct.id, data);
      if (success) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
      }
    } else {
      const newProduct = await createProduct(selectedStore.id, data);
      if (newProduct) {
        setIsProductModalOpen(false);
      }
    }
  };

  // Handler for creating product from RightPanel empty state
  const handleCreateProductFromTable = () => {
    handleOpenProductModal();
  };

  // Handler for creating store from RightPanel empty state
  const handleCreateStoreFromPanel = () => {
    handleOpenStoreModal();
  };

  // Handler for margin change from sliders
  const handleProductMarginChange = async (productId: string, newMargin: number): Promise<boolean> => {
    return updateProduct(productId, { desired_margin: newMargin });
  };

  // Handler for navigating to a product from insights
  const handleNavigateToProduct = useCallback((productId: string) => {
    setTutorialMainTab('product');
    selectProduct(productId);
  }, [selectProduct]);

  // Handler for opening costs tab from insights
  const handleOpenCostsTab = useCallback(() => {
    setTutorialMainTab('costs');
    setTutorialActiveTab('indirect');
  }, []);

  // Handler for opening product modal from insights (for price adjustment)
  const handleOpenProductModalById = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleOpenProductModal(product);
    }
  }, [products]);

  // ---------------------------------------------------------------------------
  // Tutorial Handlers
  // ---------------------------------------------------------------------------

  // Start tutorial - create demo data
  const handleStartTutorial = useCallback(async () => {
    if (!userUuid) {
      toast.error('Usuario nao autenticado');
      return;
    }

    setIsTutorialLoading(true);

    try {
      // Check for existing demo data
      const { hasDemoData, storeId: existingStoreId, productId: existingProductId } = await tutorialDemoService.hasExistingDemoData(userUuid);

      if (hasDemoData && existingStoreId && existingProductId) {
        // Reuse existing demo data - refresh stores first
        await refreshStores();

        // Try to find the existing store in current stores array
        let existingStore = stores.find(s => s.id === existingStoreId);

        // If not found in current state (stale closure), fetch directly from service
        if (!existingStore) {
          const { data: fetchedStores } = await pricingService.getStores(userUuid);
          existingStore = fetchedStores?.find(s => s.id === existingStoreId) || undefined;
        }

        if (existingStore) {
          selectStore(existingStore);
          startTutorial(existingStoreId, existingProductId);
          toast.success('Tutorial iniciado!');
          return;
        }
      }

      // Create new demo data
      const result = await tutorialDemoService.createDemoData(userUuid);

      if (!result.success || !result.data) {
        toast.error('Erro ao criar dados de demonstracao');
        return;
      }

      const { store, product } = result.data;

      // Refresh stores to include new demo store
      await refreshStores();

      // Select the demo store (pass the Store object directly to avoid stale closure)
      selectStore(store);

      // Start the tutorial
      startTutorial(store.id, product.id);

      toast.success('Tutorial iniciado!');
    } catch (error) {
      console.error('[MyEasyPricing] Error starting tutorial:', error);
      toast.error('Erro ao iniciar tutorial');
    } finally {
      setIsTutorialLoading(false);
    }
  }, [userUuid, refreshStores, selectStore, startTutorial, stores]);

  // Skip tutorial - keep demo data
  const handleSkipTutorial = useCallback(() => {
    skipTutorial();
    resetTutorial();
    toast.success('Tutorial encerrado');
  }, [skipTutorial, resetTutorial]);

  // Finish tutorial - keep demo data
  const handleFinishTutorial = useCallback(() => {
    finishTutorial();
    resetTutorial();
    toast.success('Tutorial concluido! Os dados de exemplo foram mantidos.');
  }, [finishTutorial, resetTutorial]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-black-main to-blue-main text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo + Title (Left) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-8 w-8 md:h-12 md:w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-lg md:text-xl font-bold text-transparent">
                  {labels.header.title}
                </span>
                <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">
                  {labels.header.subtitle}
                </p>
              </div>
            </div>

            {/* Back Button (Right) */}
            <button
              onClick={handleBack}
              className="flex items-center space-x-1 md:space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline text-sm md:text-base">{labels.header.backToDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="max-w-[1800px] mx-auto h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]">
        <div className="flex h-full relative">
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Left Panel - Mobile: full width overlay, Desktop: 30% */}
          <aside
            className={`
              fixed md:relative inset-y-0 left-0 z-40 md:z-auto
              w-[85%] sm:w-[350px] md:w-[30%] md:min-w-[320px] md:max-w-[450px]
              border-r border-slate-800 bg-slate-900
              transform transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              overflow-y-auto
            `}
          >
            <LeftPanel
              stores={stores}
              selectedStore={selectedStore}
              isStoreLoading={isStoreLoading}
              onSelectStore={selectStore}
              products={products}
              selectedProduct={selectedProduct}
              isProductLoading={isProductLoading}
              onSelectProduct={selectProduct}
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
              selectedProductCalculation={selectedProductCalculation}
              onProductMarginChange={handleProductMarginChange}
              tutorialActiveTab={tutorialState.isActive ? tutorialActiveTab : undefined}
              onTabChange={tutorialState.isActive ? setTutorialActiveTab : undefined}
              tutorialMainTab={tutorialMainTab}
              onMainTabChange={setTutorialMainTab}
              onOpenStoreModal={handleOpenStoreModal}
              onOpenProductModal={handleOpenProductModal}
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
              onStartTutorial={handleStartTutorial}
              isTutorialLoading={isTutorialLoading}
              tutorialOpenExportModal={tutorialState.isActive && currentStep?.id === 'exportHide'}
              mainTab={tutorialMainTab}
              onNavigateToProduct={handleNavigateToProduct}
              onOpenCostsTab={handleOpenCostsTab}
              onOpenProductModal={handleOpenProductModalById}
            />
          </section>
        </div>
      </main>

      {/* Tutorial Components */}
      <TutorialOverlay
        isActive={tutorialState.isActive}
        currentStep={currentStep}
      />

      <TutorialTooltip
        isActive={tutorialState.isActive}
        currentStep={currentStep}
        stepNumber={tutorialState.currentStep + 1}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={handleSkipTutorial}
        onFinish={handleFinishTutorial}
      />

      {/* Modals - Rendered at root level for proper centering */}
      <StoreForm
        isOpen={isStoreModalOpen}
        onClose={handleCloseStoreModal}
        onSubmit={handleStoreFormSubmit}
        onDelete={deleteStore}
        editStore={editingStore}
        isLoading={isStoreLoading}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleProductFormSubmit}
        onDelete={deleteProduct}
        editProduct={editingProduct}
        isLoading={isProductLoading}
      />
    </div>
  );
}

export default MyEasyPricing;
