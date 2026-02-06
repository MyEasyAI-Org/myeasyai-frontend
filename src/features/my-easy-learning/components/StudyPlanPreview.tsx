import { Check, BookOpen, Clock, Target, Save } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { GeneratedStudyPlan } from '../types';
import { RESOURCE_TYPE_LABELS } from '../constants';

interface StudyPlanPreviewProps {
  plan: GeneratedStudyPlan | null;
  onSavePlan?: () => void;
  isSaving?: boolean;
  onTaskComplete?: (studyHour?: number, skillCategory?: string) => Promise<void>;
}

export function StudyPlanPreview({ plan, onSavePlan, isSaving = false, onTaskComplete }: StudyPlanPreviewProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskToggle = useCallback(async (taskId: string) => {
    if (completedTasks.has(taskId)) {
      // Uncheck - just remove from local state (no XP penalty)
      setCompletedTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } else {
      // Check - add to local state and award XP
      setCompletedTasks((prev) => new Set(prev).add(taskId));
      if (onTaskComplete) {
        const currentHour = new Date().getHours();
        await onTaskComplete(currentHour);
      }
    }
  }, [completedTasks, onTaskComplete]);

  if (!plan) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 p-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-400">
            Seu plano de estudos aparecerá aqui
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Complete a conversa para gerar seu plano personalizado
          </p>
        </div>
      </div>
    );
  }

  const { plan_summary, weeks, milestones } = plan;

  return (
    <div className="h-full overflow-y-auto bg-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Seu Plano de Estudos</h1>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{plan_summary.total_weeks} semanas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{plan_summary.total_hours}h totais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{plan_summary.estimated_completion}</span>
                </div>
              </div>
            </div>
            {onSavePlan && (
              <button
                type="button"
                onClick={onSavePlan}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Plano'}
              </button>
            )}
          </div>
        </div>

        {/* Main Topics */}
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="font-semibold text-white">Principais Tópicos</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {plan_summary.main_topics.map((topic, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Weeks */}
        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week.id} className="rounded-lg bg-slate-800 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{week.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{week.focus}</p>
                </div>
                <span className="text-sm text-slate-500">{week.estimated_hours}h</span>
              </div>

              {/* Tasks */}
              <div className="mt-4 space-y-2">
                {week.tasks.map((task) => {
                  const resourceLabel = RESOURCE_TYPE_LABELS[task.resource_type];
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                        completedTasks.has(task.id) || task.is_completed
                          ? 'bg-green-900/20 border border-green-500/30'
                          : 'bg-slate-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={completedTasks.has(task.id) || task.is_completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${
                          completedTasks.has(task.id) || task.is_completed
                            ? 'text-slate-400 line-through'
                            : 'text-white'
                        }`}>{task.description}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span className={resourceLabel.color}>
                            {resourceLabel.icon} {resourceLabel.label}
                          </span>
                          <span>•</span>
                          <span>{task.estimated_minutes} min</span>
                        </div>
                        {task.resource_url && (
                          <a
                            href={task.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-blue-400 hover:underline"
                          >
                            {task.resource_title}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone for this week */}
              {milestones
                .filter((m) => m.week_number === week.week_number)
                .map((milestone) => (
                  <div
                    key={milestone.id}
                    className="mt-4 rounded-lg border-2 border-purple-500/50 bg-purple-500/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-400" />
                      <h4 className="font-semibold text-purple-300">{milestone.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{milestone.description}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Entregável: {milestone.deliverable}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
