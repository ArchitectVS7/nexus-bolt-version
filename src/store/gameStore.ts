import { create } from 'zustand';
import { Agent, Command, GameState, TerminalLine, Notification, WorldObject, Challenge, WorldEvent, WorldTemplate } from '../types';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { audioManager } from '../lib/audio';
import { worldGenerator } from '../lib/worldGenerator';

interface GameStore {
  // Game State
  gameState: GameState;
  terminalLines: TerminalLine[];
  currentInput: string;
  isExecuting: boolean;
  user: any;
  
  // Commands
  commands: Command[];
  customCommands: Command[];
  commandHistory: string[];
  
  // Challenges and Events
  challenges: Challenge[];
  activeChallenge: Challenge | null;
  worldEvents: WorldEvent[];
  worldTemplates: WorldTemplate[];
  
  // Notifications
  notifications: Notification[];
  
  // UI State
  activeRoute: string;
  selectedAgent: Agent | null;
  sidebarCollapsed: boolean;
  audioEnabled: boolean;
  
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
  setUser: (user: any) => void;
  toggleAudio: () => void;
  saveToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  interactWithObject: (objectId: string) => void;
  
  // New v2.5 actions
  startChallenge: (challengeId: string) => void;
  completeObjective: (challengeId: string, objectiveId: string) => void;
  generateWorld: (seed: string, biome: string, difficulty: number) => void;
  triggerWorldEvent: (event: WorldEvent) => void;
  saveWorldTemplate: (template: WorldTemplate) => void;
  loadWorldTemplate: (templateId: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: {
    agents: [],
    worldSize: { width: 50, height: 50 },
    objects: [
      // Add some default world objects
      { id: 'data1', type: 'datanode', position: { x: 10, y: 10 }, properties: { value: 100 }, isCollectable: true },
      { id: 'data2', type: 'datanode', position: { x: 40, y: 15 }, properties: { value: 150 }, isCollectable: true },
      { id: 'terminal1', type: 'terminalnode', position: { x: 25, y: 25 }, properties: { active: true }, isActivatable: true },
      { id: 'obstacle1', type: 'obstacle', position: { x: 20, y: 20 }, properties: {}, isBlocking: true },
      { id: 'obstacle2', type: 'obstacle', position: { x: 30, y: 30 }, properties: {}, isBlocking: true },
      { id: 'obstacle3', type: 'obstacle', position: { x: 15, y: 35 }, properties: {}, isBlocking: true },
    ] as WorldObject[],
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
  user: null,
  
  commands: [
    {
      id: 'deploy',
      name: 'DeployAgent',
      syntax: 'DeployAgent[count] location behavior',
      description: 'Deploy intelligent agents to the world grid',
      parameters: [
        { name: 'count', type: 'number', required: true, description: 'Number of agents to deploy' },
        { name: 'location', type: 'string', required: true, description: 'Starting location' },
        { name: 'behavior', type: 'string', required: false, defaultValue: 'patrol', description: 'Agent behavior: patrol, scout, guard, gather, guardArea' },
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
  
  challenges: [],
  activeChallenge: null,
  worldEvents: [],
  worldTemplates: [],
  
  notifications: [],
  
  activeRoute: '/terminal',
  selectedAgent: null,
  sidebarCollapsed: false,
  audioEnabled: true,
  
  // Actions
  setCurrentInput: (input) => set({ currentInput: input }),
  
  executeCommand: async (command) => {
    const { addTerminalLine, addNotification } = get();
    
    set({ isExecuting: true });
    
    // Play command sound
    audioManager.playSound('command', 0.3);
    
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
      
      // Play success sound
      audioManager.playSound('success', 0.4);
      
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
      
      // Play error sound
      audioManager.playSound('error', 0.4);
    }
    
    set({ isExecuting: false, currentInput: '' });
    
    // Auto-save to Supabase if enabled
    if (isSupabaseEnabled && get().user) {
      get().saveToSupabase();
    }
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
  
  setUser: (user) => set({ user }),
  
  toggleAudio: () => {
    const newState = !get().audioEnabled;
    audioManager.setEnabled(newState);
    set({ audioEnabled: newState });
  },
  
  saveToSupabase: async () => {
    if (!isSupabaseEnabled || !get().user) {
      console.log('Supabase save skipped: not enabled or no user');
      return;
    }
    
    try {
      const { gameState, customCommands, user } = get();
      
      // Save profile
      await supabase!.from('profiles').upsert({
        user_id: user.id,
        username: user.user_metadata?.username || user.email,
        score: gameState.playerStats.score,
        level: gameState.playerStats.level,
        commands_executed: gameState.playerStats.commandsExecuted,
        agents_deployed: gameState.playerStats.agentsDeployed,
        achievements: gameState.playerStats.achievements,
        updated_at: new Date().toISOString()
      });
      
      // Save custom commands
      for (const command of customCommands) {
        await supabase!.from('custom_commands').upsert({
          id: command.id,
          user_id: user.id,
          name: command.name,
          syntax: command.syntax,
          description: command.description,
          parameters: command.parameters,
          effects: command.effects,
          category: command.category,
          updated_at: new Date().toISOString()
        });
      }
      
      // Save world state
      await supabase!.from('world_states').upsert({
        user_id: user.id,
        agents: gameState.agents,
        objects: gameState.objects,
        world_size: gameState.worldSize,
        updated_at: new Date().toISOString()
      });
      
      console.log('Successfully saved data to Supabase');
    } catch (error) {
      console.error('Supabase save error:', error);
      get().addNotification({
        type: 'warning',
        title: 'Save Warning',
        message: 'Failed to save data to cloud. Progress saved locally.',
        duration: 5000
      });
    }
  },
  
  loadFromSupabase: async () => {
    if (!isSupabaseEnabled || !get().user) {
      console.log('Supabase load skipped: not enabled or no user');
      return;
    }
    
    try {
      const { user } = get();
      
      // Load profile
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Load custom commands
      const { data: commands } = await supabase!
        .from('custom_commands')
        .select('*')
        .eq('user_id', user.id);
      
      // Load world state
      const { data: worldState } = await supabase!
        .from('world_states')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        set((state) => ({
          gameState: {
            ...state.gameState,
            playerStats: {
              score: profile.score,
              level: profile.level,
              commandsExecuted: profile.commands_executed,
              agentsDeployed: profile.agents_deployed,
              achievements: profile.achievements
            }
          }
        }));
        console.log('Loaded profile from Supabase');
      }
      
      if (commands) {
        set({ customCommands: commands.map(cmd => ({
          ...cmd,
          isCustom: true,
          createdAt: new Date(cmd.created_at)
        })) });
        console.log(`Loaded ${commands.length} custom commands from Supabase`);
      }
      
      if (worldState) {
        set((state) => ({
          gameState: {
            ...state.gameState,
            agents: worldState.agents || [],
            objects: worldState.objects || state.gameState.objects,
            worldSize: worldState.world_size || state.gameState.worldSize
          }
        }));
        console.log('Loaded world state from Supabase');
      }
      
      get().addNotification({
        type: 'success',
        title: 'Data Loaded',
        message: 'Successfully loaded your progress from the cloud.',
        duration: 3000
      });
      
    } catch (error) {
      console.error('Supabase load error:', error);
      get().addNotification({
        type: 'info',
        title: 'Load Notice',
        message: 'Using local data. Cloud sync unavailable.',
        duration: 3000
      });
    }
  },
  
  interactWithObject: (objectId: string) => {
    const { gameState } = get();
    const object = gameState.objects.find(obj => obj.id === objectId);
    
    if (!object) return;
    
    let message = '';
    let scoreGain = 0;
    
    if (object.type === 'datanode' && object.isCollectable) {
      message = `Collected data node! Gained ${object.properties.value} points.`;
      scoreGain = object.properties.value;
      
      // Remove the collected object
      set((state) => ({
        gameState: {
          ...state.gameState,
          objects: state.gameState.objects.filter(obj => obj.id !== objectId),
          playerStats: {
            ...state.gameState.playerStats,
            score: state.gameState.playerStats.score + scoreGain
          }
        }
      }));
      
    } else if (object.type === 'terminalnode' && object.isActivatable) {
      message = 'Terminal node activated! System access granted.';
      scoreGain = 50;
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          playerStats: {
            ...state.gameState.playerStats,
            score: state.gameState.playerStats.score + scoreGain
          }
        }
      }));
      
    } else if (object.type === 'obstacle') {
      message = 'Obstacle blocks movement. Deploy agents to navigate around it.';
    }
    
    if (message) {
      get().addTerminalLine({
        type: 'system',
        content: message
      });
      
      if (scoreGain > 0) {
        audioManager.playSound('success', 0.3);
      }
    }
  },
  
