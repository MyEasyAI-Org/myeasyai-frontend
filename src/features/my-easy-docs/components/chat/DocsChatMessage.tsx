// =============================================
// MyEasyDocs - DocsChatMessage Component
// =============================================
// Single chat message with user/assistant styling.
// Renders markdown and shows document sources.
// =============================================

import { memo } from 'react';
import { User, Sparkles } from 'lucide-react';
import type { DocsChatMessage as DocsChatMessageType } from '../../types';
import { DocumentSources } from './DocumentSources';

// =============================================
// PROPS
// =============================================
interface DocsChatMessageProps {
  message: DocsChatMessageType;
  /** Avatar name for assistant messages */
  avatarName?: string;
  /** Avatar selfie (base64) for assistant messages */
  avatarSelfie?: string | null;
  onOpenDocument?: (documentId: string) => void;
}

// =============================================
// SIMPLE MARKDOWN RENDERER
// =============================================
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-700 rounded text-sm font-mono">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
}

// =============================================
// COMPONENT
// =============================================
export const DocsChatMessage = memo(function DocsChatMessage({
  message,
  avatarName,
  avatarSelfie,
  onOpenDocument,
}: DocsChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden
          ${isUser ? 'bg-blue-600' : avatarSelfie ? '' : 'bg-gradient-to-br from-purple-500 to-pink-500'}
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : avatarSelfie ? (
          <img
            src={avatarSelfie}
            alt={avatarName || 'Assistente'}
            className="w-full h-full object-cover"
          />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`
          flex-1 max-w-[85%] rounded-2xl px-4 py-3
          ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
          }
        `}
      >
        {/* Content */}
        <div
          className="text-sm leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />

        {/* Document sources (only for assistant) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <DocumentSources sources={message.sources} onOpenDocument={onOpenDocument} />
        )}
      </div>
    </div>
  );
});
