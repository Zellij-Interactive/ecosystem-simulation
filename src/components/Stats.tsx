import React from 'react';
import { useSimulationStore } from '../store/simulationStore';

const Stats: React.FC = () => {
  const { rabbits, foxes, simulationTime } = useSimulationStore();
  
  // Calculate gender statistics
  const rabbitMales = rabbits.filter(r => r.gender === 'male').length;
  const rabbitFemales = rabbits.filter(r => r.gender === 'female').length;
  const pregnantRabbits = rabbits.filter(r => r.isPregnant).length;
  
  const foxMales = foxes.filter(f => f.gender === 'male').length;
  const foxFemales = foxes.filter(f => f.gender === 'female').length;
  const pregnantFoxes = foxes.filter(f => f.isPregnant).length;
  
  // Format simulation time
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate time of day
  const getTimeOfDay = (timeInSeconds: number) => {
    const dayDuration = 60; // 60 seconds = 1 full day
    const timeOfDay = (timeInSeconds % dayDuration) / dayDuration;
    
    if (timeOfDay < 0.2 || timeOfDay > 0.8) {
      return '🌙 Night';
    } else if (timeOfDay < 0.25 || timeOfDay > 0.75) {
      return '🌅 Dawn/Dusk';
    } else if (timeOfDay >= 0.4 && timeOfDay <= 0.6) {
      return '☀️ Noon';
    } else {
      return '🌞 Day';
    }
  };

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-md p-4 rounded-lg text-white">
      <h2 className="text-lg font-semibold mb-3">Ecosystem Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">Time</span>
          <span className="text-xl">{formatTime(simulationTime)}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">Time of Day</span>
          <span className="text-lg">{getTimeOfDay(simulationTime)}</span>
        </div>
        
        <div className="flex flex-col col-span-2">
          <span className="text-sm text-gray-300">Total Population</span>
          <span className="text-xl">{rabbits.length + foxes.length}</span>
        </div>
      </div>
      
      {/* Rabbit Statistics */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="w-3 h-3 rounded-full bg-gray-200 mr-2"></span>
          <span className="text-sm font-medium">Rabbits ({rabbits.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm ml-5">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
            <span>Males: {rabbitMales}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-pink-400 mr-1"></span>
            <span>Females: {rabbitFemales}</span>
          </div>
          {pregnantRabbits > 0 && (
            <div className="flex items-center col-span-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
              <span>Pregnant: {pregnantRabbits}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Fox Statistics */}
      <div>
        <div className="flex items-center mb-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
          <span className="text-sm font-medium">Foxes ({foxes.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm ml-5">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
            <span>Males: {foxMales}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-pink-400 mr-1"></span>
            <span>Females: {foxFemales}</span>
          </div>
          {pregnantFoxes > 0 && (
            <div className="flex items-center col-span-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
              <span>Pregnant: {pregnantFoxes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;