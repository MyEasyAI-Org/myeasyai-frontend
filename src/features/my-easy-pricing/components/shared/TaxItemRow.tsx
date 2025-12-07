// =============================================================================
// TaxItemRow - Dynamic row for tax/fee items
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

interface TaxItemRowProps {
  id: string;
  name: string;
  percentage: number;
  onUpdate: (id: string, data: { name?: string; percentage?: number }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isNew?: boolean;
  disabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function TaxItemRow({
  id,
  name,
  percentage,
  onUpdate,
  onDelete,
  isNew = false,
  disabled = false,
}: TaxItemRowProps) {
  const labels = PRICING_LABELS;

  // Local state for inputs
  const [localName, setLocalName] = useState(name);
  const [localPercentage, setLocalPercentage] = useState(percentage ? percentage.toString() : '');
  const [isDeleting, setIsDeleting] = useState(false);

  // Ref for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on new items
  useEffect(() => {
    if (isNew && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isNew]);

  // Handle name blur (save)
  const handleNameBlur = async () => {
    const trimmedName = localName.trim();
    if (trimmedName !== name) {
      const success = await onUpdate(id, { name: trimmedName });
      if (!success) {
        setLocalName(name);
      }
    }
  };

  // Handle percentage blur (save)
  const handlePercentageBlur = async () => {
    const numValue = parseFloat(localPercentage) || 0;
    if (numValue !== percentage) {
      const success = await onUpdate(id, { percentage: numValue });
      if (!success) {
        setLocalPercentage(percentage ? percentage.toString() : '');
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete(id);
    if (!success) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
      {/* Name Input */}
      <input
        ref={nameInputRef}
        type="text"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        onBlur={handleNameBlur}
        placeholder={labels.forms.name}
        disabled={disabled || isDeleting}
        className="flex-1 min-w-0 bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
      />

      {/* Percentage Input */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={localPercentage}
          onChange={(e) => setLocalPercentage(e.target.value)}
          onBlur={handlePercentageBlur}
          placeholder="0"
          step="0.1"
          min="0"
          max="100"
          disabled={disabled || isDeleting}
          className="w-16 px-2 py-1 text-right bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50"
        />
        <span className="text-slate-400 text-sm">%</span>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled || isDeleting}
        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={labels.forms.remove}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
