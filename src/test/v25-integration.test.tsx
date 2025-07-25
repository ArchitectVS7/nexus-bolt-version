import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { llmParser } from '../lib/llm';
import { worldGenerator } from '../lib/worldGenerator';
import ChallengeSystem from '../components/Challenges/ChallengeSystem';
import WorldEditor from '../components/WorldEditor/WorldEditor';
import VisualScriptEditor from '../components/AgentProgramming/VisualScriptEditor';

// Mock external dependencies
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null })
        })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    }
  },
  isSupabaseEnabled: true,
  checkSupabaseConnection: vi.fn().mockResolvedValue(true)
}));

vi.mock('../lib/audio', () => ({
  audioManager: {
    playSound: vi.fn(),
    setEnabled: vi.fn(),
    isAudioEnabled: vi.fn().mockReturnValue(true)
  }
}));

// Mock canvas for world editor
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  setLineDash: vi.fn(),
  clearRect: vi.fn()
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('v2.5 Feature Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        agents: [],
        worldSize: { width: 50, height: 50 },
        objects: [],
        playerStats: {
          score: 0,
          commandsExecuted: 0,
          agentsDeployed: 0,
          achievements: [],
          level: 1
        }
      },
      challenges: [],
      worldTemplates: [],
      notifications: []
    });
  });

  describe('Advanced Natural Language Processing', () => {
    it('processes natural language with session memory', async () => {
      // Mock successful OpenAI response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: 'DeployAgent[3] center scout',
                confidence: 0.95,
                explanation: 'Deploy 3 scout agents at center based on context',
                sessionId: 'test-session'
              })
            }
          }]
        })
      });

      const result = await llmParser.parseCommand(
        'send three scouts to explore the center area',
        {
          worldState: {
            agents: [],
            objects: [],
            worldSize: { width: 50, height: 50 },
            playerStats: { score: 0, level: 1, commandsExecuted: 0, agentsDeployed: 0, achievements: [] }
          },
          recentCommands: ['help', 'status']
        }
      );

      expect(result).toBeTruthy();
      expect(result?.command).toBe('DeployAgent[3] center scout');
      expect(result?.confidence).toBe(0.95);
      expect(result?.sessionId).toBe('test-session');
    });

    it('maintains conversation context across multiple turns', async () => {
      const sessionId = 'test-session-context';
      
      // First interaction
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: 'DeployAgent[2] north patrol',
                confidence: 0.9,
                explanation: 'Deploying patrol agents to north'
              })
            }
          }]
        })
      });

      await llmParser.parseCommand('deploy two agents north', undefined, sessionId);

      // Second interaction should have context
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: 'ScanArea 25 10 8',
                confidence: 0.85,
                explanation: 'Scanning near the recently deployed north agents'
              })
            }
          }]
        })
      });

      const result = await llmParser.parseCommand('scan around them', undefined, sessionId);
      
      expect(result?.command).toContain('ScanArea');
      expect(result?.explanation).toContain('north');
    });

    it('handles clarification requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: '',
                confidence: 0.3,
                explanation: 'Need clarification on location',
                needsClarification: true,
                clarificationPrompt: 'Which area would you like to scan? Please specify coordinates or a named location.'
              })
            }
          }]
        })
      });

      const result = await llmParser.parseCommand('scan over there');
      
      expect(result?.needsClarification).toBe(true);
      expect(result?.clarificationPrompt).toContain('coordinates');
    });
  });

  describe('AI-Generated Content', () => {
    it('generates procedural worlds with different biomes', () => {
      const matrixWorld = worldGenerator.generate({
        seed: 'test-matrix-123',
        width: 30,
        height: 30,
        density: {
          obstacles: 0.1,
          datanodes: 0.05,
          terminals: 0.02,
          portals: 0.01
        },
        biome: 'matrix',
        difficulty: 1
      });

      expect(matrixWorld.name).toContain('matrix_world_test-matrix-123');
      expect(matrixWorld.size).toEqual({ width: 30, height: 30 });
      expect(matrixWorld.objects.length).toBeGreaterThan(0);
      expect(matrixWorld.spawnPoints.length).toBeGreaterThan(0);

      const corruptedWorld = worldGenerator.generate({
        seed: 'test-corrupted-456',
        width: 25,
        height: 25,
        density: {
          obstacles: 0.15,
          datanodes: 0.03,
          terminals: 0.01,
          portals: 0.005
        },
        biome: 'corrupted',
        difficulty: 3
      });

      expect(corruptedWorld.name).toContain('corrupted_world_test-corrupted-456');
      expect(corruptedWorld.difficulty).toBe(3);
    });

    it('creates dynamic world events', () => {
      const eventGenerator = worldGenerator.createEventGenerator('event-seed-789');
      const worldSize = { width: 50, height: 50 };
      
      const event = eventGenerator.generateEvent(worldSize);
      
      expect(event.id).toBeTruthy();
      expect(['emp_burst', 'rogue_agent', 'corrupt_zone', 'data_surge', 'system_glitch']).toContain(event.type);
      expect(event.position.x).toBeGreaterThanOrEqual(0);
      expect(event.position.x).toBeLessThan(worldSize.width);
      expect(event.position.y).toBeGreaterThanOrEqual(0);
      expect(event.position.y).toBeLessThan(worldSize.height);
      expect(event.duration).toBeGreaterThan(0);
      expect(event.message).toBeTruthy();
    });

    it('integrates world generation with game store', () => {
      const store = useGameStore.getState();
      
      store.generateWorld('integration-test-seed', 'pristine', 2);
      
      const state = useGameStore.getState();
      expect(state.gameState.objects.length).toBeGreaterThan(0);
      expect(state.notifications.length).toBeGreaterThan(0);
      expect(state.notifications[0].title).toBe('World Generated');
    });
  });

  describe('Agent Programming Interface', () => {
    it('renders visual script editor with block palette', () => {
      renderWithRouter(<VisualScriptEditor />);
      
      expect(screen.getByText('Agent Programming')).toBeInTheDocument();
      expect(screen.getByText('Triggers')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Health Low')).toBeInTheDocument();
      expect(screen.getByText('Move To')).toBeInTheDocument();
      expect(screen.getByText('Save Script')).toBeInTheDocument();
    });

    it('allows script creation and saving', async () => {
      renderWithRouter(<VisualScriptEditor />);
      
      const scriptNameInput = screen.getByPlaceholderText('Enter script name...');
      fireEvent.change(scriptNameInput, { target: { value: 'Test Patrol Script' } });
      
      const saveButton = screen.getByText('Save Script');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.notifications.some(n => n.title === 'Script Saved')).toBe(true);
      });
    });

    it('supports agent assignment', () => {
      // Add test agent
      useGameStore.setState({
        gameState: {
          agents: [{
            id: 'test-agent-1',
            name: 'Test Agent',
            position: { x: 25, y: 25 },
            status: 'active',
            behavior: 'patrol',
            commands: [],
            health: 100,
            energy: 100,
            lastAction: 'idle',
            inventory: [],
            createdAt: new Date()
          }],
          worldSize: { width: 50, height: 50 },
          objects: [],
          playerStats: {
            score: 0,
            commandsExecuted: 0,
            agentsDeployed: 1,
            achievements: [],
            level: 1
          }
        }
      });

      renderWithRouter(<VisualScriptEditor />);
      
      const agentSelect = screen.getByDisplayValue('Select agent...');
      expect(agentSelect).toBeInTheDocument();
      
      fireEvent.change(agentSelect, { target: { value: 'test-agent-1' } });
      expect(agentSelect).toHaveValue('test-agent-1');
    });
  });

  describe('World Editor', () => {
    it('renders world editor with tool palette', () => {
      renderWithRouter(<WorldEditor />);
      
      expect(screen.getByText('World Editor')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('Wall')).toBeInTheDocument();
      expect(screen.getByText('Data Node')).toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('allows world template creation and saving', async () => {
      renderWithRouter(<WorldEditor />);
      
      const templateNameInput = screen.getByPlaceholderText('Template name...');
      fireEvent.change(templateNameInput, { target: { value: 'Test World Template' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.notifications.some(n => n.title === 'Template Saved')).toBe(true);
      });
    });

    it('supports world size configuration', () => {
      renderWithRouter(<WorldEditor />);
      
      const widthInput = screen.getByDisplayValue('50');
      fireEvent.change(widthInput, { target: { value: '75' } });
      expect(widthInput).toHaveValue(75);
    });

    it('provides export functionality', () => {
      renderWithRouter(<WorldEditor />);
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();
      
      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      fireEvent.click(exportButton);
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Challenge System', () => {
    it('renders challenge system with mission dashboard', () => {
      renderWithRouter(<ChallengeSystem />);
      
      expect(screen.getByText('Challenge System')).toBeInTheDocument();
      expect(screen.getByText('Complete objectives to earn rewards')).toBeInTheDocument();
      expect(screen.getByText('Filter by difficulty:')).toBeInTheDocument();
    });

    it('displays challenge progression', () => {
      const mockChallenges = [{
        id: 'test-challenge-1',
        title: 'First Deployment',
        description: 'Deploy your first agent',
        objectives: [{
          id: 'deploy-1',
          description: 'Deploy 1 agent',
          completed: false,
          progress: 0,
          maxProgress: 1,
          type: 'deploy'
        }],
        reward: { score: 100, unlocks: ['scout_behavior'] },
        difficulty: 'easy',
        isActive: false
      }];

      useGameStore.setState({ challenges: mockChallenges });
      
      renderWithRouter(<ChallengeSystem />);
      
      expect(screen.getByText('First Deployment')).toBeInTheDocument();
      expect(screen.getByText('Deploy 1 agent')).toBeInTheDocument();
      expect(screen.getByText('100 points')).toBeInTheDocument();
    });

    it('supports challenge filtering by difficulty', () => {
      renderWithRouter(<ChallengeSystem />);
      
      const easyFilter = screen.getByText('Easy');
      const hardFilter = screen.getByText('Hard');
      
      expect(easyFilter).toBeInTheDocument();
      expect(hardFilter).toBeInTheDocument();
      
      fireEvent.click(hardFilter);
      expect(hardFilter).toHaveClass('bg-glow-green');
    });
  });

  describe('Database Integration', () => {
    it('handles Supabase operations gracefully', async () => {
      const store = useGameStore.getState();
      
      // Mock user
      store.setUser({ id: 'test-user-123', email: 'test@example.com' });
      
      // Test save operation
      await expect(store.saveToSupabase()).resolves.not.toThrow();
      
      // Test load operation
      await expect(store.loadFromSupabase()).resolves.not.toThrow();
    });

    it('falls back gracefully when Supabase is unavailable', async () => {
      // Mock Supabase failure
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
      
      const store = useGameStore.getState();
      store.setUser({ id: 'test-user-456', email: 'test2@example.com' });
      
      await store.saveToSupabase();
      
      const state = useGameStore.getState();
      expect(state.notifications.some(n => n.title === 'Save Warning')).toBe(true);
    });
  });

  describe('Complete Feature Integration', () => {
    it('demonstrates full v2.5 workflow', async () => {
      const store = useGameStore.getState();
      
      // 1. Generate a world
      store.generateWorld('integration-seed', 'matrix', 2);
      
      // 2. Start a challenge
      const testChallenge = {
        id: 'integration-challenge',
        title: 'Integration Test',
        description: 'Complete integration test',
        objectives: [{
          id: 'obj-1',
          description: 'Deploy agents',
          completed: false,
          progress: 0,
          maxProgress: 3,
          type: 'deploy'
        }],
        reward: { score: 500, unlocks: ['advanced_ai'] },
        difficulty: 'medium',
        isActive: false
      };
      
      useGameStore.setState({ challenges: [testChallenge] });
      store.startChallenge('integration-challenge');
      
      // 3. Use LLM to parse natural language
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: 'DeployAgent[3] center patrol',
                confidence: 0.9,
                explanation: 'Deploying agents for integration test'
              })
            }
          }]
        })
      });
      
      const llmResult = await llmParser.parseCommand('deploy three patrol agents at center');
      expect(llmResult?.command).toBe('DeployAgent[3] center patrol');
      
      // 4. Execute the command
      await store.executeCommand('DeployAgent[3] center patrol');
      
      // 5. Verify state changes
      const finalState = useGameStore.getState();
      expect(finalState.gameState.agents.length).toBe(3);
      expect(finalState.gameState.playerStats.agentsDeployed).toBe(3);
      expect(finalState.gameState.playerStats.commandsExecuted).toBe(1);
      expect(finalState.activeChallenge?.id).toBe('integration-challenge');
    });
  });
});