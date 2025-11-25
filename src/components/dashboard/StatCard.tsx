import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  showProgress?: boolean;
  progressPercentage?: number;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  showProgress = false,
  progressPercentage = 0,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <Icon className={`h-10 w-10 ${iconColor}`} />
      </div>
      {showProgress && (
        <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
