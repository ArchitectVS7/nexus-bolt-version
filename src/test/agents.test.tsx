import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Agent Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        agents: [],
        worldSize: { width: 50, height: 50 },
        objects: [
          { id: 'obstacle1', type: 'obstacle', position: { x: 20, y: 20 }, properties: {}, isBlocking: true }
        ],
        playerStats: {
          score: 0,
          commandsExecuted: 0,
          agentsDeployed: 0,
          achievements: [],
          level: 1
        }
      }
    });
  });

  describe('Agent Deployment', () => {
    it('creates agents with correct properties', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('DeployAgent[1] center scout');
      
      const state = useGameStore.getState();
      const agent = state.gameState.agents[0];
      
      expect(agent).toBeDefined();
      expect(agent.behavior).toBe('scout');
      expect(agent.health).toBe(100);
      expect(agent.energy).toBe(100);
      expect(agent.status).toBe('active');
      expect(agent.inventory).toEqual([]);
    });

    it('avoids obstacles when deploying agents', async () => {
      const store = useGameStore.getState();
      
      // Try to deploy at obstacle location
      await store.executeCommand('DeployAgent[1] 20 20 patrol');
      
      const state = useGameStore.getState();
      const agent = state.gameState.agents[0];
      
      // Agent should not be placed exactly on obstacle
      expect(agent.position.x !== 20 || agent.position.y !== 20).toBe(true);
    });

    it('supports different behaviors', async () => {
      const store = useGameStore.getState();
      const behaviors = ['patrol', 'scout', 'guard', 'gather', 'guardarea'];
      
      for (const behavior of behaviors) {
        await store.executeCommand(`DeployAgent[1] center ${behavior}`);
      }
      
      const state = useGameStore.getState();
      expect(state.gameState.agents).toHaveLength(behaviors.length);
      
      behaviors.forEach((behavior, index) => {
        expect(state.gameState.agents[index].behavior).toBe(behavior);
      });
    });

    it('rejects invalid behaviors', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('DeployAgent[1] center invalidbehavior');
      
      const state = useGameStore.getState();
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.type).toBe('error');
      expect(lastLine.content).toContain('Invalid behavior');
    });
  });

  describe('Agent State Management', () => {
    it('updates agent properties', () => {
      const store = useGameStore.getState();
      
      // Create an agent first
      store.createAgent({
        name: 'Test Agent',
        position: { x: 10, y: 10 },
        status: 'idle',
        behavior: 'patrol',
        commands: [],
        health: 100,
        energy: 100,
        lastAction: 'created',
        inventory: []
      });
      
      const state = useGameStore.getState();
      const agentId = state.gameState.agents[0].id;
      
      // Update agent
      store.updateAgent(agentId, { health: 75, status: 'executing' });
      
      const updatedState = useGameStore.getState();
      const updatedAgent = updatedState.gameState.agents[0];
      
      expect(updatedAgent.health).toBe(75);
      expect(updatedAgent.status).toBe('executing');
    });

    it('selects and deselects agents', () => {
      const store = useGameStore.getState();
      
      store.createAgent({
        name: 'Test Agent',
        position: { x: 10, y: 10 },
        status: 'idle',
        behavior: 'patrol',
        commands: [],
        health: 100,
        energy: 100,
        lastAction: 'created',
        inventory: []
      });
      
      const state = useGameStore.getState();
      const agent = state.gameState.agents[0];
      
      // Select agent
      store.selectAgent(agent);
      expect(useGameStore.getState().selectedAgent).toBe(agent);
      
      // Deselect agent
      store.selectAgent(null);
      expect(useGameStore.getState().selectedAgent).toBe(null);
    });
  });

  describe('Agent Persistence', () => {
    it('maintains agent state across store updates', () => {
      const store = useGameStore.getState();
      
      store.createAgent({
        name: 'Persistent Agent',
        position: { x: 15, y: 15 },
        status: 'active',
        behavior: 'guard',
        commands: ['patrol', 'scan'],
        health: 90,
        energy: 85,
        lastAction: 'patrolling',
        inventory: ['data1']
      });
      
      const state = useGameStore.getState();
      const agent = state.gameState.agents[0];
      
      expect(agent.name).toBe('Persistent Agent');
      expect(agent.commands).toEqual(['patrol', 'scan']);
      expect(agent.inventory).toEqual(['data1']);
      expect(agent.health).toBe(90);
      expect(agent.energy).toBe(85);
    });
  });
});