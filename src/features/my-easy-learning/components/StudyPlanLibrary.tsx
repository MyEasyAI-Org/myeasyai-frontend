import { BookOpen, Clock, Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { StudyPlanLibraryItem } from '../types';

interface StudyPlanLibraryProps {
  items: StudyPlanLibraryItem[];
  isLoading?: boolean;
  onLoadPlan?: (item: StudyPlanLibraryItem) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function StudyPlanLibrary({
  items,
  isLoading = false,
  onLoadPlan,
  onToggleFavorite,
  onDelete,
}: StudyPlanLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.version_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFavorite = !filterFavorites || item.is_favorite;

    return matchesSearch && matchesFavorite && !item.is_archived;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          Carregando biblioteca...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Biblioteca de Planos de Estudo</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {/* Filter Favorites */}
          <button
            type="button"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filterFavorites
                ? 'bg-blue-600 text-white'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Heart className={`inline h-4 w-4 mr-1 ${filterFavorites ? 'fill-current' : ''}`} />
            Favoritos
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-sm text-slate-400">
              {searchTerm || filterFavorites
                ? 'Nenhum plano encontrado'
                : 'Nenhum plano salvo ainda'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Gere um plano de estudos e clique em "Salvar Plano"
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const { plan_data, progress } = item;
            const progressPercentage = Math.round(progress.progress_percentage);

            return (
              <div
                key={item.id}
                className="group relative rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
              >
                {/* Favorite Badge */}
                {item.is_favorite && (
                  <div className="absolute right-2 top-2">
                    <Heart className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  </div>
                )}

                {/* Content */}
                <div className="mb-3">
                  <h3 className="mb-1 font-semibold text-white line-clamp-1">
                    {item.version_name}
                  </h3>
                  <p className="mb-2 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="space-y-1 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {plan_data.plan_summary.total_weeks} semanas • {plan_data.plan_summary.total_hours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>
                        {progress.completed_tasks}/{progress.total_tasks} tarefas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progresso</span>
                    <span className="font-semibold text-blue-400">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-slate-500">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {onLoadPlan && (
                    <button
                      type="button"
                      onClick={() => onLoadPlan(item)}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      Carregar
                    </button>
                  )}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                      title={item.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart className={`h-4 w-4 ${item.is_favorite ? 'fill-current text-yellow-500' : ''}`} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este plano?')) {
                          onDelete(item.id);
                        }
                      }}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-red-400 hover:bg-slate-700 transition-colors"
                      title="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
