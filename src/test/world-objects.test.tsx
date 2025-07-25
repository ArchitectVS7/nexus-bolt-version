import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('World Object Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        agents: [],
        worldSize: { width: 50, height: 50 },
        objects: [
          { 
            id: 'data1', 
            type: 'datanode', 
            position: { x: 10, y: 10 }, 
            properties: { value: 100 }, 
            isCollectable: true 
          },
          { 
            id: 'terminal1', 
            type: 'terminalnode', 
            position: { x: 20, y: 20 }, 
            properties: { active: true }, 
            isActivatable: true 
          },
          { 
            id: 'obstacle1', 
            type: 'obstacle', 
            position: { x: 30, y: 30 }, 
            properties: {}, 
            isBlocking: true 
          }
        ],
        playerStats: {
          score: 0,
          commandsExecuted: 0,
          agentsDeployed: 0,
          achievements: [],
          level: 1
        }
      },
      terminalLines: []
    });
  });

  describe('Object Collection', () => {
    it('collects data nodes and awards points', () => {
      const store = useGameStore.getState();
      
      store.interactWithObject('data1');
      
      const state = useGameStore.getState();
      
      // Object should be removed
      expect(state.gameState.objects.find(obj => obj.id === 'data1')).toBeUndefined();
      
      // Score should increase
      expect(state.gameState.playerStats.score).toBe(100);
      
      // Terminal should show collection message
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.content).toContain('Collected data node');
      expect(lastLine.content).toContain('100 points');
    });

    it('activates terminal nodes', () => {
      const store = useGameStore.getState();
      
      store.interactWithObject('terminal1');
      
      const state = useGameStore.getState();
      
      // Terminal should still exist (not consumed)
      expect(state.gameState.objects.find(obj => obj.id === 'terminal1')).toBeDefined();
      
      // Score should increase
      expect(state.gameState.playerStats.score).toBe(50);
      
      // Terminal should show activation message
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.content).toContain('Terminal node activated');
    });

    it('handles obstacle interaction', () => {
      const store = useGameStore.getState();
      
      store.interactWithObject('obstacle1');
      
      const state = useGameStore.getState();
      
      // Obstacle should still exist
      expect(state.gameState.objects.find(obj => obj.id === 'obstacle1')).toBeDefined();
      
      // No score change
      expect(state.gameState.playerStats.score).toBe(0);
      
      // Terminal should show obstacle message
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.content).toContain('Obstacle blocks movement');
    });
  });

  describe('Object Detection in Scans', () => {
    it('includes objects in scan results', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('ScanArea 10 10 5');
      
      const state = useGameStore.getState();
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      
      expect(lastLine.content).toContain('Objects found: 1');
      expect(lastLine.content).toContain('datanode at (10, 10)');
    });

    it('detects multiple object types', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('ScanArea 25 25 15');
      
      const state = useGameStore.getState();
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      
      expect(lastLine.content).toContain('Objects found: 3');
      expect(lastLine.content).toContain('datanode');
      expect(lastLine.content).toContain('terminalnode');
      expect(lastLine.content).toContain('obstacle');
    });
  });

  describe('Collision Detection', () => {
    it('prevents agent deployment on obstacles', async () => {
      const store = useGameStore.getState();
      
      // Try to deploy exactly on obstacle
      await store.executeCommand('DeployAgent[1] 30 30 patrol');
      
      const state = useGameStore.getState();
      const agent = state.gameState.agents[0];
      
      // Agent should be placed away from obstacle
      expect(agent.position.x !== 30 || agent.position.y !== 30).toBe(true);
    });
  });

  describe('Object Properties', () => {
    it('maintains object properties correctly', () => {
      const state = useGameStore.getState();
      
      const dataNode = state.gameState.objects.find(obj => obj.id === 'data1');
      const terminal = state.gameState.objects.find(obj => obj.id === 'terminal1');
      const obstacle = state.gameState.objects.find(obj => obj.id === 'obstacle1');
      
      expect(dataNode?.isCollectable).toBe(true);
      expect(dataNode?.properties.value).toBe(100);
      
      expect(terminal?.isActivatable).toBe(true);
      expect(terminal?.properties.active).toBe(true);
      
      expect(obstacle?.isBlocking).toBe(true);
    });
  });
});