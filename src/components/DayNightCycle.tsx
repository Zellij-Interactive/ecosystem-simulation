import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DayNightCycle: React.FC = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    if (!directionalLightRef.current || !ambientLightRef.current) return;

    // Simple day/night cycle - just adjust light intensity
    const time = Date.now() * 0.001; // Current time in seconds
    const dayDuration = 30; // 30 seconds for a full day/night cycle
    const timeOfDay = (time % dayDuration) / dayDuration; // 0-1

    // Calculate light intensity based on time of day
    const lightIntensity = Math.max(0.3, Math.sin(timeOfDay * Math.PI * 2) * 0.8 + 0.5);
    const ambientIntensity = Math.max(0.2, lightIntensity * 0.4);

    // Update light intensities
    directionalLightRef.current.intensity = lightIntensity;
    ambientLightRef.current.intensity = ambientIntensity;

    // Simple color change - warmer at "sunset/sunrise"
    const sunHeight = Math.sin(timeOfDay * Math.PI * 2);
    if (sunHeight < 0.2 && sunHeight > -0.2) {
      // Sunset/sunrise - warmer colors
      directionalLightRef.current.color.set('#ffaa77');
    } else if (sunHeight > 0.5) {
      // Noon - bright white
      directionalLightRef.current.color.set('#ffffff');
    } else {
      // Regular daylight
      directionalLightRef.current.color.set('#fff8dc');
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
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight
        ref={ambientLightRef}
        intensity={0.4}
        color="#ffffff"
      />
    </group>
  );
};

export default DayNightCycle;