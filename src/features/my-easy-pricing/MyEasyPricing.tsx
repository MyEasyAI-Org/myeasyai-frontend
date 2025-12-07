import { ArrowLeft } from 'lucide-react';
import { PRICING_LABELS } from './constants/pricing.constants';
import { LeftPanel } from './components/layout/LeftPanel';

// =============================================================================
// Types
// =============================================================================

interface MyEasyPricingProps {
  onBackToDashboard?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function MyEasyPricing({ onBackToDashboard }: MyEasyPricingProps) {
  const labels = PRICING_LABELS;

  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Title (Left) */}
            <div className="flex items-center space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-xl font-bold text-transparent">
                  {labels.header.title}
                </span>
                <p className="text-xs text-slate-400">
                  {labels.header.subtitle}
                </p>
              </div>
            </div>

            {/* Back Button (Right) */}
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{labels.header.backToDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="max-w-[1800px] mx-auto h-[calc(100vh-64px)]">
        <div className="flex h-full">
          {/* Left Panel - 30% */}
          <aside className="w-[30%] min-w-[320px] max-w-[450px] border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
            <LeftPanel />
          </aside>

          {/* Right Panel - 70% */}
          <section className="flex-1 overflow-y-auto">
            <RightPanelPlaceholder />
          </section>
        </div>
      </main>
    </div>
  );
}

// =============================================================================
// RightPanel Placeholder (será substituído na próxima fase)
// =============================================================================

function RightPanelPlaceholder() {
  const labels = PRICING_LABELS;

  return (
    <div className="p-6">
      {/* Tutorial Button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          disabled
        >
          {labels.tutorial.button}
        </button>
      </div>

      {/* Table Header Placeholder */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        {/* Store Name Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <h2 className="text-lg font-semibold text-center text-slate-400">
            {labels.table.title}
          </h2>
          {/* Export Buttons */}
          <div className="flex justify-center gap-4 mt-3">
            <button
              className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors border border-slate-700"
              disabled
            >
              {labels.export.exportExcel}
            </button>
            <button
              className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors border border-slate-700"
              disabled
            >
              {labels.export.exportPdf}
            </button>
          </div>
        </div>

        {/* Empty State - Sem botao de criar produto */}
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            Selecione uma loja para comecar
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Crie ou selecione uma loja no painel esquerdo para configurar custos e ver a tabela de precificacao.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/30">
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          Fase 1 - Layout Base
        </h3>
        <p className="text-sm text-slate-500">
          Este e o layout inicial da ferramenta MyEasyPricing.
          Os componentes estao desabilitados e serao implementados nas proximas fases.
        </p>
        <ul className="mt-3 text-xs text-slate-600 space-y-1">
          <li>✓ Estrutura de pastas criada</li>
          <li>✓ Types definidos</li>
          <li>✓ Constants/Labels para i18n</li>
          <li>✓ Layout split 30%/70%</li>
          <li>○ Proxima fase: CRUD de Lojas</li>
        </ul>
      </div>
    </div>
  );
}

export default MyEasyPricing;