  // New v2.5 actions
  startChallenge: (challengeId) => set((state) => {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (challenge) {
      return { activeChallenge: challenge };
    }
    return state;
  }),
  
  completeObjective: (challengeId, objectiveId) => set((state) => ({
    challenges: state.challenges.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            objectives: challenge.objectives.map(obj =>
              obj.id === objectiveId ? { ...obj, completed: true } : obj
            )
          }
        : challenge
    )
  })),
  
  generateWorld: (seed, biome, difficulty) => {
    const config = {
      seed,
      width: 50,
      height: 50,
      density: {
        obstacles: 0.1,
        datanodes: 0.05,
        terminals: 0.02,
        portals: 0.01
      },
      biome: biome as any,
      difficulty
    };
    
    const template = worldGenerator.generate(config);
    
    set((state) => ({
      gameState: {
        ...state.gameState,
        objects: template.objects,
        worldSize: template.size
      }
    }));
    
    get().addNotification({
      type: 'success',
      title: 'World Generated',
      message: `New ${biome} world generated with seed: ${seed}`,
      duration: 3000
    });
  },
  
  triggerWorldEvent: (event) => set((state) => {
    const newEvents = [...state.worldEvents, event];
    // Keep only last 10 events
    if (newEvents.length > 10) {
      newEvents.splice(0, newEvents.length - 10);
    }
    
    return { worldEvents: newEvents };
  }),
  
  saveWorldTemplate: (template) => set((state) => ({
    worldTemplates: [...state.worldTemplates, template]
  })),
  
  loadWorldTemplate: (templateId) => {
    const state = get();
    const template = state.worldTemplates.find(t => t.id === templateId);
    
    if (template) {
      set((prevState) => ({
        gameState: {
          ...prevState.gameState,
          objects: template.objects,
          worldSize: template.size
        }
      }));
      
      get().addNotification({
        type: 'success',
        title: 'World Loaded',
        message: `Loaded world template: ${template.name}`,
        duration: 3000
      });
    }
  }
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
    
    // Validate behavior
    const validBehaviors = ['patrol', 'scout', 'guard', 'gather', 'guardarea'];
    if (!validBehaviors.includes(behavior.toLowerCase())) {
      return {
        success: false,
        output: `Invalid behavior: ${behavior}. Valid behaviors: ${validBehaviors.join(', ')}`
      };
    }
    
    const agents: Agent[] = [];
    const store = useGameStore.getState();
    
    for (let i = 0; i < count; i++) {
      let baseX, baseY;
      
      // Handle different location types
      if (location === 'center') {
        baseX = 25; baseY = 25;
      } else if (location === 'north') {
        baseX = 25; baseY = 5;
      } else if (location === 'south') {
        baseX = 25; baseY = 45;
      } else if (location === 'east') {
        baseX = 45; baseY = 25;
      } else if (location === 'west') {
        baseX = 5; baseY = 25;
      } else if (location === 'northeast') {
        baseX = 40; baseY = 10;
      } else if (location === 'northwest') {
        baseX = 10; baseY = 10;
      } else if (location === 'southeast') {
        baseX = 40; baseY = 40;
      } else if (location === 'southwest') {
        baseX = 10; baseY = 40;
      } else {
        // Try to parse as coordinates
        const coords = location.match(/(\d+)\s+(\d+)/);
        if (coords) {
          baseX = parseInt(coords[1]);
          baseY = parseInt(coords[2]);
        } else {
          baseX = Math.floor(Math.random() * 50);
          baseY = Math.floor(Math.random() * 50);
        }
      }
      
      // Ensure position is not blocked by obstacles
      let finalX = baseX + Math.floor(Math.random() * 5) - 2;
      let finalY = baseY + Math.floor(Math.random() * 5) - 2;
      
      // Check for obstacles
      const isBlocked = store.gameState.objects.some(obj => 
        obj.isBlocking && obj.position.x === finalX && obj.position.y === finalY
      );
      
      if (isBlocked) {
        // Find nearby free position
        for (let attempts = 0; attempts < 10; attempts++) {
          finalX = baseX + Math.floor(Math.random() * 10) - 5;
          finalY = baseY + Math.floor(Math.random() * 10) - 5;
          
          finalX = Math.max(0, Math.min(49, finalX));
          finalY = Math.max(0, Math.min(49, finalY));
          
          const stillBlocked = store.gameState.objects.some(obj => 
            obj.isBlocking && obj.position.x === finalX && obj.position.y === finalY
          );
          
          if (!stillBlocked) break;
        }
      }
      
      agents.push({
        id: `agent_${Date.now()}_${i}`,
        name: `Agent-${Date.now()}-${i}`,
        position: { 
          x: Math.max(0, Math.min(49, finalX)), 
          y: Math.max(0, Math.min(49, finalY))
        },
        status: 'active',
        behavior: behavior.toLowerCase(),
        commands: [],
        health: 100,
        energy: 100,
        lastAction: 'deployed',
        inventory: [],
        createdAt: new Date(),
      });
    }
    
    return {
      success: true,
      output: `Successfully deployed ${count} agent(s) with ${behavior} behavior at ${location}.`,
      points: count * 10,
      stateChanges: {
        agents: [...store.gameState.agents, ...agents],
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
    
    const nearbyObjects = store.gameState.objects.filter(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.position.x - x, 2) + Math.pow(obj.position.y - y, 2)
      );
      return distance <= radius;
    });
    
    let scanResult = `Scan complete. Area: (${x}, ${y}) Radius: ${radius}\n`;
    scanResult += `Agents found: ${nearbyAgents.length}\n`;
    scanResult += `Objects found: ${nearbyObjects.length}\n`;
    
    if (nearbyAgents.length > 0) {
      scanResult += '\nAgents:\n';
      scanResult += nearbyAgents.map(agent => 
        `  ${agent.id}: ${agent.name} [${agent.behavior}] at (${agent.position.x}, ${agent.position.y})`
      ).join('\n');
    }
    
    if (nearbyObjects.length > 0) {
      scanResult += '\nObjects:\n';
      scanResult += nearbyObjects.map(obj => 
        `  ${obj.type} at (${obj.position.x}, ${obj.position.y})`
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