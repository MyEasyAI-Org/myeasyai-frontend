/**
 * Certificate Eligibility Service
 *
 * Checks if user meets all requirements for taking the final exam
 * and issuing a course completion diploma.
 */

import type { EnhancedGeneratedStudyPlan } from './StudyPlanGenerationService';
import type { GeneratedLesson } from '../types/lesson';
import type {
  CertificateLevel,
  CertificateEligibility,
  FinalExam,
} from '../types/courseCompletion';
import { CERTIFICATE_LEVELS } from '../types/courseCompletion';

class CertificateEligibilityServiceClass {
  /**
   * Check if user is eligible to take the final exam / issue certificate
   */
  checkEligibility(
    plan: EnhancedGeneratedStudyPlan,
    generatedLessons: Map<string, GeneratedLesson>,
    certificateLevel: CertificateLevel,
    finalExam: FinalExam | null
  ): CertificateEligibility {
    const levelConfig = CERTIFICATE_LEVELS.find((l) => l.level === certificateLevel);
    if (!levelConfig) {
      return {
        isEligible: false,
        reasons: ['Nivel de certificado invalido'],
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

    // Count totals and completions
    let totalLessons = 0;
    let lessonsCompleted = 0;
    let totalExercises = 0;
    let exercisesCompleted = 0;
    let totalQuizzes = 0;
    let quizzesPassed = 0;

    plan.weeks.forEach((week) => {
      week.lessonTopics.forEach((topic) => {
        totalLessons++;
        const lessonKey = `${week.week_number}-${topic.lessonNumber}`;
        const lesson = generatedLessons.get(lessonKey);

        if (lesson) {
          if (lesson.isCompleted) {
            lessonsCompleted++;
          }

          // Count exercises
          totalExercises += lesson.exercises.length;
          exercisesCompleted += lesson.exercises.filter((e) => e.isCompleted).length;

          // Count quizzes
          if (lesson.quiz) {
            totalQuizzes++;
            if (lesson.quiz.isPassed) {
              quizzesPassed++;
            }
          }
        }
      });
    });

    const allWeeksCompleted = lessonsCompleted === totalLessons && totalLessons > 0;
    const minimumExercisesMet = exercisesCompleted >= levelConfig.minimumExercises;
    const finalExamPassed = finalExam?.isPassed || false;

    // Build reasons for ineligibility
    const reasons: string[] = [];

    if (!allWeeksCompleted) {
      reasons.push(
        `Complete todas as licoes (${lessonsCompleted}/${totalLessons})`
      );
    }

    if (!minimumExercisesMet) {
      reasons.push(
        `Complete pelo menos ${levelConfig.minimumExercises} exercicios (${exercisesCompleted}/${levelConfig.minimumExercises})`
      );
    }

    if (totalQuizzes > 0 && quizzesPassed < totalQuizzes) {
      reasons.push(
        `Passe em todos os quizzes das licoes (${quizzesPassed}/${totalQuizzes})`
      );
    }

    if (!finalExamPassed) {
      reasons.push('Passe na prova final');
    }

    const isEligible = reasons.length === 0;

    return {
      isEligible,
      reasons,
      progress: {
        lessonsCompleted,
        totalLessons,
        exercisesCompleted,
        totalExercises,
        quizzesPassed,
        totalQuizzes,
        allWeeksCompleted,
        finalExamPassed,
        minimumExercisesMet,
      },
    };
  }

  /**
   * Check if user can take/retake the final exam
   * (pre-requisites met but not the exam itself)
   */
  canTakeExam(
    plan: EnhancedGeneratedStudyPlan,
    generatedLessons: Map<string, GeneratedLesson>,
    certificateLevel: CertificateLevel
  ): { canTake: boolean; reasons: string[] } {
    const levelConfig = CERTIFICATE_LEVELS.find((l) => l.level === certificateLevel);
    if (!levelConfig) {
      return { canTake: false, reasons: ['Nivel invalido'] };
    }

    let totalLessons = 0;
    let lessonsCompleted = 0;
    let exercisesCompleted = 0;
    let totalQuizzes = 0;
    let quizzesPassed = 0;

    plan.weeks.forEach((week) => {
      week.lessonTopics.forEach((topic) => {
        totalLessons++;
        const lessonKey = `${week.week_number}-${topic.lessonNumber}`;
        const lesson = generatedLessons.get(lessonKey);
        if (lesson) {
          if (lesson.isCompleted) lessonsCompleted++;
          exercisesCompleted += lesson.exercises.filter((e) => e.isCompleted).length;
          if (lesson.quiz) {
            totalQuizzes++;
            if (lesson.quiz.isPassed) quizzesPassed++;
          }
        }
      });
    });

    const reasons: string[] = [];
    if (lessonsCompleted < totalLessons) {
      reasons.push(`Complete todas as licoes (${lessonsCompleted}/${totalLessons})`);
    }
    if (exercisesCompleted < levelConfig.minimumExercises) {
      reasons.push(`Complete ${levelConfig.minimumExercises} exercicios (${exercisesCompleted}/${levelConfig.minimumExercises})`);
    }
    if (totalQuizzes > 0 && quizzesPassed < totalQuizzes) {
      reasons.push(`Passe em todos os quizzes (${quizzesPassed}/${totalQuizzes})`);
    }

    return { canTake: reasons.length === 0, reasons };
  }

  /**
   * Check if user can retry the exam (cooldown period)
   */
  canRetakeExam(exam: FinalExam): { canRetake: boolean; waitUntil: string | null } {
    if (!exam.lastAttemptAt) {
      return { canRetake: true, waitUntil: null };
    }

    if (exam.isPassed) {
      return { canRetake: false, waitUntil: null };
    }

    const lastAttempt = new Date(exam.lastAttemptAt);
    const waitHours = exam.config.retryWaitHours;
    const waitUntil = new Date(lastAttempt.getTime() + waitHours * 60 * 60 * 1000);
    const now = new Date();

    if (now < waitUntil) {
      return { canRetake: false, waitUntil: waitUntil.toISOString() };
    }

    return { canRetake: true, waitUntil: null };
  }
}

export const certificateEligibilityService = new CertificateEligibilityServiceClass();
