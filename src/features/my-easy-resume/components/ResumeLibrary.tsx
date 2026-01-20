import React, { useState } from 'react';
import type { ResumeLibraryItem } from '../types';

interface ResumeLibraryProps {
  items: ResumeLibraryItem[];
  isLoading?: boolean;
  onLoadResume?: (item: ResumeLibraryItem) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ResumeLibrary({
  items,
  isLoading = false,
  onLoadResume,
  onToggleFavorite,
  onDelete,
}: ResumeLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.version_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.professionalSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFavorite = !filterFavorites || item.is_favorite;

    return matchesSearch && matchesFavorite;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          Carregando biblioteca...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Biblioteca de Currículos</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Buscar currículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          {/* Filter Favorites */}
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              filterFavorites
                ? 'bg-purple-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ★ Favoritos
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {searchTerm || filterFavorites
                ? 'Nenhum currículo encontrado'
                : 'Nenhum currículo salvo ainda'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Favorite Badge */}
              {item.is_favorite && (
                <div className="absolute right-2 top-2">
                  <span className="text-xl text-yellow-500">★</span>
                </div>
              )}

              {/* Content */}
              <div className="mb-3">
                <h3 className="mb-1 font-semibold text-gray-900">{item.version_name}</h3>
                <p className="mb-2 text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="line-clamp-3 text-sm text-gray-600">
                  {item.professionalSummary || 'Sem resumo profissional'}
                </p>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {onLoadResume && (
                  <button
                    onClick={() => onLoadResume(item)}
                    className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"
                  >
                    Carregar
                  </button>
                )}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                    title={item.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    {item.is_favorite ? '★' : '☆'}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar este currículo?')) {
                        onDelete(item.id);
                      }
                    }}
                    className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    title="Deletar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
