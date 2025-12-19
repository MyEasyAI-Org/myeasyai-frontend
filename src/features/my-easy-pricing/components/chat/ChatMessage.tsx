// =============================================================================
// ChatMessage - Individual chat message bubble
// =============================================================================

import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/insights.types';

// =============================================================================
// Types
// =============================================================================

interface ChatMessageProps {
  message: ChatMessageType;
}

// =============================================================================
// Loading Dots Animation
// =============================================================================

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isLoading = message.isLoading;
  const roleLabel = isAssistant ? 'Assistente' : 'Você';

  return (
    <div
      className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
      role="article"
      aria-label={`Mensagem de ${roleLabel}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isAssistant ? 'bg-yellow-500/20' : 'bg-slate-700'}
        `}
        aria-hidden="true"
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-yellow-400" />
        ) : (
          <User className="w-4 h-4 text-slate-300" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`
          max-w-[80%] px-4 py-2.5 rounded-2xl
          ${isAssistant
            ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
            : 'bg-yellow-600 text-white rounded-tr-sm'
          }
        `}
      >
        {isLoading ? (
          <div aria-label="Carregando resposta" role="status">
            <LoadingDots />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
