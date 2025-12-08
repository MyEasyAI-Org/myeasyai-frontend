// =============================================================================
// Calculations - Pure calculation functions for pricing
// =============================================================================

import type { Product, IndirectCost, HiddenCost, TaxItem, CostAllocationMethod } from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface ProductCalculation {
  productId: string;
  productName: string;
  directCost: number;
  indirectCostAllocated: number;
  hiddenCostAllocated: number;
  totalCost: number;
  taxPercentage: number;
  taxValue: number;
  suggestedPrice: number;
  grossMargin: number;
  netMargin: number;
  profitPerUnit: number;
  breakEvenUnits: number;
  marketComparison: number | null; // percentage difference from market price
}

export interface StoreCostsSummary {
  totalIndirectCostsMonthly: number;
  totalHiddenCostsMonthly: number;
  totalTaxPercentage: number;
}

// =============================================================================
// Monthly Cost Calculation (considering frequency and amortization)
// =============================================================================

/**
 * Calculates the monthly cost of an item based on its frequency
 * - monthly: returns the amount directly
 * - yearly: divides by 12
 * - one_time: divides by amortization months (default 12)
 */
export function calculateMonthlyCost(
  amount: number,
  frequency: 'monthly' | 'yearly' | 'one_time',
  amortizationMonths: number = 12
): number {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    case 'one_time':
      return amount / (amortizationMonths || 12);
    default:
      return amount;
  }
}

// =============================================================================
// Total Costs Calculation
// =============================================================================

/**
 * Calculates the total monthly indirect costs for a store
 */
export function calculateTotalIndirectCosts(costs: IndirectCost[]): number {
  return costs.reduce((total, cost) => {
    const monthlyCost = calculateMonthlyCost(
      cost.amount,
      cost.frequency,
      cost.amortization_months
    );
    return total + monthlyCost;
  }, 0);
}

/**
 * Calculates the total monthly hidden costs for a store
 */
export function calculateTotalHiddenCosts(costs: HiddenCost[]): number {
  return costs.reduce((total, cost) => {
    const monthlyCost = calculateMonthlyCost(
      cost.amount,
      cost.frequency,
      cost.amortization_months
    );
    return total + monthlyCost;
  }, 0);
}

/**
 * Calculates the total tax percentage from all tax items
 */
export function calculateTotalTaxPercentage(taxItems: TaxItem[]): number {
  return taxItems.reduce((total, item) => total + item.percentage, 0);
}

// =============================================================================
// Cost Allocation per Product
// =============================================================================

interface AllocationWeight {
  productId: string;
  weight: number;
}

/**
 * Calculates allocation weights for each product based on the allocation method
 */
export function calculateAllocationWeights(
  products: Product[],
  method: CostAllocationMethod
): AllocationWeight[] {
  if (products.length === 0) return [];

  switch (method) {
    case 'equal': {
      // Equal distribution among all products
      const equalWeight = 1 / products.length;
      return products.map(p => ({
        productId: p.id,
        weight: equalWeight,
      }));
    }

    case 'weighted': {
      // Distribution based on product weight
      const totalWeight = products.reduce((sum, p) => sum + (p.weight || 1), 0);
      return products.map(p => ({
        productId: p.id,
        weight: totalWeight > 0 ? (p.weight || 1) / totalWeight : 1 / products.length,
      }));
    }

    case 'revenue_based': {
      // Distribution based on estimated revenue (units × direct cost)
      const revenues = products.map(p => ({
        productId: p.id,
        revenue: (p.monthly_units_estimate || 0) * p.direct_cost,
      }));
      const totalRevenue = revenues.reduce((sum, r) => sum + r.revenue, 0);

      // If no revenue data, fall back to equal distribution
      if (totalRevenue === 0) {
        const equalWeight = 1 / products.length;
        return products.map(p => ({
          productId: p.id,
          weight: equalWeight,
        }));
      }

      return revenues.map(r => ({
        productId: r.productId,
        weight: r.revenue / totalRevenue,
      }));
    }

    default:
      // Default to equal distribution
      const equalWeight = 1 / products.length;
      return products.map(p => ({
        productId: p.id,
        weight: equalWeight,
      }));
  }
}

