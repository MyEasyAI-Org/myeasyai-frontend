// =============================================
// MyEasyCRM - Task Card Component
// =============================================

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';
import type { Task } from '../../types';
import { formatDate, getInitials } from '../../utils/formatters';
import { TASK_TYPES, TASK_PRIORITIES } from '../../constants';

interface TaskCardProps {
  task: Task;
  onComplete?: (task: Task) => void;
  onUncomplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const typeInfo = TASK_TYPES[task.type];
  const priorityInfo = TASK_PRIORITIES[task.priority];
  const isOverdue = !task.completed && new Date(task.due_date) < new Date();
  const Icon = Circle; // Icon é uma string no TASK_TYPES, usamos Circle como fallback

  const handleToggle = () => {
    if (task.completed) {
      onUncomplete?.(task);
    } else {
      onComplete?.(task);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl border p-4 transition-all
        ${task.completed
          ? 'border-gray-100 bg-gray-50/50'
          : isOverdue
            ? 'border-red-200 bg-red-50/30'
            : 'border-gray-200 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 mt-0.5 transition-colors
            ${task.completed
              ? 'text-green-500'
              : 'text-gray-400 hover:text-gray-600'
            }
          `}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`
                font-medium
                ${task.completed
                  ? 'text-gray-400 line-through'
                  : 'text-gray-900'
                }
              `}
            >
              {task.title}
            </h4>

            {/* Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                    {onEdit && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(task);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDelete(task);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className={`
                text-sm mt-1 line-clamp-2
                ${task.completed ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Type */}
            <div className={`flex items-center gap-1.5 text-sm ${typeInfo?.color || 'text-gray-500'}`}>
              <Icon className="w-4 h-4" />
              <span>{typeInfo?.label || task.type}</span>
            </div>

            {/* Priority */}
            {priorityInfo && (
              <span
                className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${priorityInfo.bgColor} ${priorityInfo.color}
                `}
              >
                {priorityInfo.label}
              </span>
            )}

            {/* Due Date */}
            <div
              className={`
                flex items-center gap-1.5 text-sm
                ${isOverdue && !task.completed ? 'text-red-600' : 'text-gray-500'}
              `}
            >
              {isOverdue && !task.completed ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>{formatDate(task.due_date)}</span>
            </div>
          </div>

          {/* Related */}
          {(task.contact || task.deal) && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {task.contact && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px]">
                    {getInitials(task.contact.name)}
                  </div>
                  <span className="truncate max-w-[120px]">{task.contact.name}</span>
                </div>
              )}
              {task.deal && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{task.deal.title}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
