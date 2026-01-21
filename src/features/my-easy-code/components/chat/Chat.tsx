import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { ChatMessage, type Message } from './ChatMessage';
import { streamText, getSystemPrompt, wrapUserMessage, type StreamMessage } from '../../lib/gemini';
import { parseMessage } from '../../lib/runtime';

// Messages for fixing errors
const FIXING_MESSAGES = [
  '🔧 Corrigindo o erro...',
  '🔍 Analisando o problema...',
  '⚡ Aplicando correção...',
  '🛠️ Ajustando o código...',
  '🔄 Refatorando a solução...',
  '🎯 Eliminando o bug...',
];

// Mensagens animadas de "pensando"
const THINKING_MESSAGES = [
  '🧠 Pensando na melhor solução...',
  '✨ Criando algo incrível...',
  '🎨 Desenhando a interface...',
  '⚡ Preparando a mágica...',
  '🔧 Organizando o código...',
  '🚀 Construindo seu projeto...',
  '💡 Tendo ideias brilhantes...',
  '🎯 Focando nos detalhes...',
  '🌟 Trabalhando na perfeição...',
  '🔮 Transformando ideias em código...',
  '🏗️ Arquitetando a solução...',
  '🎪 Preparando o show...',
  '🌈 Adicionando os toques finais...',
  '⚙️ Ajustando as engrenagens...',
  '🎭 Dando vida ao projeto...',
];

interface ChatProps {
  onArtifactReceived?: (artifact: any) => void;
  className?: string;
}

export interface ChatRef {
  sendErrorFix: (errorMessage: string, retryCount: number) => Promise<void>;
}

const MAX_AUTO_FIX_RETRIES = 3;

export const Chat = memo(forwardRef<ChatRef, ChatProps>(({ onArtifactReceived, className = '' }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotate thinking messages while loading
  useEffect(() => {
    if (isLoading) {
      // Start with a random message
      setThinkingMessageIndex(Math.floor(Math.random() * THINKING_MESSAGES.length));

      thinkingIntervalRef.current = setInterval(() => {
        setThinkingMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 2500); // Change message every 2.5 seconds
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    }

    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    };
  }, [isLoading]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingMessageIndex]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        // Build message history for context
        const streamMessages: StreamMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        // Wrap user message to enforce XML output
        streamMessages.push({ role: 'user', content: wrapUserMessage(content) });

        let fullResponse = '';
        let hasStartedArtifact = false;

        await streamText({
          messages: streamMessages,
          systemPrompt: getSystemPrompt(),
          temperature: 0.7,
          onToken: (token) => {
            fullResponse += token;

            // Check if we're inside an artifact (don't show raw XML to user)
            if (fullResponse.includes('<boltArtifact') && !hasStartedArtifact) {
              hasStartedArtifact = true;
              console.log('[Chat] Artifact detected, switching to progress display');
            }

            // Show progress message instead of raw XML during streaming
            let displayContent: string;
            if (hasStartedArtifact) {
              // Count how many files have been generated so far
              const fileMatches = fullResponse.match(/<boltAction type="file"/g);
              const fileCount = fileMatches ? fileMatches.length : 0;
              displayContent = `🔄 Gerando código... (${fileCount} arquivos)`;
            } else {
              displayContent = fullResponse;
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: displayContent }
                  : m
              )
            );
          },
          onComplete: (text) => {
            console.log('[Chat] onComplete - raw text length:', text.length);
            console.log('[Chat] onComplete - has boltArtifact:', text.includes('<boltArtifact'));
            console.log('[Chat] onComplete - has boltAction:', text.includes('<boltAction'));
            console.log('[Chat] onComplete - first 500 chars:', text.substring(0, 500));
            console.log('[Chat] onComplete - last 500 chars:', text.substring(text.length - 500));

            // Parse for artifacts
            const parsed = parseMessage(text);
            console.log('[Chat] Parsed artifacts:', parsed.artifacts.length);
            console.log('[Chat] Parsed text length:', parsed.text.length);

            if (parsed.artifacts.length > 0) {
              console.log('[Chat] First artifact:', parsed.artifacts[0].title);
              console.log('[Chat] First artifact actions:', parsed.artifacts[0].actions.length);
              // Log all file actions
              const fileActions = parsed.artifacts[0].actions.filter(a => a.type === 'file');
              console.log('[Chat] File actions found:', fileActions.map(a => a.type === 'file' ? { path: a.filePath, contentLength: a.content.length } : a));
            }

            // Update message with final content (show only non-artifact text)
            // If artifacts were found, show cleaned text (even if empty)
            // Otherwise show the full response
            const displayContent = parsed.artifacts.length > 0
              ? (parsed.text.trim() || '✅ Projeto gerado! Verifique o terminal e o preview.')
              : text;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: displayContent, isStreaming: false }
                  : m
              )
            );

            // Notify about artifacts
            for (const artifact of parsed.artifacts) {
              console.log('[Chat] Sending artifact to runner:', artifact.title, 'with', artifact.actions.length, 'actions');
              onArtifactReceived?.(artifact);
            }
          },
          onError: (error) => {
            console.error('Stream error:', error);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: `Erro: ${error.message}`,
                      isStreaming: false,
                    }
                  : m
              )
            );
          },
        });
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, onArtifactReceived]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  // Send an auto-fix request when an error is detected
  const sendErrorFix = useCallback(
    async (errorMessage: string, retryCount: number) => {
      if (retryCount >= MAX_AUTO_FIX_RETRIES) {
        console.log('[Chat] Max auto-fix retries reached');
        // Add a message explaining we couldn't fix the error
        const failMessage: Message = {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Não consegui corrigir o erro após ${MAX_AUTO_FIX_RETRIES} tentativas. Por favor, descreva o que você gostaria de fazer ou forneça mais detalhes sobre o projeto.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, failMessage]);
        return;
      }

      // Create a system message about the error
      const errorDisplayMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'user',
        content: `🔴 Erro detectado (tentativa ${retryCount + 1}/${MAX_AUTO_FIX_RETRIES}):\n\`\`\`\n${errorMessage.substring(0, 500)}\n\`\`\``,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorDisplayMessage]);

      // Create assistant message placeholder
      const assistantId = `assistant-fix-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        // Build message history for context
        const streamMessages: StreamMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Add the error fix request
        const fixPrompt = `O código anterior gerou o seguinte erro:

