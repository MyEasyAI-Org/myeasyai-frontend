// =============================================
// MyEasyCRM - Company List Component
// =============================================

import { useState } from 'react';
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { CompanyCard } from './CompanyCard';
import type { Company } from '../../types';

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  onSearch: (search: string) => void;
  onCreateCompany: () => void;
  onViewCompany: (company: Company) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
}

export function CompanyList({
  companies,
  isLoading,
  error,
  totalCount,
  onSearch,
  onCreateCompany,
  onViewCompany,
  onEditCompany,
  onDeleteCompany,
}: CompanyListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Empresas</h2>
          <p className="text-gray-500 mt-1">
            {totalCount} {totalCount === 1 ? 'empresa' : 'empresas'} cadastradas
          </p>
        </div>
        <button
          onClick={onCreateCompany}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma empresa encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Comece adicionando sua primeira empresa'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateCompany}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Empresa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onView={onViewCompany}
              onEdit={onEditCompany}
              onDelete={onDeleteCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
}
