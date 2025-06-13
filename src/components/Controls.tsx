import React from 'react';
import { Play, Pause, Plus, Minus, RefreshCw, ToggleLeft, Rabbit, Cat } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

const Controls: React.FC = () => {
  const { 
    isPaused, 
    togglePause, 
    speedFactor,
    setSpeedFactor,
    showStats,
    toggleStats,
    showGrid,
    toggleGrid,
    addRabbit,
    addFox,
    reset
  } = useSimulationStore();

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-md p-4 rounded-lg text-white">
      <h2 className="text-lg font-semibold mb-3">Simulation Controls</h2>
      
      <div className="flex flex-col space-y-4">
        {/* Play/Pause */}
        <div className="flex items-center justify-between">
          <span>Simulation:</span>
          <button 
            onClick={togglePause}
            className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition-colors"
          >
            {isPaused 
              ? <Play size={18} className="text-white" /> 
              : <Pause size={18} className="text-white" />
            }
          </button>
        </div>
        
        {/* Speed Control */}
        <div className="flex items-center justify-between">
          <span>Speed: {speedFactor.toFixed(1)}x</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSpeedFactor(Math.max(0.1, speedFactor - 0.1))}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
              disabled={speedFactor <= 0.1}
            >
              <Minus size={18} className="text-white" />
            </button>
            <button 
              onClick={() => setSpeedFactor(Math.min(3.0, speedFactor + 0.1))}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
              disabled={speedFactor >= 3.0}
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Add Animals */}
        <div className="flex items-center justify-between">
          <span>Add Animals:</span>
          <div className="flex space-x-2">
            <button 
              onClick={addRabbit}
              className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors flex items-center space-x-1"
              title="Add Rabbit"
            >
              <Rabbit size={18} className="text-white" />
            </button>
            <button 
              onClick={addFox}
              className="bg-orange-600 hover:bg-orange-700 p-2 rounded-full transition-colors"
              title="Add Fox"
            >
              <Cat size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Toggle Controls */}
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleStats}
          >
            <span>Show Stats</span>
            <ToggleLeft 
              size={24} 
              className={`${showStats ? 'text-blue-400' : 'text-gray-400'}`} 
            />
          </div>
          
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleGrid}
          >
            <span>Show Grid</span>
            <ToggleLeft 
              size={24} 
              className={`${showGrid ? 'text-blue-400' : 'text-gray-400'}`} 
            />
          </div>
        </div>
        
        {/* Reset */}
        <button 
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors mt-2"
        >
          <RefreshCw size={18} />
          <span>Reset Simulation</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;