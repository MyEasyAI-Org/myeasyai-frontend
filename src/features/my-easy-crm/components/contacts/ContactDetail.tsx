// =============================================
// MyEasyCRM - Contact Detail Component
// =============================================

import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Edit,
  Trash2,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Contact, Activity } from '../../types';
import { formatPhone, formatDate, getInitials, formatDateTime } from '../../utils/formatters';
import { useContactActivities } from '../../hooks';
import { ACTIVITY_TYPES, LEAD_SOURCES } from '../../constants';
import type { LeadSource } from '../../types';

interface ContactDetailProps {
  contact: Contact | null;
  isLoading: boolean;
  error?: string | null;
  onBack: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onLogActivity?: (type: 'call' | 'email' | 'meeting' | 'note') => void;
}

export function ContactDetail({
  contact,
  isLoading,
  error,
  onBack,
  onEdit,
  onDelete,
  onLogActivity,
}: ContactDetailProps) {
  const { activities, isLoading: loadingActivities } = useContactActivities(contact?.id || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error || 'Contato não encontrado'}</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:underline"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const sourceInfo = contact.source ? LEAD_SOURCES[contact.source as LeadSource] : undefined;

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
          <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
          {contact.role && (
            <p className="text-gray-500">{contact.role}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {getInitials(contact.name)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                {contact.role && (
                  <p className="text-sm text-gray-500">{contact.role}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{contact.company.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500 text-sm">
                  Criado em {formatDate(contact.created_at)}
                </span>
              </div>
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
              {contact.tags && contact.tags.length > 0 && (
                <div>
                  <dt className="text-sm text-gray-500 mb-2">Tags</dt>
                  <dd className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {contact.notes && (
                <div>
                  <dt className="text-sm text-gray-500">Notas</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap">{contact.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          {onLogActivity && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Registrar Atividade</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onLogActivity('call')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Ligação
                </button>
                <button
                  onClick={() => onLogActivity('email')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => onLogActivity('meeting')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Reunião
                </button>
                <button
                  onClick={() => onLogActivity('note')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Nota
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
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
