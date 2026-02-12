/**
 * ExamEligibilityPanel
 *
 * Shows certificate requirements checklist, progress, and "Start Exam" button.
 * Displayed in EnhancedStudyPlanPreview when course is near completion.
 */

import { memo, useMemo } from 'react';
import {
  Award,
  BookOpen,
  PenTool,
  HelpCircle,
  Check,
  Lock,
  Clock,
  Loader2,
  Download,
} from 'lucide-react';
import { CertificateLevelTable } from './CertificateLevelTable';
import type { CertificateEligibility, FinalExam, CertificateLevel, CourseDiploma } from '../../types/courseCompletion';

interface ExamEligibilityPanelProps {
  eligibility: CertificateEligibility;
  certificateLevel: CertificateLevel;
  finalExam: FinalExam | null;
  diploma: CourseDiploma | null;
  canRetake: { canRetake: boolean; waitUntil: string | null };
  isGeneratingExam: boolean;
  onStartExam: () => void;
  onGenerateExam: () => void;
  onIssueDiploma: () => void;
  onDownloadPdf: () => void;
}

export const ExamEligibilityPanel = memo(function ExamEligibilityPanel({
  eligibility,
  certificateLevel,
  finalExam,
  diploma,
  canRetake,
  isGeneratingExam,
  onStartExam,
  onGenerateExam,
  onIssueDiploma,
  onDownloadPdf,
}: ExamEligibilityPanelProps) {
  const { progress } = eligibility;

  // Pre-requisites check (everything except final exam)
  const preReqsMet =
    progress.allWeeksCompleted &&
    progress.minimumExercisesMet &&
    (progress.totalQuizzes === 0 || progress.quizzesPassed === progress.totalQuizzes);

  // Format wait time
  const waitTimeFormatted = useMemo(() => {
    if (!canRetake.waitUntil) return null;
    const waitDate = new Date(canRetake.waitUntil);
    const now = new Date();
    const diffMs = waitDate.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}min`;
  }, [canRetake.waitUntil]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Award className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Certificado de Conclusao</h3>
          <p className="text-sm text-slate-400">
            Complete os requisitos abaixo para emitir seu certificado
          </p>
        </div>
      </div>

      {/* Level Table */}
      <CertificateLevelTable currentLevel={certificateLevel} />

      {/* Requirements Checklist */}
      <div className="rounded-lg bg-slate-800/50 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 uppercase">Requisitos</h4>

        {/* Lessons */}
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            progress.allWeeksCompleted ? 'bg-green-500' : 'bg-slate-600'
          }`}>
            {progress.allWeeksCompleted ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <BookOpen className="h-3 w-3 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">Todas as licoes concluidas</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${progress.totalLessons > 0 ? (progress.lessonsCompleted / progress.totalLessons) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progress.lessonsCompleted}/{progress.totalLessons}
              </span>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            progress.minimumExercisesMet ? 'bg-green-500' : 'bg-slate-600'
          }`}>
            {progress.minimumExercisesMet ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <PenTool className="h-3 w-3 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">Exercicios concluidos (minimo)</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{
                    width: `${progress.totalExercises > 0 ? Math.min((progress.exercisesCompleted / progress.totalExercises) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progress.exercisesCompleted}/{progress.totalExercises}
              </span>
            </div>
          </div>
        </div>

        {/* Quizzes */}
        {progress.totalQuizzes > 0 && (
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              progress.quizzesPassed === progress.totalQuizzes ? 'bg-green-500' : 'bg-slate-600'
            }`}>
              {progress.quizzesPassed === progress.totalQuizzes ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <HelpCircle className="h-3 w-3 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">Quizzes aprovados</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{
                      width: `${progress.totalQuizzes > 0 ? (progress.quizzesPassed / progress.totalQuizzes) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {progress.quizzesPassed}/{progress.totalQuizzes}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Final Exam */}
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            progress.finalExamPassed ? 'bg-green-500' : 'bg-slate-600'
          }`}>
            {progress.finalExamPassed ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Award className="h-3 w-3 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">Prova final aprovada</p>
            {finalExam && finalExam.bestScore !== null && (
              <p className="text-xs text-slate-400 mt-0.5">
                Melhor nota: {finalExam.bestScore}% • {finalExam.attempts.length} tentativa(s)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-2">
        {diploma ? (
          // Diploma already issued - show download button
          <button
            onClick={onDownloadPdf}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Baixar Certificado (PDF)
          </button>
        ) : progress.finalExamPassed ? (
          // Exam passed, no diploma yet - issue certificate
          <button
            onClick={onIssueDiploma}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-sm hover:from-amber-600 hover:to-yellow-600 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Award className="h-5 w-5" />
            Emitir Certificado
          </button>
        ) : !preReqsMet ? (
          // Pre-requisites not met
          <button
            disabled
            className="w-full py-3 rounded-lg bg-slate-700 text-slate-400 font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Complete os requisitos acima
          </button>
        ) : !finalExam ? (
          // No exam generated yet
          <button
            onClick={onGenerateExam}
            disabled={isGeneratingExam}
            className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGeneratingExam ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando prova...
              </>
            ) : (
              <>
                <Award className="h-5 w-5" />
                Gerar Prova Final
              </>
            )}
          </button>
        ) : !canRetake.canRetake ? (
          // Cooldown period
          <button
            disabled
            className="w-full py-3 rounded-lg bg-slate-700 text-slate-400 font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Tente novamente em {waitTimeFormatted}
          </button>
        ) : (
          // Ready to take/retake exam
          <button
            onClick={onStartExam}
            className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Award className="h-5 w-5" />
            {finalExam.attempts.length > 0 ? 'Refazer Prova Final' : 'Iniciar Prova Final'}
          </button>
        )}
      </div>
    </div>
  );
});

export default ExamEligibilityPanel;
