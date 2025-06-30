import { create } from 'zustand';
import { Agent, Command, GameState, TerminalLine, Notification } from '../types';

interface GameStore {
  // Game State
  gameState: GameState;
  terminalLines: TerminalLine[];
  currentInput: string;
  isExecuting: boolean;
  
  // Commands
  commands: Command[];
  customCommands: Command[];
  commandHistory: string[];
  
  // Notifications
  notifications: Notification[];
  
  // UI State
  activeRoute: string;
  selectedAgent: Agent | null;
  sidebarCollapsed: boolean;
  
  // Actions
  setCurrentInput: (input: string) => void;
  executeCommand: (command: string) => Promise<void>;
  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  selectAgent: (agent: Agent | null) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  createAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => void;
  addCustomCommand: (command: Omit<Command, 'id' | 'createdAt'>) => void;
  toggleSidebar: () => void;
  setActiveRoute: (route: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: {
    agents: [],
    worldSize: { width: 50, height: 50 },
    objects: [],
    playerStats: {
      score: 0,
      commandsExecuted: 0,
      agentsDeployed: 0,
      achievements: [],
      level: 1,
    },
  },
  terminalLines: [
    {
      id: '1',
      type: 'system',
      content: 'NEXUS WORLD BUILDER v2.1.0 - TERMINAL INTERFACE INITIALIZED',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'system',
      content: 'Connection established to Matrix mainframe...',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'system',
      content: 'Type "help" for available commands or "tutorial" to begin.',
      timestamp: new Date(),
    },
  ],
  currentInput: '',
  isExecuting: false,
  
  commands: [
    {
      id: 'deploy',
      name: 'DeployAgent',
      syntax: 'DeployAgent[count] location behavior',
      description: 'Deploy intelligent agents to the world grid',
      parameters: [
        { name: 'count', type: 'number', required: true, description: 'Number of agents to deploy' },
        { name: 'location', type: 'string', required: true, description: 'Starting location' },
        { name: 'behavior', type: 'string', required: false, defaultValue: 'patrol', description: 'Agent behavior pattern' },
      ],
      effects: [
        { type: 'create_agent', target: 'world', action: 'spawn', parameters: {} },
      ],
      category: 'agent',
      isCustom: false,
      createdAt: new Date(),
    },
    {
      id: 'scan',
      name: 'ScanArea',
      syntax: 'ScanArea x y radius',
      description: 'Scan the specified area for objects and agents',
      parameters: [
        { name: 'x', type: 'number', required: true, description: 'X coordinate' },
        { name: 'y', type: 'number', required: true, description: 'Y coordinate' },
        { name: 'radius', type: 'number', required: false, defaultValue: 5, description: 'Scan radius' },
      ],
      effects: [
        { type: 'system_action', target: 'scanner', action: 'scan', parameters: {} },
      ],
      category: 'world',
      isCustom: false,
      createdAt: new Date(),
    },
  ],
  customCommands: [],
  commandHistory: [],
  
  notifications: [],
  
  activeRoute: '/terminal',
  selectedAgent: null,
  sidebarCollapsed: false,
  
  // Actions
  setCurrentInput: (input) => set({ currentInput: input }),
  
  executeCommand: async (command) => {
    const { addTerminalLine, addNotification } = get();
    
    set({ isExecuting: true });
    
    // Add input to terminal
    addTerminalLine({
      type: 'input',
      content: `nexus@matrix:~$ ${command}`,
    });
    
    // Add to history
    set((state) => ({
      commandHistory: [...state.commandHistory, command],
    }));
    
    // Simulate command processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Parse and execute command
    const result = await parseAndExecuteCommand(command);
    
    // Add result to terminal
    addTerminalLine({
      type: result.success ? 'output' : 'error',
      content: result.output,
    });
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Command Executed',
        message: result.output,
        duration: 3000,
      });
      
      // Update game state based on command
      if (result.stateChanges) {
        set((state) => ({
          gameState: {
            ...state.gameState,
            ...result.stateChanges,
            playerStats: {
              ...state.gameState.playerStats,
              commandsExecuted: state.gameState.playerStats.commandsExecuted + 1,
              score: state.gameState.playerStats.score + (result.points || 0),
            },
          },
        }));
      }
    } else {
      addNotification({
        type: 'error',
        title: 'Command Failed',
        message: result.output,
        duration: 5000,
      });
    }
    
    set({ isExecuting: false, currentInput: '' });
  },
  
  addTerminalLine: (line) => set((state) => ({
    terminalLines: [...state.terminalLines, {
      ...line,
      id: Date.now().toString(),
      timestamp: new Date(),
    }],
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }],
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
  
  selectAgent: (agent) => set({ selectedAgent: agent }),
  
  updateAgent: (agentId, updates) => set((state) => ({
    gameState: {
      ...state.gameState,
      agents: state.gameState.agents.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    },
  })),
  
  createAgent: (agentData) => {
    const agent: Agent = {
      ...agentData,
      id: `agent_${Date.now()}`,
      createdAt: new Date(),
    };
    
    set((state) => ({
      gameState: {
        ...state.gameState,
        agents: [...state.gameState.agents, agent],
        playerStats: {
          ...state.gameState.playerStats,
          agentsDeployed: state.gameState.playerStats.agentsDeployed + 1,
        },
      },
    }));
  },
  
  addCustomCommand: (commandData) => {
    const command: Command = {
      ...commandData,
      id: `cmd_${Date.now()}`,
      createdAt: new Date(),
      isCustom: true,
    };
    
    set((state) => ({
      customCommands: [...state.customCommands, command],
    }));
  },
  
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed,
  })),
  
  setActiveRoute: (route) => set({ activeRoute: route }),
}));

