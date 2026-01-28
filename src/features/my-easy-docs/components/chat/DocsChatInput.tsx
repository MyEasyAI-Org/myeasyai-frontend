// =============================================
// MyEasyDocs - DocsChatInput Component
// =============================================
// Expandable textarea for chat messages.
// Enter to send, Shift+Enter for new line.
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface DocsChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

// =============================================
// COMPONENT
// =============================================
export function DocsChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = 'Pergunte sobre seus documentos...',
}: DocsChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 4 lines approx
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isLoading) return;

    onSend(trimmedMessage);
    setMessage('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  const canSend = message.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className="flex items-end gap-2 p-4 border-t border-slate-700 bg-slate-800/50">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          rows={1}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className={`
          flex-shrink-0 p-3 rounded-xl transition-all duration-200
          ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/20'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }
        `}
        title="Enviar mensagem (Enter)"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <SendHorizontal className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
