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
};

export function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'text-lime-400 border-lime-400 bg-lime-400/10'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}
