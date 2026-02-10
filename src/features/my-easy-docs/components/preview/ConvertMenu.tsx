// =============================================
// MyEasyDocs - ConvertMenu Component
// =============================================
// Dropdown menu for file format conversions.
// Maps MIME types to available target formats.
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { ImageConversionService } from '../../services/ImageConversionService';
import { SpreadsheetConversionService } from '../../services/SpreadsheetConversionService';

// =============================================
// CONVERSION MAP
// =============================================
const CONVERSION_OPTIONS: Record<string, { label: string; formats: { name: string; extension: string }[] }> = {
  'image/png': {
    label: 'PNG',
    formats: [
      { name: 'JPEG', extension: 'jpg' },
      { name: 'WebP', extension: 'webp' },
    ],
  },
  'image/jpeg': {
    label: 'JPEG',
    formats: [
      { name: 'PNG', extension: 'png' },
      { name: 'WebP', extension: 'webp' },
    ],
  },
  'image/webp': {
    label: 'WebP',
    formats: [
      { name: 'PNG', extension: 'png' },
      { name: 'JPEG', extension: 'jpg' },
    ],
  },
  'image/svg+xml': {
    label: 'SVG',
    formats: [
      { name: 'PNG', extension: 'png' },
    ],
  },
  'image/gif': {
    label: 'GIF',
    formats: [
      { name: 'PNG (1o frame)', extension: 'png' },
    ],
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    label: 'XLSX',
    formats: [
      { name: 'CSV', extension: 'csv' },
      { name: 'JSON', extension: 'json' },
    ],
  },
  'text/csv': {
    label: 'CSV',
    formats: [
      { name: 'XLSX', extension: 'xlsx' },
    ],
  },
};

// =============================================
// PROPS
// =============================================
interface ConvertMenuProps {
  mimeType: string;
  fileUrl: string;
  fileName: string;
}

// =============================================
// COMPONENT
// =============================================
export function ConvertMenu({ mimeType, fileUrl, fileName }: ConvertMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const options = CONVERSION_OPTIONS[mimeType];

  // Close on outside click
  useEffect(() => {
    if (isOpen) {
      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isOpen]);

  const handleConvert = useCallback(async (targetExtension: string) => {
    setIsConverting(true);
    setIsOpen(false);

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      let resultBlob: Blob;
      let resultName: string;

      const baseName = fileName.replace(/\.[^.]+$/, '');

      if (mimeType.startsWith('image/')) {
        if (mimeType === 'image/svg+xml' && targetExtension === 'png') {
          resultBlob = await ImageConversionService.svgToPng(blob);
        } else if (mimeType === 'image/gif' && targetExtension === 'png') {
          resultBlob = await ImageConversionService.gifFirstFrameToPng(blob);
        } else {
          const format = targetExtension === 'jpg' ? 'jpeg' : targetExtension;
          resultBlob = await ImageConversionService.convert(blob, format as 'png' | 'jpeg' | 'webp');
        }
        resultName = `${baseName}.${targetExtension}`;
      } else if (targetExtension === 'csv') {
        const csvText = await SpreadsheetConversionService.xlsxToCsv(blob);
        resultBlob = new Blob([csvText], { type: 'text/csv' });
        resultName = `${baseName}.csv`;
      } else if (targetExtension === 'json') {
        const jsonData = await SpreadsheetConversionService.xlsxToJson(blob);
        resultBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        resultName = `${baseName}.json`;
      } else if (targetExtension === 'xlsx') {
        const text = await blob.text();
        resultBlob = await SpreadsheetConversionService.csvToXlsx(text);
        resultName = `${baseName}.xlsx`;
      } else {
        return;
      }

      // Download the converted file
      const url = URL.createObjectURL(resultBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resultName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  }, [fileUrl, fileName, mimeType]);

  if (!options) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isConverting}
        className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        title="Converter para..."
      >
        {isConverting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRightLeft className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
          <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-slate-700">
            Converter para...
          </div>
          {options.formats.map((format) => (
            <button
              key={format.extension}
              onClick={() => handleConvert(format.extension)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>{format.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
