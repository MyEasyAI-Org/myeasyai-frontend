/**
 * FitnessContext
 *
 * Context for sharing fitness data and actions across components.
 * Eliminates prop drilling by providing a centralized state management solution.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserPersonalInfo, Treino, Dieta, FitnessMessage, TrainingModality } from '../types';
import type { GamificationState, Challenge, Goal } from '../types/gamification';
import type { TrophyCategory } from '../types/trophies';
import { useFitnessData } from '../hooks/useFitnessData';
import { usePersonalInfoFlow } from '../hooks/useAnamneseFlow';
import { useGamification } from '../hooks/useGamification';

// Tab type for navigation
export type TabId =
  | 'visao-geral'
  | 'personal-info'
  | 'modalidade'
  | 'treinos'
  | 'dieta'
  | 'exercicios'
  | 'progresso';

// Mobile UI state type
interface MobileUIState {
  isChatDrawerOpen: boolean;
  isMoreMenuOpen: boolean;
  editingExercise: { treinoId: string; exerciseIndex: number } | null;
  activeTab: TabId;
}

// Context value type
interface FitnessContextValue {
  // Personal Info
  personalInfo: UserPersonalInfo;
  updatePersonalInfo: (updates: Partial<UserPersonalInfo>) => void;

  // Workouts
  treinos: Treino[];
  setTreinos: (treinos: Treino[]) => void;
  addTreino: (treino: Treino) => void;

  // Diet
  dieta: Dieta | null;
  updateDieta: (dieta: Dieta | null) => void;

  // Modality Selection
  selectedModality: TrainingModality;
  setSelectedModality: (modality: TrainingModality) => void;

  // Chat
  messages: FitnessMessage[];
  inputMessage: string;
  isGenerating: boolean;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;

  // Gamification
  gamification: {
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    streak: {
      current: number;
      longest: number;
      isActiveToday: boolean;
      daysSinceLastActivity: number;
      totalActiveDays: number;
    };
    xp: {
      total: number;
      level: number;
      currentLevelXP: number;
      nextLevelXP: number;
      progressPercent: number;
    };
    // New trophy system
    trophies: {
      all: Array<{
        id: string;
        name: string;
        icon: string;
        category: TrophyCategory;
        userProgress: {
          currentTier: 'none' | 'bronze' | 'silver' | 'gold';
          progress: number;
        };
        tiers: Array<{
          tier: 'bronze' | 'silver' | 'gold';
          name: string;
          description: string;
          requirement: number;
          xpReward: number;
        }>;
        isMaxed: boolean;
      }>;
      goldCount: number;
      silverCount: number;
      bronzeCount: number;
      trophyPoints: number;
      totalTiers: number;
      unlockedTiers: number;
      closestToUnlock: any | null;
    };
    // Unique badges (special achievements)
    uniqueBadges: {
      unlocked: Array<{ id: string; name: string; icon: string; rarity: string; unlockedAt?: string }>;
      locked: Array<{ id: string; name: string; icon: string; rarity: string; hint?: string }>;
      visible: Array<{ id: string; name: string; icon: string; rarity: string; isUnlocked: boolean }>;
      unlockedCount: number;
      totalCount: number;
    };
    // Legacy badges (kept for backward compatibility)
    badges: {
      unlocked: Array<{ id: string; name: string; icon: string; unlockedAt: string }>;
      locked: Array<{ id: string; name: string; icon: string; requirement: string }>;
      recentUnlocks: Array<{ id: string; name: string; icon: string }>;
      unlockedCount: number;
      totalCount: number;
    };
    challenges: {
      daily: Challenge[];
      weekly: Challenge[];
      dailyProgress: { completed: number; total: number };
      weeklyProgress: { completed: number; total: number };
    };
    goals: {
      active: Goal[];
      completed: Goal[];
      overallProgress: number;
    };
    recordWorkoutCompleted: (workoutHour?: number, modalidade?: string) => Promise<void>;
    recordDietFollowed: () => Promise<void>;
    completeDailyChallenge: (challengeId: string) => void;
    completeWeeklyChallenge: (challengeId: string) => void;
  };

  // Mobile UI State
  mobileUI: MobileUIState;
  setMobileChatDrawerOpen: (open: boolean) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setEditingExercise: (edit: { treinoId: string; exerciseIndex: number } | null) => void;
  setActiveTab: (tab: TabId) => void;
}

// Create context with undefined default (will be provided by provider)
const FitnessContext = createContext<FitnessContextValue | undefined>(undefined);

// Provider props
interface FitnessProviderProps {
  children: ReactNode;
  userName?: string;
}

/**
 * FitnessProvider
 *
 * Provides fitness state and actions to all child components.
 */
