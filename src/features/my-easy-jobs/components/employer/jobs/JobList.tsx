import { useState } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import type { JobPosting, JobPostingFilters } from '../../../types';
import {
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '../../../constants';
import { JobCard } from './JobCard';

// ============================================================================
// TYPES
// ============================================================================

interface JobListProps {
  jobs: JobPosting[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  filters: JobPostingFilters;
  onFiltersChange: (filters: JobPostingFilters) => void;
  onCreateJob: () => void;
  onViewJob: (job: JobPosting) => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (job: JobPosting) => void;
  candidateCounts?: Record<string, number>;
}

// ============================================================================
// JOB LIST COMPONENT
// ============================================================================

export function JobList({
  jobs,
  isLoading,
  error,
  totalCount,
  filters,
  onFiltersChange,
  onCreateJob,
  onViewJob,
  onEditJob,
  onDeleteJob,
  candidateCounts = {},
}: JobListProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleFilterChange = (field: keyof JobPostingFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const hasActiveFilters = filters.status || filters.job_type || filters.experience_level;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vagas</h2>
          <p className="mt-1 text-sm text-slate-400">
            {totalCount} {totalCount === 1 ? 'vaga encontrada' : 'vagas encontradas'}
          </p>
        </div>
        <button
          onClick={onCreateJob}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Nova Vaga
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar vagas..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {[filters.status, filters.job_type, filters.experience_level].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-700/50 pt-4 sm:grid-cols-3">
            {/* Status Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">Todos</option>
                {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Tipo de Vaga
              </label>
              <select
                value={filters.job_type || ''}
                onChange={(e) => handleFilterChange('job_type', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">Todos</option>
                {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Nivel
              </label>
              <select
                value={filters.experience_level || ''}
                onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">Todos</option>
                {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        /* Loading State */
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="mt-3 text-sm text-slate-400">Carregando vagas...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-16">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <h3 className="mt-4 text-base font-semibold text-white">
            Erro ao carregar vagas
          </h3>
          <p className="mt-1 text-sm text-slate-400">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 py-20">
          <Briefcase className="h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            {filters.search || hasActiveFilters
              ? 'Nenhuma vaga encontrada'
              : 'Nenhuma vaga criada ainda'}
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-slate-400">
            {filters.search || hasActiveFilters
              ? 'Tente ajustar os filtros ou termos de busca.'
              : 'Crie sua primeira vaga e comece a atrair os melhores candidatos.'}
          </p>
          {!filters.search && !hasActiveFilters && (
            <button
              onClick={onCreateJob}
              className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Criar Primeira Vaga
            </button>
          )}
        </div>
      ) : (
        /* Job Cards Grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={onViewJob}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
              candidateCount={candidateCounts[job.id] ?? job.applications_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
