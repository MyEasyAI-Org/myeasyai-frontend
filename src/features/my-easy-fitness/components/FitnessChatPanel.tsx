import { MessageSquare, Send, Sparkles } from 'lucide-react';
import type React from 'react';
import { useRef, useEffect } from 'react';
import type { FitnessMessage } from '../types';

type FitnessChatPanelProps = {
  messages: FitnessMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  isGenerating: boolean;
  onSendMessage: () => void;
};

export function FitnessChatPanel({
  messages,
  inputMessage,
  setInputMessage,
  isGenerating,
  onSendMessage,
}: FitnessChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="w-[28%] min-w-[300px] min-h-0 border-r border-slate-800 bg-slate-900/50 flex flex-col">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b border-slate-800 p-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-lime-400" />
          <h2 className="text-lg font-semibold text-white">
            Assistente Fitness
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-lime-500 to-green-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-lime-400" />
                  <span className="text-xs font-semibold text-lime-400">
                    Assistente Fitness
                  </span>
                </div>
              )}
              <p
                className="text-sm leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-4 bg-slate-800 text-slate-100 border border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-lime-400 animate-spin" />
                <span className="text-xs font-semibold text-lime-400">
                  Pensando...
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-800 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pergunte sobre treinos, dieta, suplementos..."
            disabled={isGenerating}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isGenerating}
            className="rounded-lg bg-lime-600 p-2 text-white hover:bg-lime-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
