// =============================================================================
// Navigation Types
// =============================================================================

export type NavigationLevel = 'stores' | 'store' | 'product';
export type TabType = 'indirect' | 'hidden' | 'taxes' | 'product';

export interface NavigationState {
  level: NavigationLevel;
  selectedStoreId: string | null;
  selectedProductId: string | null;
  activeTab: TabType;
}

export interface NavigationActions {
  selectStore: (storeId: string) => void;
  selectProduct: (productId: string) => void;
  goBackToStores: () => void;
  goBackToStore: () => void;
  setActiveTab: (tab: TabType) => void;
}

// =============================================================================
// Store Types
// =============================================================================

export type CostAllocationMethod = 'equal' | 'weighted' | 'revenue_based';

export interface Store {
  id: string;
  user_uuid: string;
  name: string;
  description: string | null;
  currency: string;
  cost_allocation_method: CostAllocationMethod;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFormData {
  name: string;
  description: string;
  cost_allocation_method: CostAllocationMethod;
}

// =============================================================================
// Cost Types
// =============================================================================

export type CostFrequency = 'monthly' | 'yearly' | 'one_time';

export type IndirectCostCategory =
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'marketing'
  | 'tools'
  | 'accountant'
  | 'other';

export type HiddenCostCategory =
  | 'vehicle_depreciation'
  | 'food'
  | 'work_clothes'
  | 'packaging'
  | 'electricity_home'
  | 'internet_personal'
  | 'unpaid_time'
  | 'equipment_depreciation'
  | 'other';

export interface IndirectCost {
  id: string;
  store_id: string;
  name: string;
  category: IndirectCostCategory;
  amount: number;
  frequency: CostFrequency;
  amortization_months: number;
  notes: string | null;
}

export interface HiddenCostAuxiliaryData {
  // Vehicle depreciation
  km_monthly?: number;
  vehicle_type?: 'car' | 'motorcycle';
  work_percentage?: number;
  cost_per_km?: number;
  // Food
  daily_expense?: number;
  days_per_month?: number; // Also used by electricity_home
  // Electricity home
  hours_per_day?: number;
  has_ac?: boolean;
  cost_per_hour?: number;
  // Unpaid time
  hours_per_week?: number;
  hourly_rate?: number;
  weeks_per_month?: number;
  // Equipment depreciation
  equipment_value?: number;
  useful_life_months?: number;
}

export interface HiddenCost {
  id: string;
  store_id: string;
  name: string;
  category: HiddenCostCategory;
  amount: number;
  frequency: CostFrequency;
  amortization_months: number;
  is_auto_calculated: boolean;
  auxiliary_data: HiddenCostAuxiliaryData | null;
  notes: string | null;
}

// =============================================================================
// Tax Types
// =============================================================================

export type TaxRegime = 'simples' | 'mei' | 'lucro_presumido' | 'lucro_real';

export interface TaxConfig {
  id: string;
  store_id: string;
  tax_regime: TaxRegime;
}

export type TaxCategory = 'tax_rate' | 'card_fee' | 'marketplace_fee' | 'commission' | 'other';

export interface TaxItem {
  id: string;
  store_id: string;
  name: string;
  category: TaxCategory;
  percentage: number;
}

// =============================================================================
// Product Types
// =============================================================================

export type UnitType = 'unit' | 'hour' | 'kg' | 'meter' | 'service';
export type Positioning = 'premium' | 'intermediate' | 'economy';

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  direct_cost: number;
  unit_type: UnitType;
  desired_margin: number;
  positioning: Positioning;
  market_price: number | null;
  weight: number;
  monthly_units_estimate: number;
  is_active: boolean;
  is_demo: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  direct_cost: number;
  unit_type: UnitType;
  desired_margin: number;
  positioning: Positioning;
  market_price: number | null;
  weight: number;
  monthly_units_estimate: number;
}

// =============================================================================
// Calculation Types
// =============================================================================

export interface ProductCalculations {
  productId: string;
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
  marketComparison: 'below' | 'equal' | 'above' | null;
}

export interface StoreCalculationsSummary {
  totalIndirectCostsMonthly: number;
  totalHiddenCostsMonthly: number;
  totalTaxPercentage: number;
}

// =============================================================================
// Table Theme Types (Future: Templates)
// =============================================================================

export interface TableTheme {
  id: string;
  name: string;
  colors: {
    headerBg: string;
    headerText: string;
    rowBg: string;
    rowAltBg: string;
    borderColor: string;
    accentColor: string;
  };
  fonts: {
    family: string;
    headerSize: string;
    bodySize: string;
  };
  borders: {
    style: 'solid' | 'dashed' | 'none';
    width: string;
    radius: string;
  };
  decorations?: {
    headerIcon?: string;
    cornerDecor?: string;
    watermark?: string;
  };
}

// =============================================================================
// Export Modal Types
// =============================================================================

export interface ExportOptions {
  hiddenColumns: string[];
  hiddenProducts: string[];
  format: 'excel' | 'pdf';
}

// =============================================================================
// Tutorial Types
// =============================================================================

export interface TutorialStep {
  id: string;
  targetElement: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  demoStoreId: string | null;
  demoProductId: string | null;
}
