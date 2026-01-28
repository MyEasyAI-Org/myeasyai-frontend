// =============================================
// MyEasyDocs - DocsChatDrawer Component
// =============================================
// Slide-in drawer for AI chat about documents.
// =============================================

import { useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Trash2, FileText } from 'lucide-react';
import type { DocsChatMessage as DocsChatMessageType } from '../../types';
import { DocsChatMessage } from './DocsChatMessage';
import { DocsChatInput } from './DocsChatInput';

// =============================================
// PROPS
// =============================================
interface DocsChatDrawerProps {
  isOpen: boolean;
  messages: DocsChatMessageType[];
  isLoading?: boolean;
  hasDocuments?: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  onClear?: () => void;
  onOpenDocument?: (documentId: string) => void;
}

// =============================================
// COMPONENT
// =============================================
export function DocsChatDrawer({
  isOpen,
  messages,
  isLoading = false,
  hasDocuments = true,
  onClose,
  onSend,
  onClear,
  onOpenDocument,
}: DocsChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Assistente IA</h2>
              <p className="text-xs text-slate-400">Pergunte sobre seus documentos</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onClear && messages.length > 0 && (
              <button
                onClick={onClear}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Como posso ajudar?
              </h3>
              {hasDocuments ? (
                <p className="text-sm text-slate-400 max-w-xs">
                  Faça perguntas sobre seus documentos. A IA irá buscar informações
                  relevantes e responder com base no conteúdo indexado.
                </p>
              ) : (
                <div className="text-sm text-slate-400 max-w-xs">
                  <div className="flex items-center justify-center gap-2 mb-2 text-yellow-400">
                    <FileText className="w-4 h-4" />
                    <span>Nenhum documento indexado</span>
                  </div>
                  <p>
                    Faça upload de arquivos (PDF, DOCX, TXT) para poder conversar
                    com a IA sobre seu conteúdo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <DocsChatMessage
              key={message.id}
              message={message}
              onOpenDocument={onOpenDocument}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <DocsChatInput
          onSend={onSend}
          disabled={!hasDocuments}
          isLoading={isLoading}
          placeholder={
            hasDocuments
              ? 'Pergunte sobre seus documentos...'
              : 'Faça upload de documentos para começar'
          }
        />
      </div>
    </div>
  );
}
