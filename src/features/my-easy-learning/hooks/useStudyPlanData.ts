import { useState, useCallback } from 'react';
import type {
  StudyPlanProfile,
  GeneratedStudyPlan,
  StudyProgress,
  ConversationStep,
  ChatMessage,
  StudyPlanData,
} from '../types';
import { DEFAULT_STUDY_PLAN_DATA } from '../constants';

/**
 * Hook for managing study plan data state
 * Similar to useResumeData but for learning plans
 */
export function useStudyPlanData() {
  const [data, setData] = useState<StudyPlanData>(DEFAULT_STUDY_PLAN_DATA);

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  const setProfile = useCallback((profile: StudyPlanProfile | null) => {
    setData((prev) => ({ ...prev, profile }));
  }, []);

  const updateProfile = useCallback((updates: Partial<StudyPlanProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
    }));
  }, []);

  // ============================================================================
  // GENERATED PLAN MANAGEMENT
  // ============================================================================

  const setGeneratedPlan = useCallback((plan: GeneratedStudyPlan | null) => {
    setData((prev) => ({ ...prev, generatedPlan: plan }));
  }, []);

  const updateGeneratedPlan = useCallback((updates: Partial<GeneratedStudyPlan>) => {
    setData((prev) => ({
      ...prev,
      generatedPlan: prev.generatedPlan ? { ...prev.generatedPlan, ...updates } : null,
    }));
  }, []);

  // ============================================================================
  // PROGRESS MANAGEMENT
  // ============================================================================

  const setProgress = useCallback((progress: StudyProgress | null) => {
    setData((prev) => ({ ...prev, progress }));
  }, []);

  const updateProgress = useCallback((updates: Partial<StudyProgress>) => {
    setData((prev) => ({
      ...prev,
      progress: prev.progress ? { ...prev.progress, ...updates } : null,
    }));
  }, []);

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  const setCurrentStep = useCallback((step: ConversationStep) => {
    setData((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setData((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setData((prev) => ({
      ...prev,
      conversationHistory: [],
    }));
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================

  const reset = useCallback(() => {
    setData(DEFAULT_STUDY_PLAN_DATA);
  }, []);

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // State
    data,

    // Profile actions
    setProfile,
    updateProfile,

    // Plan actions
    setGeneratedPlan,
    updateGeneratedPlan,

    // Progress actions
    setProgress,
    updateProgress,

    // Conversation actions
    setCurrentStep,
    addMessage,
    clearMessages,

    // Utilities
    reset,
  };
}
