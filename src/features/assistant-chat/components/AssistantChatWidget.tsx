import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import {
  X,
  Send,
  Maximize2,
  Minimize2,
  RotateCcw,
  User,
  Bot,
  ExternalLink,
  Zap,
  HelpCircle,
  DollarSign,
  Globe,
  Users,
  ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useAvatarWidget } from '../../../contexts/AvatarWidgetContext';
import { useAssistantChat } from '../hooks/useAssistantChat';
import { ROUTES } from '../../../router/routes';
import { useConfiguratorStore } from '../../my-easy-avatar/store';
import { ChatBubbleIcon } from './ChatBubbleIcon';
import { genieEffectStyles } from './GenieEffect';

// Product name mappings to routes
const PRODUCT_ROUTES: Record<string, string> = {
  myeasywebsite: ROUTES.MY_EASY_WEBSITE,
  'myeasy website': ROUTES.MY_EASY_WEBSITE,
  myeasysite: ROUTES.MY_EASY_WEBSITE,
  businessguru: ROUTES.BUSINESS_GURU,
  'business guru': ROUTES.BUSINESS_GURU,
  myeasypricing: ROUTES.MY_EASY_PRICING,
  'myeasy pricing': ROUTES.MY_EASY_PRICING,
  myeasycrm: ROUTES.MY_EASY_CRM,
  'myeasy crm': ROUTES.MY_EASY_CRM,
  myeasycontent: ROUTES.MY_EASY_CONTENT,
  'myeasy content': ROUTES.MY_EASY_CONTENT,
  myeasyavatar: ROUTES.MY_EASY_AVATAR,
  'myeasy avatar': ROUTES.MY_EASY_AVATAR,
  myeasycode: ROUTES.MY_EASY_CODE,
  'myeasy code': ROUTES.MY_EASY_CODE,
};

// Quick suggestions with icons
const QUICK_SUGGESTIONS = [
  {
    icon: HelpCircle,
    text: 'O que a plataforma faz?',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: DollarSign,
    text: 'Quanto custa?',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Globe,
    text: 'Criar meu site',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Users,
    text: 'Gerenciar clientes',
    color: 'from-orange-500 to-amber-600',
  },
];

/**
 * Check if text contains a product name and return the route
 */
function getProductRoute(text: string): string | null {
  const lowerText = text.toLowerCase().trim();

  if (PRODUCT_ROUTES[lowerText]) {
    return PRODUCT_ROUTES[lowerText];
  }

  for (const [productName, route] of Object.entries(PRODUCT_ROUTES)) {
    if (lowerText.includes(productName) || productName.includes(lowerText)) {
      return route;
    }
  }

  return null;
}

/**
 * AssistantChatWidget - Floating chat widget with Genie Effect animation
 */
