import { forwardRef } from 'react';
import { MessageCircle, User } from 'lucide-react';

interface ChatBubbleIconProps {
  avatarSelfie: string | null;
  onClick: () => void;
  isAnimating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ChatBubbleIcon - A chat bubble icon that contains the avatar selfie
 *
 * This is the collapsed state of the chat widget, showing a speech bubble
 * with the avatar's selfie inside, indicating a support/assistant chat.
 */
export const ChatBubbleIcon = forwardRef<HTMLButtonElement, ChatBubbleIconProps>(
  ({ avatarSelfie, onClick, isAnimating = false, className = '', style }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`
          group relative flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-95
          ${isAnimating ? 'bubble-expand' : ''}
          ${className}
        `}
        style={style}
        title="Fale com a IA"
      >
        {/* Main bubble container */}
        <div className="relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

          {/* Chat bubble shape */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.3),0_0_40px_rgba(59,130,246,0.2)] ring-2 ring-purple-500/40 transition-all duration-300 group-hover:ring-purple-400/60 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5),0_0_60px_rgba(59,130,246,0.3)]">
            {/* Avatar selfie or fallback icon inside bubble */}
            {avatarSelfie ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-2 ring-purple-500/50">
                <img
                  src={avatarSelfie}
                  alt="Assistente"
                  className="h-full w-full object-cover"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-white/20">
                <User className="h-5 w-5 text-white" />
              </div>
            )}

            {/* Small chat icon badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg ring-2 ring-slate-900">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Speech bubble tail pointing right (towards avatar) */}
          <div
            className="absolute -right-2 bottom-3 h-0 w-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '10px solid rgb(30, 41, 59)', // slate-800
              filter: 'drop-shadow(2px 0 4px rgba(168,85,247,0.2))',
            }}
          />

          {/* Online indicator with pulse */}
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 ring-2 ring-slate-900" />
          </span>
        </div>
      </button>
    );
  }
);

ChatBubbleIcon.displayName = 'ChatBubbleIcon';
