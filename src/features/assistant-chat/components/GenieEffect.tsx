import { useEffect, useRef, useState, type ReactNode } from 'react';

interface GenieEffectProps {
  children: ReactNode;
  isVisible: boolean;
  /** Target element ref that the content will animate to/from */
  targetRef: React.RefObject<HTMLElement>;
  /** Duration of the animation in ms */
  duration?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  className?: string;
}

/**
 * GenieEffect - Recreates the macOS Genie Effect animation
 *
 * The animation distorts the content as it "morphs" between the full size
 * and a smaller target point, creating the classic "genie entering lamp" effect.
 */
export function GenieEffect({
  children,
  isVisible,
  targetRef,
  duration = 400,
  onAnimationComplete,
  className = '',
}: GenieEffectProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'opening' | 'closing'>('idle');
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (targetRef.current) {
      setTargetRect(targetRef.current.getBoundingClientRect());
    }
  }, [targetRef, isVisible]);

  useEffect(() => {
    if (isVisible && animationState === 'idle') {
      setAnimationState('opening');
      const timer = setTimeout(() => {
        setAnimationState('idle');
        onAnimationComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    } else if (!isVisible && animationState === 'idle') {
      setAnimationState('closing');
      const timer = setTimeout(() => {
        setAnimationState('idle');
        onAnimationComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onAnimationComplete, animationState]);

  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transformOrigin: 'bottom right',
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    if (animationState === 'opening') {
      return {
        ...baseStyles,
        opacity: 1,
        transform: 'scale(1) perspective(800px) rotateX(0deg)',
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      };
    }

    if (animationState === 'closing' || !isVisible) {
      return {
        ...baseStyles,
        opacity: 0,
        transform: 'scale(0.3) perspective(800px) rotateX(20deg)',
        clipPath: 'polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)',
      };
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'scale(1) perspective(800px) rotateX(0deg)',
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    };
  };

  return (
    <div
      ref={contentRef}
      className={className}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  );
}

/**
 * CSS-only Genie Effect using CSS custom properties and keyframes
 * This is a lighter alternative that uses pure CSS animations
 * Now with magical bubble animations!
 */
export const genieEffectStyles = `
  @keyframes genieOpen {
    0% {
      opacity: 0;
      transform: scale(0.2) perspective(800px) rotateX(30deg) translateY(50px);
      clip-path: polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%);
      filter: blur(4px);
    }
    30% {
      opacity: 0.7;
      transform: scale(0.5) perspective(800px) rotateX(20deg) translateY(30px);
      clip-path: polygon(25% 0%, 75% 0%, 90% 100%, 10% 100%);
      filter: blur(2px);
    }
    60% {
      opacity: 0.9;
      transform: scale(0.85) perspective(800px) rotateX(8deg) translateY(10px);
      clip-path: polygon(8% 0%, 92% 0%, 98% 100%, 2% 100%);
      filter: blur(0.5px);
    }
    100% {
      opacity: 1;
      transform: scale(1) perspective(800px) rotateX(0deg) translateY(0);
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      filter: blur(0);
    }
  }

  @keyframes genieClose {
    0% {
      opacity: 1;
      transform: scale(1) perspective(800px) rotateX(0deg) translateY(0);
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      filter: blur(0);
    }
    40% {
      opacity: 0.9;
      transform: scale(0.85) perspective(800px) rotateX(8deg) translateY(10px);
      clip-path: polygon(8% 0%, 92% 0%, 98% 100%, 2% 100%);
      filter: blur(0.5px);
    }
    70% {
      opacity: 0.5;
      transform: scale(0.4) perspective(800px) rotateX(25deg) translateY(40px);
      clip-path: polygon(30% 0%, 70% 0%, 88% 100%, 12% 100%);
      filter: blur(3px);
    }
    100% {
      opacity: 0;
      transform: scale(0.15) perspective(800px) rotateX(35deg) translateY(60px);
      clip-path: polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%);
      filter: blur(5px);
    }
  }

  /* Magical bubble idle animation - floating and glowing */
  @keyframes bubbleFloat {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-6px) rotate(1deg);
    }
    50% {
      transform: translateY(-3px) rotate(0deg);
    }
    75% {
      transform: translateY(-8px) rotate(-1deg);
    }
  }

  @keyframes bubblePulseGlow {
    0%, 100% {
      filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.5));
    }
  }

  @keyframes bubbleWiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    75% { transform: rotate(-3deg); }
  }

  /* Spin-morph: Bubble spins and transforms into avatar */
  @keyframes bubbleSpinToAvatar {
    0% {
      transform: scale(1) rotateY(0deg);
      filter: brightness(1) drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
      opacity: 1;
    }
    30% {
      transform: scale(1.1) rotateY(180deg);
      filter: brightness(1.5) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8));
      opacity: 1;
    }
    60% {
      transform: scale(0.8) rotateY(360deg);
      filter: brightness(2) drop-shadow(0 0 40px rgba(59, 130, 246, 1));
      opacity: 0.8;
    }
    100% {
      transform: scale(0) rotateY(540deg);
      filter: brightness(2.5) blur(8px);
      opacity: 0;
    }
  }

  /* Spin-morph: Avatar appears from spin */
  @keyframes avatarSpinAppear {
    0% {
      transform: scale(0) rotateY(-540deg);
      filter: brightness(2.5) blur(8px);
      opacity: 0;
    }
    40% {
      transform: scale(0.8) rotateY(-360deg);
      filter: brightness(2) drop-shadow(0 0 40px rgba(59, 130, 246, 1));
      opacity: 0.8;
    }
    70% {
      transform: scale(1.1) rotateY(-180deg);
      filter: brightness(1.5) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8));
      opacity: 1;
    }
    100% {
      transform: scale(1) rotateY(0deg);
      filter: brightness(1);
      opacity: 1;
    }
  }

  /* Spin-morph reverse: Avatar spins and transforms back to bubble */
  @keyframes avatarSpinToBubble {
    0% {
      transform: scale(1) rotateY(0deg);
      filter: brightness(1);
      opacity: 1;
    }
    30% {
      transform: scale(1.1) rotateY(-180deg);
      filter: brightness(1.5) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8));
      opacity: 1;
    }
    60% {
      transform: scale(0.8) rotateY(-360deg);
      filter: brightness(2) drop-shadow(0 0 40px rgba(59, 130, 246, 1));
      opacity: 0.8;
    }
    100% {
      transform: scale(0) rotateY(-540deg);
      filter: brightness(2.5) blur(8px);
      opacity: 0;
    }
  }

  /* Bubble reappearing from spin */
  @keyframes bubbleSpinAppear {
    0% {
      transform: scale(0) rotateY(540deg);
      filter: brightness(2.5) blur(8px);
      opacity: 0;
    }
    40% {
      transform: scale(0.8) rotateY(360deg);
      filter: brightness(2) drop-shadow(0 0 40px rgba(59, 130, 246, 1));
      opacity: 0.8;
    }
    70% {
      transform: scale(1.1) rotateY(180deg);
      filter: brightness(1.5) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8));
      opacity: 1;
    }
    100% {
      transform: scale(1) rotateY(0deg);
      filter: brightness(1);
      opacity: 1;
    }
  }

  /* Legacy animations kept for compatibility */
  @keyframes bubbleMagicExplode {
    0% {
      transform: scale(1) rotate(0deg);
      filter: brightness(1) drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
    }
    20% {
      transform: scale(1.3) rotate(5deg);
      filter: brightness(1.5) drop-shadow(0 0 30px rgba(168, 85, 247, 0.8));
    }
    40% {
      transform: scale(0.9) rotate(-10deg);
      filter: brightness(2) drop-shadow(0 0 50px rgba(59, 130, 246, 1));
    }
    60% {
      transform: scale(1.1) rotate(15deg);
      filter: brightness(2.5) drop-shadow(0 0 60px rgba(236, 72, 153, 1));
    }
    80% {
      transform: scale(0.5) rotate(-20deg);
      filter: brightness(3) blur(5px);
      opacity: 0.5;
    }
    100% {
      transform: scale(0) rotate(360deg);
      filter: brightness(4) blur(15px);
      opacity: 0;
    }
  }

  @keyframes bubbleMagicAppear {
    0% {
      transform: scale(0) rotate(-180deg);
      filter: brightness(3) blur(10px);
      opacity: 0;
    }
    30% {
      transform: scale(0.5) rotate(-90deg);
      filter: brightness(2) blur(5px);
      opacity: 0.5;
    }
    60% {
      transform: scale(1.2) rotate(10deg);
      filter: brightness(1.3) blur(0);
      opacity: 1;
    }
    80% {
      transform: scale(0.9) rotate(-5deg);
      filter: brightness(1.1);
    }
    100% {
      transform: scale(1) rotate(0deg);
      filter: brightness(1);
    }
  }

  /* Sparkle particles around bubble */
  @keyframes sparkleOrbit {
    0% {
      transform: rotate(0deg) translateX(50px) rotate(0deg) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
      transform: rotate(36deg) translateX(50px) rotate(-36deg) scale(1);
    }
    90% {
      opacity: 1;
      transform: rotate(324deg) translateX(50px) rotate(-324deg) scale(1);
    }
    100% {
      transform: rotate(360deg) translateX(50px) rotate(-360deg) scale(0);
      opacity: 0;
    }
  }

  @keyframes sparkleFloat {
    0%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    50% {
      transform: translateY(-10px) scale(1.2);
      opacity: 1;
    }
  }

  @keyframes sparkleShimmer {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  /* Ring pulse effect - subtle version */
  @keyframes ringPulse {
    0% {
      transform: scale(0.9);
      opacity: 0.3;
      border-width: 1px;
    }
    100% {
      transform: scale(1.8);
      opacity: 0;
      border-width: 1px;
    }
  }

  .bubble-float {
    animation: bubbleFloat 4s ease-in-out infinite;
  }

  .bubble-glow {
    animation: bubblePulseGlow 2s ease-in-out infinite;
  }

  .bubble-wiggle {
    animation: bubbleWiggle 0.5s ease-in-out;
  }

  .bubble-magic-explode {
    animation: bubbleMagicExplode 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .bubble-magic-appear {
    animation: bubbleMagicAppear 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Spin-morph animation classes */
  .bubble-spin-to-avatar {
    animation: bubbleSpinToAvatar 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .avatar-spin-appear {
    animation: avatarSpinAppear 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .avatar-spin-to-bubble {
    animation: avatarSpinToBubble 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .bubble-spin-appear {
    animation: bubbleSpinAppear 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .sparkle-orbit {
    animation: sparkleOrbit 3s linear infinite;
  }

  .sparkle-float {
    animation: sparkleFloat 2s ease-in-out infinite;
  }

  .sparkle-shimmer {
    animation: sparkleShimmer 1.5s ease-in-out infinite;
  }

  .ring-pulse {
    animation: ringPulse 3s ease-out infinite;
  }

  @keyframes bubbleExpand {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(0.8);
      opacity: 0;
    }
  }

  @keyframes bubbleContract {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .genie-open {
    animation: genieOpen 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform-origin: bottom right;
  }

  .genie-close {
    animation: genieClose 400ms cubic-bezier(0.55, 0, 0.85, 0.36) forwards;
    transform-origin: bottom right;
  }

  .bubble-expand {
    animation: bubbleExpand 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .bubble-contract {
    animation: bubbleContract 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .genie-hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.15) perspective(800px) rotateX(35deg) translateY(60px);
    clip-path: polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%);
  }
`;
