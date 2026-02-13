import { Users } from 'lucide-react';

export function CandidatesPlaceholder() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Candidatos</h2>
        <p className="mt-1 text-sm text-slate-400">
          Visualize e gerencie candidatos para suas vagas
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <Users className="mx-auto h-16 w-16 text-slate-600" />
        <h3 className="mt-6 text-xl font-semibold text-white">
          Gestão de Candidatos
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          Em breve você poderá visualizar candidatos, acompanhar o status de cada um
          no processo seletivo e adicionar notas e avaliações.
        </p>
        <span className="mt-6 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400">
          Em breve
        </span>
      </div>
    </div>
  );
}
