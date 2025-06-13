import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import Rabbit from './Rabbit';
import Fox from './Fox';

const Agents: React.FC = () => {
  const { 
    rabbits, 
    foxes, 
    updateAgents, 
    isPaused,
    worldSize
  } = useSimulationStore();

  // Update simulation every frame
  useFrame((state, delta) => {
    if (!isPaused) {
      updateAgents(delta);
    }
  });

  return (
    <group>
      {/* Render all rabbits */}
      {rabbits.map((rabbit) => (
        <Rabbit 
          key={rabbit.id} 
          rabbit={rabbit} 
          worldSize={worldSize}
        />
      ))}
      
      {/* Render all foxes */}
      {foxes.map((fox) => (
        <Fox 
          key={fox.id} 
          fox={fox} 
          worldSize={worldSize}
        />
      ))}
    </group>
  );
};

export default Agents;