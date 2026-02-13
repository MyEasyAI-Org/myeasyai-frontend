import { ArrowLeft, FileText, Building2 } from 'lucide-react';
import { RoleCard } from './RoleCard';

interface RoleSelectionLandingProps {
  onSelectRole: (role: 'employee' | 'employer') => void;
  onBackToDashboard?: () => void;
}

export function RoleSelectionLanding({
  onSelectRole,
  onBackToDashboard,
}: RoleSelectionLandingProps) {
  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl font-bold text-white">MyEasyJobs</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 md:p-8">
        <div className="w-full max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Como você quer usar o MyEasyJobs?
            </h2>
            <p className="text-slate-400 text-lg">
              Escolha seu perfil para começar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <RoleCard
              title="Contratado"
              subtitle="Estou buscando uma vaga"
              description="Crie currículos profissionais otimizados com IA para conquistar sua vaga dos sonhos."
              icon={<FileText className="h-8 w-8" />}
              color="purple"
              features={[
                'Currículos otimizados para ATS',
                'Geração com Inteligência Artificial',
                'Biblioteca de currículos',
                'Múltiplos perfis profissionais',
              ]}
              onSelect={() => onSelectRole('employee')}
            />

            <RoleCard
              title="Contratante"
              subtitle="Estou contratando talentos"
              description="Publique vagas e encontre os melhores candidatos com inteligência artificial."
              icon={<Building2 className="h-8 w-8" />}
              color="emerald"
              features={[
                'Criação e gestão de vagas',
                'Triagem inteligente de currículos',
                'Análise de candidatos com IA',
                'Dashboard de recrutamento',
              ]}
              onSelect={() => onSelectRole('employer')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
