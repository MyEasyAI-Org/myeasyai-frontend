import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useAvatarWidget } from '../../contexts/AvatarWidgetContext';
import { Avatar } from '../../features/my-easy-avatar/components/Avatar';
import { avatarService } from '../../features/my-easy-avatar/services/avatarService';
import { PHOTO_POSES, useConfiguratorStore, type PhotoPose } from '../../features/my-easy-avatar/store';

// All available poses for random selection
const ALL_POSES = Object.values(PHOTO_POSES) as PhotoPose[];

// Get a random pose (excluding Idle and the current pose)
function getRandomPose(excludePose?: PhotoPose): PhotoPose {
  const availablePoses = ALL_POSES.filter(p => p !== 'Idle' && p !== excludePose);
  return availablePoses[Math.floor(Math.random() * availablePoses.length)];
}

// CSS for magical avatar spin-morph animations
// NOTE: Animations use translate only for visual effects, not for positioning
const avatarAnimationStyles = `
  /* Spin-morph: Avatar appears from spinning transformation */
  @keyframes avatarSpinEntrance {
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

  /* Spin-morph: Avatar exits with spinning transformation */
  @keyframes avatarSpinExit {
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

  @keyframes floatBounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-1px); }
  }

  .avatar-magic-entrance {
    animation: avatarSpinEntrance 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .avatar-magic-exit {
    animation: avatarSpinExit 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-style: preserve-3d;
  }

  .avatar-float {
    animation: floatBounce 2s ease-in-out infinite;
  }
`;

/**
 * Mini 3D Avatar Widget for Dashboard
 * Displays the user's saved avatar with transparent background
 * Supports drag and drop to reposition
 * Now with magical entrance animations and preloading!
 */
