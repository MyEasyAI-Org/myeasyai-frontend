/**
 * TabButton Component
 *
 * Reusable tab button for fitness module navigation.
 */

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  iconClassName?: string;
};

export function TabButton({ active, onClick, icon: Icon, label, iconClassName }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'text-lime-400 border-lime-400 bg-lime-400/10'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <span className="min-w-4 flex items-center justify-center shrink-0">
        <Icon className={iconClassName ?? 'h-4 w-4'} />
      </span>
      <span>{label}</span>
    </button>
  );
}
