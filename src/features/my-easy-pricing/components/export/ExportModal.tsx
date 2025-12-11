// =============================================================================
// ExportModal - Modal for exporting pricing tables to Excel/PDF
// =============================================================================

import { useState } from 'react';
import { X, FileSpreadsheet, FileText, Loader2, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Product, IndirectCost, HiddenCost, TaxItem, Store } from '../../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../../hooks/useCalculations';
import { exportToExcel } from '../../utils/exportExcel';
import { exportToPdf } from '../../utils/exportPdf';

// =============================================================================
// Types
// =============================================================================

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  products: Product[];
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
}

interface ColumnOption {
  id: string;
  label: string;
}

export interface CostHiddenValues {
  hiddenIndirectCosts: string[];
  hiddenHiddenCosts: string[];
  hiddenTaxItems: string[];
}

// =============================================================================
// Constants
// =============================================================================

const COLUMN_OPTIONS: ColumnOption[] = [
  { id: 'product', label: 'Produto' },
  { id: 'directCost', label: 'C. Direto' },
  { id: 'indirectCost', label: 'C. Indireto' },
  { id: 'hiddenCost', label: 'C. Oculto' },
  { id: 'taxes', label: 'Taxas' },
  { id: 'totalCost', label: 'C. Total' },
  { id: 'price', label: 'Preco' },
  { id: 'grossMargin', label: 'Margem Bruta' },
  { id: 'netMargin', label: 'Margem Liquida' },
  { id: 'profit', label: 'Lucro' },
  { id: 'breakEven', label: 'Ponto Equil.' },
  { id: 'marketComparison', label: 'vs Mercado' },
];

// =============================================================================
// Component
// =============================================================================

