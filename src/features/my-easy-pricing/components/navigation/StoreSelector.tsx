// =============================================================================
// StoreSelector - Dropdown for selecting and managing stores
// =============================================================================

import { ChevronDown, Plus, Store as StoreIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
}

// =============================================================================
// Component
// =============================================================================

export function StoreSelector({
  stores,
  selectedStore,
  isLoading,
  onSelectStore,
  onCreateNew,
}: StoreSelectorProps) {
  const labels = PRICING_LABELS;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (storeId: string) => {
    onSelectStore(storeId);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-slate-400 mb-3">
        {labels.stores.title}
      </h2>

      <div className="space-y-2">
        {/* Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-left flex items-center justify-between hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <StoreIcon className="w-4 h-4 text-slate-400" />
              <span className={selectedStore ? 'text-white' : 'text-slate-500'}>
                {selectedStore ? selectedStore.name : labels.stores.placeholder}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {stores.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  {labels.stores.noStores}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handleSelect(store.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 ${
                        selectedStore?.id === store.id
                          ? 'bg-slate-700 text-yellow-400'
                          : 'text-white'
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{store.name}</p>
                        {store.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {store.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create New Store Button */}
        <button
          type="button"
          onClick={onCreateNew}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {labels.stores.newStore}
        </button>
      </div>
    </div>
  );
}
