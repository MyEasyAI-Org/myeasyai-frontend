// =============================================
// MyEasyDocs - Main Component
// =============================================
// This is the main entry point for the MyEasyDocs module.
// It manages file/folder navigation, preview, and AI chat.
// =============================================

import { useState } from 'react';
import { ArrowLeft, FolderOpen, Upload, LayoutGrid, List, MessageSquare, Search, Plus, ChevronRight, Folder, FileText, File, Image, Star } from 'lucide-react';
import type {
  DocsFolder,
  DocsDocument,
  DocsViewMode,
  BreadcrumbItem,
} from './types';
import { SIDEBAR_WIDTH } from './constants';
import { formatFileSize, formatRelativeTime, getFileIcon, countDocumentsInFolder } from './utils';
import { MOCK_FOLDERS, MOCK_DOCUMENTS } from './mockData';

// =============================================
// PROPS
// =============================================
interface MyEasyDocsProps {
  onBackToDashboard?: () => void;
}

// =============================================
// ICON COMPONENT HELPER
// =============================================
function FileIcon({ mimeType, className = '' }: { mimeType: string; className?: string }) {
  const iconName = getFileIcon(mimeType);

  switch (iconName) {
    case 'FileText':
      return <FileText className={className} />;
    case 'Image':
      return <Image className={className} />;
    case 'Folder':
      return <Folder className={className} />;
    default:
      return <File className={className} />;
  }
}

// =============================================
// MAIN COMPONENT
// =============================================
export function MyEasyDocs({ onBackToDashboard }: MyEasyDocsProps) {
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocsDocument | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<DocsViewMode>('grid');
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Get current path for breadcrumb
  const getBreadcrumb = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ id: null, name: 'Meus Documentos' }];

    if (currentFolderId) {
      const folder = MOCK_FOLDERS.find(f => f.id === currentFolderId);
      if (folder) {
        // Add parent folders if any
        if (folder.parent_id) {
          const parent = MOCK_FOLDERS.find(f => f.id === folder.parent_id);
          if (parent) {
            items.push({ id: parent.id, name: parent.name });
          }
        }
        items.push({ id: folder.id, name: folder.name });
      }
    }

    return items;
  };

  // Get items for current folder
  const getCurrentFolders = () => {
    return MOCK_FOLDERS.filter(f => f.parent_id === currentFolderId);
  };

  const getCurrentDocuments = () => {
    return MOCK_DOCUMENTS.filter(d => d.folder_id === currentFolderId);
  };

  // Toggle folder expansion in sidebar
  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedDocument(null);
  };

  // Render folder tree recursively
  const renderFolderTree = (parentId: string | null, level: number = 0) => {
    const folders = MOCK_FOLDERS.filter(f => f.parent_id === parentId);

    return folders.map(folder => {
      const hasChildren = MOCK_FOLDERS.some(f => f.parent_id === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = currentFolderId === folder.id;

      return (
        <div key={folder.id}>
          <button
            onClick={() => navigateToFolder(folder.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              isSelected
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
                className="p-0.5 hover:bg-slate-700 rounded"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <Folder className="w-4 h-4 text-yellow-500" />
            <span className="truncate flex-1 text-left">{folder.name}</span>
            {(() => {
              const count = countDocumentsInFolder(folder.id, MOCK_DOCUMENTS);
              return count > 0 ? (
                <span className="text-xs text-slate-500">{count}</span>
              ) : null;
            })()}
          </button>
          {hasChildren && isExpanded && renderFolderTree(folder.id, level + 1)}
        </div>
      );
    });
  };

  const breadcrumb = getBreadcrumb();
  const currentFolders = getCurrentFolders();
  const currentDocuments = getCurrentDocuments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 bg-slate-900/50 border-r border-slate-800 flex flex-col"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-blue-400" />
                <h1 className="text-lg font-semibold">My Easy Docs</h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Pasta
              </button>
            </div>
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Root */}
            <button
              onClick={() => navigateToFolder(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                currentFolderId === null
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Meus Documentos</span>
            </button>

            {/* Folder Tree */}
            <div className="mt-1">
              {renderFolderTree(null)}
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-3 border-t border-slate-800">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
              Favoritos
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/30">
            <div className="px-6 py-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-3">
                {breadcrumb.map((item, index) => (
                  <div key={item.id ?? 'root'} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-600" />}
                    <button
                      onClick={() => navigateToFolder(item.id)}
                      className={`hover:text-blue-400 transition-colors ${
                        index === breadcrumb.length - 1
                          ? 'text-white font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* View Toggle & Chat */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Visualização em grade"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Visualização em lista"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      chatOpen
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Chat IA</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentFolders.length === 0 && currentDocuments.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FolderOpen className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  Nenhum arquivo nesta pasta
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Faça upload de arquivos ou crie uma nova pasta para começar
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                  <Upload className="w-4 h-4" />
                  Fazer Upload
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                {/* Folders */}
                {currentFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => navigateToFolder(folder.id)}
                    className="flex flex-col items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
                  >
                    <Folder className="w-12 h-12 text-yellow-500 mb-3" />
                    <span className="text-sm font-medium text-slate-200 truncate w-full text-center">
                      {folder.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {countDocumentsInFolder(folder.id, MOCK_DOCUMENTS)} arquivos
                    </span>
                  </button>
                ))}

                {/* Documents */}
                {currentDocuments.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`flex flex-col items-center p-4 bg-slate-900/50 border rounded-xl transition-all group ${
                      selectedDocument?.id === doc.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative">
                      <FileIcon mimeType={doc.mime_type} className="w-12 h-12 text-slate-400" />
                      {doc.is_favorite && (
                        <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-200 truncate w-full text-center mt-3">
                      {doc.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {formatFileSize(doc.size)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Tamanho
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Modificado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {/* Folders */}
                    {currentFolders.map(folder => (
                      <tr
                        key={folder.id}
                        onClick={() => navigateToFolder(folder.id)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-slate-200">{folder.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">—</td>
                        <td className="px-4 py-3 text-sm text-slate-500">Pasta</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {formatRelativeTime(folder.updated_at)}
                        </td>
                      </tr>
                    ))}

                    {/* Documents */}
                    {currentDocuments.map(doc => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={`cursor-pointer transition-colors ${
                          selectedDocument?.id === doc.id
                            ? 'bg-blue-500/10'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FileIcon mimeType={doc.mime_type} className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-200">{doc.name}</span>
                            {doc.is_favorite && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {doc.mime_type.split('/')[1]?.toUpperCase() || 'Arquivo'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {formatRelativeTime(doc.updated_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Chat Drawer (placeholder) */}
        {chatOpen && (
          <aside className="w-[400px] flex-shrink-0 bg-slate-900/50 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold">Assistente de Documentos</h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  Chat com seus documentos
                </h3>
                <p className="text-sm text-slate-500">
                  Faça perguntas sobre seus arquivos e a IA irá buscar as respostas nos documentos indexados.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pergunte sobre seus documentos..."
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default MyEasyDocs;
