// =============================================================================
// usePricingChat - Hook for managing pricing assistant chat (UI only)
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/insights.types';

// =============================================================================
// Local Types
// =============================================================================

interface SuggestedQuestion {
  label: string;
  prompt: string;
}

// =============================================================================
// Types
// =============================================================================

interface UsePricingChatParams {
  storeId: string | null;
}

interface UsePricingChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  suggestedQuestions: SuggestedQuestion[];
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
}

function createAssistantMessage(content: string, relatedInsightIds?: string[]): ChatMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    relatedInsightIds,
  };
}

function createLoadingMessage(): ChatMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    isLoading: true,
  };
}

// =============================================================================
// Default Suggested Questions
// =============================================================================

const DEFAULT_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { label: 'Saúde', prompt: 'Como está a saúde da minha precificação?' },
  { label: 'Problemas', prompt: 'Tenho algum problema crítico?' },
  { label: 'Margens', prompt: 'Fale sobre minhas margens' },
  { label: 'Dicas', prompt: 'Me dê dicas para melhorar' },
];

// Placeholder response while AI is not connected
const PLACEHOLDER_RESPONSE = 'O assistente de IA está em desenvolvimento. Em breve você poderá conversar sobre sua precificação aqui!';

// =============================================================================
// Hook Implementation
// =============================================================================

export function usePricingChat({
  storeId,
}: UsePricingChatParams): UsePricingChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);

  // Ref para manter última mensagem para retry
  const lastUserMessageRef = useRef<string | null>(null);

  // Definir perguntas sugeridas (estáticas por enquanto)
  useEffect(() => {
    setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS);
  }, []);

  // Limpar mensagens quando loja mudar
  const prevStoreIdRef = useRef(storeId);
  useEffect(() => {
    if (storeId !== prevStoreIdRef.current) {
      prevStoreIdRef.current = storeId;
      setMessages([]);
      setError(null);
    }
  }, [storeId]);

  // ---------------------------------------------------------------------------
  // Send Message (placeholder - AI not connected)
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Salvar última mensagem para retry
    lastUserMessageRef.current = content;

    // Limpar erro anterior
    setError(null);

    // Adicionar mensagem do usuário
    const userMessage = createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    // Adicionar mensagem de loading
    const loadingMessage = createLoadingMessage();
    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);

    // Simular delay para parecer mais natural
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retornar resposta placeholder (IA não conectada)
    const assistantMessage = createAssistantMessage(PLACEHOLDER_RESPONSE);

    // Substituir loading pela resposta
    setMessages(prev =>
      prev.map(msg => (msg.id === loadingMessage.id ? assistantMessage : msg))
    );

    setIsLoading(false);
  }, [isLoading]);

  // ---------------------------------------------------------------------------
  // Retry Last Message (placeholder - AI not connected)
  // ---------------------------------------------------------------------------
  const retryLastMessage = useCallback(async () => {
    const lastMessage = lastUserMessageRef.current;
    if (!lastMessage) return;

    // Remover última resposta
    setMessages(prev => {
      let lastAssistantIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === 'assistant') {
          lastAssistantIndex = i;
          break;
        }
      }
      if (lastAssistantIndex >= 0) {
        return prev.slice(0, lastAssistantIndex);
      }
      return prev;
    });

    // Limpar erro
    setError(null);

    // Pequena pausa para o estado atualizar
    await new Promise(resolve => setTimeout(resolve, 100));

    // Adicionar mensagem de loading
    const loadingMessage = createLoadingMessage();
    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retornar resposta placeholder
    const assistantMessage = createAssistantMessage(PLACEHOLDER_RESPONSE);

    setMessages(prev =>
      prev.map(msg => (msg.id === loadingMessage.id ? assistantMessage : msg))
    );

    setIsLoading(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Clear Messages
  // ---------------------------------------------------------------------------
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    lastUserMessageRef.current = null;
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    suggestedQuestions,
  };
}
