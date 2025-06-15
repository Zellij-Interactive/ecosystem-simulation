import { create } from 'zustand';
import { SimulationState, AgentType, Vector3 } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Helper functions
const randomPosition = (worldSize: number): Vector3 => ({
  x: (Math.random() * 2 - 1) * worldSize * 0.8,
  y: 0,
  z: (Math.random() * 2 - 1) * worldSize * 0.8,
});

const randomVelocity = (speed: number): Vector3 => {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * speed,
    y: 0,
    z: Math.sin(angle) * speed,
  };
};

const randomGender = (): 'male' | 'female' => Math.random() < 0.5 ? 'male' : 'female';

const createRabbit = (worldSize: number): AgentType => ({
  id: uuidv4(),
  position: randomPosition(worldSize),
  velocity: randomVelocity(1.2),
  energy: 80,
  age: 0,
  lastReproduced: 0,
  type: 'rabbit',
  gender: randomGender(),
  isPregnant: false,
  pregnancyTime: 0,
});

const createFox = (worldSize: number): AgentType => ({
  id: uuidv4(),
  position: randomPosition(worldSize),
  velocity: randomVelocity(1.8),
  energy: 100,
  age: 0,
  lastReproduced: 0,
  type: 'fox',
  gender: randomGender(),
  isPregnant: false,
  pregnancyTime: 0,
});

// Vector operations
const distanceSquared = (a: Vector3, b: Vector3): number => {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
};

const normalizeVector = (v: Vector3): Vector3 => {
  const magnitude = Math.sqrt(v.x * v.x + v.z * v.z);
  if (magnitude === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: v.x / magnitude,
    y: 0,
    z: v.z / magnitude,
  };
};

// Initial simulation configuration
const WORLD_SIZE = 20;
const INITIAL_RABBITS = 8;
const INITIAL_FOXES = 4;

// Create the store
export const useSimulationStore = create<SimulationState>((set, get) => ({
  // State
  rabbits: Array(INITIAL_RABBITS).fill(null).map(() => createRabbit(WORLD_SIZE)),
  foxes: Array(INITIAL_FOXES).fill(null).map(() => createFox(WORLD_SIZE)),
  isPaused: false,
  speedFactor: 1.0,
  showStats: true,
  showGrid: true,
  worldSize: WORLD_SIZE,
  simulationTime: 0,
  selectedAnimal: null,
  
  // Actions
  togglePause: () => set(state => ({ isPaused: !state.isPaused })),
  
  setSpeedFactor: (speed) => set({ speedFactor: speed }),
  
  toggleStats: () => set(state => ({ showStats: !state.showStats })),
  
  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  
  setSelectedAnimal: (animal) => set({ selectedAnimal: animal }),
  
  addRabbit: () => set(state => ({
    rabbits: [...state.rabbits, createRabbit(state.worldSize)]
  })),
  
  addFox: () => set(state => ({
    foxes: [...state.foxes, createFox(state.worldSize)]
  })),
  
  updateAgents: (deltaTime) => {
    const state = get();
    const newDelta = deltaTime * state.speedFactor;
    
    // Update simulation time
    set(state => ({ simulationTime: state.simulationTime + newDelta }));
    
    // Track which rabbits get eaten
    const eatenRabbitIds = new Set<string>();
    
    // Update foxes first and check for hunting
    const updatedFoxes = state.foxes
      .map(fox => {
        const result = updateFox(fox, state, newDelta, state.rabbits);
        if (result.eatenRabbitId) {
          eatenRabbitIds.add(result.eatenRabbitId);
        }
        return result.fox;
      })
      .filter(fox => fox.energy > 0); // Remove dead foxes
    
    // Update rabbits (excluding eaten ones)
    const updatedRabbits = state.rabbits
      .filter(rabbit => !eatenRabbitIds.has(rabbit.id)) // Remove eaten rabbits
      .map(rabbit => updateRabbit(rabbit, state, newDelta))
      .filter(rabbit => rabbit.energy > 0); // Remove dead rabbits
      
    // Check for new births (gender-based reproduction)
    const newRabbits = checkGenderBasedReproduction(updatedRabbits, state.worldSize, 'rabbit');
    const newFoxes = checkGenderBasedReproduction(updatedFoxes, state.worldSize, 'fox');
    
    // Update selected animal if it still exists
    const allAnimals = [...updatedRabbits, ...newRabbits, ...updatedFoxes, ...newFoxes];
    const selectedAnimal = state.selectedAnimal 
      ? allAnimals.find(animal => animal.id === state.selectedAnimal?.id) || null
      : null;
    
    set({
      rabbits: [...updatedRabbits, ...newRabbits],
      foxes: [...updatedFoxes, ...newFoxes],
      selectedAnimal
    });
  },
  
  reset: () => set({
    rabbits: Array(INITIAL_RABBITS).fill(null).map(() => createRabbit(WORLD_SIZE)),
    foxes: Array(INITIAL_FOXES).fill(null).map(() => createFox(WORLD_SIZE)),
    simulationTime: 0,
    selectedAnimal: null
  }),
}));

