import { Briefcase, Users, Brain, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import type { JobPosting, Candidate, EmployerView } from '../../../types';
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '../../../constants';

interface EmployerOverviewProps {
  jobsCount: number;
  candidatesCount: number;
  jobs: JobPosting[];
  candidates: Candidate[];
  onNavigate: (view: EmployerView) => void;
  onCreateJob: () => void;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function MetricCard({ title, value, icon, color, onClick }: MetricCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left transition-colors hover:border-slate-700 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </button>
  );
}

export function EmployerOverview({
  jobsCount,
  candidatesCount,
  jobs,
  candidates,
  onNavigate,
  onCreateJob,
}: EmployerOverviewProps) {
  const screenedCount = candidates.filter((c) => c.screening_score !== undefined).length;
  const scored = candidates.filter((c) => c.screening_score !== undefined);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, c) => sum + (c.screening_score ?? 0), 0) / scored.length)
    : 0;

  const recentJobs = jobs.slice(0, 5);
  const recentCandidates = candidates.slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard do Recrutador</h2>
          <p className="mt-1 text-slate-400">
            Acompanhe suas vagas e candidatos em um só lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateJob}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Nova Vaga
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Vagas Abertas"
          value={String(jobsCount)}
          icon={<Briefcase className="h-6 w-6 text-emerald-400" />}
          color="bg-emerald-500/20"
          onClick={() => onNavigate('jobs')}
        />
        <MetricCard
          title="Total de Candidatos"
          value={String(candidatesCount)}
          icon={<Users className="h-6 w-6 text-blue-400" />}
          color="bg-blue-500/20"
          onClick={() => onNavigate('candidates')}
        />
        <MetricCard
          title="Triagens Realizadas"
          value={String(screenedCount)}
          icon={<Brain className="h-6 w-6 text-purple-400" />}
          color="bg-purple-500/20"
          onClick={() => onNavigate('screening')}
        />
        <MetricCard
          title="Nota Média"
          value={scored.length > 0 ? `${avgScore}/100` : '--'}
          icon={<TrendingUp className="h-6 w-6 text-amber-400" />}
          color="bg-amber-500/20"
          onClick={() => onNavigate('screening')}
        />
      </div>

      {/* Recent Jobs + Recent Candidates */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Vagas Recentes</h3>
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="flex items-center gap-1 text-sm text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {recentJobs.length === 0 ? (
            <div className="py-8 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">
                Nenhuma vaga criada ainda.
              </p>
              <button
                type="button"
                onClick={onCreateJob}
                className="mt-3 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Criar primeira vaga
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{job.title}</p>
                    <p className="text-xs text-slate-400">
                      {job.location ?? 'Sem localização'} · {job.applications_count} candidatos
                    </p>
                  </div>
                  <span
                    className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${JOB_STATUS_COLORS[job.status] ?? 'text-slate-400 bg-slate-400/20'}`}
                  >
                    {JOB_STATUS_LABELS[job.status] ?? job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Candidates */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Candidatos Recentes</h3>
            <button
              type="button"
              onClick={() => onNavigate('candidates')}
              className="flex items-center gap-1 text-sm text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {recentCandidates.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">
                Nenhum candidato cadastrado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCandidates.map((candidate) => {
                const job = jobs.find((j) => j.id === candidate.job_id);
                return (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-white">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{candidate.name}</p>
                        <p className="truncate text-xs text-slate-400">
                          {job?.title ?? 'Vaga removida'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${CANDIDATE_STATUS_COLORS[candidate.status] ?? 'text-slate-400 bg-slate-400/20'}`}
                    >
                      {CANDIDATE_STATUS_LABELS[candidate.status] ?? candidate.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
