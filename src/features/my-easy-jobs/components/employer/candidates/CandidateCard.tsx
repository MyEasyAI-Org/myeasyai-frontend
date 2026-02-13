// =============================================
// MyEasyJobs - CandidateCard Component
// =============================================
// Card for displaying a single candidate with
// status, score, tags, and action menu.
// =============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Brain,
} from 'lucide-react';
import type { Candidate } from '../../../types';
import {
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_COLORS,
} from '../../../constants';

// =============================================
// TYPES
// =============================================

interface CandidateCardProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
}

// =============================================
// HELPERS
// =============================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreTrackColor(score: number): string {
  if (score >= 70) return 'stroke-emerald-400';
  if (score >= 40) return 'stroke-amber-400';
  return 'stroke-red-400';
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// =============================================
// SCORE CIRCLE COMPONENT
// =============================================

function ScoreCircle({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-700"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getScoreTrackColor(score)}
        />
      </svg>
      <span
        className={`absolute text-xs font-bold ${getScoreColor(score)}`}
      >
        {score}
      </span>
    </div>
  );
}

// =============================================
// COMPONENT
// =============================================

export function CandidateCard({
  candidate,
  onView,
  onEdit,
  onDelete,
}: CandidateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleView = useCallback(() => {
    setMenuOpen(false);
    onView(candidate);
  }, [candidate, onView]);

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    onEdit(candidate);
  }, [candidate, onEdit]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onDelete(candidate);
  }, [candidate, onDelete]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700">
      {/* Header: Avatar + Name + Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(candidate.name)}`}
          >
            <span className="text-sm font-bold text-white">
              {getInitials(candidate.name)}
            </span>
          </div>
          {/* Name + Email */}
          <div className="min-w-0">
            <button
              onClick={() => onView(candidate)}
              className="block text-sm font-semibold text-white hover:text-emerald-400 transition-colors truncate max-w-full text-left"
            >
              {candidate.name}
            </button>
            <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
              <button
                onClick={handleView}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status + Score row */}
      <div className="flex items-center justify-between mt-4">
        {/* Status badge */}
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
            CANDIDATE_STATUS_COLORS[candidate.status] || 'text-slate-400 bg-slate-400/20'
          }`}
        >
          {CANDIDATE_STATUS_LABELS[candidate.status] || candidate.status}
        </span>

        {/* Screening score */}
        {candidate.screening_score != null && (
          <ScoreCircle score={candidate.screening_score} />
        )}
      </div>

      {/* AI Notes preview */}
      {candidate.ai_notes && (
        <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">
              Notas da IA
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            {candidate.ai_notes}
          </p>
        </div>
      )}

      {/* Tags */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {candidate.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded-full"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Applied date */}
      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500">
          Aplicou em {formatDate(candidate.applied_at)}
        </span>
      </div>
    </div>
  );
}
