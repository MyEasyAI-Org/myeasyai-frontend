// =============================================
// MyEasyCRM - Task Form Component
// =============================================

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Task, TaskFormData } from '../../types';
import { TASK_TYPES_LIST, TASK_PRIORITIES_LIST } from '../../constants';
import { useCompaniesSelect } from '../../hooks';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  type: 'other',
  priority: 'medium',
  due_date: new Date().toISOString().split('T')[0],
  contact_id: '',
  deal_id: '',
};

export function TaskForm({
  task,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        due_date: new Date(task.due_date).toISOString().split('T')[0],
        contact_id: task.contact_id || '',
        deal_id: task.deal_id || '',
      });
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        ...emptyForm,
        due_date: tomorrow.toISOString().split('T')[0],
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      contact_id: formData.contact_id || undefined,
      deal_id: formData.deal_id || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                  placeholder="Ex: Ligar para cliente"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 resize-none"
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              {/* Tipo e Prioridade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskFormData['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                  >
                    {TASK_TYPES_LIST.map((type) => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                  >
                    {TASK_PRIORITIES_LIST.map((priority) => (
                      <option key={priority.key} value={priority.key}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* Quick Date Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setFormData({ ...formData, due_date: today.toISOString().split('T')[0] });
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setFormData({ ...formData, due_date: tomorrow.toISOString().split('T')[0] });
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setFormData({ ...formData, due_date: nextWeek.toISOString().split('T')[0] });
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Próxima semana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setFormData({ ...formData, due_date: nextMonth.toISOString().split('T')[0] });
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Próximo mês
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {task ? 'Salvar' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