// Command parsing and execution logic
async function parseAndExecuteCommand(command: string): Promise<{
  success: boolean;
  output: string;
  points?: number;
  stateChanges?: Partial<GameState>;
}> {
  const trimmed = command.trim().toLowerCase();
  
  if (trimmed === 'help') {
    return {
      success: true,
      output: `
Available Commands:
  DeployAgent[count] location behavior - Deploy agents to the world
  ScanArea x y radius - Scan area for objects and agents
  ListAgents - Show all active agents
  ClearTerminal - Clear terminal output
  Status - Show system status
  Tutorial - Start interactive tutorial
  Admin - Open command builder panel
      `.trim(),
    };
  }
  
  if (trimmed === 'status') {
    const store = useGameStore.getState();
    return {
      success: true,
      output: `
SYSTEM STATUS:
  Active Agents: ${store.gameState.agents.length}
  Commands Executed: ${store.gameState.playerStats.commandsExecuted}
  Current Score: ${store.gameState.playerStats.score}
  Player Level: ${store.gameState.playerStats.level}
  World Size: ${store.gameState.worldSize.width}x${store.gameState.worldSize.height}
      `.trim(),
    };
  }
  
  if (trimmed === 'listagents') {
    const store = useGameStore.getState();
    if (store.gameState.agents.length === 0) {
      return {
        success: true,
        output: 'No agents currently deployed.',
      };
    }
    
    const agentList = store.gameState.agents.map(agent => 
      `  ${agent.id}: ${agent.name} [${agent.status}] at (${agent.position.x}, ${agent.position.y})`
    ).join('\n');
    
    return {
      success: true,
      output: `Active Agents:\n${agentList}`,
    };
  }
  
  if (trimmed === 'clearterminal') {
    useGameStore.setState({ terminalLines: [] });
    return {
      success: true,
      output: 'Terminal cleared.',
    };
  }
  
  if (trimmed.startsWith('deployagent')) {
    const match = command.match(/deployagent\[(\d+)\]\s*(\w+)?\s*(\w+)?/i);
    if (!match) {
      return {
        success: false,
        output: 'Invalid syntax. Use: DeployAgent[count] location behavior',
      };
    }
    
    const count = parseInt(match[1]);
    const location = match[2] || 'center';
    const behavior = match[3] || 'patrol';
    
    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
      const baseX = location === 'center' ? 25 : Math.floor(Math.random() * 50);
      const baseY = location === 'center' ? 25 : Math.floor(Math.random() * 50);
      
      agents.push({
        id: `agent_${Date.now()}_${i}`,
        name: `Agent-${Date.now()}-${i}`,
        position: { 
          x: baseX + Math.floor(Math.random() * 5) - 2, 
          y: baseY + Math.floor(Math.random() * 5) - 2 
        },
        status: 'active',
        behavior,
        commands: [],
        health: 100,
        energy: 100,
        lastAction: 'deployed',
        createdAt: new Date(),
      });
    }
    
    return {
      success: true,
      output: `Successfully deployed ${count} agent(s) with ${behavior} behavior at ${location}.`,
      points: count * 10,
      stateChanges: {
        agents: [...useGameStore.getState().gameState.agents, ...agents],
      },
    };
  }
  
  if (trimmed.startsWith('scanarea')) {
    const match = command.match(/scanarea\s+(\d+)\s+(\d+)\s*(\d+)?/i);
    if (!match) {
      return {
        success: false,
        output: 'Invalid syntax. Use: ScanArea x y radius',
      };
    }
    
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    const radius = parseInt(match[3]) || 5;
    
    const store = useGameStore.getState();
    const nearbyAgents = store.gameState.agents.filter(agent => {
      const distance = Math.sqrt(
        Math.pow(agent.position.x - x, 2) + Math.pow(agent.position.y - y, 2)
      );
      return distance <= radius;
    });
    
    let scanResult = `Scan complete. Area: (${x}, ${y}) Radius: ${radius}\n`;
    scanResult += `Agents found: ${nearbyAgents.length}\n`;
    
    if (nearbyAgents.length > 0) {
      scanResult += nearbyAgents.map(agent => 
        `  ${agent.id}: ${agent.name} at (${agent.position.x}, ${agent.position.y})`
      ).join('\n');
    }
    
    return {
      success: true,
      output: scanResult,
      points: 5,
    };
  }
  
  if (trimmed === 'tutorial') {
    return {
      success: true,
      output: `
NEXUS WORLD BUILDER TUTORIAL:

1. Deploy your first agent:
   > DeployAgent[1] center patrol

2. Scan the area around your agent:
   > ScanArea 25 25 10

3. Check agent status:
   > ListAgents

4. Open the admin panel to create custom commands:
   > Admin

5. View the world visualization:
   Navigate to World tab to see your agents in action

Type any command to continue exploring!
      `.trim(),
    };
  }
  
  if (trimmed === 'admin') {
    // This would normally trigger navigation to admin panel
    return {
      success: true,
      output: 'Opening admin panel... Navigate to the Admin tab to continue.',
    };
  }
  
  return {
    success: false,
    output: `Unknown command: ${command}. Type "help" for available commands.`,
  };
}