// Agent update functions
const updateRabbit = (rabbit: AgentType, state: SimulationState, deltaTime: number): AgentType => {
  // Handle pregnancy
  let updatedRabbit = { ...rabbit };
  if (rabbit.isPregnant && rabbit.pregnancyTime !== undefined) {
    updatedRabbit.pregnancyTime = rabbit.pregnancyTime + deltaTime;
  }

  // Random movement with occasional direction changes
  let newVelocity = { ...updatedRabbit.velocity };
  
  if (Math.random() < 0.03) {
    const changeAngle = (Math.random() - 0.5) * Math.PI / 2;
    const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z);
    const currentAngle = Math.atan2(newVelocity.z, newVelocity.x);
    const newAngle = currentAngle + changeAngle;
    
    newVelocity = {
      x: Math.cos(newAngle) * speed,
      y: 0,
      z: Math.sin(newAngle) * speed,
    };
  }
  
  // Check if a fox is nearby, and if so, run away
  const closestFox = findClosestFox(updatedRabbit, state.foxes);
  if (closestFox) {
    const distance = Math.sqrt(distanceSquared(updatedRabbit.position, closestFox.position));
    
    if (distance < 6) { // Detection radius
      // Move away from the fox
      const awayVector = {
        x: updatedRabbit.position.x - closestFox.position.x,
        y: 0,
        z: updatedRabbit.position.z - closestFox.position.z,
      };
      
      const normalized = normalizeVector(awayVector);
      const escapeSpeed = 3.0; // Faster when escaping
      
      newVelocity = {
        x: normalized.x * escapeSpeed,
        y: 0,
        z: normalized.z * escapeSpeed,
      };
    }
  }
  
  // Update position
  const newPosition = {
    x: updatedRabbit.position.x + newVelocity.x * deltaTime,
    y: updatedRabbit.position.y,
    z: updatedRabbit.position.z + newVelocity.z * deltaTime,
  };
  
  // Keep within bounds
  const boundedPosition = keepWithinBounds(newPosition, state.worldSize);
  
  // Update energy - rabbits slowly regain energy but consume less
  let newEnergy = updatedRabbit.energy;
  
  newEnergy = Math.min(100, updatedRabbit.energy + 3 * deltaTime); // Rabbits regenerate energy faster
  newEnergy -= 0.8 * deltaTime; // Reduced energy consumption
  
  // Pregnancy energy cost
  if (updatedRabbit.isPregnant) {
    newEnergy -= 0.5 * deltaTime; // Additional energy cost during pregnancy
  }
  
  return {
    ...updatedRabbit,
    position: boundedPosition,
    velocity: newVelocity,
    energy: newEnergy,
    age: updatedRabbit.age + deltaTime,
  };
};

