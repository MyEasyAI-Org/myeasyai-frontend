// =============================================
// MyEasyCRM - Company Detail Component
// =============================================

import {
  ArrowLeft,
  Globe,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Users,
  Target,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Company } from '../../types';
import { formatDate, formatCNPJ, getInitials } from '../../utils/formatters';
import { INDUSTRY_TYPES } from '../../constants';

interface CompanyDetailProps {
  company: (Company & { contacts_count: number; deals_count: number }) | null;
  isLoading: boolean;
  error?: string | null;
  onBack: () => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onViewContacts?: () => void;
  onViewDeals?: () => void;
}

export function CompanyDetail({
  company,
  isLoading,
  error,
  onBack,
  onEdit,
  onDelete,
  onViewContacts,
  onViewDeals,
}: CompanyDetailProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error || 'Empresa não encontrada'}</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:underline"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const industryLabel = company.industry ? INDUSTRY_TYPES[company.industry] : undefined;

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
          <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
          {industryLabel && (
            <p className="text-gray-500">{industryLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(company)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(company)}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-semibold">
                {getInitials(company.name)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                {industryLabel && (
                  <p className="text-sm text-gray-500">{industryLabel}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 truncate"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {(company.address || company.city || company.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-700">
                    {company.address && <p>{company.address}</p>}
                    {(company.city || company.state) && (
                      <p>{[company.city, company.state].filter(Boolean).join(' - ')}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500 text-sm">
                  Criada em {formatDate(company.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Informações</h4>
            <dl className="space-y-3">
              {company.cnpj && (
                <div>
                  <dt className="text-sm text-gray-500">CNPJ</dt>
                  <dd className="text-gray-900">{formatCNPJ(company.cnpj)}</dd>
                </div>
              )}
              {company.notes && (
                <div>
                  <dt className="text-sm text-gray-500">Notas</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap">{company.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column - Stats & Related */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onViewContacts}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{company.contacts_count}</p>
                  <p className="text-gray-500">Contatos</p>
                </div>
              </div>
            </button>

            <button
              onClick={onViewDeals}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{company.deals_count}</p>
                  <p className="text-gray-500">Deals</p>
                </div>
              </div>
            </button>
          </div>

          {/* Placeholder for future related content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Atividade Recente</h4>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma atividade recente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
