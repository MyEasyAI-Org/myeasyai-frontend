import { memo } from 'react';

// ============================================================================
// AttentionIndicator - Pointing hand with pulse animation
// Standard pattern for drawing user attention to important UI elements
// ============================================================================

type Position = 'top' | 'bottom' | 'left' | 'right';

interface AttentionIndicatorProps {
  /** Position relative to the target element */
  position?: Position;
  /** Optional custom message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the indicator */
  show?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const POSITION_STYLES: Record<Position, { container: string; hand: string }> = {
  top: {
    container: 'bottom-full left-1/2 -translate-x-1/2 mb-1 flex-col-reverse',
    hand: 'rotate-180',
  },
  bottom: {
    container: 'top-full left-1/2 -translate-x-1/2 mt-1 flex-col',
    hand: '',
  },
  left: {
    container: 'right-full top-1/2 -translate-y-1/2 mr-1 flex-row-reverse',
    hand: 'rotate-90',
  },
  right: {
    container: 'left-full top-1/2 -translate-y-1/2 ml-1 flex-row',
    hand: '-rotate-90',
  },
};

const SIZE_STYLES = {
  sm: { text: 'text-lg', fontSize: 'text-xs' },
  md: { text: 'text-2xl', fontSize: 'text-sm' },
  lg: { text: 'text-3xl', fontSize: 'text-base' },
};

export const AttentionIndicator = memo(function AttentionIndicator({
  position = 'left',
  message,
  size = 'md',
  show = true,
  className = '',
}: AttentionIndicatorProps) {
  if (!show) return null;

  const posStyles = POSITION_STYLES[position];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <div
      className={`absolute z-50 flex items-center gap-1 pointer-events-none ${posStyles.container} ${className}`}
    >
      {/* Pointing hand with bounce animation */}
      <span
        className={`${sizeStyles.text} ${posStyles.hand} animate-bounce drop-shadow-lg`}
        style={{ animationDuration: '1s' }}
      >
        👆
      </span>

      {/* Optional message bubble */}
      {message && (
        <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 shadow-lg animate-pulse">
          <span className={`${sizeStyles.fontSize} font-semibold text-white whitespace-nowrap`}>
            {message}
          </span>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Wrapper component for easy use around any element
// ============================================================================

interface WithAttentionIndicatorProps {
  children: React.ReactNode;
  show?: boolean;
  position?: Position;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WithAttentionIndicator = memo(function WithAttentionIndicator({
  children,
  show = false,
  position = 'left',
  message,
  size = 'md',
  className = '',
}: WithAttentionIndicatorProps) {
  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      <AttentionIndicator show={show} position={position} message={message} size={size} />

      {/* Pulse ring around element when attention is active */}
      {show && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-amber-400/50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
});

export default AttentionIndicator;