/**
 * Allocates a total cost to a specific product based on its weight
 */
export function allocateCostToProduct(
  totalCost: number,
  productWeight: number,
  monthlyUnitsEstimate: number
): number {
  // Total allocated cost for this product
  const totalAllocated = totalCost * productWeight;

  // Per unit allocation (if monthly units estimate is provided)
  if (monthlyUnitsEstimate > 0) {
    return totalAllocated / monthlyUnitsEstimate;
  }

  // If no estimate, return the total (per unit = total)
  return totalAllocated;
}

// =============================================================================
// Price and Margin Calculations
// =============================================================================

/**
 * Calculates the suggested price using markup formula
 * Price = TotalCost × (1 + MarginPercentage/100)
 */
export function calculateSuggestedPrice(
  totalCost: number,
  desiredMarginPercent: number
): number {
  return totalCost * (1 + desiredMarginPercent / 100);
}

/**
 * Calculates the price using the divisor formula (considering taxes)
 * Price = TotalCost / (1 - TaxRate - ProfitRate)
 * This ensures the final margin after taxes equals the desired margin
 */
export function calculatePriceWithTaxes(
  totalCost: number,
  desiredMarginPercent: number,
  taxPercentage: number
): number {
  const divisor = 1 - (taxPercentage / 100) - (desiredMarginPercent / 100);

  // Prevent division by zero or negative divisor
  if (divisor <= 0) {
    // Fall back to simple markup when divisor is invalid
    return calculateSuggestedPrice(totalCost, desiredMarginPercent);
  }

  return totalCost / divisor;
}

/**
 * Calculates the tax value for a given price
 */
export function calculateTaxValue(price: number, taxPercentage: number): number {
  return price * (taxPercentage / 100);
}

/**
 * Calculates gross margin percentage
 * GrossMargin = ((Price - DirectCost) / Price) × 100
 */
export function calculateGrossMargin(price: number, directCost: number): number {
  if (price <= 0) return 0;
  return ((price - directCost) / price) * 100;
}

/**
 * Calculates net margin percentage
 * NetMargin = ((Price - TotalCost - TaxValue) / Price) × 100
 */
export function calculateNetMargin(
  price: number,
  totalCost: number,
  taxValue: number
): number {
  if (price <= 0) return 0;
  return ((price - totalCost - taxValue) / price) * 100;
}

/**
 * Calculates profit per unit
 * Profit = Price - TotalCost - TaxValue
 */
export function calculateProfitPerUnit(
  price: number,
  totalCost: number,
  taxValue: number
): number {
  return price - totalCost - taxValue;
}

/**
 * Calculates contribution margin per unit
 * ContributionMargin = Price - DirectCost - TaxValue
 */
export function calculateContributionMargin(
  price: number,
  directCost: number,
  taxValue: number
): number {
  return price - directCost - taxValue;
}

/**
 * Calculates break-even point in units
 * BreakEven = FixedCosts / ContributionMargin
 * Where FixedCosts = allocated indirect + hidden costs (total, not per unit)
 */
export function calculateBreakEvenUnits(
  totalFixedCostsMonthly: number,
  contributionMarginPerUnit: number
): number {
  if (contributionMarginPerUnit <= 0) return Infinity;
  return Math.ceil(totalFixedCostsMonthly / contributionMarginPerUnit);
}

/**
 * Calculates market price comparison as percentage
 * Positive = above market, Negative = below market
 */
export function calculateMarketComparison(
  suggestedPrice: number,
  marketPrice: number | null | undefined
): number | null {
  if (!marketPrice || marketPrice <= 0) return null;
  return ((suggestedPrice - marketPrice) / marketPrice) * 100;
}

// =============================================================================
// Complete Product Calculation
// =============================================================================

interface CalculateProductParams {
  product: Product;
  allocationWeight: number;
  totalIndirectCostsMonthly: number;
  totalHiddenCostsMonthly: number;
  totalTaxPercentage: number;
}

