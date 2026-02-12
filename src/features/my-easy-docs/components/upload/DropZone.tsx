// =============================================
// MyEasyDocs - DropZone Component
// =============================================
// Drag-and-drop area for file uploads.
// Validates file size (max 100MB).
// =============================================

import { useState, useCallback, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '../../constants';
import { formatFileSize } from '../../utils';

// =============================================
// PROPS
// =============================================
interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
}

// =============================================
// COMPONENT
// =============================================
export function DropZone({
  onFilesSelected,
  disabled = false,
  multiple = true,
  accept,
  maxSize = MAX_FILE_SIZE,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Validate files
  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > maxSize) {
          errors.push(`"${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB (${formatFileSize(file.size)})`);
        } else {
          valid.push(file);
        }
      }

      return { valid, errors };
    },
    [maxSize]
  );

  // Handle files selection
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      const fileArray = Array.from(files);
      const { valid, errors } = validateFiles(fileArray);

      if (errors.length > 0) {
        setError(errors[0]); // Show first error
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [validateFiles, onFilesSelected]
  );

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  // Click to open file picker
  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  // Drag event handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      e.dataTransfer.dropEffect = 'copy';
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setIsDragging(false);
      dragCounter.current = 0;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[200px] p-8
          border-2 border-dashed rounded-xl
          transition-all duration-200 cursor-pointer
          ${
            disabled
              ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed opacity-50'
              : isDragging
              ? 'border-blue-400 bg-blue-500/10 scale-[1.02]'
              : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
      >
        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          disabled={disabled}
          multiple={multiple}
          accept={accept}
          className="hidden"
        />

        {/* Icon */}
        <div
          className={`
            w-16 h-16 mb-4 flex items-center justify-center rounded-full
            transition-colors duration-200
            ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700'}
          `}
        >
          <Upload
            className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`}
          />
        </div>

        {/* Text */}
        <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-blue-300' : 'text-slate-300'}`}>
          {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>

        <p className="text-sm text-slate-500">
          Tamanho máximo: {MAX_FILE_SIZE_MB}MB por arquivo
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