export function FitnessProvider({ children, userName }: FitnessProviderProps) {
  // Selected modality state
  const [selectedModality, setSelectedModality] = useState<TrainingModality>('');

  // Mobile UI state
  const [mobileUI, setMobileUI] = useState<MobileUIState>({
    isChatDrawerOpen: false,
    isMoreMenuOpen: false,
    editingExercise: null,
    activeTab: 'visao-geral',
  });

  const setMobileChatDrawerOpen = useCallback((open: boolean) => {
    setMobileUI((prev) => ({ ...prev, isChatDrawerOpen: open }));
  }, []);

  const setMoreMenuOpen = useCallback((open: boolean) => {
    setMobileUI((prev) => ({ ...prev, isMoreMenuOpen: open }));
  }, []);

  const setEditingExercise = useCallback(
    (edit: { treinoId: string; exerciseIndex: number } | null) => {
      setMobileUI((prev) => ({ ...prev, editingExercise: edit }));
    },
    []
  );

  const setActiveTab = useCallback((tab: TabId) => {
    setMobileUI((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  // Data state management from custom hook
  const {
    personalInfo,
    treinos,
    dieta,
    updatePersonalInfo,
    addTreino,
    updateDieta,
    setTreinos,
  } = useFitnessData(userName);

  // Conversation flow management from custom hook
  const {
    messages,
    inputMessage,
    isGenerating,
    setInputMessage,
    handleSendMessage,
  } = usePersonalInfoFlow({
    personalInfo,
    treinos,
    dieta,
    onUpdatePersonalInfo: updatePersonalInfo,
    onAddTreino: addTreino,
    onSetTreinos: setTreinos,
    onUpdateDieta: updateDieta,
  });

  // Gamification system
  const gamificationData = useGamification({
    diasTreinoSemana: personalInfo.diasTreinoSemana || 3,
    objetivo: personalInfo.objetivo || '',
    enabled: true,
  });

  // Memoize context value to prevent unnecessary re-renders
  const value: FitnessContextValue = {
    // Personal Info
    personalInfo,
    updatePersonalInfo,

    // Workouts
    treinos,
    setTreinos,
    addTreino,

    // Diet
    dieta,
    updateDieta,

    // Modality
    selectedModality,
    setSelectedModality,

    // Chat
    messages,
    inputMessage,
    isGenerating,
    setInputMessage,
    handleSendMessage,

    // Gamification
    gamification: {
      isLoading: gamificationData.isLoading,
      isSaving: gamificationData.isSaving,
      error: gamificationData.error,
      streak: gamificationData.streak,
      xp: gamificationData.xp,
      trophies: gamificationData.trophies,
      uniqueBadges: gamificationData.uniqueBadges,
      badges: gamificationData.badges,
      challenges: gamificationData.challenges,
      goals: gamificationData.goals,
      recordWorkoutCompleted: gamificationData.recordWorkoutCompleted,
      recordDietFollowed: gamificationData.recordDietFollowed,
      completeDailyChallenge: gamificationData.completeDailyChallenge,
      completeWeeklyChallenge: gamificationData.completeWeeklyChallenge,
    },

    // Mobile UI
    mobileUI,
    setMobileChatDrawerOpen,
    setMoreMenuOpen,
    setEditingExercise,
    setActiveTab,
  };

  return (
    <FitnessContext.Provider value={value}>
      {children}
    </FitnessContext.Provider>
  );
}

/**
 * useFitnessContext
 *
 * Hook to access fitness context. Throws if used outside provider.
 */
export function useFitnessContext(): FitnessContextValue {
  const context = useContext(FitnessContext);

  if (context === undefined) {
    throw new Error('useFitnessContext must be used within a FitnessProvider');
  }

  return context;
}

// Export context for advanced use cases
export { FitnessContext };
