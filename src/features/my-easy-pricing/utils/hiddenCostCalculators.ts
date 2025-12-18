// =============================================================================
// Hidden Cost Calculators - Auto-calculate hidden costs from auxiliary data
// =============================================================================

import { CALCULATION_CONSTANTS } from '../constants/pricing.constants';
import type { HiddenCostCategory, HiddenCostAuxiliaryData } from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface CalculationResult {
  amount: number;
  description: string;
}

// =============================================================================
// Calculator Functions
// =============================================================================

/**
 * Calculate vehicle depreciation cost
 * Formula: km_monthly * cost_per_km * work_percentage
 */
export function calculateVehicleDepreciation(data: HiddenCostAuxiliaryData): CalculationResult {
  const kmMonthly = data.km_monthly || 0;
  const vehicleType = data.vehicle_type || 'car';
  const workPercentage = (data.work_percentage || 100) / 100;
  const costPerKm = data.cost_per_km ?? CALCULATION_CONSTANTS.vehicleDepreciationPerKm[vehicleType];

  const amount = kmMonthly * costPerKm * workPercentage;

  return {
    amount: Math.round(amount * 100) / 100,
    description: `${kmMonthly} km × R$ ${costPerKm.toFixed(2)}/km × ${(workPercentage * 100).toFixed(0)}%`,
  };
}

/**
 * Calculate food expenses
 * Formula: daily_expense * days_per_month
 */
export function calculateFoodExpense(data: HiddenCostAuxiliaryData): CalculationResult {
  const dailyExpense = data.daily_expense || 0;
  const daysPerMonth = data.days_per_month || CALCULATION_CONSTANTS.defaults.foodDaysPerMonth;

  const amount = dailyExpense * daysPerMonth;

  return {
    amount: Math.round(amount * 100) / 100,
    description: `R$ ${dailyExpense.toFixed(2)}/dia × ${daysPerMonth} dias`,
  };
}

/**
 * Calculate home electricity cost for work
 * Formula: hours_per_day * working_days * cost_per_hour
 */
export function calculateElectricityCost(data: HiddenCostAuxiliaryData): CalculationResult {
  const hoursPerDay = data.hours_per_day || 0;
  const hasAc = data.has_ac || false;
  const daysPerMonth = data.days_per_month || CALCULATION_CONSTANTS.time.workingDaysPerMonth;
  const costPerHour = data.cost_per_hour || (hasAc
    ? CALCULATION_CONSTANTS.electricityPerHour.withAc
    : CALCULATION_CONSTANTS.electricityPerHour.withoutAc);

  const amount = hoursPerDay * daysPerMonth * costPerHour;

  return {
    amount: Math.round(amount * 100) / 100,
    description: `${hoursPerDay}h/dia × ${daysPerMonth} dias × R$ ${costPerHour.toFixed(2)}/h${hasAc ? ' (c/ AC)' : ''}`,
  };
}

/**
 * Calculate unpaid time cost
 * Formula: hours_per_week * weeks_per_month * hourly_rate
 */
export function calculateUnpaidTime(data: HiddenCostAuxiliaryData): CalculationResult {
  const hoursPerWeek = data.hours_per_week || 0;
  const hourlyRate = data.hourly_rate || 0;
  const weeksPerMonth = data.weeks_per_month || CALCULATION_CONSTANTS.time.weeksPerMonth;

  const amount = hoursPerWeek * weeksPerMonth * hourlyRate;

  return {
    amount: Math.round(amount * 100) / 100,
    description: `${hoursPerWeek}h/sem × ${weeksPerMonth.toFixed(2)} sem × R$ ${hourlyRate.toFixed(2)}/h`,
  };
}

/**
 * Calculate equipment depreciation
 * Formula: equipment_value / useful_life_months
 */
export function calculateEquipmentDepreciation(data: HiddenCostAuxiliaryData): CalculationResult {
  const equipmentValue = data.equipment_value || 0;
  const usefulLifeMonths = data.useful_life_months || CALCULATION_CONSTANTS.defaults.equipmentUsefulLife;

  const amount = usefulLifeMonths > 0 ? equipmentValue / usefulLifeMonths : 0;

  return {
    amount: Math.round(amount * 100) / 100,
    description: `R$ ${equipmentValue.toFixed(2)} ÷ ${usefulLifeMonths} meses`,
  };
}

// =============================================================================
// Main Calculator Function
// =============================================================================

/**
 * Calculate hidden cost amount based on category and auxiliary data
 */
export function calculateHiddenCost(
  category: HiddenCostCategory,
  auxiliaryData: HiddenCostAuxiliaryData | null
): CalculationResult | null {
  if (!auxiliaryData) {
    return null;
  }

  switch (category) {
    case 'vehicle_depreciation':
      return calculateVehicleDepreciation(auxiliaryData);
    case 'food':
      return calculateFoodExpense(auxiliaryData);
    case 'electricity_home':
      return calculateElectricityCost(auxiliaryData);
    case 'unpaid_time':
      return calculateUnpaidTime(auxiliaryData);
    case 'equipment_depreciation':
      return calculateEquipmentDepreciation(auxiliaryData);
    default:
      return null;
  }
}

// =============================================================================
// Check if category has auxiliary calculator
// =============================================================================

export function hasAuxiliaryCalculator(category: HiddenCostCategory): boolean {
  return [
    'vehicle_depreciation',
    'food',
    'electricity_home',
    'unpaid_time',
    'equipment_depreciation',
  ].includes(category);
}

// =============================================================================
// Get default auxiliary data for category
// =============================================================================

export function getDefaultAuxiliaryData(category: HiddenCostCategory): HiddenCostAuxiliaryData | null {
  switch (category) {
    case 'vehicle_depreciation':
      return {
        km_monthly: 0,
        vehicle_type: 'car',
        work_percentage: CALCULATION_CONSTANTS.defaults.workPercentage,
        cost_per_km: CALCULATION_CONSTANTS.vehicleDepreciationPerKm.car,
      };
    case 'food':
      return {
        daily_expense: 0,
        days_per_month: CALCULATION_CONSTANTS.defaults.foodDaysPerMonth,
      };
    case 'electricity_home':
      return {
        hours_per_day: 0,
        days_per_month: CALCULATION_CONSTANTS.time.workingDaysPerMonth,
        has_ac: false,
        cost_per_hour: CALCULATION_CONSTANTS.electricityPerHour.withoutAc,
      };
    case 'unpaid_time':
      return {
        hours_per_week: 0,
        hourly_rate: 0,
        weeks_per_month: CALCULATION_CONSTANTS.time.weeksPerMonth,
      };
    case 'equipment_depreciation':
      return {
        equipment_value: 0,
        useful_life_months: CALCULATION_CONSTANTS.defaults.equipmentUsefulLife,
      };
    default:
      return null;
  }
}
