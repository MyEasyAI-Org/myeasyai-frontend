/**
 * VisaoGeralTab Component
 *
 * Overview tab showing user stats, goals, and status cards.
 */

import { memo, useMemo, useCallback } from 'react';
import {
  Activity,
  Dumbbell,
  Flame,
  LayoutDashboard,
  Salad,
  Target,
  Scale,
  Ruler,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import type { UserPersonalInfo, Treino, Dieta } from '../../types';
import { GamificationSummary } from '../gamification';
import { useFitnessContext } from '../../contexts';

type VisaoGeralTabProps = {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
};

export const VisaoGeralTab = memo(function VisaoGeralTab({ personalInfo, treinos, dieta }: VisaoGeralTabProps) {
  const { gamification } = useFitnessContext();
  const imc = useMemo(() => {
    if (!personalInfo.peso || !personalInfo.altura) return null;
    return (personalInfo.peso / Math.pow(personalInfo.altura / 100, 2)).toFixed(1);
  }, [personalInfo.peso, personalInfo.altura]);

  const getImcStatus = useCallback((imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-yellow-400' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-green-400' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-400' };
    return { label: 'Obesidade', color: 'text-red-400' };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Scale className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">Peso</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {personalInfo.peso ? `${personalInfo.peso} kg` : '--'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Ruler className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Altura</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {personalInfo.altura ? `${personalInfo.altura} cm` : '--'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">IMC</span>
          </div>
          <p className="text-2xl font-bold text-white">{imc || '--'}</p>
          {imc && (
            <p className={`text-xs ${getImcStatus(parseFloat(imc)).color}`}>
              {getImcStatus(parseFloat(imc)).label}
            </p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-sm text-slate-400">Meta Calórica</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {dieta?.calorias ? `${dieta.calorias}` : '--'}
          </p>
          <p className="text-xs text-slate-500">kcal/dia</p>
        </div>
      </div>

      {/* Gamification Summary */}
      {!gamification.isLoading && (
        <GamificationSummary
          streak={{
            current: gamification.streak.current,
            isActiveToday: gamification.streak.isActiveToday,
          }}
          xp={{
            level: gamification.xp.level,
            progressPercent: gamification.xp.progressPercent,
          }}
          badges={{
            unlockedCount: gamification.badges.unlockedCount,
            totalCount: gamification.badges.totalCount,
            recentUnlocks: gamification.badges.recentUnlocks,
          }}
          challenges={{
            dailyProgress: gamification.challenges.dailyProgress,
            weeklyProgress: gamification.challenges.weeklyProgress,
          }}
        />
      )}

      {/* Objetivo */}
      {personalInfo.objetivo && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Seu Objetivo</span>
          </div>
          <p className="text-slate-300">{personalInfo.objetivo}</p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Treinos</span>
          </div>
          {treinos.length > 0 ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{treinos.length} treino(s) configurado(s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhum treino configurado</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Salad className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Dieta</span>
          </div>
          {dieta ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Dieta configurada</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhuma dieta configurada</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!personalInfo.nome && treinos.length === 0 && !dieta && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <LayoutDashboard className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Bem-vindo ao MyEasyFitness!</h3>
          <p className="text-slate-400 max-w-md">
            Converse com o assistente para configurar seu perfil, treinos e dieta personalizados.
          </p>
        </div>
      )}
    </div>
  );
});
