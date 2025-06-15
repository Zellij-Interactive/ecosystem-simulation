import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { AgentType } from '../models/types';
import { useSimulationStore } from '../store/simulationStore';

interface FoxProps {
  fox: AgentType;
  worldSize: number;
}

const Fox: React.FC<FoxProps> = ({ fox, worldSize }) => {
  const foxRef = useRef<THREE.Group>(null);
  const energyBarRef = useRef<THREE.Mesh>(null);
  const { setSelectedAnimal, selectedAnimal } = useSimulationStore();
  
  // Check if this fox is selected
  const isSelected = selectedAnimal?.id === fox.id;
  
  // Energy bar scale based on current energy
  const energyBarScale = useMemo(() => {
    return new THREE.Vector3(
      Math.max(0.1, fox.energy / 100), 
      0.1, 
      0.1
    );
  }, [fox.energy]);

  // Color variations based on gender
  const foxColor = fox.gender === 'male' ? '#e05d00' : '#d95a00';
  const snoutColor = fox.gender === 'male' ? '#d95a00' : '#c54a00';

  // Handle click to select animal
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    console.log('Fox clicked:', fox.id);
    setSelectedAnimal(fox);
  };

  // Update position and rotation for the fox model
  useFrame(() => {
    if (foxRef.current) {
      // Update position
      foxRef.current.position.set(
        fox.position.x,
        0.3, // Slightly above ground
        fox.position.z
      );
      
      // Update rotation to face movement direction
      if (fox.velocity.x !== 0 || fox.velocity.z !== 0) {
        foxRef.current.rotation.y = Math.atan2(
          fox.velocity.x,
          fox.velocity.z
        );
      }
      
      // Update energy bar
      if (energyBarRef.current) {
        energyBarRef.current.scale.x = Math.max(0.1, fox.energy / 100);
        
        // Color changes based on energy level
        const material = energyBarRef.current.material as THREE.MeshStandardMaterial;
        if (fox.energy > 70) {
          material.color.set('#4ade80'); // Green for high energy
        } else if (fox.energy > 30) {
          material.color.set('#facc15'); // Yellow for medium energy
        } else {
          material.color.set('#f87171'); // Red for low energy
        }
      }
    }
  });

  return (
    <group ref={foxRef}>
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]}>
          <ringGeometry args={[1.0, 1.2, 32]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Clickable invisible sphere for better click detection */}
      <mesh 
        position={[0, 0.4, 0]} 
        onClick={handleClick}
        visible={false}
      >
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Fox body */}
      <group onClick={handleClick}>
        {/* Body - slightly larger if pregnant */}
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[
            fox.isPregnant ? 0.3 : 0.25, 
            fox.isPregnant ? 0.7 : 0.6, 
            8, 16
          ]} />
          <meshStandardMaterial 
            color={isSelected ? '#ff7700' : foxColor}
            emissive={isSelected ? '#440000' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.3, 0.4]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color={isSelected ? '#ff7700' : foxColor}
            emissive={isSelected ? '#440000' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
        
        {/* Snout */}
        <mesh position={[0, 0.25, 0.6]} castShadow>
          <coneGeometry args={[0.12, 0.3, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial 
            color={isSelected ? '#ff6600' : snoutColor}
            emissive={isSelected ? '#440000' : '#000000'}
            emissiveIntensity={isSelected ? 0.1 : 0}
          />
        </mesh>
        
        {/* Ears - different sizes for male/female */}
        <group position={[0, 0.5, 0.35]}>
          <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, -0.2]} castShadow>
            <coneGeometry args={[
              0.06, 
              fox.gender === 'male' ? 0.22 : 0.2, 
              8
            ]} />
            <meshStandardMaterial 
              color={isSelected ? '#ff7700' : foxColor}
              emissive={isSelected ? '#440000' : '#000000'}
              emissiveIntensity={isSelected ? 0.1 : 0}
            />
          </mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.2]} castShadow>
            <coneGeometry args={[
              0.06, 
              fox.gender === 'male' ? 0.22 : 0.2, 
              8
            ]} />
            <meshStandardMaterial 
              color={isSelected ? '#ff7700' : foxColor}
              emissive={isSelected ? '#440000' : '#000000'}
              emissiveIntensity={isSelected ? 0.1 : 0}
            />
          </mesh>
        </group>
        
        {/* Eyes */}
        <group position={[0, 0.35, 0.5]}>
          <mesh position={[-0.07, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0.07, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
        
        {/* Tail */}
        <mesh position={[0, 0.1, -0.4]} rotation={[0.3, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
          <meshStandardMaterial 
            color={isSelected ? '#ff7700' : foxColor}
            emissive={isSelected ? '#440000' : '#000000'}
            emissiveIntensity={isSelected ? 0.1 : 0}
          />
        </mesh>
        
        {/* Tip of tail (white) */}
        <mesh position={[0, 0.05, -0.7]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        {/* Gender indicator - larger colored sphere */}
        <mesh position={[0, 0.7, 0.2]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color={fox.gender === 'male' ? '#3b82f6' : '#ec4899'} />
        </mesh>
      </group>
      
      {/* Energy bar */}
      <group position={[0, 1.0, 0]}>
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
      {fox.isPregnant && (
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  );
};

export default Fox;