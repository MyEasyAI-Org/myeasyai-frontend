import type { DashboardTab } from '../../types/dashboard';

type NavigationTabsProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

export function NavigationTabs({
  activeTab,
  onTabChange,
}: NavigationTabsProps) {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'subscription', label: 'Assinatura' },
    { id: 'products', label: 'Meus Produtos' },
    { id: 'usage', label: 'Uso e Tokens' },
  ];

  return (
    <div className="border-b border-slate-800 bg-black-main/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
