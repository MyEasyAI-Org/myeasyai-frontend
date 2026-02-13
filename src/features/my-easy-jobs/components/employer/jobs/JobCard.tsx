import { useState, useRef, useEffect } from 'react';
import { MoreVertical, MapPin, Eye, Pencil, Trash2, Users, Calendar } from 'lucide-react';
import type { JobPosting } from '../../../types';
import {
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
} from '../../../constants';

// ============================================================================
// TYPES
// ============================================================================

interface JobCardProps {
  job: JobPosting;
  onView: (job: JobPosting) => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (job: JobPosting) => void;
  candidateCount?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatSalary(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `R$ ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `R$ ${value}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================================
// JOB CARD COMPONENT
// ============================================================================

export function JobCard({ job, onView, onEdit, onDelete, candidateCount = 0 }: JobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const hasSalary = job.salary_min != null || job.salary_max != null;
  const statusColor = JOB_STATUS_COLORS[job.status] || 'text-slate-400 bg-slate-400/20';
  const statusLabel = JOB_STATUS_LABELS[job.status] || job.status;

  const visibleSkills = job.skills_required.slice(0, 3);
  const remainingSkills = job.skills_required.length - 3;

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700">
      {/* Header: Title + Menu */}
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onView(job)}
          className="text-left text-base font-semibold text-white transition-colors hover:text-emerald-400"
        >
          {job.title}
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onView(job);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                Ver detalhes
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(job);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(job);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-slate-700 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {job.location && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          <span>{job.location}</span>
        </div>
      )}

      {/* Salary */}
      {hasSalary && (
        <p className="mt-1.5 text-sm font-medium text-emerald-400">
          {job.salary_min != null && job.salary_max != null
            ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
            : job.salary_min != null
              ? `A partir de ${formatSalary(job.salary_min)}`
              : `Ate ${formatSalary(job.salary_max!)}`}
        </p>
      )}

      {/* Badges: Type, Level, Mode */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
          {JOB_TYPE_LABELS[job.job_type] || job.job_type}
        </span>
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
          {EXPERIENCE_LEVEL_LABELS[job.experience_level] || job.experience_level}
        </span>
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
          {WORK_MODE_LABELS[job.work_mode] || job.work_mode}
        </span>
      </div>

      {/* Status Badge */}
      <div className="mt-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Skills */}
      {job.skills_required.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleSkills.map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
            >
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              +{remainingSkills}
            </span>
          )}
        </div>
      )}

      {/* Spacer to push footer content to bottom */}
      <div className="flex-1" />

      {/* Candidate Count */}
      <div className="mt-4 flex items-center gap-1.5 text-sm text-slate-400">
        <Users className="h-3.5 w-3.5" />
        <span>
          {candidateCount} {candidateCount === 1 ? 'candidato' : 'candidatos'}
        </span>
      </div>

      {/* Created Date */}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="h-3 w-3" />
        <span>Criada em {formatDate(job.created_at)}</span>
      </div>
    </div>
  );
}
