// =============================================================================
// PriceAdjustSliders - Interactive sliders for adjusting product price/margin
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import { formatCurrency, formatPercentage, parseCurrencyInput } from '../../utils/formatters';
import type { Product } from '../../types/pricing.types';
import type { ProductCalculation } from '../../utils/calculations';

// =============================================================================
// Types
// =============================================================================

interface PriceAdjustSlidersProps {
  product: Product;
  calculation: ProductCalculation;
  onMarginChange: (productId: string, newMargin: number) => Promise<boolean>;
}

// =============================================================================
// Constants
// =============================================================================

const MIN_MARGIN = 0;      // 0% = price equals cost
const MAX_MARGIN = 200;    // 200% = price is 3x cost
const MARGIN_STEP = 1;

// =============================================================================
// Component
// =============================================================================

export function PriceAdjustSliders({
  product,
  calculation,
  onMarginChange,
}: PriceAdjustSlidersProps) {
  const labels = PRICING_LABELS.sliders;

  // Local state for slider values (optimistic updates)
  const [localMargin, setLocalMargin] = useState(product.desired_margin);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Input states for editable fields
  const [marginInputValue, setMarginInputValue] = useState(localMargin.toFixed(1));
  const [priceInputValue, setPriceInputValue] = useState('');
  const [isEditingMargin, setIsEditingMargin] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Sync local margin when product changes
  useEffect(() => {
    if (!isDragging && !isEditingMargin) {
      setLocalMargin(product.desired_margin);
      setMarginInputValue(product.desired_margin.toFixed(1));
    }
  }, [product.desired_margin, isDragging, isEditingMargin]);

  // Calculate price limits based on margin limits
  const priceRange = useMemo(() => {
    // Price = Cost × (1 + Margin%)
    // At 0% margin: price = cost
    // At 200% margin: price = cost × 3
    const minPrice = calculation.totalCost;
    const maxPrice = calculation.totalCost * (1 + MAX_MARGIN / 100);
    return { min: minPrice, max: maxPrice };
  }, [calculation.totalCost]);

  // Calculate current price based on local margin using simple markup formula
  // Price = Cost × (1 + Margin%)
  const localPrice = useMemo(() => {
    return calculation.totalCost * (1 + localMargin / 100);
  }, [calculation.totalCost, localMargin]);

  // Update price input when localPrice changes (and not editing)
  useEffect(() => {
    if (!isEditingPrice) {
      setPriceInputValue(localPrice.toFixed(2).replace('.', ','));
    }
  }, [localPrice, isEditingPrice]);

  // Calculate local metrics based on local price
  const localMetrics = useMemo(() => {
    const taxValue = localPrice * (calculation.taxPercentage / 100);
    const profitPerUnit = localPrice - calculation.totalCost - taxValue;
    const netMargin = localPrice > 0
      ? ((localPrice - calculation.totalCost - taxValue) / localPrice) * 100
      : 0;

    return {
      taxValue,
      profitPerUnit,
      netMargin,
    };
  }, [localPrice, calculation.totalCost, calculation.taxPercentage]);

  // Calculate margin from price (inverse of markup formula)
  // Price = Cost × (1 + Margin%) => Margin% = (Price / Cost - 1) × 100
  const calculateMarginFromPrice = useCallback((price: number): number => {
    const totalCost = calculation.totalCost;

    if (totalCost <= 0) return 0;
    if (price <= totalCost) return 0;

    const marginPercent = ((price / totalCost) - 1) * 100;

    // Clamp to valid range
    return Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, marginPercent));
  }, [calculation.totalCost]);

  // Handle margin slider change
  const handleMarginSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMargin = parseFloat(e.target.value);
    setLocalMargin(newMargin);
    setMarginInputValue(newMargin.toFixed(1));
  }, []);

  // Handle price slider change
  const handlePriceSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    const newMargin = calculateMarginFromPrice(newPrice);
    setLocalMargin(newMargin);
    setMarginInputValue(newMargin.toFixed(1));
  }, [calculateMarginFromPrice]);

  // Handle margin input change
  const handleMarginInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMarginInputValue(e.target.value);
  }, []);

  // Handle margin input blur - validate, apply and save
  const handleMarginInputBlur = useCallback(async () => {
    setIsEditingMargin(false);
    const parsed = parseFloat(marginInputValue.replace(',', '.'));

    if (!isNaN(parsed)) {
      const clamped = Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, parsed));
      setLocalMargin(clamped);
      setMarginInputValue(clamped.toFixed(1));

      // Save if changed
      if (Math.abs(clamped - product.desired_margin) >= 0.01) {
        setIsSaving(true);
        try {
          const success = await onMarginChange(product.id, clamped);
          if (!success) {
            setLocalMargin(product.desired_margin);
            setMarginInputValue(product.desired_margin.toFixed(1));
          }
        } finally {
          setIsSaving(false);
        }
      }
    } else {
      // Revert to current value
      setMarginInputValue(localMargin.toFixed(1));
    }
  }, [marginInputValue, localMargin, product.desired_margin, product.id, onMarginChange]);

  // Handle margin input key press
  const handleMarginInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setMarginInputValue(localMargin.toFixed(1));
      setIsEditingMargin(false);
    }
  }, [localMargin]);

  // Handle price input change
  const handlePriceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInputValue(e.target.value);
  }, []);

  // Handle price input blur - validate, apply and save
  const handlePriceInputBlur = useCallback(async () => {
    setIsEditingPrice(false);
    const parsed = parseCurrencyInput(priceInputValue);

    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(priceRange.min, Math.min(priceRange.max, parsed));
      const newMargin = calculateMarginFromPrice(clamped);
      setLocalMargin(newMargin);
      setMarginInputValue(newMargin.toFixed(1));

      // Save if changed
      if (Math.abs(newMargin - product.desired_margin) >= 0.01) {
        setIsSaving(true);
        try {
          const success = await onMarginChange(product.id, newMargin);
          if (!success) {
            setLocalMargin(product.desired_margin);
            setMarginInputValue(product.desired_margin.toFixed(1));
          }
        } finally {
          setIsSaving(false);
        }
      }
    } else {
      // Revert to current value
      setPriceInputValue(localPrice.toFixed(2).replace('.', ','));
    }
  }, [priceInputValue, priceRange.min, priceRange.max, calculateMarginFromPrice, localPrice, product.desired_margin, product.id, onMarginChange]);

  // Handle price input key press
  const handlePriceInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setPriceInputValue(localPrice.toFixed(2).replace('.', ','));
      setIsEditingPrice(false);
    }
  }, [localPrice]);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag end - save to database
  const handleDragEnd = useCallback(async () => {
    setIsDragging(false);

    // Only save if margin changed
    if (Math.abs(localMargin - product.desired_margin) < 0.01) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await onMarginChange(product.id, localMargin);
      if (!success) {
        // Revert on failure
        setLocalMargin(product.desired_margin);
        setMarginInputValue(product.desired_margin.toFixed(1));
      }
    } finally {
      setIsSaving(false);
    }
  }, [localMargin, product.desired_margin, product.id, onMarginChange]);

  // Calculate slider position percentages
  const marginPercent = ((localMargin - MIN_MARGIN) / (MAX_MARGIN - MIN_MARGIN)) * 100;
  const pricePercent = priceRange.max > priceRange.min
    ? ((localPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100
    : 0;

  return (
    <div className="mt-6 p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">
          {labels.title} - {product.name}
        </h4>
        {isSaving && (
          <span className="text-xs text-yellow-400 animate-pulse">
            Salvando...
          </span>
        )}
      </div>

      {/* Margin Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">
            {labels.marginLabel}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={marginInputValue}
              onChange={handleMarginInputChange}
              onFocus={() => setIsEditingMargin(true)}
              onBlur={handleMarginInputBlur}
              onKeyDown={handleMarginInputKeyDown}
              className="w-16 px-2 py-0.5 text-sm font-medium text-yellow-400 text-right bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-yellow-500"
            />
            <span className="text-sm text-yellow-400">%</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={MIN_MARGIN}
            max={MAX_MARGIN}
            step={MARGIN_STEP}
            value={localMargin}
            onChange={handleMarginSliderChange}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
            className="slider-input w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #eab308 0%, #eab308 ${marginPercent}%, #334155 ${marginPercent}%, #334155 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-500">0%</span>
            <span className="text-[10px] text-slate-500">200%</span>
          </div>
        </div>
      </div>

      {/* Price Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">
            {labels.priceLabel}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={priceInputValue}
              onChange={handlePriceInputChange}
              onFocus={() => setIsEditingPrice(true)}
              onBlur={handlePriceInputBlur}
              onKeyDown={handlePriceInputKeyDown}
              className="w-24 px-2 py-0.5 text-sm font-medium text-green-400 text-right bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-green-500"
            />
            <span className="text-sm text-green-400">R$</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={0.01}
            value={localPrice}
            onChange={handlePriceSliderChange}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
            className="slider-input w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${pricePercent}%, #334155 ${pricePercent}%, #334155 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-500">
              {formatCurrency(priceRange.min)} (custo)
            </span>
            <span className="text-[10px] text-slate-500">
              {formatCurrency(priceRange.max)} (3x custo)
            </span>
          </div>
        </div>
      </div>

      {/* Calculated Values Card */}
      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">{labels.costLabel}</p>
            <p className="text-xs font-medium text-white">
              {formatCurrency(calculation.totalCost)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">{labels.profitLabel}</p>
            <p className={`text-xs font-medium ${localMetrics.profitPerUnit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(localMetrics.profitPerUnit)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">{labels.netMarginLabel}</p>
            <p className={`text-xs font-medium ${localMetrics.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(localMetrics.netMargin, 1)}
            </p>
          </div>
        </div>
      </div>

      {/* Real-time note */}
      <div className="flex items-center gap-1.5 mt-3">
        <Zap className="w-3 h-3 text-yellow-500" />
        <span className="text-[10px] text-slate-500">
          {labels.realTimeNote}
        </span>
      </div>

      {/* Slider Styles */}
      <style>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #f59e0b;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.1s ease;
        }

        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider-input::-webkit-slider-thumb:active {
          transform: scale(0.95);
          background: #f59e0b;
        }

        .slider-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #f59e0b;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.1s ease;
        }

        .slider-input::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .slider-input::-moz-range-thumb:active {
          transform: scale(0.95);
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
}
