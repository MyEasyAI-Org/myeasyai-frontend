// =============================================
// Shared - PreviewLoadingState
// =============================================
// Reusable loading state for all preview components.
// =============================================

import { Loader2 } from 'lucide-react';

interface PreviewLoadingStateProps {
  message?: string;
  iconColor?: string;
}

export function PreviewLoadingState({
  message = 'Carregando...',
  iconColor = 'text-blue-400',
}: PreviewLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Loader2 className={`w-8 h-8 ${iconColor} animate-spin mb-4`} />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
