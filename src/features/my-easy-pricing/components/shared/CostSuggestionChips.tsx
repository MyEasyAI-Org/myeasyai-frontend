// =============================================================================
// CostSuggestionChips - Clickable suggestion chips for adding costs
// =============================================================================

import { Plus } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface Suggestion {
  id: string;
  label: string;
  category: string;
}

interface CostSuggestionChipsProps {
  suggestions: Suggestion[];
  usedCategories: string[];
  onSelect: (suggestion: Suggestion) => void;
  onAddCustom: () => void;
  addCustomLabel: string;
  disabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function CostSuggestionChips({
  suggestions,
  usedCategories,
  onSelect,
  onAddCustom,
  addCustomLabel,
  disabled = false,
}: CostSuggestionChipsProps) {
  // Filter out suggestions that are already used
  const availableSuggestions = suggestions.filter(
    s => !usedCategories.includes(s.category)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {availableSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {suggestion.label}
        </button>
      ))}

      {/* Add Custom Button */}
      <button
        type="button"
        onClick={onAddCustom}
        disabled={disabled}
        className="px-3 py-1.5 text-sm bg-yellow-600/20 border border-yellow-600/50 text-yellow-400 rounded-full hover:bg-yellow-600/30 hover:border-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        {addCustomLabel}
      </button>
    </div>
  );
}
