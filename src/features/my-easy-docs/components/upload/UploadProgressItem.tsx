// =============================================
// MyEasyDocs - UploadProgressItem Component
// =============================================
// Single upload progress item with status indicator.
// =============================================

import { memo } from 'react';
import { X, Check, AlertCircle, Loader2, Clock, Upload, FileSearch } from 'lucide-react';
import type { UploadProgress, UploadStatus } from '../../types';
import { formatFileSize } from '../../utils';
import { FileIcon } from '../shared/FileIcon';

// =============================================
// PROPS
// =============================================
interface UploadProgressItemProps {
  upload: UploadProgress;
  onCancel?: () => void;
}

// =============================================
// STATUS CONFIG
// =============================================
const STATUS_CONFIG: Record<
  UploadStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    Icon: typeof Loader2;
    animate?: boolean;
  }
> = {
  pending: {
    label: 'Na fila',
    color: 'text-slate-400',
    bgColor: 'bg-slate-700',
    Icon: Clock,
  },
  uploading: {
    label: 'Enviando',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    Icon: Upload,
    animate: true,
  },
  extracting: {
    label: 'Indexando',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    Icon: FileSearch,
    animate: true,
  },
  completed: {
    label: 'Concluído',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    Icon: Check,
  },
  error: {
    label: 'Erro',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    Icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-slate-500',
    bgColor: 'bg-slate-600',
    Icon: X,
  },
};

// =============================================
// COMPONENT
// =============================================
export const UploadProgressItem = memo(function UploadProgressItem({
  upload,
  onCancel,
}: UploadProgressItemProps) {
  const config = STATUS_CONFIG[upload.status];
  const StatusIcon = config.Icon;
  const isInProgress = upload.status === 'uploading' || upload.status === 'extracting';
  const canCancel = isInProgress || upload.status === 'pending';

  // Get mime type from file
  const mimeType = upload.file.type || 'application/octet-stream';

  // Determine container styles based on status
  const containerStyles = {
    completed: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    cancelled: 'bg-slate-800/30 border-slate-600',
    default: 'bg-slate-800/50 border-slate-700',
  };

  const containerClass =
    upload.status === 'completed'
      ? containerStyles.completed
      : upload.status === 'error'
      ? containerStyles.error
      : upload.status === 'cancelled'
      ? containerStyles.cancelled
      : containerStyles.default;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${containerClass}`}>
      {/* File icon */}
      <div className="flex-shrink-0">
        <FileIcon mimeType={mimeType} size="lg" />
      </div>

      {/* File info and progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-200 truncate pr-2">
            {upload.fileName}
          </p>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {formatFileSize(upload.fileSize)}
          </span>
        </div>

        {/* Progress bar (for uploading) */}
        {upload.status === 'uploading' && (
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        )}

        {/* Indeterminate progress bar (for extracting) */}
        {upload.status === 'extracting' && (
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1 relative">
            <div
              className="absolute h-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"
              style={{
                width: '40%',
                animation: 'indeterminate 1.5s infinite ease-in-out',
              }}
            />
            <style>{`
              @keyframes indeterminate {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        )}

        {/* Status and error */}
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-3.5 h-3.5 ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
          />
          <span className={`text-xs ${config.color}`}>
            {upload.status === 'uploading'
              ? `${config.label} ${upload.progress}%`
              : config.label}
          </span>
          {upload.error && (
            <span className="text-xs text-red-400 truncate" title={upload.error}>
              - {upload.error}
            </span>
          )}
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && onCancel && (
        <button
          onClick={onCancel}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
          title="Cancelar upload"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Completed check with success animation */}
      {upload.status === 'completed' && (
        <div className="flex-shrink-0 p-1.5 bg-green-500/20 rounded-full">
          <Check className="w-4 h-4 text-green-400 animate-[scale_0.3s_ease-out]" />
        </div>
      )}
    </div>
  );
});
