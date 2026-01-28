// =============================================
// MyEasyDocs - UploadProgressList Component
// =============================================
// List of upload progress items with summary.
// =============================================

import { useMemo } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { UploadProgress } from '../../types';
import { UploadProgressItem } from './UploadProgressItem';

// =============================================
// PROPS
// =============================================
interface UploadProgressListProps {
  uploads: UploadProgress[];
  onCancelUpload?: (uploadId: string) => void;
}

// =============================================
// COMPONENT
// =============================================
export function UploadProgressList({ uploads, onCancelUpload }: UploadProgressListProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const total = uploads.length;
    const completed = uploads.filter((u) => u.status === 'completed').length;
    const failed = uploads.filter((u) => u.status === 'error').length;
    const inProgress = uploads.filter(
      (u) => u.status === 'uploading' || u.status === 'extracting' || u.status === 'pending'
    ).length;

    return { total, completed, failed, inProgress };
  }, [uploads]);

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Summary header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-medium text-slate-300">
          Arquivos ({stats.total})
        </h4>
        <div className="flex items-center gap-3 text-xs">
          {stats.inProgress > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {stats.inProgress} em andamento
            </span>
          )}
          {stats.completed > 0 && (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {stats.completed} concluído{stats.completed > 1 ? 's' : ''}
            </span>
          )}
          {stats.failed > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {stats.failed} erro{stats.failed > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Upload items */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {uploads.map((upload) => (
          <UploadProgressItem
            key={upload.id}
            upload={upload}
            onCancel={onCancelUpload ? () => onCancelUpload(upload.id) : undefined}
          />
        ))}
      </div>

      {/* Overall progress bar (when uploads in progress) */}
      {stats.inProgress > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Progresso geral</span>
            <span className="text-xs text-slate-400">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
              style={{
                width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
