import {
  Search,
  Filter,
  Star,
  Copy,
  Trash2,
  Calendar,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Music,
  X,
  Loader2,
  FolderOpen,
  Hash,
  Image,
  Clock,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ContentLibraryItem, ContentLibraryFilters } from '../hooks/useContentLibrary';
import type { ContentType, SocialNetwork } from '../types';
import { CONTENT_TYPES, SOCIAL_NETWORKS } from '../constants';

interface ContentLibraryProps {
  items: ContentLibraryItem[];
  isLoading: boolean;
  filters: ContentLibraryFilters;
  onUpdateFilters: (filters: Partial<ContentLibraryFilters>) => void;
  onClearFilters: () => void;
  onToggleFavorite: (id: string) => Promise<boolean>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onCopyContent: (item: ContentLibraryItem) => void;
  onEditItem?: (item: ContentLibraryItem) => void;
  onScheduleItem?: (item: ContentLibraryItem) => void;
}

// Network icon mapping
const NETWORK_ICONS: Record<SocialNetwork, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music,
};

// Network gradient colors (same as ContentPreview)
const NETWORK_COLORS: Record<SocialNetwork, string> = {
  instagram: 'from-pink-500 to-purple-600',
  facebook: 'from-blue-600 to-blue-700',
  linkedin: 'from-blue-500 to-blue-600',
  twitter: 'from-slate-700 to-slate-800',
  youtube: 'from-red-600 to-red-700',
  tiktok: 'from-slate-900 to-slate-950',
};

// Get network display name
const getNetworkName = (network: SocialNetwork): string => {
  return SOCIAL_NETWORKS.find((n) => n.id === network)?.name || network;
};

export function ContentLibrary({
  items,
  isLoading,
  filters,
  onUpdateFilters,
  onClearFilters,
  onToggleFavorite,
  onDeleteItem,
  onCopyContent,
  onScheduleItem,
}: ContentLibraryProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.content_type) count++;
    if (filters.network) count++;
    if (filters.is_favorite) count++;
    if (filters.folder) count++;
    return count;
  }, [filters]);

  // Handle delete with confirmation
  const handleDelete = async (item: ContentLibraryItem) => {
    if (!confirm(`Tem certeza que deseja excluir este conteudo?`)) return;
    setDeletingId(item.id);
    await onDeleteItem(item.id);
    setDeletingId(null);
  };

  // Handle copy with feedback
  const handleCopy = async (item: ContentLibraryItem) => {
    onCopyContent(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Render full content card (same style as ContentPreview)
  const renderContentCard = (item: ContentLibraryItem) => {
    const Icon = NETWORK_ICONS[item.network];
    const gradientClass = NETWORK_COLORS[item.network];
    const isDeleting = deletingId === item.id;
    const isCopied = copiedId === item.id;

    return (
      <div
        key={item.id}
        className={`rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden ${
          isDeleting ? 'opacity-50' : ''
        }`}
      >
        {/* Card Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">
                {getNetworkName(item.network)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                {item.content_type.replace('_', ' ')}
              </span>
              <button
                onClick={() => onToggleFavorite(item.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={item.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star
                  className={`w-4 h-4 ${
                    item.is_favorite ? 'text-yellow-300 fill-yellow-300' : 'text-white/70'
                  }`}
                />
              </button>
            </div>
          </div>
          {item.title && (
            <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-4">
          {/* Main Content */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {item.content}
            </p>
          </div>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Hash className="h-4 w-4" />
                <span>Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Description */}
          {item.image_description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Image className="h-4 w-4" />
                <span>Sugestao de Imagem</span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                {item.image_description}
              </p>
            </div>
          )}

          {/* Best Time */}
          {item.best_time && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>Melhor horario: </span>
              <span className="font-semibold text-orange-400">{item.best_time}</span>
            </div>
          )}

          {/* Variations */}
          {item.variations && item.variations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <RefreshCw className="h-4 w-4" />
                <span>Variacoes ({item.variations.length})</span>
              </div>
              <div className="space-y-2">
                {item.variations.map((variation, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                  >
                    <p className="text-xs text-slate-400 mb-1">Variacao {idx + 1}</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{variation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer with date and actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <span className="text-xs text-slate-500">
              Salvo em {formatDate(item.created_at)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
              {onScheduleItem && (
                <button
                  onClick={() => onScheduleItem(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                  title="Agendar"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(item)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-800/50 text-red-400 text-sm hover:bg-red-900/30 transition-colors"
                title="Excluir"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-slate-700/50 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar conteudos..."
            value={filters.search || ''}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Filter toggle and quick filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick favorite filter */}
          <button
            onClick={() => onUpdateFilters({ is_favorite: !filters.is_favorite })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filters.is_favorite
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4" fill={filters.is_favorite ? 'currentColor' : 'none'} />
            <span>Favoritos</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-white text-sm"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {/* Network filter */}
            <select
              value={filters.network || ''}
              onChange={(e) =>
                onUpdateFilters({ network: (e.target.value as SocialNetwork) || null })
              }
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">Todas as redes</option>
              {SOCIAL_NETWORKS.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>

            {/* Content type filter */}
            <select
              value={filters.content_type || ''}
              onChange={(e) =>
                onUpdateFilters({ content_type: (e.target.value as ContentType) || null })
              }
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">Todos os tipos</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <FolderOpen className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm">
              {filters.search || activeFilterCount > 0
                ? 'Nenhum conteudo encontrado com esses filtros'
                : 'Sua biblioteca esta vazia'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {filters.search || activeFilterCount > 0
                ? 'Tente ajustar os filtros'
                : 'Salve seus conteudos gerados para encontra-los aqui'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {items.map(renderContentCard)}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {items.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-700/50 text-xs text-slate-500">
          {items.length} {items.length === 1 ? 'conteudo' : 'conteudos'}
          {filters.is_favorite && ` favorito${items.length === 1 ? '' : 's'}`}
        </div>
      )}
    </div>
  );
}
