import { NodeIO } from '@gltf-transform/core';
import { dedup, draco, prune, quantize } from '@gltf-transform/functions';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { LoopOnce, LoopRepeat, type BufferGeometry, type Group, type Mesh, type SkinnedMesh } from 'three';
import { GLTFExporter } from 'three-stdlib';
import { getAssetFileURL, useConfiguratorStore, type PhotoPose } from '../store';
import { Asset } from './Asset';

type AvatarProps = {
  /** Override the pose from store - used for temporary pose animations */
  poseOverride?: PhotoPose | null;
  /** Enable breathing/idle animation to make avatar look alive */
  enableBreathing?: boolean;
} & Record<string, unknown>;

export const Avatar = ({ poseOverride, enableBreathing = false, ...props }: AvatarProps) => {
  const group = useRef<Group>(null);
  const breathingRef = useRef({ time: 0 });
  const { nodes } = useGLTF('/avatar/models/Armature.glb');
  const { nodes: bodyNodes } = useGLTF('/avatar/models/NakedFullBody.glb');
  const { animations } = useGLTF('/avatar/models/Poses.glb');
  const customization = useConfiguratorStore((state) => state.customization);
  const skin = useConfiguratorStore((state) => state.skin);
  const { actions } = useAnimations(animations, group);
  const setDownload = useConfiguratorStore((state) => state.setDownload);
  const pose = useConfiguratorStore((state) => state.pose);

  // Breathing/idle animation - subtle movement to make avatar look alive
  useFrame((_, delta) => {
    if (!enableBreathing || !group.current) return;

    breathingRef.current.time += delta;
    const t = breathingRef.current.time;

    // Subtle breathing effect - gentle scale on Y axis (chest expanding)
    const breathingScale = 1 + Math.sin(t * 1.5) * 0.008;

    // Very subtle body sway (side to side)
    const swayX = Math.sin(t * 0.7) * 0.015;
    const swayZ = Math.cos(t * 0.5) * 0.008;

    // Apply to the group
    group.current.scale.y = breathingScale;
    group.current.rotation.z = swayX;
    group.current.rotation.x = swayZ;
  });

  useEffect(() => {
    function download() {
      const exporter = new GLTFExporter();
      exporter.parse(
        group.current!,
        async (result) => {
          const io = new NodeIO();

          // Read
          const document = await io.readBinary(new Uint8Array(result as ArrayBuffer));
          await document.transform(
            // Remove unused nodes, textures, or other data
            prune(),
            // Remove duplicate vertex or texture data, if any
            dedup(),
            // Compress mesh geometry with Draco
            draco(),
            // Quantize mesh geometry
            quantize()
          );

          // Write
          const glb = await io.writeBinary(document);

          save(
            new Blob([glb], { type: 'application/octet-stream' }),
            `avatar_${+new Date()}.glb`
          );
        },
        (error) => {
          console.error(error);
        },
        { binary: true }
      );
    }

    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);

    function save(blob: Blob, filename: string) {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
    setDownload(download);
  }, [setDownload]);

  // Use poseOverride if provided, otherwise use store pose
  const activePose = poseOverride ?? pose;

  useEffect(() => {
    const action = actions[activePose];
    if (!action) return;

    // Reset and configure the action for smooth playback
    action.reset();
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);

    // For non-Idle poses, play once and hold at end (clamp)
    // For Idle, loop continuously
    if (activePose === 'Idle') {
      action.setLoop(LoopRepeat, Infinity);
    } else {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    // Smooth fade in over 0.5 seconds for more natural transition
    action.fadeIn(0.5).play();

    return () => {
      action.fadeOut(0.5);
    };
  }, [actions, activePose]);

  // Get body meshes from NakedFullBody
  const bodyMeshes = useMemo(() => {
    const meshes: Array<{
      geometry: BufferGeometry;
      morphTargetDictionary?: Record<string, number>;
      morphTargetInfluences?: number[];
    }> = [];

    if (bodyNodes) {
      Object.values(bodyNodes).forEach((node) => {
        const mesh = node as Mesh | SkinnedMesh;
        if (mesh.isMesh) {
          meshes.push({
            geometry: mesh.geometry,
            morphTargetDictionary: mesh.morphTargetDictionary,
            morphTargetInfluences: mesh.morphTargetInfluences,
          });
        }
      });
    }
    return meshes;
  }, [bodyNodes]);

  const skeleton = (nodes.Plane as SkinnedMesh).skeleton;

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {/* Render base body */}
          {bodyMeshes.map((mesh, index) => (
            <skinnedMesh
              key={`body-${index}`}
              geometry={mesh.geometry}
              material={skin}
              skeleton={skeleton}
              morphTargetDictionary={mesh.morphTargetDictionary}
              morphTargetInfluences={mesh.morphTargetInfluences}
              castShadow
              receiveShadow
            />
          ))}
          {Object.keys(customization).map(
            (key) =>
              customization[key]?.asset?.file && (
                <Suspense key={customization[key].asset!.id}>
                  <Asset
                    categoryName={key}
                    url={getAssetFileURL(customization[key].asset!)}
                    skeleton={skeleton}
                  />
                </Suspense>
              )
          )}
        </group>
      </group>
    </group>
  );
};
