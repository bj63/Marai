import { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useMaraiStore } from '../../store/useMaraiStore';

interface LivingCoreProps {
  accentColor: string;
}

const tmp = new Vector3();

export const LivingCore = ({ accentColor }: LivingCoreProps) => {
  const meshRef = useRef<Mesh>(null);
  const stressLevel = useMaraiStore((state) => state.stressLevel);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = clock.getElapsedTime();
    mesh.rotation.x = Math.sin(t * 0.35) * 0.15;
    mesh.rotation.y = Math.cos(t * 0.28) * 0.2;
    const baseScale = 1 + stressLevel * 0.4;
    const pulse = Math.sin(t * 1.2) * 0.05;
    mesh.scale.lerp(tmp.setScalar(baseScale + pulse), 0.08);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[2, 2]} />
      <meshStandardMaterial
        color={accentColor}
        emissive={accentColor}
        emissiveIntensity={0.8 + stressLevel}
        roughness={0.2}
        metalness={0.85}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
};