\`\`\`
${errorMessage}
\`\`\`

Por favor, corrija o erro e gere o código novamente. Analise cuidadosamente:
1. Se for um erro de "Cannot access X before initialization", verifique a ordem de declaração das funções
2. Se for um erro de módulo não encontrado, verifique os imports e dependências
3. Se for um erro de tipo, verifique se os tipos estão corretos

Gere APENAS os arquivos que precisam ser corrigidos, não precisa gerar todos novamente.`;

        streamMessages.push({ role: 'user', content: wrapUserMessage(fixPrompt) });

        let fullResponse = '';
        let hasStartedArtifact = false;

        await streamText({
          messages: streamMessages,
          systemPrompt: getSystemPrompt(),
          temperature: 0.5, // Lower temperature for more precise fixes
          onToken: (token) => {
            fullResponse += token;

            if (fullResponse.includes('<boltArtifact') && !hasStartedArtifact) {
              hasStartedArtifact = true;
            }

            let displayContent: string;
            if (hasStartedArtifact) {
              const fileMatches = fullResponse.match(/<boltAction type="file"/g);
              const fileCount = fileMatches ? fileMatches.length : 0;
              const fixingMessage = FIXING_MESSAGES[retryCount % FIXING_MESSAGES.length];
              displayContent = `${fixingMessage} (${fileCount} arquivos)`;
            } else {
              displayContent = fullResponse;
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: displayContent }
                  : m
              )
            );
          },
          onComplete: (text) => {
            console.log('[Chat] Auto-fix onComplete - raw text length:', text.length);

            const parsed = parseMessage(text);

            const displayContent = parsed.artifacts.length > 0
              ? (parsed.text.trim() || '🔄 Aplicando correção...')
              : text;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: displayContent, isStreaming: false }
                  : m
              )
            );

            // Notify about artifacts
            for (const artifact of parsed.artifacts) {
              console.log('[Chat] Sending fix artifact to runner:', artifact.title);
              onArtifactReceived?.(artifact);
            }
          },
          onError: (error) => {
            console.error('Auto-fix stream error:', error);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: `Erro ao tentar corrigir: ${error.message}`,
                      isStreaming: false,
                    }
                  : m
              )
            );
          },
        });
      } catch (error) {
        console.error('Auto-fix error:', error);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, onArtifactReceived]
  );

  // Expose sendErrorFix to parent component
  useImperativeHandle(ref, () => ({
    sendErrorFix,
  }), [sendErrorFix]);

  return (
    <div className={`flex h-full flex-col bg-gray-900 ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-full bg-purple-600/20 p-4">
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-200">
              MyEasyCode
            </h2>
            <p className="mb-6 max-w-md text-gray-400">
              Crie aplicações web completas diretamente no seu navegador.
              Descreva o que você quer criar e eu vou gerar o código.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.title}
                  onClick={() => handleSend(suggestion.prompt)}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-left transition-colors hover:border-gray-600 hover:bg-gray-700"
                >
                  <p className="font-medium text-gray-200">{suggestion.title}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {suggestion.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {/* Animated thinking indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 px-4 py-3 bg-gray-800/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-gray-300 animate-pulse transition-all duration-500">
                    {THINKING_MESSAGES[thinkingMessageIndex]}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
        placeholder="Descreva o que você quer criar..."
      />
    </div>
  );
}));

Chat.displayName = 'Chat';

const SUGGESTIONS = [
  {
    title: 'Calculadora Científica',
    description: 'Com visual realista de calculadora física',
    prompt: `Crie uma calculadora científica com visual realista de calculadora física (como uma Casio fx-82).

Requisitos:
- Interface que pareça uma calculadora de verdade com botões 3D
- Display LCD com efeito de cristal líquido
- Operações básicas: +, -, ×, ÷
- Operações científicas: sin, cos, tan, log, ln, √, x², xʸ, π
- Histórico das últimas 5 operações
- Suporte a parênteses e ordem de operações
- Animação de clique nos botões
- Sons de clique (opcional)

Use React, TypeScript e CSS moderno. Crie a lógica de cálculo completa.`,
  },
  {
    title: 'Kanban Board',
    description: 'Gerenciador de tarefas estilo Trello',
    prompt: `Crie um Kanban Board completo estilo Trello com as seguintes funcionalidades:

- 3 colunas: "A Fazer", "Em Progresso", "Concluído"
- Drag and drop entre colunas (use a API nativa de drag)
- Criar, editar e excluir cards
- Cada card tem: título, descrição, cor/tag, data de criação
- Modal para edição detalhada do card
- Persistência no localStorage
- Filtro por cor/tag
- Contador de cards por coluna
- Animações suaves nas transições
- Design moderno com glassmorphism

Use React e TypeScript. Implemente toda a lógica de drag and drop sem bibliotecas externas.`,
  },
  {
    title: 'Pomodoro Timer',
    description: 'Timer de produtividade com estatísticas',
    prompt: `Crie um Pomodoro Timer profissional com:

- Timer visual circular animado (não apenas texto)
- Modos: Pomodoro (25min), Pausa Curta (5min), Pausa Longa (15min)
- Notificações sonoras e visuais quando o timer termina
- Contador de ciclos completados no dia
- Gráfico de estatísticas da semana (barras)
- Histórico de sessões com data/hora
- Configurações personalizáveis de tempo
- Tema claro/escuro
- Persistência de dados no localStorage
- Atalhos de teclado (Space para pausar, R para resetar)

Visual inspirado em apps como Forest ou Focus To-Do. Use React e TypeScript.`,
  },
  {
    title: 'Conversor de Moedas',
    description: 'Com gráfico de variação e múltiplas moedas',
    prompt: `Crie um conversor de moedas profissional com:

- Conversão entre BRL, USD, EUR, GBP, JPY, BTC
- Taxas de câmbio simuladas (pode usar dados fixos realistas)
- Gráfico de variação dos últimos 7 dias (linha)
- Inverter moedas com um clique
- Histórico das últimas 10 conversões
- Favoritos para pares de moedas frequentes
- Formatação correta de cada moeda (símbolos, decimais)
- Animação suave nos valores
- Cards com variação % do dia (simulada)
- Design moderno com gradientes

Use React, TypeScript e crie um componente de gráfico simples com SVG (sem biblioteca externa).`,
  },
];

export default Chat;
