export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface AgentType {
  id: string;
  position: Vector3;
  velocity: Vector3;
  energy: number;
  age: number;
  lastReproduced: number;
  type: 'rabbit' | 'fox';
  gender: 'male' | 'female';
  isPregnant?: boolean;
  pregnancyTime?: number;
}

export interface SimulationState {
  rabbits: AgentType[];
  foxes: AgentType[];
  isPaused: boolean;
  speedFactor: number;
  showStats: boolean;
  showGrid: boolean;
  worldSize: number;
  simulationTime: number;
  
  // Actions
  togglePause: () => void;
  setSpeedFactor: (speed: number) => void;
  toggleStats: () => void;
  toggleGrid: () => void;
  addRabbit: () => void;
  addFox: () => void;
  updateAgents: (deltaTime: number) => void;
  reset: () => void;
}