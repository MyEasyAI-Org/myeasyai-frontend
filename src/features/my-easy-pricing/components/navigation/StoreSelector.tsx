// =============================================================================
// StoreSelector - List-based selection for stores
// =============================================================================

import { Plus, Store as StoreIcon, Pencil } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Store } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store | null;
  isLoading: boolean;
  onSelectStore: (storeId: string | null) => void;
  onCreateNew: () => void;
  onEditStore?: () => void;
}

// =============================================================================
// Component
// =============================================================================

const MAX_STORES = 10;

export function StoreSelector({
  stores,
  selectedStore,
  isLoading,
  onSelectStore,
  onCreateNew,
  onEditStore,
}: StoreSelectorProps) {
  const labels = PRICING_LABELS;

  const handleSelect = (storeId: string) => {
    // If clicking on already selected store, deselect it
    if (selectedStore?.id === storeId) {
      onSelectStore(null);
    } else {
      onSelectStore(storeId);
    }
  };

  const canCreateMore = stores.length < MAX_STORES;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-slate-400 mb-3">
        {labels.stores.title}
        <span className="ml-2 text-xs text-slate-500">
          ({stores.length}/{MAX_STORES})
        </span>
      </h2>

      {/* Store List */}
      <div className="space-y-2">
        {stores.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{labels.stores.noStores}</p>
            <p className="text-xs mt-1">{labels.stores.createFirst}</p>
          </div>
        ) : (
          stores.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            return (
              <div
                key={store.id}
                className={`relative rounded-lg border transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(store.id)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <StoreIcon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isSelected ? 'text-yellow-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        isSelected ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      {store.name}
                      {store.is_demo && (
                        <span className="ml-2 text-xs text-slate-500">(Demo)</span>
                      )}
                    </p>
                    {store.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {store.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Edit button - Only for selected store */}
                {isSelected && onEditStore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStore();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-md transition-colors"
                    title={labels.stores.editStore}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Create New Store Button - Large */}
        {canCreateMore && (
          <button
            type="button"
            onClick={onCreateNew}
            disabled={isLoading}
            className="w-full mt-3 px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {labels.stores.newStore}
          </button>
        )}

        {/* Limit reached message */}
        {!canCreateMore && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Limite de lojas atingido
          </p>
        )}
      </div>
    </div>
  );
}
