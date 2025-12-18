// =============================================
// MyEasyCRM - Company Card Component
// =============================================

import { useState } from 'react';
import {
  Globe,
  MapPin,
  Users,
  Target,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import type { Company } from '../../types';
import { getInitials } from '../../utils/formatters';
import { INDUSTRY_TYPES } from '../../constants';

interface CompanyCardProps {
  company: Company;
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export function CompanyCard({
  company,
  onView,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const industryLabel = company.industry ? INDUSTRY_TYPES[company.industry] : undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Logo and Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
            {getInitials(company.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={() => onView?.(company)}
            >
              {company.name}
            </h3>
            {industryLabel && (
              <p className="text-sm text-gray-500">{industryLabel}</p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
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
                      onView(company);
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
                      onEdit(company);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(company);
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

      {/* Company Info */}
      <div className="mt-4 space-y-2">
        {company.website && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4 text-gray-400" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 truncate"
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {(company.city || company.state) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              {[company.city, company.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{company.contacts_count || 0} contatos</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>{company.deals_count || 0} deals</span>
        </div>
      </div>
    </div>
  );
}
