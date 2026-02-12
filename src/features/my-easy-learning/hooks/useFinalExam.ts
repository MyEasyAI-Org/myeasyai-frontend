/**
 * useFinalExam Hook
 *
 * Manages final exam state, certificate eligibility, and diploma issuance.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { finalExamGenerationService } from '../services/FinalExamGenerationService';
import { certificateEligibilityService } from '../services/CertificateEligibilityService';
import { exportCertificatePdf } from '../utils/certificatePdf';
import type { EnhancedGeneratedStudyPlan } from '../services/StudyPlanGenerationService';
import type { StudyPlanProfile } from '../types';
import type { GeneratedLesson, LessonTopic } from '../types/lesson';
import type {
  CertificateLevel,
  CertificateEligibility,
  FinalExam,
  FinalExamAttempt,
  FinalExamQuestion,
  CourseDiploma,
} from '../types/courseCompletion';
import {
  toCertificateLevel,
  generateDiplomaId,
  FINAL_EXAM_XP_REWARDS,
} from '../types/courseCompletion';

interface UseFinalExamProps {
  plan: EnhancedGeneratedStudyPlan | null;
  profile: StudyPlanProfile | null;
  generatedLessons: Map<string, GeneratedLesson>;
  onXpEarned: (amount: number, reason: string) => void;
  onDiplomaIssued?: (diploma: CourseDiploma) => void;
  onExamUpdated?: (exam: FinalExam) => void;
  existingExam?: FinalExam | null;
  existingDiploma?: CourseDiploma | null;
  userName?: string;
}

interface UseFinalExamReturn {
  // State
  certificateLevel: CertificateLevel;
  eligibility: CertificateEligibility;
  finalExam: FinalExam | null;
  diploma: CourseDiploma | null;
  isGeneratingExam: boolean;
  isExamActive: boolean;
  examQuestions: FinalExamQuestion[];
  canRetake: { canRetake: boolean; waitUntil: string | null };

  // Actions
  generateExam: () => Promise<void>;
  startExam: () => void;
  cancelExam: () => void;
  submitExamAttempt: (attempt: FinalExamAttempt) => void;
  issueDiploma: () => CourseDiploma | null;
  downloadPdf: () => Promise<void>;
}

export function useFinalExam({
  plan,
  profile,
  generatedLessons,
  onXpEarned,
  onDiplomaIssued,
  onExamUpdated,
  existingExam,
  existingDiploma,
  userName,
}: UseFinalExamProps): UseFinalExamReturn {
  const [finalExam, setFinalExam] = useState<FinalExam | null>(existingExam || null);
  const [diploma, setDiploma] = useState<CourseDiploma | null>(existingDiploma || null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<FinalExamQuestion[]>([]);

  // Sync when existingExam/existingDiploma props change (e.g. dev mock loaded)
  useEffect(() => {
    if (existingExam !== undefined) setFinalExam(existingExam);
  }, [existingExam]);

  useEffect(() => {
    if (existingDiploma !== undefined) setDiploma(existingDiploma);
  }, [existingDiploma]);

  const certificateLevel = useMemo(() => {
    return toCertificateLevel(profile?.target_level || 'basic');
  }, [profile?.target_level]);

  const eligibility = useMemo(() => {
    if (!plan) {
      return {
        isEligible: false,
        reasons: ['Nenhum plano de estudos carregado'],
        progress: {
          lessonsCompleted: 0,
          totalLessons: 0,
          exercisesCompleted: 0,
          totalExercises: 0,
          quizzesPassed: 0,
          totalQuizzes: 0,
          allWeeksCompleted: false,
          finalExamPassed: false,
          minimumExercisesMet: false,
        },
      };
    }
    return certificateEligibilityService.checkEligibility(
      plan,
      generatedLessons,
      certificateLevel,
      finalExam
    );
  }, [plan, generatedLessons, certificateLevel, finalExam]);

  const canRetake = useMemo(() => {
    if (!finalExam) return { canRetake: true, waitUntil: null };
    return certificateEligibilityService.canRetakeExam(finalExam);
  }, [finalExam]);

  const generateExam = useCallback(async () => {
    if (!profile || !plan) return;

    setIsGeneratingExam(true);
    try {
      // Collect all lesson topics from the plan
      const allTopics: LessonTopic[] = plan.weeks.flatMap((w) => w.lessonTopics);

      const exam = await finalExamGenerationService.generateFinalExam(
        profile,
        allTopics,
        certificateLevel
      );

      setFinalExam(exam);
      onExamUpdated?.(exam);
    } catch (error) {
      console.error('Erro ao gerar prova final:', error);
    } finally {
      setIsGeneratingExam(false);
    }
  }, [profile, plan, certificateLevel, onExamUpdated]);

  const startExam = useCallback(() => {
    if (!finalExam) return;

    const questions = finalExamGenerationService.selectQuestionsForAttempt(
      finalExam,
      finalExam.attempts.length + 1
    );

    setExamQuestions(questions);
    setIsExamActive(true);
  }, [finalExam]);

  const cancelExam = useCallback(() => {
    setIsExamActive(false);
    setExamQuestions([]);
  }, []);

  const submitExamAttempt = useCallback(
    (attempt: FinalExamAttempt) => {
      if (!finalExam) return;

      const updatedExam: FinalExam = {
        ...finalExam,
        attempts: [...finalExam.attempts, attempt],
        bestScore: Math.max(finalExam.bestScore || 0, attempt.score),
        isPassed: finalExam.isPassed || attempt.passed,
        passedAt: attempt.passed ? attempt.completedAt : finalExam.passedAt,
        lastAttemptAt: attempt.completedAt,
      };

      setFinalExam(updatedExam);
      setIsExamActive(false);
      setExamQuestions([]);
      onExamUpdated?.(updatedExam);

      // Award XP if passed
      if (attempt.passed && !finalExam.isPassed) {
        const xpReward = FINAL_EXAM_XP_REWARDS[certificateLevel];
        onXpEarned(xpReward, `Prova final aprovada! (Nivel ${certificateLevel})`);
      }
    },
    [finalExam, certificateLevel, onXpEarned, onExamUpdated]
  );

  const issueDiploma = useCallback(() => {
    if (!profile || !plan || !finalExam?.isPassed) return null;

    const newDiploma: CourseDiploma = {
      id: generateDiplomaId(),
      planId: plan.id,
      userId: profile.user_id,
      studentName: userName || profile.plan_name || 'Aluno',
      skillName: profile.skill_name,
      skillCategory: profile.skill_category,
      certificateLevel,
      finalExamScore: finalExam.bestScore || 0,
      totalHoursStudied: plan.plan_summary.total_hours,
      lessonsCompleted: eligibility.progress.lessonsCompleted,
      exercisesCompleted: eligibility.progress.exercisesCompleted,
      issuedAt: new Date().toISOString(),
      legalDisclaimerAcknowledged: true,
    };

    setDiploma(newDiploma);
    onDiplomaIssued?.(newDiploma);
    return newDiploma;
  }, [profile, plan, finalExam, certificateLevel, eligibility, userName, onDiplomaIssued]);

  const downloadPdf = useCallback(async () => {
    if (!diploma) return;
    await exportCertificatePdf(diploma);
  }, [diploma]);

  return {
    certificateLevel,
    eligibility,
    finalExam,
    diploma,
    isGeneratingExam,
    isExamActive,
    examQuestions,
    canRetake,
    generateExam,
    startExam,
    cancelExam,
    submitExamAttempt,
    issueDiploma,
    downloadPdf,
  };
}
