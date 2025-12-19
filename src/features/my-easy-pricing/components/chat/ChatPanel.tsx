// =============================================================================
// ChatPanel - Main chat container for pricing assistant
// =============================================================================

import { useEffect, useRef } from 'react';
import { MessageSquare, Trash2, RefreshCw } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import { usePricingChat } from '../../hooks/usePricingChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

// =============================================================================
// Types
// =============================================================================

interface ChatPanelProps {
  storeId: string | null;
}

// =============================================================================
// Default Quick Prompts (fallback)
// =============================================================================

const DEFAULT_QUICK_PROMPTS = [
  { label: 'Saúde', prompt: 'Como está a saúde da minha precificação?' },
  { label: 'Problemas', prompt: 'Tenho algum problema crítico?' },
  { label: 'Margens', prompt: 'Fale sobre minhas margens' },
  { label: 'Dicas', prompt: 'Me dê dicas para melhorar' },
];

// =============================================================================
// Component
// =============================================================================

export function ChatPanel({ storeId }: ChatPanelProps) {
  const labels = PRICING_LABELS.insights.chat;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    suggestedQuestions,
  } = usePricingChat({
    storeId,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  // Use perguntas sugeridas dinâmicas ou fallback para as padrão
  const quickPrompts = suggestedQuestions.length > 0
    ? suggestedQuestions
    : DEFAULT_QUICK_PROMPTS;

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">
            {labels.title}
          </h3>
          <p className="text-sm text-slate-400">
            {labels.subtitle}
          </p>
        </div>

        {/* Clear button */}
        {hasMessages && (
          <button
            onClick={clearMessages}
            className="p-2 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50 rounded"
            title="Limpar conversa"
            aria-label="Limpar conversa"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto rounded-xl bg-slate-800/30 border border-slate-700/50 mb-4"
        role="log"
        aria-label="Mensagens do chat"
        aria-live="polite"
      >
        {hasMessages ? (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Retry Button - mostrar quando houver erro */}
            {error && !isLoading && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={retryLastMessage}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                    text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-lg
                    hover:bg-yellow-400/20 hover:border-yellow-400/50
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                    transition-all"
                  aria-label="Tentar novamente"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Tentar novamente
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Welcome State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 mb-4 rounded-full bg-yellow-400/10 flex items-center justify-center" aria-hidden="true">
              <MessageSquare className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-slate-300 text-sm mb-2">
              {labels.welcome}
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Pergunte sobre margens, custos, break-even ou peça dicas.
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Perguntas rápidas">
              {quickPrompts.map((item) => {
                // Garantir que temos label e prompt válidos
                const label = item?.label || 'Pergunta';
                const prompt = item?.prompt || '';
                if (!prompt) return null;

                return (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading || !storeId}
                    className="px-3 py-1.5 text-xs font-medium rounded-full
                      bg-slate-700/50 text-slate-300 border border-slate-600/50
                      hover:bg-slate-700 hover:text-white hover:border-slate-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                      transition-all"
                    aria-label={`Perguntar: ${prompt}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || !storeId}
        placeholder={!storeId ? 'Selecione uma loja primeiro...' : undefined}
      />
    </div>
  );
}
