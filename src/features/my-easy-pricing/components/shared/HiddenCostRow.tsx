// =============================================================================
// HiddenCostRow - Editable row for hidden costs with auxiliary fields
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader2, Calculator } from 'lucide-react';
import { PRICING_LABELS, CALCULATION_CONSTANTS } from '../../constants/pricing.constants';
import type { HiddenCostCategory, HiddenCostAuxiliaryData, CostFrequency } from '../../types/pricing.types';
import { calculateMonthlyCost } from '../../hooks/useIndirectCosts';
import {
  calculateHiddenCost,
  hasAuxiliaryCalculator,
  getDefaultAuxiliaryData,
} from '../../utils/hiddenCostCalculators';

// =============================================================================
// Types
// =============================================================================

interface HiddenCostRowProps {
  id: string;
  name: string;
  category: HiddenCostCategory;
  amount: number;
  frequency: CostFrequency;
  amortizationMonths: number;
  isAutoCalculated: boolean;
  auxiliaryData: HiddenCostAuxiliaryData | null;
  onUpdate: (id: string, data: {
    name?: string;
    amount?: number;
    frequency?: CostFrequency;
    amortization_months?: number;
    is_auto_calculated?: boolean;
    auxiliary_data?: HiddenCostAuxiliaryData | null;
  }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isNew?: boolean;
  disabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function HiddenCostRow({
  id,
  name,
  category,
  amount,
  frequency,
  amortizationMonths,
  isAutoCalculated,
  auxiliaryData,
  onUpdate,
  onDelete,
  isNew = false,
  disabled = false,
}: HiddenCostRowProps) {
  const labels = PRICING_LABELS;
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Check if this category has auxiliary calculator
  const hasCalculator = hasAuxiliaryCalculator(category);

  // Local state
  const [localName, setLocalName] = useState(name);
  const [localAmount, setLocalAmount] = useState(amount ? amount.toString() : '');
  const [localFrequency, setLocalFrequency] = useState<CostFrequency>(frequency);
  const [localAmortization, setLocalAmortization] = useState(amortizationMonths.toString());
  const [localAuxData, setLocalAuxData] = useState<HiddenCostAuxiliaryData | null>(
    auxiliaryData || (hasCalculator ? getDefaultAuxiliaryData(category) : null)
  );
  const [useCalculator, setUseCalculator] = useState(isAutoCalculated && hasCalculator);

  // UI state
  const [showAmortization, setShowAmortization] = useState(frequency === 'one_time');
  const [showAuxFields, setShowAuxFields] = useState(useCalculator);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Focus name input when new row is added
  useEffect(() => {
    if (isNew && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isNew]);

  // Update amortization visibility when frequency changes
  useEffect(() => {
    setShowAmortization(localFrequency === 'one_time');
  }, [localFrequency]);

  // Calculate value from auxiliary data
  const calculatedResult = useCalculator && localAuxData
    ? calculateHiddenCost(category, localAuxData)
    : null;

  // Monthly value for display
  const displayAmount = useCalculator && calculatedResult
    ? calculatedResult.amount
    : parseFloat(localAmount) || 0;

  const monthlyValue = calculateMonthlyCost(
    displayAmount,
    localFrequency,
    parseInt(localAmortization) || 12
  );

  // Handle blur (save on field exit)
  const handleBlur = async () => {
    const parsedAmount = useCalculator && calculatedResult
      ? calculatedResult.amount
      : parseFloat(localAmount) || 0;
    const parsedAmortization = parseInt(localAmortization) || 12;

    // Check if anything changed
    if (
      localName === name &&
      parsedAmount === amount &&
      localFrequency === frequency &&
      parsedAmortization === amortizationMonths &&
      useCalculator === isAutoCalculated &&
      JSON.stringify(localAuxData) === JSON.stringify(auxiliaryData)
    ) {
      return; // No changes
    }

    setIsSaving(true);
    await onUpdate(id, {
      name: localName.trim() || name,
      amount: parsedAmount,
      frequency: localFrequency,
      amortization_months: parsedAmortization,
      is_auto_calculated: useCalculator,
      auxiliary_data: useCalculator ? localAuxData : null,
    });
    setIsSaving(false);
  };

  // Handle frequency change
  const handleFrequencyChange = async (newFrequency: CostFrequency) => {
    setLocalFrequency(newFrequency);
    setIsSaving(true);
    await onUpdate(id, { frequency: newFrequency });
    setIsSaving(false);
  };

  // Handle toggle calculator
  const handleToggleCalculator = () => {
    const newUseCalculator = !useCalculator;
    setUseCalculator(newUseCalculator);
    setShowAuxFields(newUseCalculator);

    if (newUseCalculator && !localAuxData) {
      setLocalAuxData(getDefaultAuxiliaryData(category));
    }
  };

  // Handle auxiliary data change
  const handleAuxDataChange = (field: keyof HiddenCostAuxiliaryData, value: unknown) => {
    setLocalAuxData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(id);
  };

  // Render auxiliary fields based on category
  const renderAuxiliaryFields = () => {
    if (!showAuxFields || !localAuxData) return null;

    const auxLabels = labels.hiddenCosts.auxiliary;

    switch (category) {
      case 'vehicle_depreciation':
        return (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">{auxLabels.vehicle.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">{auxLabels.vehicle.kmMonthly}</label>
                <input
                  type="number"
                  value={localAuxData.km_monthly || ''}
                  onChange={(e) => handleAuxDataChange('km_monthly', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.vehicle.vehicleType}</label>
                <select
                  value={localAuxData.vehicle_type || 'car'}
                  onChange={(e) => {
                    const vehicleType = e.target.value as 'car' | 'motorcycle';
                    handleAuxDataChange('vehicle_type', vehicleType);
                    // Update cost_per_km based on vehicle type
                    const newCostPerKm = vehicleType === 'car'
                      ? CALCULATION_CONSTANTS.vehicleDepreciationPerKm.car
                      : CALCULATION_CONSTANTS.vehicleDepreciationPerKm.motorcycle;
                    handleAuxDataChange('cost_per_km', newCostPerKm);
                    handleBlur();
                  }}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                >
                  <option value="car">{auxLabels.vehicle.vehicleTypes.car}</option>
                  <option value="motorcycle">{auxLabels.vehicle.vehicleTypes.motorcycle}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.vehicle.workPercentage}</label>
                <input
                  type="number"
                  value={localAuxData.work_percentage || ''}
                  onChange={(e) => handleAuxDataChange('work_percentage', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  min="0"
                  max="100"
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.vehicle.costPerKm}</label>
                <input
                  type="number"
                  value={localAuxData.cost_per_km || ''}
                  onChange={(e) => handleAuxDataChange('cost_per_km', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  step="0.01"
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="0.70"
                />
              </div>
            </div>
          </div>
        );

      case 'food':
        return (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">{auxLabels.food.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">{auxLabels.food.dailyExpense}</label>
                <input
                  type="number"
                  value={localAuxData.daily_expense || ''}
                  onChange={(e) => handleAuxDataChange('daily_expense', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.food.daysPerMonth}</label>
                <input
                  type="number"
                  value={localAuxData.days_per_month || ''}
                  onChange={(e) => handleAuxDataChange('days_per_month', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="22"
                />
              </div>
            </div>
          </div>
        );

      case 'electricity_home':
        return (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">{auxLabels.electricity.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">{auxLabels.electricity.hoursPerDay}</label>
                <input
                  type="number"
                  value={localAuxData.hours_per_day || ''}
                  onChange={(e) => handleAuxDataChange('hours_per_day', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.electricity.daysPerMonth}</label>
                <input
                  type="number"
                  value={localAuxData.days_per_month || ''}
                  onChange={(e) => handleAuxDataChange('days_per_month', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="22"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.electricity.costPerHour}</label>
                <input
                  type="number"
                  value={localAuxData.cost_per_hour || ''}
                  onChange={(e) => handleAuxDataChange('cost_per_hour', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  step="0.01"
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="0.50"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localAuxData.has_ac || false}
                    onChange={(e) => {
                      handleAuxDataChange('has_ac', e.target.checked);
                      // Update cost_per_hour based on AC selection
                      const newCostPerHour = e.target.checked
                        ? CALCULATION_CONSTANTS.electricityPerHour.withAc
                        : CALCULATION_CONSTANTS.electricityPerHour.withoutAc;
                      handleAuxDataChange('cost_per_hour', newCostPerHour);
                      handleBlur();
                    }}
                    className="rounded border-slate-600 bg-slate-800 text-yellow-500"
                  />
                  {auxLabels.electricity.hasAc}
                </label>
              </div>
            </div>
          </div>
        );

      case 'unpaid_time':
        return (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">{auxLabels.unpaidTime.description}</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">{auxLabels.unpaidTime.hoursPerWeek}</label>
                <input
                  type="number"
                  value={localAuxData.hours_per_week || ''}
                  onChange={(e) => handleAuxDataChange('hours_per_week', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.unpaidTime.weeksPerMonth}</label>
                <input
                  type="number"
                  value={localAuxData.weeks_per_month || ''}
                  onChange={(e) => handleAuxDataChange('weeks_per_month', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  step="0.01"
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="4.33"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.unpaidTime.hourlyRate}</label>
                <input
                  type="number"
                  value={localAuxData.hourly_rate || ''}
                  onChange={(e) => handleAuxDataChange('hourly_rate', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        );

      case 'equipment_depreciation':
        return (
          <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">{auxLabels.equipment.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">{auxLabels.equipment.equipmentValue}</label>
                <input
                  type="number"
                  value={localAuxData.equipment_value || ''}
                  onChange={(e) => handleAuxDataChange('equipment_value', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{auxLabels.equipment.usefulLifeMonths}</label>
                <input
                  type="number"
                  value={localAuxData.useful_life_months || ''}
                  onChange={(e) => handleAuxDataChange('useful_life_months', parseFloat(e.target.value) || 0)}
                  onBlur={handleBlur}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="36"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 space-y-3">
      {/* Row 1: Name and Delete */}
      <div className="flex items-center gap-2">
        <input
          ref={nameInputRef}
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled || isDeleting}
          placeholder="Nome do custo"
          className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled || isDeleting}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
          title={labels.forms.remove}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Calculator Toggle (for categories that have it) */}
      {hasCalculator && (
        <button
          type="button"
          onClick={handleToggleCalculator}
          className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-colors ${
            useCalculator
              ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
          }`}
        >
          <Calculator className="w-3 h-3" />
          {useCalculator ? 'Calculadora ativa' : 'Usar calculadora'}
        </button>
      )}

      {/* Auxiliary Fields */}
      {renderAuxiliaryFields()}

      {/* Calculated Value Display */}
      {useCalculator && calculatedResult && (
        <div className="px-3 py-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-400/80">{calculatedResult.description}</span>
            <span className="text-sm font-medium text-yellow-400">
              R$ {calculatedResult.amount.toFixed(2)}/mês
            </span>
          </div>
        </div>
      )}

      {/* Row 2: Amount and Frequency (only show if not using calculator) */}
      {!useCalculator && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              R$
            </span>
            <input
              type="number"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              onBlur={handleBlur}
              disabled={disabled || isDeleting}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500 disabled:opacity-50"
            />
          </div>

          <select
            value={localFrequency}
            onChange={(e) => handleFrequencyChange(e.target.value as CostFrequency)}
            disabled={disabled || isDeleting}
            className="px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500 disabled:opacity-50"
          >
            <option value="monthly">{labels.forms.frequencies.monthly}</option>
            <option value="yearly">{labels.forms.frequencies.yearly}</option>
            <option value="one_time">{labels.forms.frequencies.one_time}</option>
          </select>

          {isSaving && (
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
          )}
        </div>
      )}

      {/* Row 3: Amortization (only for one_time and not using calculator) */}
      {!useCalculator && showAmortization && (
        <div className="flex items-center gap-2 pl-1">
          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1"
          >
            {showAmortization ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {labels.forms.amortization}
          </button>
          <input
            type="number"
            value={localAmortization}
            onChange={(e) => setLocalAmortization(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled || isDeleting}
            min="1"
            max="120"
            className="w-20 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 disabled:opacity-50"
          />
          <span className="text-xs text-slate-500">meses</span>
        </div>
      )}

      {/* Monthly value display (only for non-monthly, non-calculator) */}
      {!useCalculator && localFrequency !== 'monthly' && (
        <div className="text-xs text-slate-500 pl-1">
          = R$ {monthlyValue.toFixed(2)}/mês
        </div>
      )}
    </div>
  );
}
