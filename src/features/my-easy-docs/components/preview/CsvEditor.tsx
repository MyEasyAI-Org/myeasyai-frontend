// =============================================
// MyEasyDocs - CsvEditor Component
// =============================================
// Editable CSV table with add/remove rows/columns
// and RFC 4180 compliant serialization.
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { Save, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { MESSAGES } from '../../constants';

// =============================================
// PROPS
// =============================================
interface CsvEditorProps {
  data: (string | number | boolean | null)[][];
  isSaving?: boolean;
  onSave: (csvContent: string) => Promise<void>;
  onCancel: () => void;
}

// =============================================
// RFC 4180 CSV SERIALIZATION
// =============================================
function serializeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function toCsv(data: string[][]): string {
  return data
    .map(row => row.map(serializeCsvCell).join(','))
    .join('\r\n');
}

// =============================================
// COMPONENT
// =============================================
export function CsvEditor({ data, isSaving = false, onSave, onCancel }: CsvEditorProps) {
  const [tableData, setTableData] = useState<string[][]>(() =>
    data.map(row => row.map(cell => (cell !== null && cell !== undefined ? String(cell) : '')))
  );
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving) {
          await onSave(toCsv(tableData));
        }
      }
      if (e.key === 'Escape' && !editingCell) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tableData, isSaving, editingCell, onSave, onCancel]);

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setTableData(prev => {
      const newData = prev.map(row => [...row]);
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  }, []);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
  }, []);

  const handleCellBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleAddRow = useCallback(() => {
    const colCount = tableData[0]?.length || 1;
    setTableData(prev => [...prev, Array(colCount).fill('')]);
  }, [tableData]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    if (tableData.length <= 1) return;
    setTableData(prev => prev.filter((_, i) => i !== rowIndex));
  }, [tableData.length]);

  const handleAddColumn = useCallback(() => {
    setTableData(prev => prev.map(row => [...row, '']));
  }, []);

  const handleRemoveColumn = useCallback((colIndex: number) => {
    if ((tableData[0]?.length || 0) <= 1) return;
    setTableData(prev => prev.map(row => row.filter((_, i) => i !== colIndex)));
  }, [tableData]);

  const handleSave = useCallback(async () => {
    if (!isSaving) {
      await onSave(toCsv(tableData));
    }
  }, [tableData, isSaving, onSave]);

  const colCount = tableData[0]?.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Linha</span>
          </button>
          <button
            onClick={handleAddColumn}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Coluna</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>{MESSAGES.preview.cancelAction}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{MESSAGES.preview.savingAction}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{MESSAGES.preview.saveAction}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 sticky top-0 z-10">
              <th className="w-12 px-2 py-1.5 border-r border-slate-700/50 text-slate-500 text-right">#</th>
              {Array.from({ length: colCount }).map((_, colIndex) => (
                <th key={colIndex} className="px-1 py-1 border-r border-slate-700/30 text-slate-400 font-normal">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase px-2">
                      {String.fromCharCode(65 + (colIndex % 26))}
                      {colIndex >= 26 ? String.fromCharCode(65 + Math.floor(colIndex / 26) - 1) : ''}
                    </span>
                    {colCount > 1 && (
                      <button
                        onClick={() => handleRemoveColumn(colIndex)}
                        className="p-0.5 text-slate-600 hover:text-red-400 transition-colors"
                        title="Remover coluna"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                <td className="px-2 py-1.5 text-right text-slate-500 bg-slate-800/50 border-r border-slate-700/50 select-none w-12 sticky left-0">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleRemoveRow(rowIndex)}
                      className={`p-0.5 transition-colors ${
                        tableData.length > 1 ? 'text-slate-600 hover:text-red-400' : 'invisible'
                      }`}
                      title="Remover linha"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span>{rowIndex + 1}</span>
                  </div>
                </td>
                {row.map((cell, colIndex) => {
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  return (
                    <td
                      key={colIndex}
                      className="px-0 py-0 border-r border-slate-700/30 cursor-text"
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellBlur();
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              handleCellBlur();
                              const nextCol = colIndex + 1;
                              if (nextCol < colCount) {
                                handleCellClick(rowIndex, nextCol);
                              } else if (rowIndex + 1 < tableData.length) {
                                handleCellClick(rowIndex + 1, 0);
                              }
                            }
                          }}
                          autoFocus
                          className="w-full px-3 py-1.5 bg-blue-500/10 text-white border border-blue-500/50 outline-none text-sm"
                        />
                      ) : (
                        <div className="px-3 py-1.5 text-slate-300 whitespace-nowrap min-h-[32px]">
                          {cell || <span className="text-slate-600">-</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>
          {tableData.length.toLocaleString()} {tableData.length === 1 ? 'linha' : 'linhas'} x {colCount.toLocaleString()}{' '}
          {colCount === 1 ? 'coluna' : 'colunas'}
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+S</kbd>
          <span>salvar</span>
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] ml-2">Esc</kbd>
          <span>cancelar</span>
        </div>
      </div>
    </div>
  );
}
