import { Briefcase, Users, Brain, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function EmployerOverview() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard do Recrutador</h2>
        <p className="mt-1 text-slate-400">
          Acompanhe suas vagas e candidatos em um só lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Vagas Abertas"
          value="0"
          icon={<Briefcase className="h-6 w-6 text-emerald-400" />}
          color="bg-emerald-500/20"
        />
        <MetricCard
          title="Total de Candidatos"
          value="0"
          icon={<Users className="h-6 w-6 text-blue-400" />}
          color="bg-blue-500/20"
        />
        <MetricCard
          title="Triagens Realizadas"
          value="0"
          icon={<Brain className="h-6 w-6 text-purple-400" />}
          color="bg-purple-500/20"
        />
        <MetricCard
          title="Taxa de Aprovação"
          value="--"
          icon={<TrendingUp className="h-6 w-6 text-amber-400" />}
          color="bg-amber-500/20"
        />
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-lg font-semibold text-white">
          Comece criando sua primeira vaga
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Publique vagas de emprego e atraia os melhores talentos com a ajuda da inteligência artificial.
        </p>
      </div>
    </div>
  );
}
