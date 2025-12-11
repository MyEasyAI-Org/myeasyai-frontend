// =============================================================================
// StoreForm - Modal form for creating/editing stores
// =============================================================================

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import { Tooltip } from '../shared/Tooltip';
import type { Store, StoreFormData, CostAllocationMethod } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreFormData) => Promise<void>;
  onDelete?: (storeId: string) => Promise<boolean>;
  editStore?: Store | null;
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function StoreForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editStore,
  isLoading = false,
}: StoreFormProps) {
  const labels = PRICING_LABELS;
  const isEditing = !!editStore;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costAllocationMethod, setCostAllocationMethod] = useState<CostAllocationMethod>('equal');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when modal opens/closes or editStore changes
  useEffect(() => {
    if (isOpen) {
      if (editStore) {
        setName(editStore.name);
        setDescription(editStore.description || '');
        setCostAllocationMethod(editStore.cost_allocation_method);
      } else {
        setName('');
        setDescription('');
        setCostAllocationMethod('equal');
      }
      // Reset delete state
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [isOpen, editStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      cost_allocation_method: costAllocationMethod,
    });
  };

  const handleDelete = async () => {
    if (!editStore || !onDelete) return;

    setIsDeleting(true);
    const success = await onDelete(editStore.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg shadow-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">
              {isEditing ? labels.stores.modal.titleEdit : labels.stores.modal.titleCreate}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEditing
                ? 'Atualize as informações da sua loja/tabela de preços.'
                : 'Crie uma nova loja ou tabela de preços para organizar seus produtos.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            disabled={isLoading || isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="store-name" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.stores.modal.nameLabel} <span className="text-red-400">*</span>
              </label>
              <input
                id="store-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.stores.modal.namePlaceholder}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors"
                required
                autoFocus
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="store-description" className="block text-sm font-medium text-slate-300 mb-2">
                {labels.stores.modal.descriptionLabel}
              </label>
              <textarea
                id="store-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={labels.stores.modal.descriptionPlaceholder}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-colors resize-none"
              />
            </div>

            {/* Cost Allocation Method */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-slate-300">
                  {labels.stores.modal.allocationMethodLabel}
                </label>
                <Tooltip
                  content="Igual: divide igualmente. Por peso: proporcional ao peso. Por receita: proporcional às vendas."
                  position="right"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['equal', 'weighted', 'revenue_based'] as CostAllocationMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setCostAllocationMethod(method)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      costAllocationMethod === method
                        ? 'bg-yellow-600 border-yellow-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {labels.stores.modal.allocationMethods[method]}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Confirmation */}
            {isEditing && showDeleteConfirm && (
              <div className="p-4 rounded-lg border border-red-800 bg-red-950/30">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      {labels.messages.confirmDelete}
                    </p>
                    <p className="text-xs text-red-400/80 mt-1">
                      {labels.messages.confirmDeleteStore}
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
                        {labels.stores.deleteStore}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            {/* Delete Button - Only show when editing */}
            {isEditing && onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading || isDeleting}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {labels.stores.deleteStore}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                disabled={isLoading || isDeleting}
              >
                {labels.stores.modal.cancel}
              </button>
            )}

            <div className="flex gap-3">
              {isEditing && onDelete && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  disabled={isLoading || isDeleting}
                >
                  {labels.stores.modal.cancel}
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || isDeleting || !name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {labels.stores.modal.saving}
                  </>
                ) : (
                  isEditing ? labels.stores.modal.save : labels.stores.modal.create
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