const updateFox = (
  fox: AgentType, 
  state: SimulationState, 
  deltaTime: number, 
  rabbits: AgentType[]
): { fox: AgentType; eatenRabbitId?: string } => {
  // Handle pregnancy
  let updatedFox = { ...fox };
  if (fox.isPregnant && fox.pregnancyTime !== undefined) {
    updatedFox.pregnancyTime = fox.pregnancyTime + deltaTime;
  }

  // Find the closest rabbit to hunt
  const closestRabbit = findClosestRabbit(updatedFox, rabbits);
  let newVelocity = { ...updatedFox.velocity };
  let newEnergy = updatedFox.energy - 2.5 * deltaTime; // Reduced energy consumption for foxes
  let eatenRabbitId: string | undefined;
  
  // Pregnancy energy cost
  if (updatedFox.isPregnant) {
    newEnergy -= 0.8 * deltaTime; // Additional energy cost during pregnancy
  }
  
  if (closestRabbit) {
    const distance = Math.sqrt(distanceSquared(updatedFox.position, closestRabbit.position));
    
    if (distance < 8) { // Detection radius
      // Move toward the rabbit - HUNTING SPEED
      const towardVector = {
        x: closestRabbit.position.x - updatedFox.position.x,
        y: 0,
        z: closestRabbit.position.z - updatedFox.position.z,
      };
      
      const normalized = normalizeVector(towardVector);
      const huntSpeed = 3.5; // INCREASED hunting speed (was 2.5)
      
      newVelocity = {
        x: normalized.x * huntSpeed,
        y: 0,
        z: normalized.z * huntSpeed,
      };
      
      // If close enough, eat the rabbit
      if (distance < 1.2) { // Catch radius
        // Gain energy from eating and mark rabbit as eaten
        newEnergy = Math.min(100, updatedFox.energy + 60); // More energy from eating
        eatenRabbitId = closestRabbit.id;
      }
    } else {
      // No rabbit in detection range - use wandering speed
      if (Math.random() < 0.04) {
        const changeAngle = (Math.random() - 0.5) * Math.PI / 2;
        const wanderSpeed = 1.8; // WANDERING SPEED (slower than hunting)
        const currentAngle = Math.atan2(newVelocity.z, newVelocity.x);
        const newAngle = currentAngle + changeAngle;
        
        newVelocity = {
          x: Math.cos(newAngle) * wanderSpeed,
          y: 0,
          z: Math.sin(newAngle) * wanderSpeed,
        };
      }
    }
  } else {
    // No rabbits detected - random wandering movement
    if (Math.random() < 0.04) {
      const changeAngle = (Math.random() - 0.5) * Math.PI / 2;
      const wanderSpeed = 1.8; // WANDERING SPEED
      const currentAngle = Math.atan2(newVelocity.z, newVelocity.x);
      const newAngle = currentAngle + changeAngle;
      
      newVelocity = {
        x: Math.cos(newAngle) * wanderSpeed,
        y: 0,
        z: Math.sin(newAngle) * wanderSpeed,
      };
    }
  }
  
  // Update position
  const newPosition = {
    x: updatedFox.position.x + newVelocity.x * deltaTime,
    y: updatedFox.position.y,
    z: updatedFox.position.z + newVelocity.z * deltaTime,
  };
  
  // Keep within bounds
  const boundedPosition = keepWithinBounds(newPosition, state.worldSize);
  
  const finalFox = {
    ...updatedFox,
    position: boundedPosition,
    velocity: newVelocity,
    energy: newEnergy,
    age: updatedFox.age + deltaTime,
  };
  
  return { fox: finalFox, eatenRabbitId };
};

// Helper function to find the closest rabbit to a fox
const findClosestRabbit = (fox: AgentType, rabbits: AgentType[]): AgentType | null => {
  if (rabbits.length === 0) return null;
  
  let closestRabbit = null;
  let closestDistance = Infinity;
  
  for (const rabbit of rabbits) {
    const distance = distanceSquared(fox.position, rabbit.position);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestRabbit = rabbit;
    }
  }
  
  return closestRabbit;
};

