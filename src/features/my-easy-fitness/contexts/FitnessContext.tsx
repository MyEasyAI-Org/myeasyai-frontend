/**
 * FitnessContext
 *
 * Context for sharing fitness data and actions across components.
 * Eliminates prop drilling by providing a centralized state management solution.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserPersonalInfo, Treino, Dieta, FitnessMessage, TrainingModality } from '../types';
import { useFitnessData } from '../hooks/useFitnessData';
import { usePersonalInfoFlow } from '../hooks/useAnamneseFlow';

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
