import { memo, type ReactNode } from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 px-4 py-4 ${
        isUser ? 'bg-gray-800/30' : 'bg-gray-900/50'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-blue-600' : 'bg-purple-600'
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-gray-200">
            {isUser ? 'Você' : 'MyEasyCode'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ className, children, ...props }: { className?: string; children?: ReactNode }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;

                if (isInline) {
                  return (
                    <code
                      className="rounded bg-gray-700 px-1.5 py-0.5 text-sm text-gray-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative">
                    <div className="absolute right-2 top-2 rounded bg-gray-600 px-2 py-0.5 text-xs text-gray-300">
                      {match?.[1]}
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              pre: ({ children }: { children?: ReactNode }) => {
                return <>{children}</>;
              },
            } as Components}
          >
            {message.content}
          </ReactMarkdown>

          {message.isStreaming && (
            <span className="inline-block h-4 w-2 animate-pulse bg-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
