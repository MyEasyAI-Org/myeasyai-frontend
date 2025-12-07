// =============================================================================
// LeftPanel - Left side panel with store/product navigation and forms
// =============================================================================

import { useState } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import { useStoreData } from '../../hooks/useStoreData';
import type { StoreFormData, TabType } from '../../types/pricing.types';
import { StoreSelector } from '../navigation/StoreSelector';
import { StoreForm } from '../forms/StoreForm';
import { FormTabs } from '../navigation/FormTabs';
import { IndirectCostsForm } from '../forms/IndirectCostsForm';
import { HiddenCostsForm } from '../forms/HiddenCostsForm';
import { TaxConfigForm } from '../forms/TaxConfigForm';

// =============================================================================
// Component
// =============================================================================

export function LeftPanel() {
  const labels = PRICING_LABELS;

  // Store data hook
  const {
    stores,
    selectedStore,
    isLoading,
    selectStore,
    createStore,
    updateStore,
    deleteStore,
  } = useStoreData();

  // Modal state
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<typeof selectedStore>(null);

  // Tab state (null = no tab selected initially)
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  // Handlers
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
      const success = await updateStore(editingStore.id, data);
      if (success) {
        setIsStoreModalOpen(false);
        setEditingStore(null);
      }
    } else {
      const newStore = await createStore(data);
      if (newStore) {
        setIsStoreModalOpen(false);
        // Note: createStore already sets the new store as selected
      }
    }
  };

  const handleCloseStoreModal = () => {
    setIsStoreModalOpen(false);
    setEditingStore(null);
  };

  const hasSelectedStore = !!selectedStore;

  return (
    <div className="p-6">
      {/* Store Selector - Always visible */}
      <StoreSelector
        stores={stores}
        selectedStore={selectedStore}
        isLoading={isLoading}
        onSelectStore={selectStore}
        onCreateNew={handleCreateNewStore}
      />

      {/* Message when no store is selected */}
      {!hasSelectedStore && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="text-center text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">1</span>
            </div>
            <p className="text-sm">
              {stores.length === 0
                ? labels.stores.createFirst
                : 'Selecione uma loja para começar'}
            </p>
          </div>
        </div>
      )}

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
          />

          {/* Tab Content - Only show when a tab is selected */}
          {activeTab && (
            <TabContent activeTab={activeTab} storeId={selectedStore.id} />
          )}

          {/* Product Selector */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h2 className="text-sm font-medium text-slate-400 mb-3">
              {labels.products.title}
            </h2>
            <div className="space-y-2">
              <select
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-500 focus:outline-none"
                disabled
              >
                <option>{labels.products.placeholder}</option>
              </select>
              <button
                className="w-full px-4 py-2 bg-slate-700 text-slate-400 rounded-lg font-medium cursor-not-allowed"
                disabled
              >
                {labels.products.newProduct}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Store Form Modal */}
      <StoreForm
        isOpen={isStoreModalOpen}
        onClose={handleCloseStoreModal}
        onSubmit={handleStoreFormSubmit}
        onDelete={deleteStore}
        editStore={editingStore}
        isLoading={isLoading}
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
}

function TabContent({ activeTab, storeId }: TabContentProps) {
  const labels = PRICING_LABELS;

  // Render IndirectCostsForm for indirect tab
  if (activeTab === 'indirect') {
    return <IndirectCostsForm storeId={storeId} />;
  }

  // Render HiddenCostsForm for hidden tab
  if (activeTab === 'hidden') {
    return <HiddenCostsForm storeId={storeId} />;
  }

  // Render TaxConfigForm for taxes tab
  if (activeTab === 'taxes') {
    return <TaxConfigForm storeId={storeId} />;
  }

  // Placeholder for product tab (to be implemented)
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">{labels.products.modal.titleCreate}</h3>
        <p className="text-sm text-slate-500 mb-4">Dados do produto selecionado</p>
        <p className="text-xs text-slate-600">
          Formulário será implementado na próxima fase
        </p>
      </div>
    </div>
  );
}
