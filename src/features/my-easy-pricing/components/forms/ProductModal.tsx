// =============================================================================
// ProductModal - Modal form for creating/editing products
// =============================================================================

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { PRICING_LABELS, CALCULATION_CONSTANTS } from '../../constants/pricing.constants';
import type { Product, ProductFormData, UnitType, Positioning } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (productId: string) => Promise<boolean>;
  editProduct?: Product | null;
  isLoading?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const UNIT_TYPE_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'unit', label: PRICING_LABELS.products.modal.unitTypes.unit },
  { value: 'hour', label: PRICING_LABELS.products.modal.unitTypes.hour },
  { value: 'kg', label: PRICING_LABELS.products.modal.unitTypes.kg },
  { value: 'meter', label: PRICING_LABELS.products.modal.unitTypes.meter },
  { value: 'service', label: PRICING_LABELS.products.modal.unitTypes.service },
];

const POSITIONING_OPTIONS: { value: Positioning; label: string }[] = [
  { value: 'premium', label: PRICING_LABELS.products.modal.positionings.premium },
  { value: 'intermediate', label: PRICING_LABELS.products.modal.positionings.intermediate },
  { value: 'economy', label: PRICING_LABELS.products.modal.positionings.economy },
];

// =============================================================================
// Component
// =============================================================================

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editProduct,
  isLoading = false,
}: ProductModalProps) {
  const labels = PRICING_LABELS;
  const isEditing = !!editProduct;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [directCost, setDirectCost] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('unit');
  const [desiredMargin, setDesiredMargin] = useState(CALCULATION_CONSTANTS.defaults.marginPercentage.toString());
  const [positioning, setPositioning] = useState<Positioning>('intermediate');
  const [marketPrice, setMarketPrice] = useState('');
  const [weight, setWeight] = useState(CALCULATION_CONSTANTS.defaults.weight.toString());
  const [monthlyUnitsEstimate, setMonthlyUnitsEstimate] = useState(CALCULATION_CONSTANTS.defaults.monthlyUnitsEstimate.toString());

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when modal opens/closes or editProduct changes
  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setName(editProduct.name);
        setDescription(editProduct.description || '');
        setDirectCost(editProduct.direct_cost.toString());
        setUnitType(editProduct.unit_type);
        setDesiredMargin(editProduct.desired_margin.toString());
        setPositioning(editProduct.positioning);
        setMarketPrice(editProduct.market_price?.toString() || '');
        setWeight(editProduct.weight.toString());
        setMonthlyUnitsEstimate(editProduct.monthly_units_estimate.toString());
      } else {
        setName('');
        setDescription('');
        setDirectCost('');
        setUnitType('unit');
        setDesiredMargin(CALCULATION_CONSTANTS.defaults.marginPercentage.toString());
        setPositioning('intermediate');
        setMarketPrice('');
        setWeight(CALCULATION_CONSTANTS.defaults.weight.toString());
        setMonthlyUnitsEstimate(CALCULATION_CONSTANTS.defaults.monthlyUnitsEstimate.toString());
      }
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [isOpen, editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !directCost) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      category: '',
      direct_cost: parseFloat(directCost) || 0,
      unit_type: unitType,
      desired_margin: parseFloat(desiredMargin) || CALCULATION_CONSTANTS.defaults.marginPercentage,
      positioning,
      market_price: marketPrice ? parseFloat(marketPrice) : null,
      weight: parseFloat(weight) || CALCULATION_CONSTANTS.defaults.weight,
      monthly_units_estimate: parseInt(monthlyUnitsEstimate) || CALCULATION_CONSTANTS.defaults.monthlyUnitsEstimate,
    });
  };

  const handleDelete = async () => {
    if (!editProduct || !onDelete) return;

    setIsDeleting(true);
    const success = await onDelete(editProduct.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-10 sm:items-center sm:py-12"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-100 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">
          {isEditing ? labels.products.modal.titleEdit : labels.products.modal.titleCreate}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isEditing
            ? 'Atualize as informacoes do produto.'
            : 'Adicione um novo produto a sua tabela de precos.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-300 mb-2">
              {labels.products.modal.nameLabel} <span className="text-red-400">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.products.modal.namePlaceholder}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Direct Cost & Unit Type Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="direct-cost" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.directCostLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                <input
                  id="direct-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={directCost}
                  onChange={(e) => setDirectCost(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="unit-type" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.unitTypeLabel}
              </label>
              <select
                id="unit-type"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as UnitType)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
              >
                {UNIT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Margin & Positioning Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.marginLabel}
              </label>
              <div className="relative">
                <input
                  id="margin"
                  type="number"
                  step="1"
                  min="0"
                  max="500"
                  value={desiredMargin}
                  onChange={(e) => setDesiredMargin(e.target.value)}
                  placeholder={labels.products.modal.marginPlaceholder}
                  className="w-full px-4 py-3 pr-8 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
            </div>
            <div>
              <label htmlFor="positioning" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.positioningLabel}
              </label>
              <select
                id="positioning"
                value={positioning}
                onChange={(e) => setPositioning(e.target.value as Positioning)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
              >
                {POSITIONING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Market Price & Monthly Estimate Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="market-price" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.marketPriceLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                <input
                  id="market-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(e.target.value)}
                  placeholder="Opcional"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="monthly-estimate" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.products.modal.monthlyEstimateLabel}
              </label>
              <input
                id="monthly-estimate"
                type="number"
                step="1"
                min="1"
                value={monthlyUnitsEstimate}
                onChange={(e) => setMonthlyUnitsEstimate(e.target.value)}
                placeholder={labels.products.modal.monthlyEstimatePlaceholder}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          {/* Weight (for allocation) */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-slate-300 mb-2">
              {labels.products.modal.weightLabel}
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={labels.products.modal.weightPlaceholder}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
            />
            <p className="mt-1 text-xs text-slate-500">
              Usado para rateio de custos quando o metodo e "Por peso"
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {labels.products.modal.cancel || labels.stores.modal.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading || isDeleting || !name.trim() || !directCost}
              className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.products.modal.saving}
                </>
              ) : (
                isEditing ? labels.products.modal.save : labels.products.modal.create
              )}
            </button>
          </div>

          {/* Delete Button - Only show when editing */}
          {isEditing && onDelete && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}
              className="w-full mt-4 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {labels.products.deleteProduct}
            </button>
          )}

          {/* Delete Confirmation */}
          {isEditing && showDeleteConfirm && (
            <div className="mt-4 p-4 rounded-lg border border-red-800 bg-red-950/30">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300">
                    {labels.messages.confirmDeleteProduct}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {labels.stores.modal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
