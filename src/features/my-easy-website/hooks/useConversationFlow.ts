import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Message type for conversation
 */
export type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{ label: string; value: string; icon?: any }>;
  requiresInput?: boolean;
  requiresImages?: boolean;
  showColorPalettes?: boolean;
  showCustomColorButton?: boolean;
};

/**
 * Conversation snapshot for history/back navigation
 */
export type ConversationSnapshot<T = any> = {
  step: number;
  data: T;
  messages: Message[];
};

/**
 * Hook for managing conversation flow in MyEasyWebsite
 * Handles message history, conversation steps, and navigation (back/forward)
 *
 * @example
 * const {
 *   messages,
 *   currentStep,
 *   canGoBack,
 *   addMessage,
 *   addMessages,
 *   goToStep,
 *   goBack,
 *   saveSnapshot,
 *   messagesEndRef,
 * } = useConversationFlow<SiteData>({ initialStep: 0 });
 */
export function useConversationFlow<T = any>(config?: {
  initialStep?: number;
  initialMessages?: Message[];
  autoScroll?: boolean;
}) {
  const {
    initialStep = 0,
    initialMessages = [],
    autoScroll = true,
  } = config || {};

  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationSnapshot<T>[]
  >([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  /**
   * Add a single message to the conversation
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Add multiple messages to the conversation
   */
  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  /**
   * Replace all messages
   */
  const setAllMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Go to a specific step
   */
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  /**
   * Go to next step (increment by 1)
   */
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  /**
   * Save current state to history (for back navigation)
   */
  const saveSnapshot = useCallback((data: T) => {
    setConversationHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        data,
        messages: [...messages],
      },
    ]);
  }, [currentStep, messages]);

  /**
   * Go back to previous snapshot
   */
  const goBack = useCallback(() => {
    if (conversationHistory.length === 0) {
      console.warn('No conversation history to go back to');
      return;
    }

    const lastSnapshot = conversationHistory[conversationHistory.length - 1];

    // Restore state from snapshot
    setCurrentStep(lastSnapshot.step);
    setMessages(lastSnapshot.messages);

    // Remove last snapshot from history
    setConversationHistory((prev) => prev.slice(0, -1));
  }, [conversationHistory]);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  /**
   * Check if can go back
   */
  const canGoBack = conversationHistory.length > 0;

  /**
   * Get last message
   */
  const getLastMessage = useCallback((): Message | undefined => {
    return messages[messages.length - 1];
  }, [messages]);

  /**
   * Get messages count
   */
  const messagesCount = messages.length;

  /**
   * Get message at index
   */
  const getMessageAt = useCallback((index: number): Message | undefined => {
    return messages[index];
  }, [messages]);

  /**
   * Update message at index
   */
  const updateMessageAt = useCallback((index: number, message: Partial<Message>) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[index]) {
        newMessages[index] = { ...newMessages[index], ...message };
      }
      return newMessages;
    });
  }, []);

  /**
   * Remove message at index
   */
  const removeMessageAt = useCallback((index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    // State
    messages,
    currentStep,
    conversationHistory,
    canGoBack,
    messagesCount,

    // Message management
    addMessage,
    addMessages,
    setAllMessages,
    clearMessages,
    getLastMessage,
    getMessageAt,
    updateMessageAt,
    removeMessageAt,

    // Step management
    goToStep,
    goToNextStep,

    // Navigation
    goBack,
    saveSnapshot,
    clearHistory,

    // Refs
    messagesEndRef,
  };
}
