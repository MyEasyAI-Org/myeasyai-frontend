import { CameraControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { UI_MODES, useConfiguratorStore } from '../store';

export const START_CAMERA_POSITION: [number, number, number] = [-1.5, -0.3, 5];
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [-1.5, -0.3, 5];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0.3, 0];

type CameraManagerProps = {
  loading: boolean;
};

export const CameraManager = ({ loading }: CameraManagerProps) => {
  const controls = useRef<CameraControls>(null);
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const initialLoading = useConfiguratorStore((state) => state.loading);
  const mode = useConfiguratorStore((state) => state.mode);

  useEffect(() => {
    if (!controls.current) return;

    if (initialLoading) {
      controls.current.setLookAt(
        ...START_CAMERA_POSITION,
        ...DEFAULT_CAMERA_TARGET
      );
    } else if (
      !loading &&
      mode === UI_MODES.CUSTOMIZE &&
      currentCategory?.expand?.cameraPlacement
    ) {
      controls.current.setLookAt(
        ...currentCategory.expand.cameraPlacement.position,
        ...currentCategory.expand.cameraPlacement.target,
        true
      );
    } else {
      controls.current.setLookAt(
        ...DEFAULT_CAMERA_POSITION,
        ...DEFAULT_CAMERA_TARGET,
        true
      );
    }
  }, [currentCategory, mode, initialLoading, loading]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      minDistance={2}
      maxDistance={8}
    />
  );
};
