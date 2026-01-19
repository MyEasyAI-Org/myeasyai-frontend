/**
 * EditableField Component
 *
 * Reusable inline editable field for fitness data.
 */

import { useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';

type EditableFieldProps = {
  label: string;
  value: string | number;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'select';
  suffix?: string;
  options?: { value: string; label: string }[];
};

export function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  suffix = '',
  options,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const displayValue = value ? `${value}${suffix}` : '--';

  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
      <span className="text-slate-400">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-2">
          {type === 'select' && options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value="">Selecione...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm w-24"
              autoFocus
            />
          )}
          <button onClick={handleSave} className="p-1 text-green-400 hover:bg-green-400/20 rounded">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={handleCancel} className="p-1 text-red-400 hover:bg-red-400/20 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{displayValue}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-500 hover:text-lime-400 hover:bg-lime-400/10 rounded transition-colors"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
