import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { AgentType } from '../models/types';
import { useSimulationStore } from '../store/simulationStore';

interface RabbitProps {
  rabbit: AgentType;
  worldSize: number;
}

const Rabbit: React.FC<RabbitProps> = ({ rabbit, worldSize }) => {
  const rabbitRef = useRef<THREE.Group>(null);
  const energyBarRef = useRef<THREE.Mesh>(null);
  const { setSelectedAnimal, selectedAnimal } = useSimulationStore();
  
  // Check if this rabbit is selected
  const isSelected = selectedAnimal?.id === rabbit.id;
  
  // Energy bar scale based on current energy
  const energyBarScale = useMemo(() => {
    return new THREE.Vector3(
      Math.max(0.1, rabbit.energy / 100), 
      0.1, 
      0.1
    );
  }, [rabbit.energy]);

  // Color based on gender
  const rabbitColor = rabbit.gender === 'male' ? '#f0f0f0' : '#e8e8e8';
  const earColor = rabbit.gender === 'male' ? '#d8d8d8' : '#d0d0d0';

  // Handle click to select animal
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    console.log('Rabbit clicked:', rabbit.id);
    setSelectedAnimal(rabbit);
  };

  // Update position and rotation for the rabbit model
  useFrame(() => {
    if (rabbitRef.current) {
      // Update position
      rabbitRef.current.position.set(
        rabbit.position.x,
        0.2, // Slightly above ground
        rabbit.position.z
      );
      
      // Update rotation to face movement direction
      if (rabbit.velocity.x !== 0 || rabbit.velocity.z !== 0) {
        rabbitRef.current.rotation.y = Math.atan2(
          rabbit.velocity.x,
          rabbit.velocity.z
        );
      }
      
      // Update energy bar
      if (energyBarRef.current) {
        energyBarRef.current.scale.x = Math.max(0.1, rabbit.energy / 100);
        
        // Color changes based on energy level
        const material = energyBarRef.current.material as THREE.MeshStandardMaterial;
        if (rabbit.energy > 70) {
          material.color.set('#4ade80'); // Green for high energy
        } else if (rabbit.energy > 30) {
          material.color.set('#facc15'); // Yellow for medium energy
        } else {
          material.color.set('#f87171'); // Red for low energy
        }
      }
    }
  });

  return (
    <group ref={rabbitRef}>
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]}>
          <ringGeometry args={[0.8, 1.0, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Clickable invisible sphere for better click detection */}
      <mesh 
        position={[0, 0.3, 0]} 
        onClick={handleClick}
        visible={false}
      >
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Rabbit body */}
      <group onClick={handleClick}>
        {/* Body - slightly larger if pregnant */}
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[
            rabbit.isPregnant ? 0.25 : 0.2, 
            rabbit.isPregnant ? 0.35 : 0.3, 
            8, 16
          ]} />
          <meshStandardMaterial 
            color={isSelected ? '#ffffff' : rabbitColor}
            emissive={isSelected ? '#004400' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.3, 0.2]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={isSelected ? '#ffffff' : rabbitColor}
            emissive={isSelected ? '#004400' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
        
        {/* Ears - different sizes for male/female */}
        <group position={[0, 0.4, 0.15]}>
          <mesh position={[-0.08, 0.1, 0]} castShadow>
            <capsuleGeometry args={[
              0.03, 
              rabbit.gender === 'male' ? 0.28 : 0.25, 
              8, 8
            ]} />
            <meshStandardMaterial 
              color={isSelected ? '#f0f0f0' : earColor}
              emissive={isSelected ? '#004400' : '#000000'}
              emissiveIntensity={isSelected ? 0.1 : 0}
            />
          </mesh>
          <mesh position={[0.08, 0.1, 0]} castShadow>
            <capsuleGeometry args={[
              0.03, 
              rabbit.gender === 'male' ? 0.28 : 0.25, 
              8, 8
            ]} />
            <meshStandardMaterial 
              color={isSelected ? '#f0f0f0' : earColor}
              emissive={isSelected ? '#004400' : '#000000'}
              emissiveIntensity={isSelected ? 0.1 : 0}
            />
          </mesh>
        </group>
        
        {/* Eyes */}
        <group position={[0, 0.35, 0.32]}>
          <mesh position={[-0.05, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
        
        {/* Tail */}
        <mesh position={[0, 0.1, -0.25]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        {/* Gender indicator - larger colored sphere */}
        <mesh position={[0, 0.6, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={rabbit.gender === 'male' ? '#3b82f6' : '#ec4899'} />
        </mesh>
      </group>
      
      {/* Energy bar */}
      <group position={[0, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#334155" transparent opacity={0.3} />
        </mesh>
        <mesh 
          ref={energyBarRef} 
          position={[0, 0, 0]}
          scale={energyBarScale}
        >
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
      </group>
      
      {/* Pregnancy indicator */}
      {rabbit.isPregnant && (
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  );
};

export default Rabbit;