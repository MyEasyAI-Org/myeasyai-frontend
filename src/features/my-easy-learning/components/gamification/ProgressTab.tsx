/**
 * ProgressTab Component
 *
 * Full gamification tab showing streak, XP, certificates, and achievements.
 */

import { memo, useMemo } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { StudyStreakCard } from './StudyStreakCard';
import { LearningXpProgressBar } from './LearningXpProgressBar';
import { CertificateGrid } from './CertificateGrid';
import { AchievementGrid } from './AchievementGrid';
import { CERTIFICATES } from '../../constants/trophies';
import { ACHIEVEMENTS } from '../../constants/uniqueBadges';
import type { LearningGamificationState } from '../../types/gamification';

interface ProgressTabProps {
  state: LearningGamificationState;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  streak: {
    current: number;
    longest: number;
    isActiveToday: boolean;
    totalStudyDays: number;
  };
  xp: {
    total: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercent: number;
  };
  stats: {
    totalTasksCompleted: number;
    totalLessonsCompleted: number;
    perfectWeeks: number;
    plansCompleted: number;
  };
}

export const ProgressTab = memo(function ProgressTab({
  state,
  isLoading,
  isSaving,
  error,
  streak,
  xp,
  stats,
}: ProgressTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <GraduationCap className="h-10 w-10 text-slate-600" />
          <p className="text-slate-400">Erro ao carregar dados de gamificacao</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  // Transform certificates data for CertificateGrid
  const certificatesForGrid = useMemo(() => {
    return CERTIFICATES.map((cert) => {
      const userCert = state.certificates.find((c) => c.certificateId === cert.id);
      const currentTier = userCert?.currentTier || 'none';
      const progress = userCert?.progress || 0;

      // Calculate progress based on metric
      let calculatedProgress = progress;
      switch (cert.metric) {
        case 'streak_days':
          calculatedProgress = streak.current;
          break;
        case 'total_lessons':
          calculatedProgress = stats.totalLessonsCompleted;
          break;
        case 'total_tasks':
          calculatedProgress = stats.totalTasksCompleted;
          break;
        case 'perfect_weeks':
          calculatedProgress = stats.perfectWeeks;
          break;
        case 'skill_categories':
          calculatedProgress = state.skillCategories?.length || 0;
          break;
        case 'early_sessions':
          calculatedProgress = state.earlyStudySessions || 0;
          break;
        case 'night_sessions':
          calculatedProgress = state.nightStudySessions || 0;
          break;
      }

      return {
        id: cert.id,
        name: cert.name,
        icon: cert.icon,
        category: cert.category,
        userProgress: {
          currentTier,
          progress: calculatedProgress,
        },
        tiers: cert.tiers,
        isMaxed: currentTier === 'gold',
      };
    });
  }, [state, streak, stats]);

  // Calculate certificate stats
  const certificateStats = useMemo(() => {
    let goldCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;
    let unlockedTiers = 0;

    certificatesForGrid.forEach((cert) => {
      if (cert.userProgress.currentTier === 'gold') {
        goldCount++;
        unlockedTiers += 3;
      } else if (cert.userProgress.currentTier === 'silver') {
        silverCount++;
        unlockedTiers += 2;
      } else if (cert.userProgress.currentTier === 'bronze') {
        bronzeCount++;
        unlockedTiers += 1;
      }
    });

    return {
      goldCount,
      silverCount,
      bronzeCount,
      certificatePoints: goldCount * 3 + silverCount * 2 + bronzeCount,
      totalTiers: certificatesForGrid.length * 3,
      unlockedTiers,
    };
  }, [certificatesForGrid]);

  // Transform achievements data for AchievementGrid
  const achievementsForGrid = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      const userAchievement = state.achievements.find(
        (a) => a.achievementId === achievement.id
      );
      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
      };
    });
  }, [state.achievements]);

  return (
    <div className="relative p-3 sm:p-4 space-y-3 overflow-hidden pb-24 sm:pb-4">
      {/* Compact Header */}
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Seu Progresso</h2>
      </div>

      {/* Top Row: Streak and XP - compact mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StudyStreakCard
          currentStreak={streak.current}
          longestStreak={streak.longest}
          isActiveToday={streak.isActiveToday}
          totalStudyDays={streak.totalStudyDays}
          compact
        />

        <LearningXpProgressBar
          currentXP={xp.currentLevelXP}
          nextLevelXP={xp.nextLevelXP}
          level={xp.level}
          totalXP={xp.total}
          compact
        />
      </div>

      {/* Certificates Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
        <CertificateGrid
          certificates={certificatesForGrid}
          goldCount={certificateStats.goldCount}
          silverCount={certificateStats.silverCount}
          bronzeCount={certificateStats.bronzeCount}
          certificatePoints={certificateStats.certificatePoints}
          totalTiers={certificateStats.totalTiers}
          unlockedTiers={certificateStats.unlockedTiers}
        />
      </div>

      {/* Achievements Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
        <AchievementGrid achievements={achievementsForGrid} />
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Estatisticas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-white">{stats.totalTasksCompleted}</p>
            <p className="text-xs text-slate-500">Tarefas Concluidas</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-white">{stats.totalLessonsCompleted}</p>
            <p className="text-xs text-slate-500">Semanas Concluidas</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-white">{stats.perfectWeeks}</p>
            <p className="text-xs text-slate-500">Semanas Perfeitas</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-white">{stats.plansCompleted}</p>
            <p className="text-xs text-slate-500">Planos Concluidos</p>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando...
        </div>
      )}
    </div>
  );
});

export default ProgressTab;
