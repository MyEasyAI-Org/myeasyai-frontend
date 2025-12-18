// =============================================
// MyEasyCRM - Deal Card Component (Kanban)
// =============================================

import { useState } from 'react';
import {
  User,
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import type { Deal, DealStage } from '../../types';
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters';
import { DEAL_STAGES, DEAL_STAGES_LIST } from '../../constants';

interface DealCardProps {
  deal: Deal;
  onView?: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
  onMoveToStage?: (deal: Deal, stage: DealStage) => void;
  isDragging?: boolean;
}

export function DealCard({
  deal,
  onView,
  onEdit,
  onDelete,
  onMoveToStage,
  isDragging = false,
}: DealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const currentStageIndex = DEAL_STAGES_LIST.findIndex((s) => s.value === deal.stage);
  const availableStages = DEAL_STAGES_LIST.filter((_, index) => index !== currentStageIndex);

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4 cursor-pointer
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50 shadow-lg rotate-2' : ''}
      `}
      onClick={() => onView?.(deal)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
          {deal.title}
        </h4>
        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
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
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                {onView && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onView(deal);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalhes
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(deal);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {onMoveToStage && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMoveMenu(!showMoveMenu)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Mover para...
                    </button>
                    {showMoveMenu && (
                      <div className="absolute left-full top-0 ml-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        {availableStages.map((stage) => (
                          <button
                            key={stage.value}
                            onClick={() => {
                              setShowMenu(false);
                              setShowMoveMenu(false);
                              onMoveToStage(deal, stage.value);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            {stage.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(deal);
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

      {/* Value */}
      <p className="text-lg font-semibold text-gray-900 mb-3">
        {formatCurrency(deal.value)}
      </p>

      {/* Contact/Company */}
      <div className="space-y-2 mb-3">
        {deal.contact && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
              {getInitials(deal.contact.name)}
            </div>
            <span className="truncate">{deal.contact.name}</span>
          </div>
        )}
        {deal.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="truncate">{deal.company.name}</span>
          </div>
        )}
      </div>

      {/* Expected Close Date */}
      {deal.expected_close_date && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Previsão: {formatDate(deal.expected_close_date)}</span>
        </div>
      )}

      {/* Probability Badge */}
      {deal.probability !== undefined && deal.probability !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Probabilidade</span>
            <span className="font-medium text-gray-700">{deal.probability}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
