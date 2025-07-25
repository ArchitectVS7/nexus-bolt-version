import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useGameStore } from '../store/gameStore';
import { useCommandValidation } from '../hooks/useCommandValidation';
import { llmParser } from '../lib/llm';

// Mock audio manager
vi.mock('../lib/audio', () => ({
  audioManager: {
    playSound: vi.fn(),
    setEnabled: vi.fn(),
    isAudioEnabled: vi.fn().mockReturnValue(true)
  }
}));

describe('Command System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
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
      terminalLines: [],
      currentInput: '',
      isExecuting: false
    });
  });

  describe('Command Validation', () => {
    it('validates DeployAgent command syntax', () => {
      const TestComponent = () => {
        const { validateCommand } = useCommandValidation();
        const result = validateCommand('DeployAgent[3] center patrol');
        return <div data-testid="result">{result.isValid.toString()}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('result')).toHaveTextContent('true');
    });

    it('rejects invalid DeployAgent syntax', () => {
      const TestComponent = () => {
        const { validateCommand } = useCommandValidation();
        const result = validateCommand('DeployAgent invalid');
        return (
          <div>
            <div data-testid="valid">{result.isValid.toString()}</div>
            <div data-testid="errors">{result.errors.join(', ')}</div>
          </div>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('valid')).toHaveTextContent('false');
      expect(screen.getByTestId('errors')).toHaveTextContent('Invalid DeployAgent syntax');
    });

    it('warns about large agent deployments', () => {
      const TestComponent = () => {
        const { validateCommand } = useCommandValidation();
        const result = validateCommand('DeployAgent[15] center patrol');
        return <div data-testid="warnings">{result.warnings.join(', ')}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('warnings')).toHaveTextContent('more than 10 agents');
    });

    it('validates ScanArea coordinates', () => {
      const TestComponent = () => {
        const { validateCommand } = useCommandValidation();
        const result = validateCommand('ScanArea 100 100 5');
        return <div data-testid="errors">{result.errors.join(', ')}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('errors')).toHaveTextContent('out of bounds');
    });
  });

  describe('Command Execution', () => {
    it('executes valid DeployAgent command', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('DeployAgent[2] center patrol');
      
      const state = useGameStore.getState();
      expect(state.gameState.agents).toHaveLength(2);
      expect(state.gameState.agents[0].behavior).toBe('patrol');
      expect(state.gameState.playerStats.agentsDeployed).toBe(2);
    });

    it('executes ScanArea command', async () => {
      const store = useGameStore.getState();
      
      // First deploy an agent
      await store.executeCommand('DeployAgent[1] center patrol');
      
      // Then scan the area
      await store.executeCommand('ScanArea 25 25 10');
      
      const state = useGameStore.getState();
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.content).toContain('Agents found: 1');
    });

    it('handles unknown commands', async () => {
      const store = useGameStore.getState();
      
      await store.executeCommand('UnknownCommand');
      
      const state = useGameStore.getState();
      const lastLine = state.terminalLines[state.terminalLines.length - 1];
      expect(lastLine.type).toBe('error');
      expect(lastLine.content).toContain('Unknown command');
    });
  });

  describe('LLM Command Parsing', () => {
    it('parses natural language to commands', async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                command: 'DeployAgent[3] center scout',
                confidence: 0.9,
                explanation: 'Deploy 3 scout agents at center'
              })
            }
          }]
        })
      });

      const result = await llmParser.parseCommand('send three scouts to the center');
      
      expect(result).toBeTruthy();
      expect(result?.command).toBe('DeployAgent[3] center scout');
      expect(result?.confidence).toBe(0.9);
    });

    it('falls back to pattern matching when LLM fails', async () => {
      // Mock API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await llmParser.parseCommand('deploy two agents');
      
      expect(result).toBeTruthy();
      expect(result?.command).toContain('DeployAgent');
      expect(result?.confidence).toBe(0.7);
    });
  });
});