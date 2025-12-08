// =============================================================================
// ProductSelector - Dropdown for selecting and managing products
// =============================================================================

import { ChevronDown, Plus, Package } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Product } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  onSelectProduct: (productId: string | null) => void;
  onCreateNew: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function ProductSelector({
  products,
  selectedProduct,
  isLoading,
  onSelectProduct,
  onCreateNew,
}: ProductSelectorProps) {
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

  const handleSelect = (productId: string) => {
    onSelectProduct(productId);
    setIsOpen(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-800">
      <h2 className="text-sm font-medium text-slate-400 mb-3">
        {labels.products.title}
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
              <Package className="w-4 h-4 text-slate-400" />
              <span className={selectedProduct ? 'text-white' : 'text-slate-500'}>
                {selectedProduct ? selectedProduct.name : labels.products.placeholder}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {products.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  {labels.products.noProducts}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 ${
                        selectedProduct?.id === product.id
                          ? 'bg-slate-700 text-yellow-400'
                          : 'text-white'
                      }`}
                    >
                      <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          Custo: {formatCurrency(product.direct_cost)} | Margem: {product.desired_margin}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create New Product Button */}
        <button
          type="button"
          onClick={onCreateNew}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {labels.products.newProduct}
        </button>
      </div>
    </div>
  );
}
