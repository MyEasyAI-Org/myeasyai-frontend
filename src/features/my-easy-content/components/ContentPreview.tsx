import {
  BookmarkPlus,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  Facebook,
  FileText,
  Hash,
  Image,
  Instagram,
  Linkedin,
  Music,
  RefreshCw,
  Sparkles,
  Twitter,
  Youtube,
  Library,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type {
  CalendarEntry,
  ContentData,
  GeneratedContent,
  SocialNetwork,
} from '../types';
import { SOCIAL_NETWORKS } from '../constants';
import {
  copyToClipboard,
  exportCalendar,
  formatContentForDisplay,
  getNetworkName,
} from '../utils/contentGenerator';
import { ContentLibrary } from './ContentLibrary';
import { SocialNetworkPreview } from './SocialNetworkPreview';
import type { ContentLibraryItem, ContentLibraryFilters } from '../hooks/useContentLibrary';

type ContentPreviewProps = {
  contentData: ContentData;
  isGenerating: boolean;
  onSaveContent: (content: GeneratedContent) => void;
  onRegenerateContent: (content: GeneratedContent) => void;
  onExportCalendar: (format: 'csv' | 'json') => void;
  // Library props
  libraryItems: ContentLibraryItem[];
  libraryIsLoading: boolean;
  libraryFilters: ContentLibraryFilters;
  onUpdateLibraryFilters: (filters: Partial<ContentLibraryFilters>) => void;
  onClearLibraryFilters: () => void;
  onToggleLibraryFavorite: (id: string) => Promise<boolean>;
  onDeleteLibraryItem: (id: string) => Promise<boolean>;
};

const NETWORK_ICONS: Record<SocialNetwork, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Music,
  youtube: Youtube,
};

const NETWORK_COLORS: Record<SocialNetwork, string> = {
  instagram: 'from-pink-500 to-purple-600',
  facebook: 'from-blue-600 to-blue-700',
  linkedin: 'from-blue-500 to-blue-600',
  twitter: 'from-slate-700 to-slate-800',
  tiktok: 'from-slate-900 to-slate-950',
  youtube: 'from-red-600 to-red-700',
};

export function ContentPreview({
  contentData,
  isGenerating,
  onSaveContent,
  onRegenerateContent,
  onExportCalendar,
  libraryItems,
  libraryIsLoading,
  libraryFilters,
  onUpdateLibraryFilters,
  onClearLibraryFilters,
  onToggleLibraryFavorite,
  onDeleteLibraryItem,
}: ContentPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'calendar' | 'library'>(
    'content',
  );
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);

  const handleCopy = async (content: GeneratedContent) => {
    const text = formatContentForDisplay(content);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(content.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderNetworkBadge = (network: SocialNetwork) => {
    const Icon = NETWORK_ICONS[network];
    const networkConfig = SOCIAL_NETWORKS.find((n) => n.id === network);
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: networkConfig?.color }}
      >
        <Icon className="h-3 w-3" />
        <span>{getNetworkName(network)}</span>
      </div>
    );
  };

  const renderContentCard = (content: GeneratedContent) => {
    const Icon = NETWORK_ICONS[content.network];
    const gradientClass = NETWORK_COLORS[content.network];

    return (
      <div
        key={content.id}
        className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden"
      >
        {/* Card Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">
                {getNetworkName(content.network)}
              </span>
            </div>
            <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
              {content.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">{content.title}</h3>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-4">
          {/* Main Content */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {content.content}
            </p>
          </div>

          {/* Hashtags */}
          {content.hashtags && content.hashtags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Hash className="h-4 w-4" />
                <span>Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {content.hashtags.map((tag, idx) => (
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
          {content.imageDescription && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Image className="h-4 w-4" />
                <span>Sugestao de Imagem</span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                {content.imageDescription}
              </p>
            </div>
          )}

          {/* Best Time */}
          {content.bestTime && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>Melhor horario: </span>
              <span className="font-semibold text-orange-400">
                {content.bestTime}
              </span>
            </div>
          )}

          {/* Variations */}
          {content.variations && content.variations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <RefreshCw className="h-4 w-4" />
                <span>Variacoes ({content.variations.length})</span>
              </div>
              <div className="space-y-2">
                {content.variations.map((variation, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                  >
                    <p className="text-xs text-slate-400 mb-1">
                      Variacao {idx + 1}
                    </p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {variation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <button
              type="button"
              onClick={() => handleCopy(content)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              {copiedId === content.id ? (
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
            <button
              type="button"
              onClick={() => setPreviewContent(content)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
              title="Ver preview por rede"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSaveContent(content)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              <BookmarkPlus className="h-4 w-4" />
              <span>Salvar</span>
            </button>
            <button
              type="button"
              onClick={() => onRegenerateContent(content)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarEntry = (entry: CalendarEntry) => {
    const Icon = NETWORK_ICONS[entry.network];
    return (
      <div
        key={entry.id}
        className="flex items-center gap-4 p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-orange-500/50 transition-colors"
      >
        <div className="text-center min-w-[60px]">
          <p className="text-2xl font-bold text-white">
            {entry.date.getDate()}
          </p>
          <p className="text-xs text-slate-400">{entry.dayOfWeek}</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-white">{entry.title}</span>
          </div>
          <p className="text-xs text-slate-400">{entry.contentType}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-orange-400">{entry.bestTime}</p>
          <span
            className={`text-xs px-2 py-1 rounded ${
              entry.status === 'ready'
                ? 'bg-green-500/20 text-green-400'
                : entry.status === 'draft'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-slate-500/20 text-slate-400'
            }`}
          >
            {entry.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-900/30 flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">
              Conteudo Gerado
            </h2>
          </div>
          {contentData.calendar.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => onExportCalendar('csv')}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
              <button
                onClick={() => onExportCalendar('json')}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-3 w-3" />
                JSON
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Conteudos ({contentData.generatedContents.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendario ({contentData.calendar.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              <span>Biblioteca ({libraryItems.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-orange-400 animate-pulse" />
              <div className="absolute inset-0 animate-spin">
                <div className="h-16 w-16 border-t-2 border-orange-400 rounded-full" />
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold text-white">
              Gerando seu conteudo...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Isso pode levar alguns segundos
            </p>
          </div>
        ) : activeTab === 'content' ? (
          contentData.generatedContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum conteudo gerado ainda
              </h3>
              <p className="text-slate-400 max-w-md">
                Converse com o assistente no painel ao lado para gerar posts,
                legendas, roteiros e muito mais!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {contentData.generatedContents.map(renderContentCard)}
            </div>
          )
        ) : activeTab === 'calendar' ? (
          contentData.calendar.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Calendario vazio
              </h3>
              <p className="text-slate-400 max-w-md">
                Solicite ao assistente para criar um calendario editorial mensal
                para suas redes sociais.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contentData.calendar.map(renderCalendarEntry)}
            </div>
          )
        ) : (
          <div className="h-full -m-6">
            <ContentLibrary
              items={libraryItems}
              isLoading={libraryIsLoading}
              filters={libraryFilters}
              onUpdateFilters={onUpdateLibraryFilters}
              onClearFilters={onClearLibraryFilters}
              onToggleFavorite={onToggleLibraryFavorite}
              onDeleteItem={onDeleteLibraryItem}
              onCopyContent={(item) => {
                const text = item.content;
                navigator.clipboard.writeText(text);
              }}
            />
          </div>
        )}
      </div>

      {/* Social Network Preview Modal */}
      {previewContent && (
        <SocialNetworkPreview
          content={previewContent}
          isOpen={!!previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}
    </div>
  );
}