/**
 * Calculates all pricing metrics for a single product
 */
export function calculateProductPricing(params: CalculateProductParams): ProductCalculation {
  const {
    product,
    allocationWeight,
    totalIndirectCostsMonthly,
    totalHiddenCostsMonthly,
    totalTaxPercentage,
  } = params;

  const monthlyUnits = product.monthly_units_estimate || 1;

  // Allocate indirect and hidden costs to this product (per unit)
  const indirectCostAllocated = allocateCostToProduct(
    totalIndirectCostsMonthly,
    allocationWeight,
    monthlyUnits
  );

  const hiddenCostAllocated = allocateCostToProduct(
    totalHiddenCostsMonthly,
    allocationWeight,
    monthlyUnits
  );

  // Calculate total cost per unit
  const totalCost = product.direct_cost + indirectCostAllocated + hiddenCostAllocated;

  // Calculate suggested price (considering taxes in the divisor formula)
  const suggestedPrice = calculatePriceWithTaxes(
    totalCost,
    product.desired_margin,
    totalTaxPercentage
  );

  // Calculate tax value
  const taxValue = calculateTaxValue(suggestedPrice, totalTaxPercentage);

  // Calculate margins
  const grossMargin = calculateGrossMargin(suggestedPrice, product.direct_cost);
  const netMargin = calculateNetMargin(suggestedPrice, totalCost, taxValue);

  // Calculate profit per unit
  const profitPerUnit = calculateProfitPerUnit(suggestedPrice, totalCost, taxValue);

  // Calculate contribution margin for break-even
  const contributionMargin = calculateContributionMargin(
    suggestedPrice,
    product.direct_cost,
    taxValue
  );

  // Calculate fixed costs allocated to this product (total, not per unit)
  const fixedCostsAllocated = (totalIndirectCostsMonthly + totalHiddenCostsMonthly) * allocationWeight;

  // Calculate break-even point
  const breakEvenUnits = calculateBreakEvenUnits(fixedCostsAllocated, contributionMargin);

  // Calculate market comparison
  const marketComparison = calculateMarketComparison(suggestedPrice, product.market_price);

  return {
    productId: product.id,
    productName: product.name,
    directCost: product.direct_cost,
    indirectCostAllocated,
    hiddenCostAllocated,
    totalCost,
    taxPercentage: totalTaxPercentage,
    taxValue,
    suggestedPrice,
    grossMargin,
    netMargin,
    profitPerUnit,
    breakEvenUnits,
    marketComparison,
  };
}

// =============================================================================
// Calculate All Products
// =============================================================================

interface CalculateAllProductsParams {
  products: Product[];
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
  allocationMethod: CostAllocationMethod;
}

export interface AllProductsCalculationResult {
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
}

/**
 * Calculates pricing for all products in a store
 */
export function calculateAllProducts(params: CalculateAllProductsParams): AllProductsCalculationResult {
  const {
    products,
    indirectCosts,
    hiddenCosts,
    taxItems,
    allocationMethod,
  } = params;

  // Calculate store-level totals
  const totalIndirectCostsMonthly = calculateTotalIndirectCosts(indirectCosts);
  const totalHiddenCostsMonthly = calculateTotalHiddenCosts(hiddenCosts);
  const totalTaxPercentage = calculateTotalTaxPercentage(taxItems);

  const summary: StoreCostsSummary = {
    totalIndirectCostsMonthly,
    totalHiddenCostsMonthly,
    totalTaxPercentage,
  };

  // If no products, return empty calculations
  if (products.length === 0) {
    return { calculations: [], summary };
  }

  // Calculate allocation weights
  const weights = calculateAllocationWeights(products, allocationMethod);

  // Calculate pricing for each product
  const calculations = products.map(product => {
    const weightEntry = weights.find(w => w.productId === product.id);
    const allocationWeight = weightEntry?.weight || 1 / products.length;

    return calculateProductPricing({
      product,
      allocationWeight,
      totalIndirectCostsMonthly,
      totalHiddenCostsMonthly,
      totalTaxPercentage,
    });
  });

  return { calculations, summary };
}
