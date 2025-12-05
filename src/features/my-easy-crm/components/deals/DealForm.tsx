// =============================================
// MyEasyCRM - Deal Form Component
// =============================================

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Deal, DealFormData, DealStage, LeadSource } from '../../types';
import { DEAL_STAGES, DEAL_STAGES_LIST, LEAD_SOURCES_LIST } from '../../constants';
import { useCompaniesSelect } from '../../hooks';

interface DealFormProps {
  deal?: Deal | null;
  initialStage?: DealStage;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DealFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyForm: DealFormData = {
  title: '',
  value: 0,
  stage: 'lead',
  probability: 10,
  expected_close_date: '',
  contact_id: '',
  company_id: '',
  source: 'other',
  notes: '',
};

export function DealForm({
  deal,
  initialStage,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: DealFormProps) {
  const [formData, setFormData] = useState<DealFormData>(emptyForm);
  const { options: companies, isLoading: loadingCompanies } = useCompaniesSelect();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability || 0,
        expected_close_date: deal.expected_close_date
          ? new Date(deal.expected_close_date).toISOString().split('T')[0]
          : '',
        contact_id: deal.contact_id || '',
        company_id: deal.company_id || '',
        source: deal.source || 'other',
        notes: deal.notes || '',
      });
    } else {
      setFormData({
        ...emptyForm,
        stage: initialStage || 'lead',
        probability: getProbabilityForStage(initialStage || 'lead'),
      });
    }
  }, [deal, initialStage, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      contact_id: formData.contact_id || undefined,
      company_id: formData.company_id || undefined,
      expected_close_date: formData.expected_close_date || undefined,
    });
  };

  const handleStageChange = (stage: DealStage) => {
    setFormData({
      ...formData,
      stage,
      probability: getProbabilityForStage(stage),
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
              {deal ? 'Editar Deal' : 'Novo Deal'}
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
                  Título do Deal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                  placeholder="Ex: Implementação de CRM para Empresa X"
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Fase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fase *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleStageChange(e.target.value as DealStage)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                >
                  {DEAL_STAGES_LIST.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Probabilidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probabilidade de Fechamento
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {formData.probability}%
                  </span>
                </div>
              </div>

              {/* Data de Fechamento Esperada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fechamento Esperada
                </label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                  disabled={loadingCompanies}
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origem
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                >
                  {LEAD_SOURCES_LIST.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900"
                  placeholder="Observações sobre o deal..."
                />
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
                {deal ? 'Salvar' : 'Criar Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function getProbabilityForStage(stage: DealStage): number {
  const stageInfo = DEAL_STAGES[stage];
  return stageInfo?.probability || 0;
}
