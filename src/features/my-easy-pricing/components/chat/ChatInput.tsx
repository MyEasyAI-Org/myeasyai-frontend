// =============================================================================
// ChatInput - Input field for chat messages
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ChatInput({
  onSend,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const labels = PRICING_LABELS.insights.chat;
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2" role="search">
      {/* Input */}
      <div className="flex-1 relative">
        <label htmlFor="chat-input" className="sr-only">
          {placeholder || labels.placeholder}
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || labels.placeholder}
          rows={1}
          aria-describedby="chat-input-hint"
          className={`
            w-full px-4 py-3 pr-12
            bg-slate-800 border border-slate-700 rounded-xl
            text-sm text-white placeholder-slate-500
            resize-none overflow-hidden
            focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
        />
        <span id="chat-input-hint" className="sr-only">
          Pressione Enter para enviar ou Shift+Enter para nova linha
        </span>
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={`
          flex-shrink-0 p-3 rounded-xl
          bg-yellow-600 text-white
          hover:bg-yellow-500 active:bg-yellow-700
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
          transition-colors
        `}
        aria-label={labels.send}
      >
        <Send className="w-5 h-5" aria-hidden="true" />
      </button>
    </form>
  );
}
