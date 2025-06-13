import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

const DayNightCycle: React.FC = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  
  const { simulationTime, isPaused, speedFactor } = useSimulationStore();

  // Get sun color based on time of day
  const getSunColor = (timeOfDay: number): string => {
    // timeOfDay is 0-1, where 0 is midnight, 0.5 is noon
    if (timeOfDay < 0.2 || timeOfDay > 0.8) {
      // Night time - cool blue
      return '#4169e1';
    } else if (timeOfDay < 0.25 || timeOfDay > 0.75) {
      // Dawn/Dusk - warm orange
      return '#ff6b35';
    } else if (timeOfDay < 0.3 || timeOfDay > 0.7) {
      // Early morning/late afternoon - soft yellow
      return '#ffd23f';
    } else if (timeOfDay >= 0.4 && timeOfDay <= 0.6) {
      // Noon - bright white
      return '#ffffff';
    } else {
      // Morning/afternoon - warm white
      return '#fff8dc';
    }
  };

  // Get ambient color based on time of day
  const getAmbientColor = (timeOfDay: number): string => {
    if (timeOfDay < 0.2 || timeOfDay > 0.8) {
      // Night time - subtle blue
      return '#1e3a8a';
    } else {
      // Day time - neutral
      return '#ffffff';
    }
  };

  useFrame(() => {
    if (!directionalLightRef.current || !ambientLightRef.current || isPaused) return;

    // Day duration in simulation seconds (60 seconds = 1 full day)
    const dayDuration = 60;
    const timeOfDay = (simulationTime % dayDuration) / dayDuration; // 0-1

    // Calculate sun position (circular path across the sky)
    const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2; // Start at sunrise
    const sunRadius = 30;
    const sunHeight = 20;
    
    const sunPosition = new THREE.Vector3(
      Math.cos(sunAngle) * sunRadius,
      Math.sin(sunAngle) * sunHeight + 10, // Offset to keep above horizon
      Math.sin(sunAngle) * 15
    );

    // Update directional light position
    directionalLightRef.current.position.copy(sunPosition);
    directionalLightRef.current.target.position.set(0, 0, 0);

    // Calculate sun intensity based on height above horizon
    const sunHeightNormalized = Math.max(0, Math.sin(sunAngle));
    const sunIntensity = Math.max(0.2, sunHeightNormalized * 1.2);
    
    // Calculate ambient intensity
    const ambientIntensity = Math.max(0.1, sunHeightNormalized * 0.6);

    // Update light properties
    directionalLightRef.current.intensity = sunIntensity;
    directionalLightRef.current.color.set(getSunColor(timeOfDay));
    
    ambientLightRef.current.intensity = ambientIntensity;
    ambientLightRef.current.color.set(getAmbientColor(timeOfDay));

    // Update shadow camera to follow the sun
    if (directionalLightRef.current.shadow.camera) {
      directionalLightRef.current.shadow.camera.updateProjectionMatrix();
    }
  });

  return (
    <group>
      {/* Main directional light (sun) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 10]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight
        ref={ambientLightRef}
        intensity={0.5}
        color="#ffffff"
      />
      
      {/* Visual sun representation */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color="#ffff00" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default DayNightCycle;