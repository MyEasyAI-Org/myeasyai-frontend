import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Dumbbell,
  Facebook,
  FileText,
  GraduationCap,
  Hash,
  Heart,
  Home,
  Instagram,
  Laptop,
  Laugh,
  Lightbulb,
  Linkedin,
  MessageSquare,
  MoreHorizontal,
  Music,
  Send,
  Smartphone,
  Smile,
  Sparkles,
  Store,
  Tag,
  Twitter,
  Utensils,
  Video,
  Wrench,
  Youtube,
} from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import type {
  BusinessNiche,
  ContentMessage,
  ContentTone,
  ContentType,
  SocialNetwork,
} from '../types';
import {
  BUSINESS_NICHES,
  CONTENT_TONES,
  CONTENT_TYPES,
  SOCIAL_NETWORKS,
} from '../constants';

type ContentChatPanelProps = {
  messages: ContentMessage[];
  currentStep: number;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  isGenerating: boolean;
  selectedNetworks: SocialNetwork[];
  selectedContentTypes: ContentType[];
  canGoBack: boolean;
  onSendMessage: () => void;
  onNicheSelect: (niche: BusinessNiche) => void;
  onToneSelect: (tone: ContentTone) => void;
  onNetworkToggle: (network: SocialNetwork) => void;
  onContentTypeToggle: (contentType: ContentType) => void;
  onConfirmNetworks: () => void;
  onConfirmContentTypes: () => void;
  onGoBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ICON_MAP: Record<string, React.ElementType> = {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  FileText,
  MessageSquare,
  Smartphone,
  Video,
  Calendar,
  Lightbulb,
  Hash,
  Clock,
  Utensils,
  Store,
  Briefcase,
  Heart,
  Sparkles,
  GraduationCap,
  Laptop,
  Dumbbell,
  Home,
  Wrench,
  MoreHorizontal,
  Smile,
  Laugh,
  BookOpen,
  Tag,
};

export function ContentChatPanel({
  messages,
  currentStep,
  inputMessage,
  setInputMessage,
  isGenerating,
  selectedNetworks,
  selectedContentTypes,
  canGoBack,
  onSendMessage,
  onNicheSelect,
  onToneSelect,
  onNetworkToggle,
  onContentTypeToggle,
  onConfirmNetworks,
  onConfirmContentTypes,
  onGoBack,
  messagesEndRef,
}: ContentChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const renderIcon = (iconName: string, className: string = 'h-4 w-4') => {
    const IconComponent = ICON_MAP[iconName];
    if (!IconComponent) return null;
    return <IconComponent className={className} />;
  };

  return (
    <div className="w-full md:w-[45%] lg:w-[35%] border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 flex flex-col h-[55vh] md:h-full">
      {/* Chat Header */}
      <div className="border-b border-slate-800 p-2.5 sm:p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white">
            Assistente de Conteudo
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-lg p-2.5 sm:p-3 md:p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-400">
                    AI Assistant
                  </span>
                </div>
              )}
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.content}
              </p>

              {/* Niche Selector */}
              {message.showNicheSelector && (
                <div className="mt-2.5 sm:mt-3 md:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {BUSINESS_NICHES.map((niche) => (
                    <button
                      key={niche.id}
                      onClick={() => onNicheSelect(niche.id)}
                      className="flex items-center space-x-1.5 sm:space-x-2 rounded-lg border border-slate-600 bg-slate-700 p-2 sm:p-2.5 md:p-3 text-left transition-colors hover:border-orange-500 hover:bg-slate-600 text-slate-300"
                    >
                      {renderIcon(niche.icon, 'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0')}
                      <span className="text-[10px] sm:text-xs font-medium">{niche.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Tone Selector */}
              {message.showToneSelector && (
                <div className="mt-2.5 sm:mt-3 md:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {CONTENT_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => onToneSelect(tone.id)}
                      className="flex flex-col items-start rounded-lg border border-slate-600 bg-slate-700 p-2 sm:p-2.5 md:p-3 text-left transition-colors hover:border-orange-500 hover:bg-slate-600 text-slate-300"
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        {renderIcon(tone.icon, 'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0')}
                        <span className="text-[10px] sm:text-xs font-medium">{tone.name}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-2">
                        {tone.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Network Selector */}
              {message.showNetworkSelector && (
                <div className="mt-2.5 sm:mt-3 md:mt-4">
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {SOCIAL_NETWORKS.map((network) => {
                      const isSelected = selectedNetworks.includes(network.id);
                      return (
                        <button
                          key={network.id}
                          onClick={() => onNetworkToggle(network.id)}
                          className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg border p-2 sm:p-2.5 md:p-3 text-left transition-colors ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-slate-600 bg-slate-700 hover:border-orange-500 hover:bg-slate-600 text-slate-300'
                          }`}
                        >
                          {renderIcon(network.icon, 'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0')}
                          <span className="text-[10px] sm:text-xs font-medium">
                            {network.name}
                          </span>
                          {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedNetworks.length > 0 && (
                    <button
                      onClick={onConfirmNetworks}
                      className="mt-2.5 sm:mt-3 md:mt-4 w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-700 transition-colors"
                    >
                      Continuar ({selectedNetworks.length} selecionadas)
                    </button>
                  )}
                </div>
              )}

              {/* Content Type Selector */}
              {message.showContentTypeSelector && (
                <div className="mt-2.5 sm:mt-3 md:mt-4">
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {CONTENT_TYPES.map((contentType) => {
                      const isSelected = selectedContentTypes.includes(
                        contentType.id,
                      );
                      return (
                        <button
                          key={contentType.id}
                          onClick={() => onContentTypeToggle(contentType.id)}
                          className={`flex flex-col items-start rounded-lg border p-2 sm:p-2.5 md:p-3 text-left transition-colors ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-slate-600 bg-slate-700 hover:border-orange-500 hover:bg-slate-600 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 sm:space-x-2 w-full">
                            {renderIcon(contentType.icon, 'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0')}
                            <span className="text-[10px] sm:text-xs font-medium flex-1">
                              {contentType.name}
                            </span>
                            {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-2">
                            {contentType.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedContentTypes.length > 0 && (
                    <button
                      onClick={onConfirmContentTypes}
                      className="mt-2.5 sm:mt-3 md:mt-4 w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-700 transition-colors"
                    >
                      Gerar Conteudo ({selectedContentTypes.length} tipos)
                    </button>
                  )}
                </div>
              )}

              {/* Options Buttons */}
              {message.options && (
                <div className="mt-2.5 sm:mt-3 md:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {message.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Handle option click based on current step
                      }}
                      className="flex items-center space-x-1.5 sm:space-x-2 rounded-lg border border-slate-600 bg-slate-700 p-2 sm:p-2.5 md:p-3 text-left transition-colors hover:border-orange-500 hover:bg-slate-600 text-slate-300"
                    >
                      {option.icon && renderIcon(option.icon, 'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0')}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-xs font-medium block">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-2.5 sm:p-3 md:p-4 bg-slate-800 text-slate-100 border border-slate-700">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 animate-spin" />
                <span className="text-[10px] sm:text-xs font-semibold text-orange-400">
                  Gerando conteudo...
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Go Back Button */}
      {canGoBack && (
        <div className="border-t border-slate-800 px-2.5 sm:px-3 md:px-4 pt-2 sm:pt-3 pb-1.5 sm:pb-2">
          <button
            onClick={onGoBack}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border-2 border-orange-500/30 bg-orange-500/10 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-[-4px] transition-transform" />
            <span className="text-xs sm:text-sm font-semibold">
              Voltar a pergunta anterior
            </span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-800 p-2.5 sm:p-3 md:p-4">
        <div className="flex space-x-1.5 sm:space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={
              isGenerating ||
              currentStep === 0 ||
              currentStep === 3 ||
              currentStep === 4 ||
              currentStep === 5
            }
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
          <button
            onClick={onSendMessage}
            disabled={
              !inputMessage.trim() ||
              isGenerating ||
              currentStep === 0 ||
              currentStep === 3 ||
              currentStep === 4 ||
              currentStep === 5
            }
            className="rounded-lg bg-orange-600 p-1.5 sm:p-2 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
