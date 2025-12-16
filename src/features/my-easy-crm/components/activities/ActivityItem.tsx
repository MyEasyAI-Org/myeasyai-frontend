// =============================================
// MyEasyCRM - Activity Item Component
// =============================================

import { useState } from 'react';
import {
  MoreVertical,
  Trash2,
  User,
  Target,
  MessageSquare,
} from 'lucide-react';
import type { Activity } from '../../types';
import { formatDateTime, getInitials } from '../../utils/formatters';
import { ACTIVITY_TYPES } from '../../constants';

interface ActivityItemProps {
  activity: Activity;
  onDelete?: (activity: Activity) => void;
  showRelated?: boolean;
}

export function ActivityItem({
  activity,
  onDelete,
  showRelated = true,
}: ActivityItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const typeInfo = ACTIVITY_TYPES[activity.type];
  const Icon = MessageSquare; // Icon é uma string no ACTIVITY_TYPES, precisamos usar diretamente

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo?.bgColor || 'bg-gray-100'}`}
      >
        <Icon className={`w-5 h-5 ${typeInfo?.color || 'text-gray-600'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-gray-900">
              {typeInfo?.label || activity.type}
            </p>
            <p className="text-sm text-gray-500">
              {formatDateTime(activity.created_at)}
            </p>
          </div>

          {/* Menu */}
          {onDelete && (
            <div className="relative">
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
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(activity);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
          {activity.description}
        </p>

        {/* Related */}
        {showRelated && (activity.contact || activity.deal) && (
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {activity.contact && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px]">
                  {getInitials(activity.contact.name)}
                </div>
                <span className="truncate max-w-[150px]">{activity.contact.name}</span>
              </div>
            )}
            {activity.deal && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{activity.deal.title}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
