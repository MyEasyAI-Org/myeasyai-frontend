// =============================================
// MyEasyDocs - SpreadsheetPreview Component
// =============================================
// Preview component for spreadsheet files (XLSX, XLS, CSV).
// Uses xlsx library for parsing and displays as HTML table.
// Lazy sheet parsing: only the active sheet is parsed on demand.
// =============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, FileSpreadsheet, AlertCircle, Edit3, ChevronDown } from 'lucide-react';
import { UploadService } from '../../services/UploadService';
import { CsvEditor } from './CsvEditor';

// =============================================
// TYPES
// =============================================
interface SpreadsheetPreviewProps {
  url?: string;
  r2Key?: string;
  fileName: string;
  isSaving?: boolean;
  onSave?: (content: string) => Promise<void>;
}

type CellValue = string | number | boolean | null;

// =============================================
// COMPONENT
// =============================================
const MAX_VISIBLE_ROWS = 500;
const MAX_PARSE_ROWS = 10_000;

export function SpreadsheetPreview({ url, r2Key, fileName, isSaving = false, onSave }: SpreadsheetPreviewProps) {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [currentSheetData, setCurrentSheetData] = useState<CellValue[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleRows, setVisibleRows] = useState(MAX_VISIBLE_ROWS);

  const workbookRef = useRef<XLSX.WorkBook | null>(null);
  const parsedCacheRef = useRef<Map<string, CellValue[][]>>(new Map());

  const isCsv = fileName.toLowerCase().endsWith('.csv');
  const canEdit = isCsv && !!onSave;

  const handleSaveCsv = useCallback(async (csvContent: string) => {
    if (onSave) {
      try {
        await onSave(csvContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error saving CSV:', err);
      }
    }
  }, [onSave]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Effect 1: Load workbook and extract sheet names (NO data parsing)
  useEffect(() => {
    const loadWorkbook = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchUrl = r2Key ? UploadService.getDownloadUrl(r2Key) : url;

        if (!fetchUrl) {
          throw new Error('Nenhuma fonte de arquivo disponível');
        }

        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error(`Erro ao carregar arquivo: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: false });

        workbookRef.current = workbook;
        parsedCacheRef.current.clear();
        setSheetNames(workbook.SheetNames);
        setActiveSheet(0);
      } catch (err) {
        console.error('Error loading spreadsheet:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar planilha');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkbook();
  }, [url, r2Key]);

  // Effect 2: Parse only the active sheet on demand (with cache)
  useEffect(() => {
    const wb = workbookRef.current;
    if (!wb || sheetNames.length === 0) return;

    const name = sheetNames[activeSheet];
    if (!name) return;

    // Check cache first
    const cached = parsedCacheRef.current.get(name);
    if (cached) {
      setCurrentSheetData(cached);
      setVisibleRows(MAX_VISIBLE_ROWS);
      return;
    }

    // Parse on demand
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json<CellValue[]>(ws, { header: 1, defval: null });
    const capped = data.slice(0, MAX_PARSE_ROWS);

    parsedCacheRef.current.set(name, capped);
    setCurrentSheetData(capped);
    setVisibleRows(MAX_VISIBLE_ROWS);
  }, [activeSheet, sheetNames]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-4" />
        <p className="text-slate-400">Carregando planilha...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-500/10 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar planilha</h3>
        <p className="text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  // Empty state
  if (sheetNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
          <FileSpreadsheet className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400">Planilha vazia</p>
      </div>
    );
  }

  const hasData = currentSheetData.length > 0;
  const rowCount = currentSheetData.length;
  const colCount = hasData ? currentSheetData.reduce((max, row) => Math.max(max, row.length), 0) : 0;
  const displayedData = hasData ? currentSheetData.slice(0, visibleRows) : [];
  const hasMoreRows = rowCount > visibleRows;

  // CSV editing mode
  if (isEditing && canEdit && hasData) {
    return (
      <CsvEditor
        data={currentSheetData}
        isSaving={isSaving}
        onSave={handleSaveCsv}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar with sheet tabs */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
        <FileSpreadsheet className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span className="text-sm text-slate-300 font-medium truncate max-w-[150px] flex-shrink-0">
          {fileName}
        </span>

        {/* Sheet tabs - only show if multiple sheets */}
        {sheetNames.length > 1 && (
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            {sheetNames.map((name, index) => (
              <button
                key={name}
                onClick={() => { setActiveSheet(index); setVisibleRows(MAX_VISIBLE_ROWS); }}
                className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
                  index === activeSheet
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Single sheet indicator */}
        {sheetNames.length === 1 && (
          <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded ml-2">
            {sheetNames[0]}
          </span>
        )}

        {/* Edit button for CSV files */}
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ml-auto shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Table content */}
      <div className="flex-1 overflow-auto">
        {hasData ? (
          <>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {displayedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-slate-700/50 ${
                      rowIndex === 0 ? 'bg-slate-800 sticky top-0 z-10' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Row number */}
                    <td className="px-2 py-1.5 text-right text-slate-500 bg-slate-800/50 border-r border-slate-700/50 select-none w-12 sticky left-0">
                      {rowIndex + 1}
                    </td>
                    {/* Data cells */}
                    {Array.from({ length: colCount }).map((_, colIndex) => {
                      const cellValue = row[colIndex];
                      const isHeader = rowIndex === 0;
                      return (
                        <td
                          key={colIndex}
                          className={`px-3 py-1.5 border-r border-slate-700/30 whitespace-nowrap ${
                            isHeader
                              ? 'font-semibold text-slate-200'
                              : 'text-slate-300'
                          } ${cellValue === null || cellValue === '' ? 'text-slate-600' : ''}`}
                        >
                          {cellValue !== null && cellValue !== '' ? String(cellValue) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMoreRows && (
              <div className="flex items-center justify-center py-3 border-t border-slate-700/50">
                <button
                  onClick={() => setVisibleRows((prev) => prev + MAX_VISIBLE_ROWS)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Mostrar mais {Math.min(MAX_VISIBLE_ROWS, rowCount - visibleRows).toLocaleString()} linhas ({(rowCount - visibleRows).toLocaleString()} restantes)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8 text-slate-400">
            Esta aba esta vazia
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>
          {rowCount.toLocaleString()} {rowCount === 1 ? 'linha' : 'linhas'} x {colCount.toLocaleString()}{' '}
          {colCount === 1 ? 'coluna' : 'colunas'}
        </span>
        {sheetNames.length > 1 && (
          <span>
            Aba {activeSheet + 1} de {sheetNames.length}
          </span>
        )}
      </div>
    </div>
  );
}
