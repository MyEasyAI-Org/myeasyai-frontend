import { Briefcase, Plus } from 'lucide-react';

export function JobsPlaceholder() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vagas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie suas vagas de emprego
          </p>
        </div>
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-lg bg-emerald-600/50 px-4 py-2 text-sm font-semibold text-white/50 cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Nova Vaga
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <Briefcase className="mx-auto h-16 w-16 text-slate-600" />
        <h3 className="mt-6 text-xl font-semibold text-white">
          Gestão de Vagas
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          Em breve você poderá criar e gerenciar vagas de emprego, definir requisitos,
          faixa salarial e muito mais.
        </p>
        <span className="mt-6 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400">
          Em breve
        </span>
      </div>
    </div>
  );
}
