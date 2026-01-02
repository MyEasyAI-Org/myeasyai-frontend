import { ArrowLeft, Construction, Dumbbell } from 'lucide-react';

type MyEasyFitnessProps = {
  onBackToDashboard: () => void;
};

export function MyEasyFitness({ onBackToDashboard }: MyEasyFitnessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-lime-500/20 p-2">
                  <Dumbbell className="h-5 w-5 text-lime-400" />
                </div>
                <h1 className="text-xl font-bold text-white">MyEasyFitness</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content - Em Construção */}
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-lime-500/20">
            <Construction className="h-12 w-12 text-lime-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Em Construção</h2>
          <p className="mt-4 max-w-md text-lg text-slate-400">
            O MyEasyFitness está sendo desenvolvido para ajudar você com treinos,
            dietas, calorias, suplementos, mobilidade e esportes.
          </p>
          <p className="mt-2 text-slate-500">Em breve disponível!</p>
          <button
            onClick={onBackToDashboard}
            className="mt-8 rounded-lg bg-lime-600 px-6 py-3 text-sm font-semibold text-white hover:bg-lime-500 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
