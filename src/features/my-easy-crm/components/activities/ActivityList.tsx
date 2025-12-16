// =============================================
// MyEasyCRM - Activity List Component
// =============================================

import { useState } from 'react';
import {
  Plus,
  Loader2,
  AlertCircle,
  Activity as ActivityIcon,
  PhoneCall,
  Mail,
  Video,
  FileText,
} from 'lucide-react';
import { ActivityItem } from './ActivityItem';
import type { Activity, ActivityType } from '../../types';
import { ACTIVITY_TYPES } from '../../constants';

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  error?: string | null;
  onCreateActivity: (type: ActivityType) => void;
  onDeleteActivity: (activity: Activity) => void;
}

type FilterType = 'all' | ActivityType;

export function ActivityList({
  activities,
  isLoading,
  error,
  onCreateActivity,
  onDeleteActivity,
}: ActivityListProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter((a) => a.type === filterType);

  // Stats
  const stats = {
    call: activities.filter((a) => a.type === 'call').length,
    email: activities.filter((a) => a.type === 'email').length,
    meeting: activities.filter((a) => a.type === 'meeting').length,
    note: activities.filter((a) => a.type === 'note').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Atividades</h2>
          <p className="text-gray-500 mt-1">
            {activities.length} {activities.length === 1 ? 'atividade registrada' : 'atividades registradas'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Registrar Atividade</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCreateActivity('call')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Ligação
          </button>
          <button
            onClick={() => onCreateActivity('email')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => onCreateActivity('meeting')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Video className="w-4 h-4" />
            Reunião
          </button>
          <button
            onClick={() => onCreateActivity('note')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Nota
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${filterType === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <ActivityIcon className={`w-5 h-5 mb-2 ${filterType === 'all' ? 'text-blue-600' : 'text-gray-400'}`} />
          <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
          <p className="text-sm text-gray-500">Todas</p>
        </button>

        <button
          onClick={() => setFilterType('call')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${filterType === 'call'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <PhoneCall className={`w-5 h-5 mb-2 ${filterType === 'call' ? 'text-blue-600' : 'text-green-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{stats.call}</p>
          <p className="text-sm text-gray-500">Ligações</p>
        </button>

        <button
          onClick={() => setFilterType('email')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${filterType === 'email'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <Mail className={`w-5 h-5 mb-2 ${filterType === 'email' ? 'text-blue-600' : 'text-blue-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{stats.email}</p>
          <p className="text-sm text-gray-500">Emails</p>
        </button>

        <button
          onClick={() => setFilterType('meeting')}
          className={`
            p-4 rounded-xl border transition-colors text-left
            ${filterType === 'meeting'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <Video className={`w-5 h-5 mb-2 ${filterType === 'meeting' ? 'text-blue-600' : 'text-purple-500'}`} />
          <p className="text-2xl font-bold text-gray-900">{stats.meeting}</p>
          <p className="text-sm text-gray-500">Reuniões</p>
        </button>
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
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ActivityIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {filterType !== 'all'
              ? 'Não há atividades deste tipo'
              : 'Comece registrando sua primeira atividade'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onDelete={onDeleteActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