// Helper function to find the closest fox to a rabbit
const findClosestFox = (rabbit: AgentType, foxes: AgentType[]): AgentType | null => {
  if (foxes.length === 0) return null;
  
  let closestFox = null;
  let closestDistance = Infinity;
  
  for (const fox of foxes) {
    const distance = distanceSquared(rabbit.position, fox.position);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestFox = fox;
    }
  }
  
  return closestFox;
};

// Boundary check function
const keepWithinBounds = (position: Vector3, worldSize: number): Vector3 => {
  const { x, y, z } = position;
  const bounded = { ...position };
  
  // Check if outside the circle boundary
  const distanceFromCenter = Math.sqrt(x * x + z * z);
  
  if (distanceFromCenter > worldSize) {
    const angle = Math.atan2(z, x);
    bounded.x = Math.cos(angle) * worldSize * 0.95;
    bounded.z = Math.sin(angle) * worldSize * 0.95;
  }
  
  return bounded;
};

// Gender-based reproduction function
const checkGenderBasedReproduction = (
  agents: AgentType[], 
  worldSize: number, 
  species: 'rabbit' | 'fox'
): AgentType[] => {
  const newAgents: AgentType[] = [];
  const pregnancyDuration = species === 'rabbit' ? 8 : 15; // Pregnancy duration in simulation time
  
  // Handle births from pregnant females
  for (const agent of agents) {
    if (agent.isPregnant && agent.pregnancyTime !== undefined && agent.pregnancyTime >= pregnancyDuration) {
      // Give birth
      const litterSize = species === 'rabbit' ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1; // 2-4 rabbits, 1-2 foxes
      
      for (let i = 0; i < litterSize; i++) {
        const baby = species === 'rabbit' ? createRabbit(worldSize) : createFox(worldSize);
        baby.position = {
          x: agent.position.x + (Math.random() - 0.5) * 2,
          y: 0,
          z: agent.position.z + (Math.random() - 0.5) * 2,
        };
        baby.energy = 60; // Babies start with less energy
        newAgents.push(baby);
      }
      
      // Reset pregnancy status
      agent.isPregnant = false;
      agent.pregnancyTime = 0;
      agent.lastReproduced = agent.age;
      agent.energy -= 40; // Energy cost of giving birth
    }
  }
  
  // Check for new mating opportunities
  const matingDistance = 2.0;
  const reproductionParams = species === 'rabbit' 
    ? { minEnergy: 60, minAge: 8, cooldown: 12, chance: 0.15 }
    : { minEnergy: 75, minAge: 15, cooldown: 18, chance: 0.12 };
  
  const males = agents.filter(a => a.gender === 'male' && !a.isPregnant);
  const females = agents.filter(a => a.gender === 'female' && !a.isPregnant);
  
  for (const female of females) {
    // Check if female is ready to reproduce
    if (female.energy > reproductionParams.minEnergy && 
        female.age > reproductionParams.minAge && 
        (female.age - female.lastReproduced) > reproductionParams.cooldown) {
      
      // Find nearby males
      for (const male of males) {
        if (male.energy > reproductionParams.minEnergy && 
            male.age > reproductionParams.minAge && 
            (male.age - male.lastReproduced) > reproductionParams.cooldown) {
          
          const distance = Math.sqrt(distanceSquared(female.position, male.position));
          
          if (distance < matingDistance && Math.random() < reproductionParams.chance) {
            // Successful mating - female becomes pregnant
            female.isPregnant = true;
            female.pregnancyTime = 0;
            female.energy -= 15; // Energy cost of mating
            male.energy -= 10; // Energy cost of mating
            male.lastReproduced = male.age;
            break; // Female can only mate once per cycle
          }
        }
      }
    }
  }
  
  return newAgents;
};