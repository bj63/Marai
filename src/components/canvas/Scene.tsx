import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useMaraiStore } from '../../store/useMaraiStore';
import { HoloProjector } from './HoloProjector';
import { LivingCore } from './LivingCore';

export const Scene = () => {
  const stressLevel = useMaraiStore((state) => state.stressLevel);
  const connectionStatus = useMaraiStore((state) => state.connectionStatus);

  const ambientIntensity = 0.35 + stressLevel * 0.35;
  const accentColor = connectionStatus === 'connected' ? '#22d3ee' : connectionStatus === 'connecting' ? '#f59e0b' : '#f43f5e';

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={[0x020617]} />
      <fog attach="fog" args={[0x020617, 12, 28]} />
      <ambientLight intensity={ambientIntensity} />
      <pointLight position={[6, 6, 6]} intensity={2} color={accentColor} />

      <Suspense fallback={null}>
        <Stars radius={80} depth={20} count={1500} factor={4} fade speed={1.2} />
        <LivingCore accentColor={accentColor} />
        <HoloProjector accentColor={accentColor} />
        <Environment preset="night" />
      </Suspense>

      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.4} />

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.9} />
        <Vignette eskil={false} offset={0.12} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
};
