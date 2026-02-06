import { Send, Bot, User, GraduationCap, Sparkles, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useConfiguratorStore } from '../../my-easy-avatar/store';
import type { ChatMessage, ConversationStep, SkillLevel, StudyMotivation } from '../types';
import { SKILL_LEVELS, TARGET_SKILL_LEVELS, STUDY_MOTIVATIONS, WEEKLY_HOURS_OPTIONS, DEADLINE_OPTIONS } from '../constants';

interface StudyPlanChatPanelProps {
  messages: ChatMessage[];
  currentStep: ConversationStep;
  inputMessage: string;
  isGenerating: boolean;
  generatingStep?: string | null;
  hasError?: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSkillLevelSelect?: (level: SkillLevel) => void;
  onTargetLevelSelect?: (level: SkillLevel) => void;
  onMotivationSelect?: (motivation: StudyMotivation) => void;
  onWeeklyHoursSelect?: (hours: number) => void;
  onDeadlineSelect?: (weeks: number) => void;
}

// Simple markdown renderer component
function MessageContent({ text }: { text: string }) {
  // Split by bold markers and render
  const parts = text.split(/(\*\*.*?\*\*|_.*?_|\n)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Create a stable key from content + position
        const key = `${part.slice(0, 10)}-${index}`;

        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <em key={key} className="italic text-slate-300">{part.slice(1, -1)}</em>;
        }
        if (part === '\n') {
          return <br key={key} />;
        }
        return <span key={key}>{part}</span>;
      })}
    </>
  );
}

// Generation step labels
const GENERATION_STEPS: Record<string, { label: string; icon: string }> = {
  iniciando: { label: 'Iniciando...', icon: '🚀' },
  analisando: { label: 'Analisando seu perfil', icon: '🔍' },
  planejando: { label: 'Estruturando o plano', icon: '📋' },
  criando: { label: 'Criando as lições', icon: '✍️' },
  finalizando: { label: 'Finalizando', icon: '✨' },
};

export function StudyPlanChatPanel({
  messages,
  currentStep,
  inputMessage,
  isGenerating,
  generatingStep,
  hasError,
  onInputChange,
  onSendMessage,
  onSkillLevelSelect,
  onTargetLevelSelect,
  onMotivationSelect,
  onWeeklyHoursSelect,
  onDeadlineSelect,
}: StudyPlanChatPanelProps) {
  // Avatar data from store
  const avatarName = useConfiguratorStore((state) => state.avatarName);
  const avatarSelfie = useConfiguratorStore((state) => state.avatarSelfie);
  const loadSavedAvatar = useConfiguratorStore((state) => state.loadSavedAvatar);
  const assets = useConfiguratorStore((state) => state.assets);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved avatar on mount
  useEffect(() => {
    if (assets.length > 0) {
      loadSavedAvatar();
    }
  }, [assets.length, loadSavedAvatar]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Display name for the assistant
  const displayName = avatarName || 'Professor IA';

  // Get current generation step info
  const currentGenStep = generatingStep ? GENERATION_STEPS[generatingStep] : null;

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Chat Header with Avatar */}
      <div className="border-b border-slate-800 bg-slate-800/50 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar Image */}
          <div className="relative">
            {avatarSelfie ? (
              <img
                src={avatarSelfie}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/50"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            )}
            {/* Online/Generating indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${
              isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
            }`} />
          </div>

          {/* Avatar Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{displayName}</h3>
              <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                <Sparkles className="h-3 w-3" />
                Professor
              </span>
              {isGenerating && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Trabalhando...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isGenerating && currentGenStep
                ? `${currentGenStep.icon} ${currentGenStep.label}`
                : 'Seu tutor de aprendizado personalizado'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar/User Icon */}
              {msg.role === 'assistant' ? (
                msg.isError ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                ) : avatarSelfie ? (
                  <img
                    src={avatarSelfie}
                    alt={displayName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-br-md bg-blue-600 text-white'
                    : msg.isError
                    ? 'rounded-bl-md bg-red-900/30 border border-red-500/30 text-slate-100'
                    : 'rounded-bl-md bg-slate-800 text-slate-100'
                }`}
              >
                {msg.role === 'assistant' && (
                  <p className={`mb-1 text-xs font-medium ${msg.isError ? 'text-red-400' : 'text-purple-400'}`}>
                    {msg.isError ? 'Oops!' : displayName}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  <MessageContent text={msg.content} />
                </p>
                {msg.isError && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
                    <RefreshCw className="h-3 w-3" />
                    <span>Digite "gerar" para tentar novamente</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Enhanced Loading indicator */}
          {isGenerating && (
            <div className="flex items-end gap-2">
              {avatarSelfie ? (
                <img
                  src={avatarSelfie}
                  alt={displayName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-purple-500/30 animate-pulse"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 min-w-[200px]">
                {currentGenStep ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      <span className="text-sm text-slate-300">{currentGenStep.label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-slate-500">Isso pode levar alguns segundos...</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error retry hint */}
      {hasError && currentStep === 'review' && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-red-900/20 border border-red-500/30 px-4 py-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Algo deu errado. Digite <strong>"gerar"</strong> para tentar novamente.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-slate-800 p-4">
        {currentStep === 'current_level' && onSkillLevelSelect && (
          <div className="space-y-2">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onSkillLevelSelect(level.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-all hover:bg-slate-700 hover:border-purple-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="font-semibold">{level.label}</div>
                <div className="text-xs text-slate-400">{level.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'target_level' && onTargetLevelSelect && (
          <div className="space-y-2">
            {TARGET_SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onTargetLevelSelect(level.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-all hover:bg-slate-700 hover:border-purple-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="font-semibold">{level.label}</div>
                <div className="text-xs text-slate-400">{level.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'time_availability' && onWeeklyHoursSelect && (
          <div className="space-y-2">
            {WEEKLY_HOURS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onWeeklyHoursSelect(option.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-all hover:bg-slate-700 hover:border-purple-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'deadline' && onDeadlineSelect && (
          <div className="space-y-2">
            {DEADLINE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onDeadlineSelect(option.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-all hover:bg-slate-700 hover:border-purple-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 'motivation' && onMotivationSelect && (
          <div className="space-y-2">
            {STUDY_MOTIVATIONS.map((motivation) => (
              <button
                key={motivation.value}
                onClick={() => onMotivationSelect(motivation.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-all hover:bg-slate-700 hover:border-purple-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <div className="font-semibold">{motivation.label}</div>
                <div className="text-xs text-slate-400">{motivation.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Input */}
      {(currentStep === 'skill_selection' || currentStep === 'review') && (
        <div className="border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasError ? 'Digite "gerar" para tentar novamente...' : 'Manda sua mensagem...'}
              disabled={isGenerating}
              className={`flex-1 rounded-lg border bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                hasError
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:border-purple-500 focus:ring-purple-500/50'
              }`}
            />
            <button
              onClick={onSendMessage}
              disabled={isGenerating || !inputMessage.trim()}
              className={`rounded-lg p-2 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer ${
                hasError ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
