// =============================================
// MyEasyCRM - Task List Component
// =============================================

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckSquare,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task, TaskFilters, TaskType, TaskPriority } from '../../types';
import { TASK_TYPES_LIST, TASK_PRIORITIES_LIST } from '../../constants';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onUncompleteTask: (task: Task) => void;
}

type ViewFilter = 'all' | 'pending' | 'overdue' | 'completed';

export function TaskList({
  tasks,
  isLoading,
  error,
  totalCount,
  filters,
  onFiltersChange,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onUncompleteTask,
}: TaskListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchTerm || undefined });
  };

  const handleViewFilterChange = (view: ViewFilter) => {
    setViewFilter(view);
    const newFilters: TaskFilters = { ...filters };

    delete newFilters.completed;
    delete newFilters.overdue;

    switch (view) {
      case 'pending':
        newFilters.completed = false;
        break;
      case 'completed':
        newFilters.completed = true;
        break;
      case 'overdue':
        newFilters.overdue = true;
        break;
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setViewFilter('all');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.type || filters.priority || filters.completed !== undefined || filters.overdue;

  // Stats
  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = tasks.filter((t) => !t.completed && new Date(t.due_date) < new Date());
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tarefas</h2>
          <p className="text-gray-500 mt-1">
            {totalCount} {totalCount === 1 ? 'tarefa' : 'tarefas'}
          </p>
        </div>
        <button
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleViewFilterChange('all')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${viewFilter === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <CheckSquare className={`w-5 h-5 mb-2 ${viewFilter === 'all' ? 'text-blue-600' : 'text-gray-400'}`} />
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          <p className="text-sm text-gray-500">Todas</p>
        </button>

        <button
          onClick={() => handleViewFilterChange('pending')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${viewFilter === 'pending'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <Calendar className={`w-5 h-5 mb-2 ${viewFilter === 'pending' ? 'text-blue-600' : 'text-yellow-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </button>

        <button
          onClick={() => handleViewFilterChange('overdue')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${viewFilter === 'overdue'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <AlertTriangle className={`w-5 h-5 mb-2 ${viewFilter === 'overdue' ? 'text-red-600' : 'text-red-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
          <p className="text-sm text-gray-500">Atrasadas</p>
        </button>

        <button
          onClick={() => handleViewFilterChange('completed')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${viewFilter === 'completed'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <CheckSquare className={`w-5 h-5 mb-2 ${viewFilter === 'completed' ? 'text-green-600' : 'text-green-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
          <p className="text-sm text-gray-500">Concluídas</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-colors
              ${showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Filter className="w-5 h-5" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as TaskType || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todos os tipos</option>
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
                  value={filters.priority || ''}
                  onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as TaskPriority || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todas as prioridades</option>
                  {TASK_PRIORITIES_LIST.map((priority) => (
                    <option key={priority.key} value={priority.key}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando sua primeira tarefa'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Tarefa
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onCompleteTask}
              onUncomplete={onUncompleteTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
