/**
 * CertificateLevelTable
 *
 * Visual table showing basico/intermediario/avancado levels,
 * what each attests, and requirements.
 */

import { memo } from 'react';
import { Check } from 'lucide-react';
import type { CertificateLevel } from '../../types/courseCompletion';
import { CERTIFICATE_LEVELS } from '../../types/courseCompletion';

interface CertificateLevelTableProps {
  currentLevel: CertificateLevel;
}

const LEVEL_STYLES: Record<CertificateLevel, { bg: string; border: string; text: string; badge: string }> = {
  basico: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    badge: 'bg-blue-500',
  },
  intermediario: {
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    badge: 'bg-purple-500',
  },
  avancado: {
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    badge: 'bg-red-500',
  },
};

export const CertificateLevelTable = memo(function CertificateLevelTable({
  currentLevel,
}: CertificateLevelTableProps) {
  return (
    <div className="rounded-lg bg-slate-800/30 border border-slate-700 p-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Niveis de Certificado</h4>
      <div className="space-y-2">
        {CERTIFICATE_LEVELS.map((level) => {
          const style = LEVEL_STYLES[level.level];
          const isCurrentLevel = level.level === currentLevel;

          return (
            <div
              key={level.level}
              className={`rounded-lg border p-3 ${
                isCurrentLevel
                  ? `${style.bg} ${style.border}`
                  : 'bg-slate-900/30 border-slate-700/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${style.badge}`}>
                    {level.label}
                  </span>
                  {isCurrentLevel && (
                    <span className="text-xs text-amber-400 font-medium">← Seu nivel</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Min. {level.minimumExercises} exerc.</span>
                  <span>Nota {level.passingScore}%</span>
                  <span>{level.finalExamQuestions} questoes</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-1.5">{level.description}</p>
              {isCurrentLevel && (
                <ul className="space-y-1">
                  {level.whatItAttests.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CertificateLevelTable;
