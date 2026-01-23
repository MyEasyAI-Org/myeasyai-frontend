import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, Material, MeshStandardMaterial, Skeleton, SkinnedMesh } from 'three';
import { useConfiguratorStore } from '../store';

type AssetProps = {
  url: string;
  categoryName: string;
  skeleton: Skeleton;
};

type MeshItem = {
  geometry: BufferGeometry;
  material: Material | Material[];
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

export const Asset = ({ url, categoryName, skeleton }: AssetProps) => {
  const { scene } = useGLTF(url);
  const materialsRef = useRef<MeshStandardMaterial[]>([]);

  const customization = useConfiguratorStore((state) => state.customization);
  const lockedGroups = useConfiguratorStore((state) => state.lockedGroups);
  const skin = useConfiguratorStore((state) => state.skin);

  const assetColor = customization[categoryName]?.color;

  // Collect meshes once when scene changes
  const attachedItems = useMemo(() => {
    const items: MeshItem[] = [];
    materialsRef.current = [];

    scene.traverse((child) => {
      const mesh = child as SkinnedMesh;
      if (mesh.isMesh) {
        const mat = mesh.material as MeshStandardMaterial;
        const isSkinMaterial = mat?.name?.includes('Skin_');
        const isColorMaterial = mat?.name?.includes('Color_');

        if (isColorMaterial) {
          materialsRef.current.push(mat);
        }

        items.push({
          geometry: mesh.geometry,
          material: isSkinMaterial ? skin : mesh.material,
          morphTargetDictionary: mesh.morphTargetDictionary,
          morphTargetInfluences: mesh.morphTargetInfluences,
        });
      }
    });

    return items;
  }, [scene, skin]);

  // Update colors separately in useEffect to avoid render-time state updates
  useEffect(() => {
    if (assetColor) {
      materialsRef.current.forEach((material) => {
        material.color.set(assetColor);
      });
    }
  }, [assetColor]);

  if (lockedGroups[categoryName]) {
    return null;
  }

  return (
    <>
      {attachedItems.map((item, index) => (
        <skinnedMesh
          key={index}
          geometry={item.geometry}
          material={item.material}
          skeleton={skeleton}
          morphTargetDictionary={item.morphTargetDictionary}
          morphTargetInfluences={item.morphTargetInfluences}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
};
