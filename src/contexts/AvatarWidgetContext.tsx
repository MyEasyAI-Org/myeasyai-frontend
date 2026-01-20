import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { PhotoPose } from '../features/my-easy-avatar/store';

type Position = {
  x: number;
  y: number;
};

type AvatarWidgetContextType = {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  position: Position;
  setPosition: (position: Position) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
  // Preloading state - avatar loads in background before chat opens
  isPreloaded: boolean;
  setIsPreloaded: (value: boolean) => void;
  // Animation state for magical transitions
  animationPhase: 'idle' | 'exploding' | 'morphing' | 'appearing' | 'disappearing';
  setAnimationPhase: (phase: 'idle' | 'exploding' | 'morphing' | 'appearing' | 'disappearing') => void;
  // Temporary pose override for widget animations
  tempPose: PhotoPose | null;
  setTempPose: (pose: PhotoPose | null) => void;
};

const AvatarWidgetContext = createContext<AvatarWidgetContextType | null>(null);

// Default position (bottom-right corner, matches bubble position)
const DEFAULT_POSITION: Position = { x: 16, y: 16 };

export function AvatarWidgetProvider({ children }: { children: ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPositionState] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exploding' | 'morphing' | 'appearing' | 'disappearing'>('idle');
  const [tempPose, setTempPose] = useState<PhotoPose | null>(null);

  const setPosition = useCallback((newPosition: Position) => {
    // Clamp position to keep widget visible on screen
    const clampedX = Math.max(0, newPosition.x);
    const clampedY = Math.max(0, newPosition.y);
    setPositionState({ x: clampedX, y: clampedY });
  }, []);

  return (
    <AvatarWidgetContext.Provider
      value={{
        isMinimized,
        setIsMinimized,
        position,
        setPosition,
        isDragging,
        setIsDragging,
        isChatOpen,
        setIsChatOpen,
        isPreloaded,
        setIsPreloaded,
        animationPhase,
        setAnimationPhase,
        tempPose,
        setTempPose,
      }}
    >
      {children}
    </AvatarWidgetContext.Provider>
  );
}

export function useAvatarWidget() {
  const context = useContext(AvatarWidgetContext);
  if (!context) {
    // Return default values if not inside provider
    return {
      isMinimized: false,
      setIsMinimized: () => {},
      position: DEFAULT_POSITION,
      setPosition: () => {},
      isDragging: false,
      setIsDragging: () => {},
      isChatOpen: false,
      setIsChatOpen: () => {},
      isPreloaded: false,
      setIsPreloaded: () => {},
      animationPhase: 'idle' as const,
      setAnimationPhase: () => {},
      tempPose: null,
      setTempPose: () => {},
    };
  }
  return context;
}
