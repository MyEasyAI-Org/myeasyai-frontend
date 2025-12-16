// =============================================================================
// Formatters - Currency and percentage formatting utilities
// =============================================================================

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Formats a number as Brazilian Real currency
 * @param value - The numeric value to format
 * @param showSymbol - Whether to include the R$ symbol (default: true)
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (!showSymbol) {
    // Remove "R$" and trim spaces
    return formatted.replace('R$', '').trim();
  }

  return formatted;
}

/**
 * Formats a currency value for compact display (shorter format)
 * Uses abbreviated notation for large numbers
 * @param value - The numeric value to format
 * @returns Compact formatted string (e.g., "R$ 1,2K")
 */
export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}K`;
  }
  return formatCurrency(value);
}

// =============================================================================
// Percentage Formatting
// =============================================================================

/**
 * Formats a number as a percentage
 * @param value - The percentage value (e.g., 33.5 for 33.5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "33,5%")
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Formats a percentage with sign indicator
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with sign (e.g., "+5,0%" or "-3,2%")
 */
export function formatPercentageWithSign(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals).replace('.', ',')}%`;
}

// =============================================================================
// Combined Formats
// =============================================================================

/**
 * Formats tax display as "X% (R$ Y,YY)"
 * @param percentage - Tax percentage
 * @param value - Tax value in currency
 * @returns Combined format string (e.g., "8% (R$ 7,44)")
 */
export function formatTaxDisplay(percentage: number, value: number): string {
  if (percentage === 0 && value === 0) {
    return '-';
  }
  return `${formatPercentage(percentage, 2)} (${formatCurrency(value)})`;
}

/**
 * Formats market comparison display
 * @param percentageDiff - Percentage difference from market price
 * @returns Formatted comparison string (e.g., "+15% acima" or "-10% abaixo")
 */
export function formatMarketComparison(percentageDiff: number | null): string {
  if (percentageDiff === null) return '-';

  const sign = percentageDiff >= 0 ? '+' : '';
  const direction = percentageDiff >= 0 ? 'acima' : 'abaixo';
  return `${sign}${percentageDiff.toFixed(0).replace('.', ',')}% ${direction}`;
}

// =============================================================================
// Number Formatting
// =============================================================================

/**
 * Formats a number with thousands separator (Brazilian format)
 * @param value - The numeric value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1.234")
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats break-even units display
 * @param units - Number of units for break-even
 * @returns Formatted string with "un" suffix or infinity symbol
 */
export function formatBreakEven(units: number): string {
  if (!Number.isFinite(units)) return '∞';
  if (units > 999999) return '999.999+ un';
  return `${formatNumber(units)} un`;
}

// =============================================================================
// Input Parsing
// =============================================================================

/**
 * Parses a Brazilian currency string to number
 * @param value - String like "1.234,56" or "R$ 1.234,56"
 * @returns Parsed number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbol and spaces
  const cleaned = value.replace(/R\$|\s/g, '');
  // Replace Brazilian decimal separator
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
}

/**
 * Parses a percentage string to number
 * @param value - String like "33,5%" or "33.5"
 * @returns Parsed number
 */
export function parsePercentageInput(value: string): number {
  // Remove percentage symbol
  const cleaned = value.replace('%', '').trim();
  // Handle Brazilian decimal separator
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
}