export function DashboardAvatarWidget() {
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState<'entering' | 'pose-playing' | 'exiting' | 'visible' | 'hidden'>('hidden');
  const [tempPoseOverride, setTempPoseOverride] = useState<PhotoPose | null>(null);
  const {
    isMinimized,
    setIsMinimized,
    position,
    setPosition,
    isDragging,
    setIsDragging,
    isChatOpen,
    setIsPreloaded,
    animationPhase,
  } = useAvatarWidget();
  const loading = useConfiguratorStore((state) => state.loading);
  const assets = useConfiguratorStore((state) => state.assets);
  const loadSavedAvatar = useConfiguratorStore((state) => state.loadSavedAvatar);
  const customization = useConfiguratorStore((state) => state.customization);
  const savedPose = useConfiguratorStore((state) => state.pose);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);
  const prevChatOpen = useRef(isChatOpen);
  const prevMinimized = useRef(isMinimized);
  const randomPoseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inject animation styles
  useEffect(() => {
    const styleId = 'avatar-animation-styles';
    if (!document.getElementById(styleId)) {
      console.log('[AvatarWidget] Injecting CSS animation styles');
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = avatarAnimationStyles;
      document.head.appendChild(styleElement);
    } else {
      console.log('[AvatarWidget] CSS animation styles already exist');
    }
  }, []);

  // Check if user has a saved avatar and load it (PRELOAD on mount)
  useEffect(() => {
    const checkAndLoadAvatar = async () => {
      if (loading || assets.length === 0) return;

      try {
        const hasSaved = await avatarService.hasSavedAvatar();
        if (hasSaved) {
          await loadSavedAvatar();
          setHasAvatar(true);
          setIsPreloaded(true); // Mark as preloaded for instant display
        }
      } catch (error) {
        console.error('[DashboardAvatarWidget] Error loading avatar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndLoadAvatar();
  }, [loading, assets, loadSavedAvatar, setIsPreloaded]);

  // Handle animation states when chat opens/closes
  useEffect(() => {
    console.log('[AvatarWidget] Chat state effect - isChatOpen:', isChatOpen, 'prevChatOpen:', prevChatOpen.current, 'hasAvatar:', hasAvatar, 'showAnimation:', showAnimation);

    if (isChatOpen && !prevChatOpen.current && hasAvatar) {
      // Chat just opened - trigger entrance animation (spin)
      console.log('[AvatarWidget] Chat OPENED - starting entrance animation');
      setShowAnimation('entering');

      // Use saved pose during entrance
      setTempPoseOverride(savedPose);

      // After spin completes (800ms), let pose animation play for 2 seconds
      const poseTimer = setTimeout(() => {
        setShowAnimation('pose-playing');
      }, 800);

      // After pose animation (800ms + 2000ms), switch to Idle and float
      const floatTimer = setTimeout(() => {
        setTempPoseOverride('Idle'); // Return to Idle pose
        setShowAnimation('visible');
      }, 800 + 2000);

      return () => {
        clearTimeout(poseTimer);
        clearTimeout(floatTimer);
      };
    } else if (!isChatOpen && prevChatOpen.current) {
      // Chat just closed - trigger exit animation with full spin
      console.log('[AvatarWidget] Chat CLOSED - starting exit animation');
      setShowAnimation('exiting');
      const timer = setTimeout(() => {
        console.log('[AvatarWidget] Exit animation complete - setting hidden');
        setShowAnimation('hidden');
        setTempPoseOverride(null);
      }, 800); // Full spin animation duration (matches avatarSpinExit)
      return () => clearTimeout(timer);
    }
    prevChatOpen.current = isChatOpen;
  }, [isChatOpen, hasAvatar, savedPose]);

  // Also listen to animationPhase from context for exit animation
  // This ensures the exit animation triggers even if the local state detection fails
  useEffect(() => {
    console.log('[AvatarWidget] Animation phase effect - animationPhase:', animationPhase, 'showAnimation:', showAnimation);
    if (animationPhase === 'disappearing' && showAnimation !== 'exiting' && showAnimation !== 'hidden') {
      console.log('[AvatarWidget] Animation phase DISAPPEARING - starting exit animation from context');
      setShowAnimation('exiting');
      const timer = setTimeout(() => {
        console.log('[AvatarWidget] Exit animation from context complete - setting hidden');
        setShowAnimation('hidden');
        setTempPoseOverride(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, showAnimation]);

  // Random pose every 40 seconds when chat is open and visible
  useEffect(() => {
    if (isChatOpen && showAnimation === 'visible') {
      // Start the 40-second interval for random poses
      randomPoseIntervalRef.current = setInterval(() => {
        // Get a random pose (not Idle)
        const randomPose = getRandomPose(tempPoseOverride ?? undefined);
        setTempPoseOverride(randomPose);

        // After 2 seconds, return to Idle
        setTimeout(() => {
          setTempPoseOverride('Idle');
        }, 2000);
      }, 40000); // Every 40 seconds

      return () => {
        if (randomPoseIntervalRef.current) {
          clearInterval(randomPoseIntervalRef.current);
          randomPoseIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval when chat closes or during animations
      if (randomPoseIntervalRef.current) {
        clearInterval(randomPoseIntervalRef.current);
        randomPoseIntervalRef.current = null;
      }
    }
  }, [isChatOpen, showAnimation, tempPoseOverride]);

  // Adjust position when avatar size changes to keep it in the same visual position
  useEffect(() => {
    if (prevMinimized.current !== isMinimized && isChatOpen) {
      const smallWidth = 60;
      const largeWidth = 150;
      const widthDiff = largeWidth - smallWidth;

      if (isMinimized) {
        // Going from large to small - move right to compensate
        setPosition({ x: position.x - widthDiff / 2, y: position.y });
      } else {
        // Going from small to large - move left to compensate
        setPosition({ x: position.x + widthDiff / 2, y: position.y });
      }
    }
    prevMinimized.current = isMinimized;
  }, [isMinimized, isChatOpen, position, setPosition]);

  // Handle drag start - on the entire avatar container
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't start drag if clicking on the minimize button
    if ((e.target as HTMLElement).closest('button')) return;

    console.log('[AvatarWidget] Drag START - position:', position, 'isExiting:', showAnimation === 'exiting' || animationPhase === 'disappearing');
    e.preventDefault();
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = { x: clientX, y: clientY };
    initialPositionRef.current = { ...position };
  }, [position, setIsDragging, showAnimation, animationPhase]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !initialPositionRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = dragStartRef.current.x - clientX;
    const deltaY = dragStartRef.current.y - clientY;

    // Calculate new position (right/bottom based)
    const newX = initialPositionRef.current.x + deltaX;
    const newY = initialPositionRef.current.y + deltaY;

    // Clamp to screen bounds
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;

    const finalPosition = {
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY),
    };
    console.log('[AvatarWidget] Drag MOVE - new position:', finalPosition);
    setPosition(finalPosition);
  }, [isDragging, setPosition]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    initialPositionRef.current = null;
  }, [setIsDragging]);

  // Add/remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Check if customization has any assets
  const hasCustomization = Object.values(customization).some(
    (cat) => cat.asset?.file
  );

  // Don't render if no avatar or still loading
  if (isLoading || !hasAvatar || !hasCustomization) {
    return null;
  }

  // Size configurations - always use large size for the single canvas
  const size = isMinimized
    ? { width: 60, height: 80, cameraZ: 8 }
    : { width: 150, height: 220, cameraZ: 5.5 };

  // Get animation class based on state
  const getAnimationClass = () => {
    if (animationPhase === 'appearing' || showAnimation === 'entering') {
      return 'avatar-magic-entrance';
    }
    if (animationPhase === 'disappearing' || showAnimation === 'exiting') {
      return 'avatar-magic-exit';
    }
    if (showAnimation === 'pose-playing') {
      // No CSS animation during pose playback - let the 3D pose animation be the focus
      return '';
    }
    if (showAnimation === 'visible') {
      return 'avatar-float';
    }
    return '';
  };

  // Determine if avatar should be visible or hidden (preloading)
  // Avatar stays visible during exit animation so it can spin before disappearing
  // Check both local state (showAnimation) and context state (animationPhase) for exit
  const isExiting = showAnimation === 'exiting' || animationPhase === 'disappearing';
  const isVisible = isChatOpen || isExiting;

  // Log visibility calculation on every render during debugging
  const animClass = getAnimationClass();
  console.log('[AvatarWidget] Render at', Date.now(), '- isExiting:', isExiting, 'isVisible:', isVisible, 'isChatOpen:', isChatOpen, 'showAnimation:', showAnimation, 'animationPhase:', animationPhase, 'animationClass:', animClass);

  // Also log z-index and opacity values that will be applied
  console.log('[AvatarWidget] CSS applied - zIndex:', isVisible ? 'z-50' : 'z-[-1]', 'opacity:', isVisible ? 1 : 0.001, 'class:', animClass);

  // SINGLE CANVAS - Always rendered, visibility controlled by CSS
  // This ensures the 3D scene is always warm and ready
  return (
    <div
      className={`fixed ${isVisible ? 'z-50' : 'z-[-1]'} ${isVisible ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'pointer-events-none'} ${animClass}`}
      style={{
        width: `${isVisible ? size.width : 150}px`,
        height: `${isVisible ? size.height : 220}px`,
        right: `${isVisible ? position.x : 16}px`,
        bottom: `${isVisible ? position.y : 16}px`,
        transformOrigin: 'center bottom',
        opacity: isVisible ? 1 : 0.001, // Near-invisible when preloading but still renders
        visibility: 'visible', // Always visible to DOM for rendering
      }}
      onMouseDown={isVisible && !isExiting ? handleDragStart : undefined}
      onTouchStart={isVisible && !isExiting ? handleDragStart : undefined}
    >
      {/* Minimize/Maximize button - only when visible and not exiting */}
      {isVisible && !isExiting && (
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute right-4 -top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 ring-1 ring-slate-700 transition-all hover:bg-slate-700 hover:text-white hover:ring-purple-500/50"
          title={isMinimized ? 'Aumentar avatar' : 'Minimizar avatar'}
        >
          {isMinimized ? (
            <Maximize2 className="h-3 w-3" />
          ) : (
            <Minimize2 className="h-3 w-3" />
          )}
        </button>
      )}

      <div className="pointer-events-none h-full w-full">
        <Canvas
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          camera={{ position: [0, 0, isVisible ? size.cameraZ : 5.5], fov: 30 }}
          style={{ background: 'transparent' }}
          frameloop="always"
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <Environment preset="sunset" environmentIntensity={0.3} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            {/* Back Lights */}
            <directionalLight position={[3, 3, -5]} intensity={4} color="#a855f7" />
            <directionalLight position={[-3, 3, -5]} intensity={5} color="#3b82f6" />

            {/* Avatar */}
            <group position={[0, -1.35, 0]}>
              <Avatar poseOverride={tempPoseOverride} enableBreathing={isVisible && showAnimation === 'visible'} />
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
