import { useCallback, useRef, useState } from 'react';
import {
  type ChatMessage,
  groqChatService,
} from '../services/GroqChatService';

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type UseAssistantChatReturn = {
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
};

/**
 * Hook for managing assistant chat state and interactions
 */
export function useAssistantChat(): UseAssistantChatReturn {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: AssistantMessage = {
        id: generateMessageId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Convert messages to chat format for API
        const conversationHistory: ChatMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await groqChatService.sendMessage(
          content.trim(),
          conversationHistory
        );

        const assistantMessage: AssistantMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error('[useAssistantChat] Error:', err);
        setError('Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');

        // Add error message to chat
        const errorMessage: AssistantMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content:
            'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, generateMessageId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
}
