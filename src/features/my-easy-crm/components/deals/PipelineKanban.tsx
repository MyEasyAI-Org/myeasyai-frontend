// =============================================
// MyEasyCRM - Pipeline Kanban Component
// =============================================

import { useState } from 'react';
import { Plus, Loader2, AlertCircle, Target } from 'lucide-react';
import { DealCard } from './DealCard';
import type { Pipeline, Deal, DealStage } from '../../types';
import { DEAL_STAGES, OPEN_DEAL_STAGES } from '../../constants';
import { formatCurrency } from '../../utils/formatters';

interface PipelineKanbanProps {
  pipeline: Pipeline | null;
  isLoading: boolean;
  error?: string | null;
  onCreateDeal: (stage?: DealStage) => void;
  onViewDeal: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onMoveDealToStage: (deal: Deal, stage: DealStage, lostReason?: string) => void;
}

export function PipelineKanban({
  pipeline,
  isLoading,
  error,
  onCreateDeal,
  onViewDeal,
  onEditDeal,
  onDeleteDeal,
  onMoveDealToStage,
}: PipelineKanbanProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stage) {
      onMoveDealToStage(draggedDeal, stage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
          <p className="text-gray-500 mt-1">
            {pipeline?.total_deals || 0} negócios · {formatCurrency(pipeline?.total_value || 0)} em valor total
          </p>
        </div>
        <button
          onClick={() => onCreateDeal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Negócio
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
        {OPEN_DEAL_STAGES.map((stageKey) => {
          const stageInfo = DEAL_STAGES[stageKey];
          const column = pipeline?.columns.find(c => c.id === stageKey);
          const stageDeals = column?.deals || [];
          const stageValue = column?.total_value || 0;
          const isDropTarget = dragOverStage === stageKey && draggedDeal?.stage !== stageKey;

          return (
            <div
              key={stageKey}
              className="flex-shrink-0 w-80"
              onDragOver={(e) => handleDragOver(e, stageKey)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stageKey)}
            >
              {/* Column Header */}
              <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${stageInfo.color}`}
                    />
                    <h3 className="font-semibold text-gray-900">{stageInfo.label}</h3>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {formatCurrency(stageValue)}
                </p>
              </div>

              {/* Column Content */}
              <div
                className={`
                  bg-gray-50 rounded-b-xl border border-gray-200 border-t-0 p-3
                  min-h-[200px] max-h-[calc(100%-88px)] overflow-y-auto
                  transition-colors
                  ${isDropTarget ? 'bg-blue-50 border-blue-300' : ''}
                `}
              >
                {stageDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Nenhum negócio nesta etapa</p>
                    <button
                      onClick={() => onCreateDeal(stageKey)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Adicionar negócio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                      >
                        <DealCard
                          deal={deal}
                          onView={onViewDeal}
                          onEdit={onEditDeal}
                          onDelete={onDeleteDeal}
                          onMoveToStage={onMoveDealToStage}
                          isDragging={draggedDeal?.id === deal.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
