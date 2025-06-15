import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls, Stats as DreiStats } from '@react-three/drei';
import Ground from './Ground';
import Agents from './Agents';
import DayNightCycle from './DayNightCycle';
import { useSimulationStore } from '../store/simulationStore';

const Simulation: React.FC = () => {
  const { showStats, setSelectedAnimal } = useSimulationStore();

  // Handle canvas click to deselect animals
  const handleCanvasClick = (event: any) => {
    // Only deselect if clicking on the canvas itself, not on objects
    if (event.eventObject === event.object) {
      console.log('Canvas clicked - deselecting animal');
      setSelectedAnimal(null);
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 20], fov: 50 }}
      className="w-full h-full bg-gray-900"
      onPointerMissed={() => {
        console.log('Pointer missed - deselecting animal');
        setSelectedAnimal(null);
      }}
    >
      {showStats && <DreiStats className="stats" />}
      <fog attach="fog" args={['#e4e9be', 30, 100]} />
      
      {/* Dynamic Day/Night Lighting System */}
      <DayNightCycle />
      
      <Suspense fallback={null}>
        <Sky 
          distance={450000} 
          sunPosition={[0, 1, 0]} 
          inclination={0.5} 
          azimuth={0.25} 
        />
        <Ground />
        <Agents />
      </Suspense>
      
      <OrbitControls 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2.5} 
        minDistance={5} 
        maxDistance={50}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
};

export default Simulation;