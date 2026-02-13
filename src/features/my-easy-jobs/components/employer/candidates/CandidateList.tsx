// =============================================
// MyEasyJobs - CandidateList Component
// =============================================
// Full candidate list with search, filters,
// loading/error/empty states, and card grid.
// =============================================

import { useState, useCallback } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Users,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import type { Candidate, CandidateFilters } from '../../../types';
import { CANDIDATE_STATUS_LABELS } from '../../../constants';
import { CandidateCard } from './CandidateCard';

// =============================================
// TYPES
// =============================================

interface CandidateListProps {
  candidates: Candidate[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  filters: CandidateFilters;
  onFiltersChange: (filters: CandidateFilters) => void;
  onCreateCandidate: () => void;
  onViewCandidate: (c: Candidate) => void;
  onEditCandidate: (c: Candidate) => void;
  onDeleteCandidate: (c: Candidate) => void;
  jobs: Array<{ id: string; title: string }>;
}

// =============================================
// COMPONENT
// =============================================

export function CandidateList({
  candidates,
  isLoading,
  error,
  totalCount,
  filters,
  onFiltersChange,
  onCreateCandidate,
  onViewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  jobs,
}: CandidateListProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Search handler with debounce-friendly approach
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: e.target.value || undefined });
    },
    [filters, onFiltersChange]
  );

  // Filter handlers
  const handleJobFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ ...filters, job_id: e.target.value || undefined });
    },
    [filters, onFiltersChange]
  );

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        status: (e.target.value as CandidateFilters['status']) || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
    setShowFilters(false);
  }, [onFiltersChange]);

  const hasActiveFilters = !!(filters.job_id || filters.status || filters.search);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Candidatos</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {totalCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Visualize e gerencie candidatos para suas vagas
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateCandidate}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar Candidato
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Buscar candidatos por nome ou email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm"
            />
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Vaga
              </label>
              <div className="relative">
                <select
                  value={filters.job_id || ''}
                  onChange={handleJobFilterChange}
                  className="w-full appearance-none px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">Todas as vagas</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={filters.status || ''}
                  onChange={handleStatusFilterChange}
                  className="w-full appearance-none px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">Todos os status</option>
                  {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      {isLoading ? (
        /* Loading state */
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="mt-4 text-sm text-slate-400">Carregando candidatos...</p>
        </div>
      ) : error ? (
        /* Error state */
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Erro ao carregar candidatos
          </h3>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
        </div>
      ) : candidates.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-slate-600" />
          <h3 className="mt-6 text-xl font-semibold text-white">
            {hasActiveFilters
              ? 'Nenhum candidato encontrado'
              : 'Nenhum candidato ainda'}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            {hasActiveFilters
              ? 'Tente ajustar os filtros para encontrar candidatos.'
              : 'Adicione candidatos para suas vagas e acompanhe o processo seletivo.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreateCandidate}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Candidato
            </button>
          )}
        </div>
      ) : (
        /* Candidate grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onView={onViewCandidate}
              onEdit={onEditCandidate}
              onDelete={onDeleteCandidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
