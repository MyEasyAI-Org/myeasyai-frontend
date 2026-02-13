import { useState, useCallback } from 'react';
import { Brain, Play, CheckCircle, AlertTriangle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { JobPosting, Candidate, ScreeningResult, ScreeningScore } from '../../../types';
import { ScreeningService } from '../../../services/ScreeningService';

interface ScreeningViewProps {
  jobs: JobPosting[];
  candidates: Candidate[];
  onUpdateScreening: (
    id: string,
    score: number,
    grade: NonNullable<Candidate['screening_grade']>,
    aiNotes: string,
  ) => Promise<Candidate>;
}

const GRADE_CONFIG: Record<ScreeningScore, { label: string; color: string; icon: typeof CheckCircle }> = {
  excellent: { label: 'Excelente', color: 'text-emerald-400', icon: CheckCircle },
  good: { label: 'Bom', color: 'text-blue-400', icon: CheckCircle },
  average: { label: 'Médio', color: 'text-amber-400', icon: AlertTriangle },
  below_average: { label: 'Abaixo da Média', color: 'text-orange-400', icon: AlertTriangle },
  poor: { label: 'Fraco', color: 'text-red-400', icon: XCircle },
};

function ScoreCircle({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xl font-bold text-white">{score}</span>
    </div>
  );
}

function ResultCard({ result, candidate, job, expanded, onToggle }: {
  result: ScreeningResult;
  candidate: Candidate;
  job: JobPosting | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  const gradeInfo = GRADE_CONFIG[result.grade];
  const GradeIcon = gradeInfo.icon;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-900"
      >
        <ScoreCircle score={result.overall_score} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white">{candidate.name}</p>
          <p className="text-sm text-slate-400">{job?.title ?? 'Vaga removida'}</p>
          <div className="mt-1 flex items-center gap-2">
            <GradeIcon className={`h-4 w-4 ${gradeInfo.color}`} />
            <span className={`text-sm font-medium ${gradeInfo.color}`}>{gradeInfo.label}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-5">
          {/* Skills Match */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-slate-300">Habilidades Requeridas</h4>
            <div className="space-y-1.5">
              {result.skills_match.map((s) => (
                <div key={s.skill} className="flex items-center gap-2 text-sm">
                  {s.matched ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  )}
                  <span className={s.matched ? 'text-slate-300' : 'text-slate-500'}>{s.skill}</span>
                </div>
              ))}
              {result.skills_match.length === 0 && (
                <p className="text-sm text-slate-500">Nenhuma habilidade requerida definida para esta vaga.</p>
              )}
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs text-slate-400">Experiência</p>
              <p className="text-lg font-bold text-white">{result.experience_match.score}/100</p>
              <p className="mt-1 text-xs text-slate-500">{result.experience_match.notes}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs text-slate-400">Educação</p>
              <p className="text-lg font-bold text-white">{result.education_match.score}/100</p>
              <p className="mt-1 text-xs text-slate-500">{result.education_match.notes}</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-emerald-400">Pontos Fortes</h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-amber-400">Pontos de Atenção</h4>
              <ul className="space-y-1">
                {result.weaknesses.length > 0 ? result.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {w}
                  </li>
                )) : (
                  <li className="text-sm text-slate-500">Nenhum ponto de atenção identificado.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="mb-1 text-sm font-medium text-slate-300">Recomendação</h4>
            <p className="text-sm text-slate-400">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ScreeningView({ jobs, candidates, onUpdateScreening }: ScreeningViewProps) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isScreening, setIsScreening] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const jobCandidates = selectedJobId
    ? candidates.filter((c) => c.job_id === selectedJobId)
    : [];

  const unscreenedCount = jobCandidates.filter((c) => c.screening_score === undefined).length;

  const handleScreen = useCallback(async () => {
    if (!selectedJob) return;

    const toScreen = jobCandidates.filter((c) => c.screening_score === undefined);
    if (toScreen.length === 0) return;

    setIsScreening(true);
    setError(null);
    setResults([]);
    setProgress({ completed: 0, total: toScreen.length });

    try {
      const screeningResults = await ScreeningService.screenMultiple(
        toScreen,
        selectedJob,
        (completed, total) => setProgress({ completed, total }),
      );

      // Save results to candidates
      for (const result of screeningResults) {
        await onUpdateScreening(
          result.candidate_id,
          result.overall_score,
          result.grade,
          result.recommendation,
        );
      }

      setResults(screeningResults);
      if (screeningResults.length > 0) {
        setExpandedId(screeningResults[0].candidate_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar triagem');
    } finally {
      setIsScreening(false);
    }
  }, [selectedJob, jobCandidates, onUpdateScreening]);

  // Also show previously screened candidates
  const previouslyScreened = jobCandidates.filter((c) => c.screening_score !== undefined);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Triagem com IA</h2>
        <p className="mt-1 text-slate-400">
          Analise automaticamente os candidatos com base nos requisitos da vaga.
        </p>
      </div>

      {/* Job Selection */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <label htmlFor="screening-job" className="mb-2 block text-sm font-medium text-slate-300">
          Selecione a vaga para triagem
        </label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <select
            id="screening-job"
            value={selectedJobId}
            onChange={(e) => { setSelectedJobId(e.target.value); setResults([]); }}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white transition-colors focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Selecione uma vaga...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({candidates.filter((c) => c.job_id === job.id).length} candidatos)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleScreen}
            disabled={!selectedJobId || isScreening || unscreenedCount === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScreening ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando ({progress.completed}/{progress.total})
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {unscreenedCount > 0
                  ? `Triar ${unscreenedCount} candidato${unscreenedCount !== 1 ? 's' : ''}`
                  : 'Todos já triados'}
              </>
            )}
          </button>
        </div>

        {selectedJobId && (
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
            <span>{jobCandidates.length} candidatos na vaga</span>
            <span>·</span>
            <span>{unscreenedCount} pendentes de triagem</span>
            <span>·</span>
            <span>{previouslyScreened.length} já triados</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results from current screening */}
      {results.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Resultados da Triagem ({results.length})
          </h3>
          <div className="space-y-3">
            {results.map((result) => {
              const candidate = candidates.find((c) => c.id === result.candidate_id);
              const job = jobs.find((j) => j.id === result.job_id);
              if (!candidate) return null;
              return (
                <ResultCard
                  key={result.candidate_id}
                  result={result}
                  candidate={candidate}
                  job={job}
                  expanded={expandedId === result.candidate_id}
                  onToggle={() => setExpandedId(
                    expandedId === result.candidate_id ? null : result.candidate_id,
                  )}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Previously screened candidates */}
      {selectedJobId && previouslyScreened.length > 0 && results.length === 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Candidatos Já Triados ({previouslyScreened.length})
          </h3>
          <div className="space-y-3">
            {previouslyScreened
              .sort((a, b) => (b.screening_score ?? 0) - (a.screening_score ?? 0))
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="4" />
                      <circle
                        cx="28" cy="28" r="24" fill="none"
                        stroke={(candidate.screening_score ?? 0) >= 70 ? '#34d399' : (candidate.screening_score ?? 0) >= 50 ? '#fbbf24' : '#f87171'}
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={2 * Math.PI * 24 - ((candidate.screening_score ?? 0) / 100) * 2 * Math.PI * 24}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-white">{candidate.screening_score ?? 0}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{candidate.name}</p>
                    <p className="text-sm text-slate-400">{candidate.email}</p>
                    {candidate.screening_grade && (
                      <span className={`text-xs font-medium ${GRADE_CONFIG[candidate.screening_grade]?.color ?? 'text-slate-400'}`}>
                        {GRADE_CONFIG[candidate.screening_grade]?.label ?? candidate.screening_grade}
                      </span>
                    )}
                  </div>
                  {candidate.ai_notes && (
                    <p className="hidden max-w-xs text-xs text-slate-500 lg:block">{candidate.ai_notes}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedJobId && results.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Brain className="mx-auto h-16 w-16 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Triagem Inteligente de Candidatos
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Selecione uma vaga acima para analisar automaticamente os candidatos.
            A IA avaliará habilidades, experiência e formação com base nos requisitos da vaga.
          </p>
        </div>
      )}

      {/* No candidates for selected job */}
      {selectedJobId && jobCandidates.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Nenhum Candidato
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Esta vaga ainda não possui candidatos cadastrados. Adicione candidatos primeiro na aba "Candidatos".
          </p>
        </div>
      )}
    </div>
  );
}
