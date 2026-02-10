// =============================================
// Shared - PreviewEmptyState
// =============================================
// Reusable empty state for all preview components.
// =============================================

import type { LucideIcon } from 'lucide-react';

interface PreviewEmptyStateProps {
  icon: LucideIcon;
  message: string;
}

export function PreviewEmptyState({ icon: Icon, message }: PreviewEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
