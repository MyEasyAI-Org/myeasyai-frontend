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
import { ACTIVITY_TYPES } from '../../constants';
import { useCRMTheme } from '../../contexts/ThemeContext';

interface CRMDashboardProps {
  onNavigate: (view: 'contacts' | 'companies' | 'deals' | 'tasks' | 'activities') => void;
}

export function CRMDashboard({ onNavigate }: CRMDashboardProps) {
  const { metrics, isLoading: loadingMetrics } = useDealMetrics();
  const { pending: pendingTasks, overdue: overdueTasks, isLoading: loadingTasks } = useTaskCounts();
  const { activities, isLoading: loadingActivities } = useRecentActivities(5);
  const { totalCount: contactsCount, isLoading: loadingContacts } = useContacts();
  const { totalCount: companiesCount, isLoading: loadingCompanies } = useCompanies();
  const { isDark } = useCRMTheme();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Visao Geral
        </h2>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Resumo das suas vendas e contatos
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total em Vendas */}
        <div className={`rounded-xl border p-6 ${
          isDark
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              <ArrowUpRight className="w-4 h-4" />
              Vendas
            </span>
          </div>
          {loadingMetrics ? (
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          ) : (
            <>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics?.total_value || 0)}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Valor total em aberto
              </p>
            </>
          )}
        </div>

        {/* Negocios em Andamento */}
        <button
          type="button"
          onClick={() => onNavigate('deals')}
          className={`rounded-xl border p-6 text-left transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Target className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
          {loadingMetrics ? (
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          ) : (
            <>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.open_deals || 0}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Negocios em andamento
              </p>
            </>
          )}
        </button>

        {/* Contatos */}
        <button
          type="button"
          onClick={() => onNavigate('contacts')}
          className={`rounded-xl border p-6 text-left transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <Users className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
          {loadingContacts ? (
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          ) : (
            <>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {contactsCount}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Contatos
              </p>
            </>
          )}
        </button>

        {/* Empresas */}
        <button
          type="button"
          onClick={() => onNavigate('companies')}
          className={`rounded-xl border p-6 text-left transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-orange-500/20' : 'bg-orange-100'
            }`}>
              <Building2 className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
          {loadingCompanies ? (
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          ) : (
            <>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {companiesCount}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Empresas
              </p>
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Stats */}
        <div className={`rounded-xl border p-6 ${
          isDark
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Performance Mensal
          </h3>
          {loadingMetrics ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Vendas Fechadas
                    </p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {metrics?.won_this_month || 0}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(metrics?.revenue_this_month || 0)}
                </p>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-red-500/10' : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <ArrowDownRight className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Nao Fecharam
                    </p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {metrics?.lost_this_month || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Previsao de Vendas
                    </p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Negocios em aberto
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatCurrency(metrics?.weighted_value || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Overview */}
        <div className={`rounded-xl border p-6 ${
          isDark
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tarefas
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className={`text-sm font-medium ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Ver todas
            </button>
          </div>
          {loadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-yellow-500/10 hover:bg-yellow-500/20'
                    : 'bg-yellow-50 hover:bg-yellow-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
                  }`}>
                    <CheckSquare className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Pendentes
                    </p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {pendingTasks} tarefas
                    </p>
                  </div>
                </div>
                <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              </button>

              {overdueTasks > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('tasks')}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-red-500/10 hover:bg-red-500/20'
                      : 'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Atrasadas
                      </p>
                      <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {overdueTasks} tarefas
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`rounded-xl border p-6 ${
        isDark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Historico Recente
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('activities')}
            className={`text-sm font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            Ver todas
          </button>
        </div>
        {loadingActivities ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
              Nenhuma atividade recente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const typeInfo = ACTIVITY_TYPES[activity.type];

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDark
                        ? typeInfo?.bgColor?.replace('100', '500/20') || 'bg-slate-700'
                        : typeInfo?.bgColor || 'bg-gray-100'
                    }`}
                  >
                    <Activity className={`w-4 h-4 ${
                      isDark
                        ? typeInfo?.color?.replace('600', '400') || 'text-slate-400'
                        : typeInfo?.color || 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {typeInfo?.label || activity.type}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {activity.description}
                    </p>
                  </div>
                  <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
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
