// =============================================
// MyEasyCRM - Dashboard Component
// =============================================

import {
  Users,
  Building2,
  Target,
  DollarSign,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useDealMetrics, useTaskCounts, useRecentActivities, useContacts, useCompanies } from '../../hooks';
import { ACTIVITY_TYPES, DEAL_STAGES } from '../../constants';

interface CRMDashboardProps {
  onNavigate: (view: 'contacts' | 'companies' | 'deals' | 'tasks' | 'activities') => void;
}

export function CRMDashboard({ onNavigate }: CRMDashboardProps) {
  const { metrics, isLoading: loadingMetrics } = useDealMetrics();
  const { pending: pendingTasks, overdue: overdueTasks, isLoading: loadingTasks } = useTaskCounts();
  const { activities, isLoading: loadingActivities } = useRecentActivities(5);
  const { totalCount: contactsCount, isLoading: loadingContacts } = useContacts();
  const { totalCount: companiesCount, isLoading: loadingCompanies } = useCompanies();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-500 mt-1">
          Resumo das suas vendas e contatos
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total em Vendas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              Vendas
            </span>
          </div>
          {loadingMetrics ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics?.total_value || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Valor total em aberto
              </p>
            </>
          )}
        </div>

        {/* Negócios em Andamento */}
        <button
          onClick={() => onNavigate('deals')}
          className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
          {loadingMetrics ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.open_deals || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Negócios em andamento
              </p>
            </>
          )}
        </button>

        {/* Contatos */}
        <button
          onClick={() => onNavigate('contacts')}
          className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
          {loadingContacts ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{contactsCount}</p>
              <p className="text-sm text-gray-500 mt-1">Contatos</p>
            </>
          )}
        </button>

        {/* Empresas */}
        <button
          onClick={() => onNavigate('companies')}
          className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
          {loadingCompanies ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{companiesCount}</p>
              <p className="text-sm text-gray-500 mt-1">Empresas</p>
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Mensal</h3>
          {loadingMetrics ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendas Fechadas</p>
                    <p className="font-semibold text-gray-900">{metrics?.won_this_month || 0}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(metrics?.revenue_this_month || 0)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Não Fecharam</p>
                    <p className="font-semibold text-gray-900">{metrics?.lost_this_month || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Previsão de Vendas</p>
                    <p className="font-semibold text-gray-900">Negócios em aberto</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(metrics?.weighted_value || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tarefas</h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas
            </button>
          </div>
          {loadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="font-semibold text-gray-900">{pendingTasks} tarefas</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </button>

              {overdueTasks > 0 && (
                <button
                  onClick={() => onNavigate('tasks')}
                  className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Atrasadas</p>
                      <p className="font-semibold text-red-600">{overdueTasks} tarefas</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Histórico Recente</h3>
          <button
            onClick={() => onNavigate('activities')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas
          </button>
        </div>
        {loadingActivities ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const typeInfo = ACTIVITY_TYPES[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo?.bgColor || 'bg-gray-100'}`}
                  >
                    <Activity className={`w-4 h-4 ${typeInfo?.color || 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {typeInfo?.label || activity.type}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