export function AssistantChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'opening' | 'closing'>('idle');
  const [showChat, setShowChat] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleAnimation, setBubbleAnimation] = useState<'idle' | 'exploding' | 'appearing' | 'spinning-out' | 'spinning-in'>('idle');
  const [bubblePosition, setBubblePosition] = useState({ x: 16, y: 16 });
  const [isBubbleDragging, setIsBubbleDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const bubbleDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const bubbleInitialPositionRef = useRef<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const { isMinimized: isAvatarMinimized, position: avatarPosition, setPosition: setAvatarPosition, setIsChatOpen, setAnimationPhase } = useAvatarWidget();

  const { messages, isLoading, sendMessage, clearMessages } = useAssistantChat();

  // Get avatar name and selfie from store
  const avatarName = useConfiguratorStore((state) => state.avatarName);
  const avatarSelfie = useConfiguratorStore((state) => state.avatarSelfie);
  const loadSavedAvatar = useConfiguratorStore((state) => state.loadSavedAvatar);
  const assets = useConfiguratorStore((state) => state.assets);

  // Load saved avatar data on mount (when assets are available)
  useEffect(() => {
    if (assets.length > 0) {
      loadSavedAvatar();
    }
  }, [assets.length, loadSavedAvatar]);

  // Display name: use avatar name if set, otherwise "Assistente"
  const displayName = avatarName ? `Assistente (${avatarName})` : 'Assistente';

  // Calculate positions
  // When chat is CLOSED: bubble is at fixed position (bottom-right corner)
  // When chat is OPEN: chat panel is to the left of the avatar
  const avatarWidth = isAvatarMinimized ? 60 : 150;

  // Chat panel position (to the left of avatar when open)
  // Different offsets for minimized vs full avatar to maintain proper spacing
  const chatRight = isAvatarMinimized
    ? avatarPosition.x + avatarWidth + 8  // More gap for small avatar
    : avatarPosition.x + avatarWidth - 8; // Closer for large avatar

  // Inject CSS keyframes for genie effect
  useEffect(() => {
    const styleId = 'genie-effect-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = genieEffectStyles;
      document.head.appendChild(styleElement);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && showChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, showChat]);

  // Track if this was a drag or a click
  const wasDragRef = useRef(false);

  // Bubble drag handlers
  const handleBubbleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't start drag on touch for now - allow touch to be click
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    bubbleDragStartRef.current = { x: clientX, y: clientY };
    bubbleInitialPositionRef.current = { ...bubblePosition };
    wasDragRef.current = false;

    // Only set dragging on mouse (not touch) and after a small movement
    if (!('touches' in e)) {
      setIsBubbleDragging(true);
    }
  }, [bubblePosition]);

  const handleBubbleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!bubbleDragStartRef.current || !bubbleInitialPositionRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = bubbleDragStartRef.current.x - clientX;
    const deltaY = bubbleDragStartRef.current.y - clientY;

    // Only start dragging if moved more than 5px (to differentiate from click)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < 5 && !wasDragRef.current) return;

    // Mark that this is a drag, not a click
    wasDragRef.current = true;

    const newX = bubbleInitialPositionRef.current.x + deltaX;
    const newY = bubbleInitialPositionRef.current.y + deltaY;

    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 120;

    setBubblePosition({
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY),
    });
  }, []);

  const handleBubbleDragEnd = useCallback(() => {
    // Sync bubble position with avatar position when drag ends
    if (wasDragRef.current) {
      setAvatarPosition(bubblePosition);
    }
    setIsBubbleDragging(false);
    bubbleDragStartRef.current = null;
    bubbleInitialPositionRef.current = null;
  }, [bubblePosition, setAvatarPosition]);

  // Add/remove event listeners for bubble drag
  useEffect(() => {
    if (isBubbleDragging) {
      window.addEventListener('mousemove', handleBubbleDragMove);
      window.addEventListener('mouseup', handleBubbleDragEnd);
      window.addEventListener('touchmove', handleBubbleDragMove);
      window.addEventListener('touchend', handleBubbleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleBubbleDragMove);
      window.removeEventListener('mouseup', handleBubbleDragEnd);
      window.removeEventListener('touchmove', handleBubbleDragMove);
      window.removeEventListener('touchend', handleBubbleDragEnd);
    };
  }, [isBubbleDragging, handleBubbleDragMove, handleBubbleDragEnd]);

  // Handle opening the chat with Spin-Morph Effect
  const handleOpen = useCallback(() => {
    if (animationState !== 'idle') return;

    // Sync avatar position with bubble position before opening
    setAvatarPosition(bubblePosition);

    // Start bubble spin-out animation
    setBubbleAnimation('spinning-out');
    setAnimationState('opening');
    setAnimationPhase('exploding');

    // At halfway point of spin (400ms), hide bubble and show avatar spinning in
    setTimeout(() => {
      setShowBubble(false);
      setIsOpen(true);
      setIsChatOpen(true); // Show avatar 3D with spin entrance
      setAnimationPhase('appearing');
    }, 400);

    // Show chat panel with genie effect
    setTimeout(() => {
      setShowChat(true);
    }, 500);

    // Reset animation state after all animations complete
    setTimeout(() => {
      setAnimationState('idle');
      setBubbleAnimation('idle');
      setAnimationPhase('idle');
    }, 1200);
  }, [animationState, setIsChatOpen, setAnimationPhase, bubblePosition, setAvatarPosition]);

  // Handle bubble click - only open if it wasn't a drag
  const handleBubbleClick = useCallback(() => {
    if (!wasDragRef.current) {
      handleOpen();
    }
  }, [handleOpen]);

  // Handle closing the chat with Spin-Morph Effect (reverse)
  const handleClose = useCallback(() => {
    console.log('[ChatWidget] handleClose called at', Date.now(), '- animationState:', animationState);
    if (animationState !== 'idle') return;

    // Sync bubble position with avatar position before closing
    setBubblePosition(avatarPosition);

    console.log('[ChatWidget] Setting animationState to closing, animationPhase to disappearing');
    setAnimationState('closing');
    setAnimationPhase('disappearing');

    // Start avatar spin-out animation (avatar will spin for 800ms)
    console.log('[ChatWidget] Setting isChatOpen to false');
    setIsChatOpen(false);

    // Start closing animation for chat panel
    setTimeout(() => {
      setShowChat(false);
    }, 100);

    // After avatar finishes spinning out (800ms), show bubble spinning in
    setTimeout(() => {
      setShowBubble(true);
      setBubbleAnimation('spinning-in');
    }, 800);

    // Reset all states after bubble spin-in animation completes (800ms avatar + 800ms bubble)
    setTimeout(() => {
      setIsOpen(false);
      setAnimationState('idle');
      setBubbleAnimation('idle');
      setAnimationPhase('idle');
    }, 1600);
  }, [animationState, setIsChatOpen, setAnimationPhase, avatarPosition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleProductClick = useCallback((route: string) => {
    handleClose();
    setTimeout(() => navigate(route), 450);
  }, [navigate, handleClose]);

  const handleLinkClick = useCallback((href: string) => {
    handleClose();
    setTimeout(() => {
      if (href.startsWith('/')) {
        navigate(href);
      } else {
        window.open(href, '_blank');
      }
    }, 450);
  }, [navigate, handleClose]);

  // Check if text is a plan name
  const isPlanName = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    return ['individual', 'plus', 'premium'].includes(lowerText);
  }, []);

  const ProductLink = useCallback(({ children }: { children?: ReactNode }) => {
    const text = String(children ?? '');
    const route = getProductRoute(text);

    // Check if it's a product name
    if (route) {
      return (
        <button
          type="button"
          onClick={() => handleProductClick(route)}
          className="group inline-flex items-center gap-1 font-semibold text-purple-400 transition-all hover:text-purple-300"
        >
          {children}
          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      );
    }

    // Check if it's a plan name (Individual, Plus, Premium)
    if (isPlanName(text)) {
      return (
        <button
          type="button"
          onClick={() => handleLinkClick('/dashboard?tab=subscription')}
          className="group inline-flex items-center gap-1 font-semibold text-purple-400 transition-all hover:text-purple-300"
        >
          {children}
          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      );
    }

    return <strong className="font-semibold text-purple-300">{children}</strong>;
  }, [handleProductClick, isPlanName, handleLinkClick]);

  // Custom link renderer for markdown links
  const MarkdownLink = useCallback(({ href, children }: { href?: string; children?: ReactNode }) => {
    if (!href) return <>{children}</>;

    return (
      <button
        type="button"
        onClick={() => handleLinkClick(href)}
        className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600 hover:shadow-lg hover:shadow-purple-500/25"
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </button>
    );
  }, [handleLinkClick]);

  const widgetSize = isExpanded
    ? { width: '400px', height: '480px' }
    : { width: '340px', height: '400px' };

  // Get animation class based on state
  const getAnimationClass = () => {
    if (animationState === 'opening') return 'genie-open';
    if (animationState === 'closing') return 'genie-close';
    if (!showChat) return 'genie-hidden';
    return '';
  };

  return (
    <>
      {/* Chat Widget Container with Genie Effect */}
      <div
        className={`fixed z-50 ${getAnimationClass()}`}
        style={{
          bottom: `${avatarPosition.y}px`,
          right: `${chatRight}px`,
          width: widgetSize.width,
          height: widgetSize.height,
          transformOrigin: 'bottom right',
          visibility: showChat || animationState !== 'idle' ? 'visible' : 'hidden',
        }}
      >
        {/* Speech bubble tail - connects to avatar's mouth */}
        <div
          className="absolute z-20"
          style={{
            right: '-19px',
            bottom: isAvatarMinimized ? '28.5px' : '100px',
            width: 0,
            height: 0,
            borderTop: '14px solid transparent',
            borderBottom: '14px solid transparent',
            borderLeft: '20px solid rgb(15, 23, 42)',
            filter: 'drop-shadow(2px 0 3px rgba(168,85,247,0.2))',
          }}
        />
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/95 shadow-[0_0_15px_rgba(168,85,247,0.3),0_0_30px_rgba(59,130,246,0.2),0_0_45px_rgba(168,85,247,0.1)] ring-1 ring-purple-500/20 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              {/* Avatar selfie or default icon */}
              {avatarSelfie ? (
                <img
                  src={avatarSelfie}
                  alt={displayName}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-purple-500/50"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-400 to-purple-400">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">{displayName}</h3>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-slate-400">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
                  title="Nova conversa"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleExpand}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex h-full flex-col px-4">
                {/* Hero Section */}
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  {/* Icon */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/80 ring-1 ring-slate-700">
                      <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>

                  {/* Welcome Text */}
                  <h4 className="mb-1 text-lg font-bold text-white">
                    Como posso ajudar?
                  </h4>
                  <p className="mb-5 text-sm text-slate-400">
                    Tire suas dúvidas sobre a plataforma
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="pb-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Sugestões
                  </p>
                  <div className="space-y-1.5">
                    {QUICK_SUGGESTIONS.map((suggestion) => {
                      const Icon = suggestion.icon;
                      return (
                        <button
                          type="button"
                          key={suggestion.text}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="group flex w-full items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-left transition-all hover:border-slate-600 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-r ${suggestion.color}`}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="flex-1 text-sm text-slate-200 group-hover:text-white">
                            {suggestion.text}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div
                className="h-full overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-500/50 hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/70"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(168,85,247,0.5) rgba(30,41,59,0.5)',
                }}
              >
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        avatarSelfie ? (
                          <img
                            src={avatarSelfie}
                            alt={displayName}
                            className="mr-2 mt-0.5 h-6 w-6 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800">
                            <Bot className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                        )
                      )}
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'border border-slate-700 bg-slate-800/50 text-slate-200'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 text-slate-200">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-2 space-y-1 last:mb-0">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-2 space-y-1 last:mb-0 [counter-reset:item]">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="flex items-start gap-2 text-slate-200 [counter-increment:item] before:mt-0.5 before:flex before:h-4 before:w-4 before:shrink-0 before:items-center before:justify-center before:rounded before:bg-purple-500/20 before:text-[9px] before:font-bold before:text-purple-400 before:content-[counter(item)]">
                                    <span className="flex-1">{children}</span>
                                  </li>
                                ),
                                strong: ProductLink,
                                a: MarkdownLink,
                                h1: ({ children }) => (
                                  <h1 className="mb-2 text-base font-bold text-white">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="mb-1.5 mt-2 text-sm font-bold text-white">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-1 text-sm font-semibold text-purple-300">{children}</h3>
                                ),
                                code: ({ children }) => (
                                  <code className="rounded bg-slate-700 px-1 py-0.5 text-xs text-purple-300">{children}</code>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading */}
                  {isLoading && (
                    <div className="flex justify-start">
                      {avatarSelfie ? (
                        <img
                          src={avatarSelfie}
                          alt={displayName}
                          className="mr-2 mt-0.5 h-6 w-6 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800">
                          <Bot className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                      )}
                      <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800 p-3">
            <form
              onSubmit={handleSubmit}
              className={`flex items-center gap-2 rounded-lg border bg-slate-800/50 px-3 py-2 transition-all ${
                isFocused ? 'border-purple-500/50' : 'border-slate-700'
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Pergunte algo..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Bubble Icon - Magical animated comic style speech bubble */}
      {showBubble && (
        <div
          onMouseDown={handleBubbleDragStart}
          onTouchStart={handleBubbleDragStart}
          onClick={handleBubbleClick}
          className={`fixed z-[9999] group ${isBubbleDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
            bubbleAnimation === 'exploding' ? 'bubble-magic-explode' :
            bubbleAnimation === 'appearing' ? 'bubble-magic-appear' :
            bubbleAnimation === 'spinning-out' ? 'bubble-spin-to-avatar' :
            bubbleAnimation === 'spinning-in' ? 'bubble-spin-appear' :
            ''
          }`}
          style={{
            bottom: `${bubblePosition.y}px`,
            right: `${bubblePosition.x}px`,
            userSelect: 'none',
          }}
        >
          <div className="relative transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            {/* Premium WhatsApp-style speech bubble - unified shape */}
            <div
              className="relative"
              style={{
                width: '80px',
                height: '96px',
              }}
            >
              {/* Subtle pulse glow effect behind bubble */}
              <svg
                width="80"
                height="96"
                viewBox="0 0 80 96"
                className="absolute inset-0"
                style={{
                  filter: 'blur(8px)',
                  animation: 'bubblePulse 3s ease-in-out infinite',
                }}
              >
                <circle cx="40" cy="40" r="36" fill="rgba(139, 92, 246, 0.4)" />
                <path
                  d="M10 62 L25 62 L8 78 Z"
                  fill="rgba(139, 92, 246, 0.4)"
                  transform="rotate(25, 16, 62)"
                />
              </svg>
              {/* Unified bubble shape with tail */}
              <svg
                width="80"
                height="96"
                viewBox="0 0 80 96"
                className="absolute inset-0"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}
              >
                <defs>
                  <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                {/* Circle with WhatsApp-style tail */}
                <circle cx="40" cy="40" r="36" fill="url(#bubbleGrad)" />
                <path
                  d="M10 62 L25 62 L8 78 Z"
                  fill="url(#bubbleGrad)"
                  transform="rotate(25, 16, 62)"
                />
              </svg>
              {/* Avatar image with gradient border */}
              <div
                className="absolute rounded-full overflow-hidden"
                style={{
                  top: '4px',
                  left: '4px',
                  width: '72px',
                  height: '72px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  padding: '3px',
                }}
              >
                {avatarSelfie ? (
                  <img
                    src={avatarSelfie}
                    alt="Chat"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-600">
                    <User className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Online indicator - centered on circle border */}
            <span className="absolute flex" style={{ right: '10px', top: '7.9px', width: '13px', height: '13px' }}>
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span className="relative inline-flex rounded-full border-2 border-white bg-green-500" style={{ width: '13px', height: '13px' }} />
            </span>
          </div>
        </div>
      )}
    </>
  );
}
