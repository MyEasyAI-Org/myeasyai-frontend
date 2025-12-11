// =============================================================================
// PDF Export Utility - Export pricing data to PDF using @react-pdf/renderer
// =============================================================================

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Product, IndirectCost, HiddenCost, TaxItem, Store } from '../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../hooks/useCalculations';
import { PRICING_LABELS } from '../constants/pricing.constants';
import { calculateMonthlyCost } from './calculations';

// =============================================================================
// Types
// =============================================================================

export interface PdfExportData {
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
// Styles
// =============================================================================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ca8a04',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    padding: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ca8a04',
    padding: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 5,
    minHeight: 20,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 5,
    minHeight: 20,
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
    textAlign: 'center',
  },
  tableCellLeft: {
    fontSize: 7,
    color: '#334155',
    textAlign: 'left',
  },
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    marginTop: 2,
  },
  subtotalLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtotalValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  costsTable: {
    width: '100%',
    marginTop: 8,
  },
  costsHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 6,
  },
  hiddenCostsHeader: {
    flexDirection: 'row',
    backgroundColor: '#d97706',
    padding: 6,
  },
  taxesHeader: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    padding: 6,
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatPercentage(value: number): string {
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

function formatBreakEven(units: number): string {
  if (!Number.isFinite(units)) return '-';
  if (units > 999999) return '999k+';
  return `${units}`;
}

function formatMarketComparison(percentageDiff: number | null): string {
  if (percentageDiff === null) return '-';
  const sign = percentageDiff >= 0 ? '+' : '';
  return `${sign}${percentageDiff.toFixed(0)}%`;
}

// =============================================================================
// PDF Components
// =============================================================================

interface PdfDocumentProps {
  data: PdfExportData;
}

function PdfDocument({ data }: PdfDocumentProps) {
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

  const visibleCalculations = calculations.filter(
    calc => !hiddenProducts.includes(calc.productId)
  );

  const generatedDate = new Date().toLocaleString('pt-BR');

  return (
    <Document>
      {/* Page 1: Summary + Products Table */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{store.name}</Text>
          <Text style={styles.subtitle}>
            Tabela de Precificacao - {store.description || 'MyEasyPricing'}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Custos</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Custos Indiretos Mensais:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalIndirectCostsMonthly)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Custos Ocultos Mensais:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalHiddenCostsMonthly)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Taxas:</Text>
            <Text style={styles.summaryValue}>{formatPercentage(summary.totalTaxPercentage)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Metodo de Rateio:</Text>
            <Text style={styles.summaryValue}>
              {PRICING_LABELS.stores.modal.allocationMethods[store.cost_allocation_method]}
            </Text>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tabela de Produtos ({visibleCalculations.length})</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Produto</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>C.Direto</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>C.Indireto</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>C.Oculto</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Taxas</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>C.Total</Text>
              <Text style={[styles.tableHeaderCell, { width: '9%' }]}>Preco</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>M.Bruta</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>M.Liquida</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>Lucro</Text>
              <Text style={[styles.tableHeaderCell, { width: '6%' }]}>P.Eq.</Text>
              <Text style={[styles.tableHeaderCell, { width: '7%' }]}>Mercado</Text>
            </View>

            {/* Table Rows */}
            {visibleCalculations.map((calc, index) => (
              <View key={calc.productId} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCellLeft, { width: '12%' }]}>
                  {maskValue(calc.productName, hiddenColumns.includes('product'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatCurrency(calc.directCost), hiddenColumns.includes('directCost'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatCurrency(calc.indirectCostAllocated), hiddenColumns.includes('indirectCost'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatCurrency(calc.hiddenCostAllocated), hiddenColumns.includes('hiddenCost'))}
                </Text>
                <Text style={[styles.tableCell, { width: '10%' }]}>
                  {maskValue(`${formatPercentage(calc.taxPercentage)}`, hiddenColumns.includes('taxes'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatCurrency(calc.totalCost), hiddenColumns.includes('totalCost'))}
                </Text>
                <Text style={[styles.tableCell, { width: '9%' }]}>
                  {maskValue(formatCurrency(calc.suggestedPrice), hiddenColumns.includes('price'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatPercentage(calc.grossMargin), hiddenColumns.includes('grossMargin'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatPercentage(calc.netMargin), hiddenColumns.includes('netMargin'))}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {maskValue(formatCurrency(calc.profitPerUnit), hiddenColumns.includes('profit'))}
                </Text>
                <Text style={[styles.tableCell, { width: '6%' }]}>
                  {maskValue(formatBreakEven(calc.breakEvenUnits), hiddenColumns.includes('breakEven'))}
                </Text>
                <Text style={[styles.tableCell, { width: '7%' }]}>
                  {maskValue(formatMarketComparison(calc.marketComparison), hiddenColumns.includes('marketComparison'))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Gerado em {generatedDate} - MyEasyPricing
        </Text>
      </Page>

      {/* Page 2: Costs Breakdown */}
      {(indirectCosts.length > 0 || hiddenCosts.length > 0 || taxItems.length > 0) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalhamento de Custos</Text>
            <Text style={styles.subtitle}>{store.name}</Text>
          </View>

          {/* Indirect Costs */}
          {indirectCosts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custos Indiretos ({indirectCosts.length})</Text>
              <View style={styles.costsTable}>
                <View style={styles.costsHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'left' }]}>Nome</Text>
                  <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Categoria</Text>
                  <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Valor Original</Text>
                  <Text style={[styles.tableHeaderCell, { width: '14%' }]}>Frequencia</Text>
                  <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Valor Mensal</Text>
                </View>
                {indirectCosts.map((cost, index) => {
                  const isHidden = hiddenIndirectCosts.includes(cost.id);
                  const monthlyValue = calculateMonthlyCost(cost.amount, cost.frequency, cost.amortization_months);
                  return (
                    <View key={cost.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCellLeft, { width: '30%' }]}>{maskValue(cost.name, isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{maskValue(getCategoryLabel(cost.category), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '18%' }]}>{maskValue(formatCurrency(cost.amount), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '14%' }]}>{maskValue(getFrequencyLabel(cost.frequency), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '18%' }]}>{maskValue(formatCurrency(monthlyValue), isHidden)}</Text>
                    </View>
                  );
                })}
                <View style={styles.subtotalRow}>
                  <Text style={[styles.subtotalLabel, { width: '82%' }]}>Subtotal</Text>
                  <Text style={[styles.subtotalValue, { width: '18%' }]}>
                    {formatCurrency(summary.totalIndirectCostsMonthly)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Hidden Costs */}
          {hiddenCosts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custos Ocultos ({hiddenCosts.length})</Text>
              <View style={styles.costsTable}>
                <View style={styles.hiddenCostsHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'left' }]}>Nome</Text>
                  <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Categoria</Text>
                  <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Valor Original</Text>
                  <Text style={[styles.tableHeaderCell, { width: '14%' }]}>Frequencia</Text>
                  <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Valor Mensal</Text>
                </View>
                {hiddenCosts.map((cost, index) => {
                  const isHidden = hiddenHiddenCosts.includes(cost.id);
                  const monthlyValue = calculateMonthlyCost(cost.amount, cost.frequency, cost.amortization_months);
                  return (
                    <View key={cost.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCellLeft, { width: '30%' }]}>{maskValue(cost.name, isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{maskValue(getCategoryLabel(cost.category), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '18%' }]}>{maskValue(formatCurrency(cost.amount), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '14%' }]}>{maskValue(getFrequencyLabel(cost.frequency), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '18%' }]}>{maskValue(formatCurrency(monthlyValue), isHidden)}</Text>
                    </View>
                  );
                })}
                <View style={styles.subtotalRow}>
                  <Text style={[styles.subtotalLabel, { width: '82%' }]}>Subtotal</Text>
                  <Text style={[styles.subtotalValue, { width: '18%' }]}>
                    {formatCurrency(summary.totalHiddenCostsMonthly)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Taxes */}
          {taxItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Impostos e Taxas ({taxItems.length})</Text>
              <View style={styles.costsTable}>
                <View style={styles.taxesHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '40%', textAlign: 'left' }]}>Nome</Text>
                  <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Categoria</Text>
                  <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Percentual</Text>
                </View>
                {taxItems.map((tax, index) => {
                  const isHidden = hiddenTaxItems.includes(tax.id);
                  return (
                    <View key={tax.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCellLeft, { width: '40%' }]}>{maskValue(tax.name, isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '30%' }]}>{maskValue(getCategoryLabel(tax.category), isHidden)}</Text>
                      <Text style={[styles.tableCell, { width: '30%' }]}>{maskValue(formatPercentage(tax.percentage), isHidden)}</Text>
                    </View>
                  );
                })}
                <View style={styles.subtotalRow}>
                  <Text style={[styles.subtotalLabel, { width: '70%' }]}>Total</Text>
                  <Text style={[styles.subtotalValue, { width: '30%' }]}>
                    {formatPercentage(summary.totalTaxPercentage)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            Gerado em {generatedDate} - MyEasyPricing
          </Text>
        </Page>
      )}
    </Document>
  );
}

// =============================================================================
// Main Export Function
// =============================================================================

export async function exportToPdf(data: PdfExportData): Promise<void> {
  const blob = await pdf(<PdfDocument data={data} />).toBlob();

  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const safeName = data.store.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Precificacao_${safeName}_${date}.pdf`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
