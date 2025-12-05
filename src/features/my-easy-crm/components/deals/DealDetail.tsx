// =============================================
// MyEasyCRM - Deal Detail Component
// =============================================

import {
  ArrowLeft,
  Building2,
  User,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import type { Deal, DealStage } from '../../types';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '../../utils/formatters';
import { useDealActivities } from '../../hooks';
import { DEAL_STAGES, DEAL_STAGES_LIST, ACTIVITY_TYPES, LEAD_SOURCES } from '../../constants';

interface DealDetailProps {
  deal: Deal | null;
  isLoading: boolean;
  error?: string | null;
  onBack: () => void;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onMoveToStage?: (deal: Deal, stage: DealStage) => void;
}

export function DealDetail({
  deal,
  isLoading,
  error,
  onBack,
  onEdit,
  onDelete,
  onMoveToStage,
}: DealDetailProps) {
  const { activities, isLoading: loadingActivities } = useDealActivities(deal?.id || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error || 'Deal não encontrado'}</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:underline"
        >
          Voltar para o pipeline
        </button>
      </div>
    );
  }

  const stageInfo = DEAL_STAGES[deal.stage];
  const sourceInfo = deal.source ? LEAD_SOURCES[deal.source] : undefined;
  const currentStageIndex = DEAL_STAGES_LIST.findIndex((s) => s.value === deal.stage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
            {stageInfo && (
              <span
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: `${stageInfo.color}20`,
                  color: stageInfo.color,
                }}
              >
                {stageInfo.label}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{formatCurrency(deal.value)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(deal)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(deal)}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Progresso do Deal</h4>
        <div className="flex items-center gap-2">
          {DEAL_STAGES_LIST.map((stage, index) => {
            const isActive = stage.value === deal.stage;
            const isPast = index < currentStageIndex;
            const isClosed = stage.value === 'closed_won' || stage.value === 'closed_lost';

            return (
              <div key={stage.value} className="flex-1 flex items-center">
                <button
                  onClick={() => onMoveToStage?.(deal, stage.value)}
                  className={`
                    flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors text-center
                    ${isActive
                      ? 'text-white'
                      : isPast
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }
                  `}
                  style={isActive ? { backgroundColor: stage.color } : undefined}
                >
                  {stage.label}
                </button>
                {index < DEAL_STAGES_LIST.length - 1 && !isClosed && (
                  <ArrowRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Deal Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Detalhes</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(deal.value)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Probabilidade</p>
                  <p className="font-semibold text-gray-900">{deal.probability || 0}%</p>
                </div>
              </div>

              {deal.expected_close_date && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fechamento Esperado</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(deal.expected_close_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Relacionados</h4>
            <div className="space-y-4">
              {deal.contact && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(deal.contact.name)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contato</p>
                    <p className="font-medium text-gray-900">{deal.contact.name}</p>
                  </div>
                </div>
              )}

              {deal.company && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Empresa</p>
                    <p className="font-medium text-gray-900">{deal.company.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Informações</h4>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Origem</dt>
                <dd className="text-gray-900">{sourceInfo?.label || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Criado em</dt>
                <dd className="text-gray-900">{formatDate(deal.created_at)}</dd>
              </div>
              {deal.notes && (
                <div>
                  <dt className="text-sm text-gray-500">Notas</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap">{deal.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Histórico de Atividades</h4>

            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const typeInfo = ACTIVITY_TYPES[activity.type];

                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo?.bgColor || 'bg-gray-100'}`}
                      >
                        <MessageSquare className={`w-5 h-5 ${typeInfo?.color || 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900">
                            {typeInfo?.label || activity.type}
                          </p>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {formatDateTime(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