export function ExportModal({
  isOpen,
  onClose,
  store,
  products,
  calculations,
  summary,
  indirectCosts,
  hiddenCosts,
  taxItems,
}: ExportModalProps) {
  const labels = PRICING_LABELS.export;

  // State for hidden columns and products
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [hiddenProducts, setHiddenProducts] = useState<string[]>([]);
  const [hiddenIndirectCosts, setHiddenIndirectCosts] = useState<string[]>([]);
  const [hiddenHiddenCosts, setHiddenHiddenCosts] = useState<string[]>([]);
  const [hiddenTaxItems, setHiddenTaxItems] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);

  // Collapsible sections state
  const [showCostsSection, setShowCostsSection] = useState(false);

  if (!isOpen) return null;

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setHiddenColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Toggle product visibility
  const toggleProduct = (productId: string) => {
    setHiddenProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle all columns
  const toggleAllColumns = () => {
    if (hiddenColumns.length === COLUMN_OPTIONS.length) {
      setHiddenColumns([]);
    } else {
      setHiddenColumns(COLUMN_OPTIONS.map(c => c.id));
    }
  };

  // Toggle all products
  const toggleAllProducts = () => {
    if (hiddenProducts.length === products.length) {
      setHiddenProducts([]);
    } else {
      setHiddenProducts(products.map(p => p.id));
    }
  };

  // Toggle indirect cost visibility
  const toggleIndirectCost = (costId: string) => {
    setHiddenIndirectCosts(prev =>
      prev.includes(costId)
        ? prev.filter(id => id !== costId)
        : [...prev, costId]
    );
  };

  // Toggle hidden cost visibility
  const toggleHiddenCost = (costId: string) => {
    setHiddenHiddenCosts(prev =>
      prev.includes(costId)
        ? prev.filter(id => id !== costId)
        : [...prev, costId]
    );
  };

  // Toggle tax item visibility
  const toggleTaxItem = (taxId: string) => {
    setHiddenTaxItems(prev =>
      prev.includes(taxId)
        ? prev.filter(id => id !== taxId)
        : [...prev, taxId]
    );
  };

  // Toggle all indirect costs
  const toggleAllIndirectCosts = () => {
    if (hiddenIndirectCosts.length === indirectCosts.length) {
      setHiddenIndirectCosts([]);
    } else {
      setHiddenIndirectCosts(indirectCosts.map(c => c.id));
    }
  };

  // Toggle all hidden costs
  const toggleAllHiddenCosts = () => {
    if (hiddenHiddenCosts.length === hiddenCosts.length) {
      setHiddenHiddenCosts([]);
    } else {
      setHiddenHiddenCosts(hiddenCosts.map(c => c.id));
    }
  };

  // Toggle all tax items
  const toggleAllTaxItems = () => {
    if (hiddenTaxItems.length === taxItems.length) {
      setHiddenTaxItems([]);
    } else {
      setHiddenTaxItems(taxItems.map(t => t.id));
    }
  };

  // Export handlers
  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportType('excel');
    try {
      exportToExcel({
        store,
        products,
        calculations,
        summary,
        indirectCosts,
        hiddenCosts,
        taxItems,
        hiddenColumns,
        hiddenProducts,
        hiddenIndirectCosts,
        hiddenHiddenCosts,
        hiddenTaxItems,
      });
      onClose();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      await exportToPdf({
        store,
        products,
        calculations,
        summary,
        indirectCosts,
        hiddenCosts,
        taxItems,
        hiddenColumns,
        hiddenProducts,
        hiddenIndirectCosts,
        hiddenHiddenCosts,
        hiddenTaxItems,
      });
      onClose();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Check if there are any costs to hide
  const hasCostsToHide = indirectCosts.length > 0 || hiddenCosts.length > 0 || taxItems.length > 0;
  const totalHiddenCostsCount = hiddenIndirectCosts.length + hiddenHiddenCosts.length + hiddenTaxItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg shadow-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">{labels.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info */}
          <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            {labels.info}
          </div>

          {/* Hidden Columns Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">{labels.hideColumns}</h3>
              <button
                type="button"
                onClick={toggleAllColumns}
                className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                {hiddenColumns.length === COLUMN_OPTIONS.length ? 'Mostrar todas' : 'Ocultar todas'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_OPTIONS.map(column => {
                const isHidden = hiddenColumns.includes(column.id);
                return (
                  <button
                    key={column.id}
                    type="button"
                    onClick={() => toggleColumn(column.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isHidden
                        ? 'bg-slate-700 text-slate-400 border border-slate-600'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-yellow-600/50'
                    }`}
                  >
                    {isHidden ? (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-green-500" />
                    )}
                    <span className={isHidden ? 'line-through' : ''}>{column.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hidden Products Section */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">{labels.hideProducts}</h3>
                <button
                  type="button"
                  onClick={toggleAllProducts}
                  className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  {hiddenProducts.length === products.length ? 'Mostrar todos' : 'Ocultar todos'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {products.map(product => {
                  const isHidden = hiddenProducts.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isHidden
                          ? 'bg-slate-700 text-slate-400 border border-slate-600'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-yellow-600/50'
                      }`}
                    >
                      {isHidden ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`truncate ${isHidden ? 'line-through' : ''}`}>
                        {product.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hidden Store Costs Section (Collapsible) */}
          {hasCostsToHide && (
            <div className="border border-slate-700 rounded-lg overflow-hidden">
              {/* Collapsible Header */}
              <button
                type="button"
                onClick={() => setShowCostsSection(!showCostsSection)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {showCostsSection ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h3 className="text-sm font-medium text-slate-300">
                    Ocultar custos da loja
                  </h3>
                </div>
                {totalHiddenCostsCount > 0 && (
                  <span className="text-xs bg-yellow-600/20 text-yellow-500 px-2 py-0.5 rounded-full">
                    {totalHiddenCostsCount} oculto{totalHiddenCostsCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {/* Collapsible Content */}
              {showCostsSection && (
                <div className="p-4 space-y-4 border-t border-slate-700">
                  {/* Indirect Costs */}
                  {indirectCosts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                          Custos Indiretos ({indirectCosts.length})
                        </h4>
                        <button
                          type="button"
                          onClick={toggleAllIndirectCosts}
                          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {hiddenIndirectCosts.length === indirectCosts.length ? 'Mostrar' : 'Ocultar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {indirectCosts.map(cost => {
                          const isHidden = hiddenIndirectCosts.includes(cost.id);
                          return (
                            <button
                              key={cost.id}
                              type="button"
                              onClick={() => toggleIndirectCost(cost.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                                isHidden
                                  ? 'bg-slate-700/50 text-slate-500 border border-slate-600/50'
                                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-blue-600/50'
                              }`}
                            >
                              {isHidden ? (
                                <EyeOff className="w-3 h-3 text-slate-500" />
                              ) : (
                                <Eye className="w-3 h-3 text-blue-400" />
                              )}
                              <span className={`truncate ${isHidden ? 'line-through' : ''}`}>
                                {cost.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Hidden Costs */}
                  {hiddenCosts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wide">
                          Custos Ocultos ({hiddenCosts.length})
                        </h4>
                        <button
                          type="button"
                          onClick={toggleAllHiddenCosts}
                          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {hiddenHiddenCosts.length === hiddenCosts.length ? 'Mostrar' : 'Ocultar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {hiddenCosts.map(cost => {
                          const isHidden = hiddenHiddenCosts.includes(cost.id);
                          return (
                            <button
                              key={cost.id}
                              type="button"
                              onClick={() => toggleHiddenCost(cost.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                                isHidden
                                  ? 'bg-slate-700/50 text-slate-500 border border-slate-600/50'
                                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-amber-600/50'
                              }`}
                            >
                              {isHidden ? (
                                <EyeOff className="w-3 h-3 text-slate-500" />
                              ) : (
                                <Eye className="w-3 h-3 text-amber-400" />
                              )}
                              <span className={`truncate ${isHidden ? 'line-through' : ''}`}>
                                {cost.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tax Items */}
                  {taxItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide">
                          Impostos e Taxas ({taxItems.length})
                        </h4>
                        <button
                          type="button"
                          onClick={toggleAllTaxItems}
                          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                        >
                          {hiddenTaxItems.length === taxItems.length ? 'Mostrar' : 'Ocultar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {taxItems.map(tax => {
                          const isHidden = hiddenTaxItems.includes(tax.id);
                          return (
                            <button
                              key={tax.id}
                              type="button"
                              onClick={() => toggleTaxItem(tax.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                                isHidden
                                  ? 'bg-slate-700/50 text-slate-500 border border-slate-600/50'
                                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-red-600/50'
                              }`}
                            >
                              {isHidden ? (
                                <EyeOff className="w-3 h-3 text-slate-500" />
                              ) : (
                                <Eye className="w-3 h-3 text-red-400" />
                              )}
                              <span className={`truncate ${isHidden ? 'line-through' : ''}`}>
                                {tax.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Export Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            disabled={isExporting}
          >
            {labels.cancel}
          </button>

          <div className="flex gap-3">
            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isExporting && exportType === 'excel' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              {labels.excelButton}
            </button>

            {/* PDF Export Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isExporting && exportType === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {labels.pdfButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
