// =============================================================================
// Excel Export Utility - Export pricing data to .xlsx format
// =============================================================================

import * as XLSX from 'xlsx';
import type { Product, IndirectCost, HiddenCost, TaxItem, Store } from '../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../hooks/useCalculations';
import { PRICING_LABELS } from '../constants/pricing.constants';
import { calculateMonthlyCost } from './calculations';

// =============================================================================
// Types
// =============================================================================

export interface ExcelExportData {
  store: Store;
  products: Product[];
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
  hiddenColumns: string[];
  hiddenProducts: string[];
  hiddenIndirectCosts: string[];
  hiddenHiddenCosts: string[];
  hiddenTaxItems: string[];
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrencyForExcel(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatPercentageForExcel(value: number): string {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

function maskValue(value: string, shouldMask: boolean): string {
  return shouldMask ? '***' : value;
}

function getFrequencyLabel(frequency: 'monthly' | 'yearly' | 'one_time'): string {
  return PRICING_LABELS.forms.frequencies[frequency] || frequency;
}

function getCategoryLabel(category: string): string {
  const categories = PRICING_LABELS.table.costsBreakdown.categories as Record<string, string>;
  return categories[category] || category;
}

function formatBreakEvenForExcel(units: number): string {
  if (!Number.isFinite(units)) return '∞';
  if (units > 999999) return '999.999+ un';
  return `${units} un`;
}

function formatMarketComparisonForExcel(percentageDiff: number | null): string {
  if (percentageDiff === null) return '-';
  const sign = percentageDiff >= 0 ? '+' : '';
  const direction = percentageDiff >= 0 ? 'acima' : 'abaixo';
  return `${sign}${percentageDiff.toFixed(0)}% ${direction}`;
}

// =============================================================================
// Products Sheet
// =============================================================================

function createProductsSheet(
  calculations: ProductCalculation[],
  products: Product[],
  hiddenColumns: string[],
  hiddenProducts: string[]
): XLSX.WorkSheet {
  const labels = PRICING_LABELS.table.columns;
  const productMap = new Map(products.map(p => [p.id, p]));

  // Filter out hidden products
  const visibleCalculations = calculations.filter(
    calc => !hiddenProducts.includes(calc.productId)
  );

  // Headers
  const headers = [
    labels.product,
    labels.directCost,
    labels.indirectCost,
    labels.hiddenCost,
    labels.taxes,
    labels.totalCost,
    labels.price,
    labels.grossMargin,
    labels.netMargin,
    labels.profit,
    labels.breakEven,
    labels.marketComparison,
  ];

  // Data rows
  const rows = visibleCalculations.map(calc => {
    const product = productMap.get(calc.productId);
    return [
      maskValue(calc.productName, hiddenColumns.includes('product')),
      maskValue(formatCurrencyForExcel(calc.directCost), hiddenColumns.includes('directCost')),
      maskValue(formatCurrencyForExcel(calc.indirectCostAllocated), hiddenColumns.includes('indirectCost')),
      maskValue(formatCurrencyForExcel(calc.hiddenCostAllocated), hiddenColumns.includes('hiddenCost')),
      maskValue(`${formatPercentageForExcel(calc.taxPercentage)} (${formatCurrencyForExcel(calc.taxValue)})`, hiddenColumns.includes('taxes')),
      maskValue(formatCurrencyForExcel(calc.totalCost), hiddenColumns.includes('totalCost')),
      maskValue(formatCurrencyForExcel(calc.suggestedPrice), hiddenColumns.includes('price')),
      maskValue(formatPercentageForExcel(calc.grossMargin), hiddenColumns.includes('grossMargin')),
      maskValue(formatPercentageForExcel(calc.netMargin), hiddenColumns.includes('netMargin')),
      maskValue(formatCurrencyForExcel(calc.profitPerUnit), hiddenColumns.includes('profit')),
      maskValue(formatBreakEvenForExcel(calc.breakEvenUnits), hiddenColumns.includes('breakEven')),
      maskValue(formatMarketComparisonForExcel(calc.marketComparison), hiddenColumns.includes('marketComparison')),
    ];
  });

  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Produto
    { wch: 15 }, // C. Direto
    { wch: 15 }, // C. Indireto
    { wch: 15 }, // C. Oculto
    { wch: 20 }, // Taxas
    { wch: 15 }, // C. Total
    { wch: 15 }, // Preço
    { wch: 15 }, // Margem Bruta
    { wch: 15 }, // Margem Líquida
    { wch: 15 }, // Lucro
    { wch: 15 }, // Ponto Equil.
    { wch: 15 }, // vs Mercado
  ];

  return ws;
}

// =============================================================================
// Indirect Costs Sheet
// =============================================================================

function createIndirectCostsSheet(
  indirectCosts: IndirectCost[],
  summary: StoreCostsSummary,
  hiddenIndirectCosts: string[]
): XLSX.WorkSheet {
  const labels = PRICING_LABELS.table.costsBreakdown.columns;

  const headers = [
    labels.name,
    labels.category,
    labels.originalValue,
    labels.frequency,
    labels.monthlyValue,
  ];

  const rows = indirectCosts.map(cost => {
    const isHidden = hiddenIndirectCosts.includes(cost.id);
    const monthlyValue = calculateMonthlyCost(
      cost.amount,
      cost.frequency,
      cost.amortization_months
    );
    return [
      maskValue(cost.name, isHidden),
      maskValue(getCategoryLabel(cost.category), isHidden),
      maskValue(formatCurrencyForExcel(cost.amount), isHidden),
      maskValue(getFrequencyLabel(cost.frequency), isHidden),
      maskValue(formatCurrencyForExcel(monthlyValue), isHidden),
    ];
  });

  // Add subtotal row
  rows.push([
    'SUBTOTAL',
    '',
    '',
    '',
    formatCurrencyForExcel(summary.totalIndirectCostsMonthly),
  ]);

  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];

  return ws;
}

// =============================================================================
// Hidden Costs Sheet
// =============================================================================

function createHiddenCostsSheet(
  hiddenCosts: HiddenCost[],
  summary: StoreCostsSummary,
  hiddenHiddenCosts: string[]
): XLSX.WorkSheet {
  const labels = PRICING_LABELS.table.costsBreakdown.columns;

  const headers = [
    labels.name,
    labels.category,
    labels.originalValue,
    labels.frequency,
    labels.monthlyValue,
  ];

  const rows = hiddenCosts.map(cost => {
    const isHidden = hiddenHiddenCosts.includes(cost.id);
    const monthlyValue = calculateMonthlyCost(
      cost.amount,
      cost.frequency,
      cost.amortization_months
    );
    return [
      maskValue(cost.name, isHidden),
      maskValue(getCategoryLabel(cost.category), isHidden),
      maskValue(formatCurrencyForExcel(cost.amount), isHidden),
      maskValue(getFrequencyLabel(cost.frequency), isHidden),
      maskValue(formatCurrencyForExcel(monthlyValue), isHidden),
    ];
  });

  // Add subtotal row
  rows.push([
    'SUBTOTAL',
    '',
    '',
    '',
    formatCurrencyForExcel(summary.totalHiddenCostsMonthly),
  ]);

  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];

