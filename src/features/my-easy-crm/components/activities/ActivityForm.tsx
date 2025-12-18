// =============================================
// MyEasyCRM - Activity Form Component
// =============================================

import { useState, useEffect } from 'react';
import { X, Loader2, Phone, Mail, Users, FileText } from 'lucide-react';
import type { ActivityType, ActivityFormData } from '../../types';
import { ACTIVITY_TYPES } from '../../constants';

interface ActivityFormProps {
  type: ActivityType;
  contactId?: string;
  dealId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  Mail,
  Users,
  FileText,
};

export function ActivityForm({
  type,
  contactId,
  dealId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ActivityFormProps) {
  const [description, setDescription] = useState('');
  const [incoming, setIncoming] = useState(false);

  const typeInfo = ACTIVITY_TYPES[type];
  const Icon = IconMap[typeInfo?.icon] || FileText;

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setIncoming(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type,
      description,
      contact_id: contactId,
      deal_id: dealId,
      incoming: type === 'call' || type === 'email' ? incoming : undefined,
    });
    onClose();
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'call':
        return 'Descreva a ligação: assuntos discutidos, próximos passos...';
      case 'email':
        return 'Resuma o email: assunto, principais pontos...';
      case 'meeting':
        return 'Descreva a reunião: participantes, pauta, decisões...';
      case 'note':
        return 'Adicione uma nota sobre o contato ou negociação...';
      default:
        return 'Descreva a atividade...';
    }
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
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo?.bgColor || 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${typeInfo?.color || 'text-gray-600'}`} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Registrar {typeInfo?.label || 'Atividade'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Direction (for calls and emails) */}
              {(type === 'call' || type === 'email') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direção
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="direction"
                        checked={!incoming}
                        onChange={() => setIncoming(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">
                        {type === 'call' ? 'Ligação feita' : 'Email enviado'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="direction"
                        checked={incoming}
                        onChange={() => setIncoming(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">
                        {type === 'call' ? 'Ligação recebida' : 'Email recebido'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900"
                  placeholder={getPlaceholder()}
                  autoFocus
                />
              </div>

              {/* Quick Templates */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Modelos rápidos:</p>
                <div className="flex flex-wrap gap-2">
                  {type === 'call' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDescription('Ligação de follow-up. Cliente interessado, aguardando retorno.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Follow-up
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescription('Ligação não atendida. Tentar novamente.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Não atendeu
                      </button>
                    </>
                  )}
                  {type === 'email' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDescription('Enviado proposta comercial. Aguardando retorno.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Proposta enviada
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescription('Email de follow-up enviado.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Follow-up
                      </button>
                    </>
                  )}
                  {type === 'meeting' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDescription('Reunião de apresentação. Apresentamos a solução e discutimos necessidades.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Apresentação
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescription('Reunião de negociação. Discutimos valores e prazos.')}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Negociação
                      </button>
                    </>
                  )}
                </div>
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
                disabled={isSubmitting || !description.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
