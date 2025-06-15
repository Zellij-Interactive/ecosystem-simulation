import React from 'react';
import { X } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

const AnimalInfoPanel: React.FC = () => {
  const { selectedAnimal, setSelectedAnimal, rabbits, foxes } = useSimulationStore();

  if (!selectedAnimal) return null;

  const getEnergyColor = (energy: number) => {
    if (energy > 70) return 'bg-green-500';
    if (energy > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatAge = (age: number) => {
    return `${Math.floor(age)}s`;
  };

  // Helper function to calculate distance between two positions
  const distanceSquared = (pos1: any, pos2: any) => {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return dx * dx + dz * dz;
  };

  // Get current behavior based on animal type and nearby threats/prey
  const getCurrentBehavior = () => {
    if (selectedAnimal.isPregnant) return 'Pregnant';
    
    const currentSpeed = Math.sqrt(
      selectedAnimal.velocity.x ** 2 + selectedAnimal.velocity.z ** 2
    );

    if (selectedAnimal.type === 'rabbit') {
      // Check if there are foxes nearby (within 6 units)
      const nearbyFoxes = foxes.filter(fox => {
        const distance = Math.sqrt(distanceSquared(selectedAnimal.position, fox.position));
        return distance < 6.0;
      });

      if (nearbyFoxes.length > 0 && currentSpeed > 2.0) {
        return 'Running'; // Rabbit is fleeing from foxes
      }
      
      return 'Grazing'; // Default rabbit behavior
    } else {
      // Fox behavior
      const nearbyRabbits = rabbits.filter(rabbit => {
        const distance = Math.sqrt(distanceSquared(selectedAnimal.position, rabbit.position));
        return distance < 8.0;
      });

      if (nearbyRabbits.length > 0 && currentSpeed > 2.0) {
        return 'Hunting'; // Fox is chasing rabbits
      }
      
      return 'Wandering'; // Default fox behavior
    }
  };

  const currentBehavior = getCurrentBehavior();

  return (
    <div className="fixed top-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {selectedAnimal.type === 'rabbit' ? '🐰' : '🦊'}
          </span>
          <div>
            <h3 className="font-semibold text-gray-800 capitalize">
              {selectedAnimal.type}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedAnimal.gender === 'male' ? 'Male ♂️' : 'Female ♀️'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedAnimal(null)}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Info Content */}
      <div className="p-4 space-y-4">
        {/* Energy */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Energy</span>
            <span>{selectedAnimal.energy.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getEnergyColor(selectedAnimal.energy)}`}
              style={{ width: `${Math.max(0, selectedAnimal.energy)}%` }}
            />
          </div>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Age</span>
            <p className="font-medium text-gray-800">{formatAge(selectedAnimal.age)}</p>
          </div>
          <div>
            <span className="text-gray-500">Behavior</span>
            <p className="font-medium text-gray-800">
              {currentBehavior}
            </p>
          </div>
        </div>

        {/* Position */}
        <div>
          <span className="text-gray-500 text-sm">Position</span>
          <p className="font-medium text-gray-800 text-sm">
            ({selectedAnimal.position.x.toFixed(1)}, {selectedAnimal.position.z.toFixed(1)})
          </p>
        </div>

        {/* Speed */}
        <div>
          <span className="text-gray-500 text-sm">Speed</span>
          <p className="font-medium text-gray-800 text-sm">
            {Math.sqrt(
              selectedAnimal.velocity.x ** 2 + selectedAnimal.velocity.z ** 2
            ).toFixed(1)} units/s
          </p>
        </div>

        {/* Pregnancy Info */}
        {selectedAnimal.isPregnant && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🤱</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">Expecting</p>
                <p className="text-xs text-yellow-600">
                  {selectedAnimal.pregnancyTime ? 
                    `${(selectedAnimal.pregnancyTime).toFixed(1)}s pregnant` : 
                    'Just became pregnant'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalInfoPanel;