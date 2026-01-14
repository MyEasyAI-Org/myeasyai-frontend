import React, { useRef } from 'react';
import { Send, ArrowLeft, Briefcase, FileText } from 'lucide-react';
import type { ChatMessage, ConversationStep, CareerLevel, TemplateStyle, ResumeLanguage } from '../types';
import { CAREER_LEVELS, TEMPLATE_STYLES, RESUME_LANGUAGES, INDUSTRIES } from '../constants';

interface ResumeChatPanelProps {
  messages: ChatMessage[];
  currentStep: ConversationStep;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  isGenerating: boolean;
  canGoBack: boolean;
  onSendMessage: () => void;
  onCareerLevelSelect: (level: CareerLevel) => void;
  onTemplateStyleSelect: (style: TemplateStyle) => void;
  onLanguageSelect: (lang: ResumeLanguage) => void;
  onIndustrySelect: (industry: string) => void;
  onGoBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ResumeChatPanel({
  messages,
  currentStep,
  inputMessage,
  setInputMessage,
  isGenerating,
  canGoBack,
  onSendMessage,
  onCareerLevelSelect,
  onTemplateStyleSelect,
  onLanguageSelect,
  onIndustrySelect,
  onGoBack,
  messagesEndRef,
}: ResumeChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex w-[35%] flex-col border-r border-slate-800 bg-slate-900/50">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center space-x-3">
          <Briefcase className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Assistente de Currículo</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Step-specific selectors */}
        {currentStep === 'career_level' && !isGenerating && (
          <div className="space-y-2">
            {CAREER_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onCareerLevelSelect(level.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left transition-all hover:border-purple-500 hover:bg-slate-700"
              >
                <div className="font-medium text-white">{level.label}</div>
                <div className="text-sm text-gray-400">{level.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'template_style' && !isGenerating && (
          <div className="space-y-2">
            {TEMPLATE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onTemplateStyleSelect(style.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left transition-all hover:border-purple-500 hover:bg-slate-700"
              >
                <div className="font-medium text-white">{style.label}</div>
                <div className="text-sm text-gray-400">{style.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'language' && !isGenerating && (
          <div className="space-y-2">
            {RESUME_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onLanguageSelect(lang.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left transition-all hover:border-purple-500 hover:bg-slate-700"
              >
                <div className="font-medium text-white">
                  {lang.flag} {lang.label}
                </div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'industry' && !isGenerating && (
          <div className="grid grid-cols-2 gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                onClick={() => onIndustrySelect(industry)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm text-white transition-all hover:border-purple-500 hover:bg-slate-700"
              >
                {industry}
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isGenerating && (
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
            <span className="text-sm">Gerando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 p-4">
        {canGoBack && (
          <button
            onClick={onGoBack}
            className="mb-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        )}
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua resposta..."
            disabled={isGenerating}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
          />
          <button
            onClick={onSendMessage}
            disabled={isGenerating || !inputMessage.trim()}
            className="rounded-lg bg-purple-600 p-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
