import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface RoleCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  color: 'purple' | 'emerald';
  features: string[];
  onSelect: () => void;
}

const COLOR_CLASSES = {
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    border: 'hover:border-purple-500/60',
    button: 'bg-purple-600 hover:bg-purple-700',
    badge: 'text-purple-400 bg-purple-500/20',
    check: 'text-purple-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    border: 'hover:border-emerald-500/60',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    badge: 'text-emerald-400 bg-emerald-500/20',
    check: 'text-emerald-400',
  },
} as const;

export function RoleCard({
  title,
  subtitle,
  description,
  icon,
  color,
  features,
  onSelect,
}: RoleCardProps) {
  const colors = COLOR_CLASSES[color];

  return (
    <div
      className={`group relative rounded-xl border border-slate-800 bg-slate-900/50 p-8 transition-all duration-300 ${colors.border} hover:bg-slate-900/80 cursor-pointer`}
      onClick={onSelect}
    >
      <div className={`inline-flex rounded-xl p-4 ${colors.iconBg} mb-6`}>
        <div className={colors.iconText}>{icon}</div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
      <p className={`text-sm font-medium mb-3 ${colors.badge.split(' ')[0]}`}>
        {subtitle}
      </p>
      <p className="text-slate-400 text-sm mb-6">{description}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
            <Check className={`h-4 w-4 flex-shrink-0 ${colors.check}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors ${colors.button}`}
      >
        Acessar
      </button>
    </div>
  );
}
