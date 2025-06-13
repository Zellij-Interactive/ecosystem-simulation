import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import { Plane } from '@react-three/drei';

interface GridProps {
  size: number;
}

const Grid: React.FC<GridProps> = ({ size }) => {
  const gridSize = size * 2;
  const gridDivisions = 20;
  
  return (
    <gridHelper 
      args={[gridSize, gridDivisions]} 
      position={[0, 0.01, 0]} 
      rotation={[0, 0, 0]} 
      visible={useSimulationStore(state => state.showGrid)}
    />
  );
};

const Ground: React.FC = () => {
  const envRef = useRef<THREE.Group>(null);
  const worldSize = useSimulationStore(state => state.worldSize);
  
  useFrame((state, delta) => {
    // Subtle animation for the environment if needed
    if (envRef.current) {
      // Example: gentle sway for grass or other elements
    }
  });

  return (
    <group ref={envRef}>
      {/* Main ground plane */}
      <Plane 
        args={[worldSize * 2, worldSize * 2]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color="#7CBA92" 
          roughness={1} 
          metalness={0}
        />
      </Plane>
      
      {/* Helper grid */}
      <Grid size={worldSize} />
      
      {/* Environment boundary indicator */}
      <mesh position={[0, 0.05, 0]}>
        <ringGeometry args={[worldSize - 0.1, worldSize, 64]} />
        <meshBasicMaterial color="#5D8A68" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default Ground;