  return ws;
}

// =============================================================================
// Taxes Sheet
// =============================================================================

function createTaxesSheet(
  taxItems: TaxItem[],
  summary: StoreCostsSummary,
  hiddenTaxItems: string[]
): XLSX.WorkSheet {
  const labels = PRICING_LABELS.table.costsBreakdown.columns;

  const headers = [
    labels.name,
    labels.category,
    labels.percentage,
  ];

  const rows = taxItems.map(tax => {
    const isHidden = hiddenTaxItems.includes(tax.id);
    return [
      maskValue(tax.name, isHidden),
      maskValue(getCategoryLabel(tax.category), isHidden),
      maskValue(formatPercentageForExcel(tax.percentage), isHidden),
    ];
  });

  // Add subtotal row
  rows.push([
    'TOTAL',
    '',
    formatPercentageForExcel(summary.totalTaxPercentage),
  ]);

  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
  ];

  return ws;
}

// =============================================================================
// Summary Sheet
// =============================================================================

function createSummarySheet(
  store: Store,
  summary: StoreCostsSummary,
  productsCount: number
): XLSX.WorkSheet {
  const data = [
    ['RESUMO DA LOJA'],
    [''],
    ['Nome da Loja', store.name],
    ['Descrição', store.description || '-'],
    ['Método de Rateio', PRICING_LABELS.stores.modal.allocationMethods[store.cost_allocation_method]],
    [''],
    ['CUSTOS MENSAIS'],
    ['Custos Indiretos', formatCurrencyForExcel(summary.totalIndirectCostsMonthly)],
    ['Custos Ocultos', formatCurrencyForExcel(summary.totalHiddenCostsMonthly)],
    ['Total Custos Fixos', formatCurrencyForExcel(summary.totalIndirectCostsMonthly + summary.totalHiddenCostsMonthly)],
    [''],
    ['IMPOSTOS E TAXAS'],
    ['Total de Taxas', formatPercentageForExcel(summary.totalTaxPercentage)],
    [''],
    ['PRODUTOS'],
    ['Quantidade de Produtos', productsCount.toString()],
    [''],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 25 },
    { wch: 30 },
  ];

  return ws;
}

// =============================================================================
// Main Export Function
// =============================================================================

export function exportToExcel(data: ExcelExportData): void {
  const {
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
  } = data;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add sheets
  const summarySheet = createSummarySheet(store, summary, products.length);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo');

  const productsSheet = createProductsSheet(calculations, products, hiddenColumns, hiddenProducts);
  XLSX.utils.book_append_sheet(wb, productsSheet, 'Produtos');

  if (indirectCosts.length > 0) {
    const indirectSheet = createIndirectCostsSheet(indirectCosts, summary, hiddenIndirectCosts);
    XLSX.utils.book_append_sheet(wb, indirectSheet, 'Custos Indiretos');
  }

  if (hiddenCosts.length > 0) {
    const hiddenSheet = createHiddenCostsSheet(hiddenCosts, summary, hiddenHiddenCosts);
    XLSX.utils.book_append_sheet(wb, hiddenSheet, 'Custos Ocultos');
  }

  if (taxItems.length > 0) {
    const taxesSheet = createTaxesSheet(taxItems, summary, hiddenTaxItems);
    XLSX.utils.book_append_sheet(wb, taxesSheet, 'Impostos');
  }

  // Generate filename with store name and date
  const date = new Date().toISOString().split('T')[0];
  const safeName = store.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Precificacao_${safeName}_${date}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
}
