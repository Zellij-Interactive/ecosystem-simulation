import React from 'react';
import Simulation from './components/Simulation';
import Controls from './components/Controls';
import Stats from './components/Stats';

function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Simulation Canvas */}
      <Simulation />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-white text-2xl font-bold mb-2">Ecosystem Simulation</h1>
          <Stats />
        </div>
        <div className="pointer-events-auto">
          <Controls />
        </div>
      </div>
    </div>
  );
}

export default App;