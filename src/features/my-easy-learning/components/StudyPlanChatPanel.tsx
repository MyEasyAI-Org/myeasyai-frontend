import { Send } from 'lucide-react';
import type { ChatMessage, ConversationStep, SkillLevel, StudyMotivation } from '../types';
import { SKILL_LEVELS, TARGET_SKILL_LEVELS, STUDY_MOTIVATIONS, WEEKLY_HOURS_OPTIONS, DEADLINE_OPTIONS } from '../constants';

interface StudyPlanChatPanelProps {
  messages: ChatMessage[];
  currentStep: ConversationStep;
  inputMessage: string;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSkillLevelSelect?: (level: SkillLevel) => void;
  onTargetLevelSelect?: (level: SkillLevel) => void;
  onMotivationSelect?: (motivation: StudyMotivation) => void;
  onWeeklyHoursSelect?: (hours: number) => void;
  onDeadlineSelect?: (weeks: number) => void;
}

export function StudyPlanChatPanel({
  messages,
  currentStep,
  inputMessage,
  isGenerating,
  onInputChange,
  onSendMessage,
  onSkillLevelSelect,
  onTargetLevelSelect,
  onMotivationSelect,
  onWeeklyHoursSelect,
  onDeadlineSelect,
}: StudyPlanChatPanelProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-800 p-4">
        {currentStep === 'current_level' && onSkillLevelSelect && (
          <div className="space-y-2">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onSkillLevelSelect(level.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-colors hover:bg-slate-700"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-colors hover:bg-slate-700"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-colors hover:bg-slate-700"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-colors hover:bg-slate-700"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left text-white transition-colors hover:bg-slate-700"
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
              placeholder="Digite sua mensagem..."
              disabled={isGenerating}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={onSendMessage}
              disabled={isGenerating || !inputMessage.trim()}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
