// =============================================
// MyEasyCRM - Contact List Component
// =============================================

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { ContactCard } from './ContactCard';
import { ContactTable } from './ContactTable';
import type { Contact, ContactFilters } from '../../types';
import { LEAD_SOURCES_LIST } from '../../constants';
import type { LeadSource } from '../../types';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  error?: string | null;
  totalCount: number;
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  onCreateContact: () => void;
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onLogActivity?: (contact: Contact) => void;
}

type ViewMode = 'grid' | 'table';

export function ContactList({
  contacts,
  isLoading,
  error,
  totalCount,
  filters,
  onFiltersChange,
  onCreateContact,
  onViewContact,
  onEditContact,
  onDeleteContact,
  onLogActivity,
}: ContactListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchTerm || undefined });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.source || filters.company_id;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contatos</h2>
          <p className="text-gray-500 mt-1">
            {totalCount} {totalCount === 1 ? 'contato' : 'contatos'} cadastrados
          </p>
        </div>
        <button
          onClick={onCreateContact}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Contato
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-colors
              ${showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Filter className="w-5 h-5" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origem
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => onFiltersChange({ ...filters, source: e.target.value as LeadSource || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todas as origens</option>
                  {LEAD_SOURCES_LIST.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
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
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum contato encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro contato'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={onCreateContact}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Contato
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onView={onViewContact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onLogActivity={onLogActivity}
            />
          ))}
        </div>
      ) : (
        <ContactTable
          contacts={contacts}
          onView={onViewContact}
          onEdit={onEditContact}
          onDelete={onDeleteContact}
        />
      )}
    </div>
  );
}
