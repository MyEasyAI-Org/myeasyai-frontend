// =============================================
// MyEasyDocs - useDocsChat Hook
// Manages AI chat state and interactions
// =============================================

import { useState, useCallback } from 'react';
import { DocsAIService } from '../services';
import type { DocsChatMessage, DocumentSource } from '../types';
import { generateId } from '../utils';

interface UseDocsChatOptions {
  /** Whether user has documents uploaded */
  hasDocuments?: boolean;
  /** Callback when a source is clicked */
  onSourceClick?: (documentId: string) => void;
}

interface UseDocsChatReturn {
  /** Chat messages */
  messages: DocsChatMessage[];
  /** Whether AI is processing */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Send a message to the AI */
  sendMessage: (content: string) => Promise<void>;
  /** Clear chat history */
  clearMessages: () => void;
  /** Add a system message */
  addSystemMessage: (content: string) => void;
}

export function useDocsChat(options?: UseDocsChatOptions): UseDocsChatReturn {
  const [messages, setMessages] = useState<DocsChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasDocuments = true } = options || {};

  /**
   * Creates a new message object
   */
  const createMessage = useCallback(
    (
      role: 'user' | 'assistant',
      content: string,
      sources?: DocumentSource[]
    ): DocsChatMessage => ({
      id: generateId(),
      role,
      content,
      sources,
      created_at: new Date().toISOString(),
    }),
    []
  );

  /**
   * Sends a message and gets AI response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);

      // Add user message immediately
      const userMessage = createMessage('user', content.trim());
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      try {
        // Check if user has documents
        if (!hasDocuments) {
          const noDocsResponse = DocsAIService.getNoDocumentsResponse();
          const assistantMessage = createMessage(
            'assistant',
            noDocsResponse.answer,
            noDocsResponse.sources
          );
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }

        // Get AI response
        const response = await DocsAIService.askQuestion(
          content.trim(),
          messages // Pass history for context
        );

        // Add assistant message
        const assistantMessage = createMessage(
          'assistant',
          response.answer,
          response.sources
        );
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao processar sua pergunta';
        setError(errorMessage);

        // Add error message as assistant response
        const errorResponse = createMessage(
          'assistant',
          'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
        );
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, hasDocuments, createMessage]
  );

  /**
   * Clears all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Adds a system message (for welcome, instructions, etc.)
   */
  const addSystemMessage = useCallback(
    (content: string) => {
      const message = createMessage('assistant', content);
      setMessages((prev) => [...prev, message]);
    },
    [createMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
  };
}
