import { animated, useSpring } from '@react-spring/three';
import {
  Environment,
  Float,
  Gltf,
  SoftShadows,
} from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { DefaultLoadingManager } from 'three';
import { useConfiguratorStore } from '../store';
import { Avatar } from './Avatar';
import { CameraManager } from './CameraManager';
import { LoadingAvatar } from './LoadingAvatar';

// Custom hook to track loading without causing render-phase state updates
function useLoadingProgress() {
  const [active, setActive] = useState(false);
  const itemsLoadingRef = useRef(0);

  useEffect(() => {
    const originalOnStart = DefaultLoadingManager.onStart;
    const originalOnLoad = DefaultLoadingManager.onLoad;
    const originalOnProgress = DefaultLoadingManager.onProgress;

    DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      itemsLoadingRef.current = itemsTotal - itemsLoaded;
      // Use setTimeout to defer state update out of render phase
      setTimeout(() => setActive(true), 0);
      originalOnStart?.(url, itemsLoaded, itemsTotal);
    };

    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      itemsLoadingRef.current = itemsTotal - itemsLoaded;
      originalOnProgress?.(url, itemsLoaded, itemsTotal);
    };

    DefaultLoadingManager.onLoad = () => {
      itemsLoadingRef.current = 0;
      setTimeout(() => setActive(false), 0);
      originalOnLoad?.();
    };

    return () => {
      DefaultLoadingManager.onStart = originalOnStart;
      DefaultLoadingManager.onLoad = originalOnLoad;
      DefaultLoadingManager.onProgress = originalOnProgress;
    };
  }, []);

  return { active };
}

export const Experience = () => {
  const setScreenshot = useConfiguratorStore((state) => state.setScreenshot);
  const setTakeSelfie = useConfiguratorStore((state) => state.setTakeSelfie);
  const setAvatarSelfie = useConfiguratorStore((state) => state.setAvatarSelfie);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  // Selfie function - captures the avatar's face as a circular/square image
  useEffect(() => {
    const takeSelfie = () => {
      // Store original camera position
      const originalPosition = camera.position.clone();
      const originalFov = (camera as any).fov;

      // Move camera closer to face for selfie (slightly further back and higher)
      camera.position.set(0, 0.65, 2.5);
      camera.lookAt(0, 0.55, 0);
      if ((camera as any).fov) {
        (camera as any).fov = 35;
        (camera as any).updateProjectionMatrix();
      }

      // Render one frame with new camera position
      gl.render(scene, camera);

      // Capture the selfie
      const selfieCanvas = document.createElement('canvas');
      const size = 200; // Square selfie image
      selfieCanvas.width = size;
      selfieCanvas.height = size;
      const selfieCtx = selfieCanvas.getContext('2d');

      if (selfieCtx) {
        // Calculate center crop from the rendered canvas
        const sourceCanvas = gl.domElement;
        const sourceSize = Math.min(sourceCanvas.width, sourceCanvas.height);
        const sx = (sourceCanvas.width - sourceSize) / 2;
        const sy = (sourceCanvas.height - sourceSize) / 2 - sourceSize * 0.15; // Offset up a bit to center on face

        // Draw cropped and resized image
        selfieCtx.drawImage(
          sourceCanvas,
          Math.max(0, sx),
          Math.max(0, sy),
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size
        );

        // Get base64 data
        const selfieData = selfieCanvas.toDataURL('image/png');
        setAvatarSelfie(selfieData);
      }

      // Restore original camera position
      camera.position.copy(originalPosition);
      if ((camera as any).fov) {
        (camera as any).fov = originalFov;
        (camera as any).updateProjectionMatrix();
      }
    };

    setTakeSelfie(takeSelfie);
  }, [gl, scene, camera, setTakeSelfie, setAvatarSelfie]);

  useEffect(() => {
    const screenshot = () => {
      const overlayCanvas = document.createElement('canvas');

      overlayCanvas.width = gl.domElement.width;
      overlayCanvas.height = gl.domElement.height;
      const overlayCtx = overlayCanvas.getContext('2d');
      if (!overlayCtx) {
        return;
      }
      // Draw the original rendered image onto the overlay canvas
      overlayCtx.drawImage(gl.domElement, 0, 0);

      // Create an image element for the logo
      const logo = new Image();
      logo.src = '/avatar/images/bone-logo-512.png';
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        // Draw the logo onto the overlay canvas
        const logoWidth = 765 / 4;
        const logoHeight = 370 / 4;
        const x = overlayCanvas.width - logoWidth - 42;
        const y = overlayCanvas.height - logoHeight - 42;
        overlayCtx.drawImage(logo, x, y, logoWidth, logoHeight);

        // Create a link element to download the image
        const link = document.createElement('a');
        const date = new Date();
        link.setAttribute(
          'download',
          `Avatar_${date.toISOString().split('T')[0]}_${date.toLocaleTimeString()}.png`
        );
        link.setAttribute(
          'href',
          overlayCanvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
        );
        link.click();
      };
    };
    setScreenshot(screenshot);
  }, [gl, setScreenshot]);

  const { active } = useLoadingProgress();
  const [loading, setLoading] = useState(false);
  const setLoadingAt = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (active) {
      timeout = setTimeout(() => {
        setLoading(true);
        setLoadingAt.current = Date.now();
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setLoading(false);
      }, Math.max(0, 2000 - (Date.now() - setLoadingAt.current)));
    }
    return () => clearTimeout(timeout);
  }, [active]);

  const { scale, spin, floatHeight } = useSpring({
    scale: loading ? 0.5 : 1,
    spin: loading ? Math.PI * 8 : 0,
    floatHeight: loading ? 0.5 : 0,
  });

  return (
    <>
      <CameraManager loading={loading} />
      <Environment preset="sunset" environmentIntensity={0.3} />

      <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.31}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>

      <SoftShadows size={52} samples={16} focus={0.5} />

      {/* Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {/* Fill Light */}
      <directionalLight position={[-5, 5, 5]} intensity={0.7} />
      {/* Back Lights - Blue/Purple theme */}
      <directionalLight position={[3, 3, -5]} intensity={6} color="#a855f7" />
      <directionalLight position={[-3, 3, -5]} intensity={8} color="#3b82f6" />

      <AvatarWrapper loading={loading}>
        <animated.group
          scale={scale}
          position-y={floatHeight}
          rotation-y={spin}
        >
          <Avatar />
        </animated.group>
      </AvatarWrapper>
      <Gltf
        src="/avatar/models/Teleporter Base.glb"
        position-y={-0.31}
        castShadow
        receiveShadow
      />
      <LoadingAvatar loading={loading} />
    </>
  );
};

type AvatarWrapperProps = {
  loading: boolean;
  children: ReactNode;
};

const AvatarWrapper = ({ loading, children }: AvatarWrapperProps) => {
  return loading ? (
    <Float floatIntensity={1} speed={6}>
      {children}
    </Float>
  ) : (
    <>{children}</>
  );
};
