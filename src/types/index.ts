export interface Agent {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: 'idle' | 'active' | 'executing' | 'error';
  behavior: string;
  commands: string[];
  health: number;
  energy: number;
  lastAction: string;
  createdAt: Date;
}

export interface Command {
  id: string;
  name: string;
  syntax: string;
  description: string;
  parameters: Parameter[];
  effects: Effect[];
  category: 'agent' | 'world' | 'system';
  isCustom: boolean;
  createdAt: Date;
}

export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface Effect {
  type: 'create_agent' | 'move_agent' | 'modify_world' | 'system_action';
  target: string;
  action: string;
  parameters: Record<string, any>;
}

export interface GameState {
  agents: Agent[];
  worldSize: { width: number; height: number };
  objects: WorldObject[];
  playerStats: PlayerStats;
  currentChallenge?: Challenge;
}

export interface WorldObject {
  id: string;
  type: 'wall' | 'data' | 'terminal' | 'portal';
  position: { x: number; y: number };
  properties: Record<string, any>;
}

export interface PlayerStats {
  score: number;
  commandsExecuted: number;
  agentsDeployed: number;
  achievements: string[];
  level: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  objectives: Objective[];
  rewards: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}