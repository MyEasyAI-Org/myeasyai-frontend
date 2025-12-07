// =============================================================================
// DynamicCostRow - Editable row for costs with name, value, frequency
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { CostFrequency } from '../../types/pricing.types';
import { calculateMonthlyCost } from '../../hooks/useIndirectCosts';

// =============================================================================
// Types
// =============================================================================

interface DynamicCostRowProps {
  id: string;
  name: string;
  amount: number;
  frequency: CostFrequency;
  amortizationMonths: number;
  onUpdate: (id: string, data: { name?: string; amount?: number; frequency?: CostFrequency; amortization_months?: number }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isNew?: boolean;
  disabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function DynamicCostRow({
  id,
  name,
  amount,
  frequency,
  amortizationMonths,
  onUpdate,
  onDelete,
  isNew = false,
  disabled = false,
}: DynamicCostRowProps) {
  const labels = PRICING_LABELS;
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Local state for editing
  const [localName, setLocalName] = useState(name);
  const [localAmount, setLocalAmount] = useState(amount ? amount.toString() : '');
  const [localFrequency, setLocalFrequency] = useState<CostFrequency>(frequency);
  const [localAmortization, setLocalAmortization] = useState(amortizationMonths.toString());

  // UI state
  const [showAmortization, setShowAmortization] = useState(frequency === 'one_time');
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

  // Calculate monthly value for display
  const monthlyValue = calculateMonthlyCost(
    parseFloat(localAmount) || 0,
    localFrequency,
    parseInt(localAmortization) || 12
  );

  // Handle blur (save on field exit)
  const handleBlur = async () => {
    const parsedAmount = parseFloat(localAmount) || 0;
    const parsedAmortization = parseInt(localAmortization) || 12;

    // Check if anything changed
    if (
      localName === name &&
      parsedAmount === amount &&
      localFrequency === frequency &&
      parsedAmortization === amortizationMonths
    ) {
      return; // No changes
    }

    setIsSaving(true);
    await onUpdate(id, {
      name: localName.trim() || name,
      amount: parsedAmount,
      frequency: localFrequency,
      amortization_months: parsedAmortization,
    });
    setIsSaving(false);
  };

  // Handle frequency change (immediate save)
  const handleFrequencyChange = async (newFrequency: CostFrequency) => {
    setLocalFrequency(newFrequency);

    setIsSaving(true);
    await onUpdate(id, { frequency: newFrequency });
    setIsSaving(false);
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(id);
    // Component will be removed if delete succeeds
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

      {/* Row 2: Amount and Frequency */}
      <div className="flex items-center gap-2">
        {/* Amount */}
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

        {/* Frequency Select */}
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

        {/* Saving indicator */}
        {isSaving && (
          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
        )}
      </div>

      {/* Row 3: Amortization (only for one_time) */}
      {showAmortization && (
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

      {/* Monthly value display */}
      {localFrequency !== 'monthly' && (
        <div className="text-xs text-slate-500 pl-1">
          = R$ {monthlyValue.toFixed(2)}/mês
        </div>
      )}
    </div>
  );
}
