/**
 * EditableListField Component
 *
 * Reusable editable list field for adding/removing string items.
 * Used for medical restrictions, injuries, food preferences, etc.
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

type ColorScheme = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

type EditableListFieldProps = {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  colorScheme?: ColorScheme;
};

const colorClasses: Record<ColorScheme, { bg: string; text: string; hover: string }> = {
  red: { bg: 'bg-red-500/20', text: 'text-red-400', hover: 'hover:text-red-300' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', hover: 'hover:text-orange-300' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', hover: 'hover:text-yellow-300' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', hover: 'hover:text-green-300' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', hover: 'hover:text-blue-300' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', hover: 'hover:text-purple-300' },
};

export function EditableListField({
  label,
  items,
  onAdd,
  onRemove,
  placeholder = 'Adicionar item...',
  colorScheme = 'green',
}: EditableListFieldProps) {
  const [newItem, setNewItem] = useState('');
  const colors = colorClasses[colorScheme];

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div>
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm flex items-center gap-1`}
          >
            {item}
            <button onClick={() => onRemove(idx)} className={colors.hover}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAdd}
          className="p-1 bg-lime-500/20 text-lime-400 rounded hover:bg-lime-500/30"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
