import { useMemo } from 'react';
import { Color, Mesh } from 'three';
import { Line, PointMaterial, Points } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface HoloProjectorProps {
  accentColor: string;
}

export const HoloProjector = ({ accentColor }: HoloProjectorProps) => {
  const color = useMemo(() => new Color(accentColor), [accentColor]);
  const points = useMemo(() => Float32Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 24), []);
  const lineRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    lineRef.current.rotation.y = t * 0.1;
    lineRef.current.rotation.x = t * 0.05;
  });

  return (
    <group>
      <Points positions={points} stride={3} frustumCulled={false}>
        <PointMaterial transparent color={color} size={0.075} sizeAttenuation depthWrite={false} opacity={0.5} />
      </Points>
      <group position={[0, -2.5, 0]} ref={lineRef}>
        <Line
          points={[[-5, 0, -2], [0, 0, 4], [5, 0, -2]]}
          color={color}
          lineWidth={1.2}
          dashed
          dashScale={2}
          opacity={0.45}
          transparent
        />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.8, 4, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
};
