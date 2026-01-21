import { memo, useCallback, useRef, useState } from 'react';
import { ArrowUp, Paperclip, Square, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = memo(
  ({
    onSend,
    onStop,
    isLoading = false,
    placeholder = 'Digite sua mensagem...',
    disabled = false,
  }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(() => {
      if (isLoading) {
        onStop?.();
        return;
      }

      const trimmedMessage = message.trim();
      if (!trimmedMessage && files.length === 0) return;

      onSend(trimmedMessage, files.length > 0 ? files : undefined);
      setMessage('');
      setFiles([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, [message, files, isLoading, onSend, onStop]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit]
    );

    const handleInput = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Auto-resize
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      },
      []
    );

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, []);

    const removeFile = useCallback((index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return (
      <div className="border-t border-gray-700 bg-gray-800 p-4">
        {/* File Previews */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded bg-gray-700 px-3 py-1.5"
              >
                <span className="max-w-[150px] truncate text-sm text-gray-300">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            title="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Text Input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-lg bg-gray-700 px-4 py-3 pr-12 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              style={{ maxHeight: '200px' }}
            />
          </div>

          {/* Send/Stop Button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || (!isLoading && !message.trim() && files.length === 0)}
            className={`rounded-lg p-2 transition-colors ${
              isLoading
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50'
            }`}
            title={isLoading ? 'Parar' : 'Enviar'}
          >
            {isLoading ? (
              <Square className="h-5 w-5" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
