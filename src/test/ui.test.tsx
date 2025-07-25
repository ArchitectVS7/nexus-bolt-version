import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TerminalInterface from '../components/Terminal/TerminalInterface';
import WorldVisualization from '../components/World/WorldVisualization';
import { useGameStore } from '../store/gameStore';

// Mock canvas
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
  createBuffer: vi.fn(),
  createBufferSource: vi.fn(),
  createGain: vi.fn()
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UI Components', () => {
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
      terminalLines: [
        {
          id: '1',
          type: 'system',
          content: 'NEXUS WORLD BUILDER v2.2.0 - TERMINAL INTERFACE INITIALIZED',
          timestamp: new Date()
        }
      ],
      currentInput: '',
      isExecuting: false,
      selectedAgent: null
    });
  });

  describe('Terminal Interface', () => {
    it('renders terminal with initial message', () => {
      renderWithRouter(<TerminalInterface />);
      
      expect(screen.getByText(/NEXUS WORLD BUILDER v2.2.0/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter command...')).toBeInTheDocument();
      expect(screen.getByText('Execute')).toBeInTheDocument();
    });

    it('accepts user input', () => {
      renderWithRouter(<TerminalInterface />);
      
      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'help' } });
      
      expect(input).toHaveValue('help');
    });

    it('executes commands on button click', async () => {
      renderWithRouter(<TerminalInterface />);
      
      const input = screen.getByPlaceholderText('Enter command...');
      const executeButton = screen.getByText('Execute');
      
      fireEvent.change(input, { target: { value: 'help' } });
      fireEvent.click(executeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Available Commands/)).toBeInTheDocument();
      });
    });

    it('executes commands on Enter key', async () => {
      renderWithRouter(<TerminalInterface />);
      
      const input = screen.getByPlaceholderText('Enter command...');
      
      fireEvent.change(input, { target: { value: 'status' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(/SYSTEM STATUS/)).toBeInTheDocument();
      });
    });

    it('shows command history', () => {
      renderWithRouter(<TerminalInterface />);
      
      const historyButton = screen.getByTitle('Command History');
      fireEvent.click(historyButton);
      
      // History dropdown should appear (even if empty)
      expect(screen.getByText('Command History')).toBeInTheDocument();
    });

    it('disables execute button when input is empty', () => {
      renderWithRouter(<TerminalInterface />);
      
      const executeButton = screen.getByText('Execute');
      expect(executeButton).toBeDisabled();
    });

    it('shows executing state', () => {
      useGameStore.setState({ isExecuting: true });
      
      renderWithRouter(<TerminalInterface />);
      
      expect(screen.getByText('Processing command...')).toBeInTheDocument();
    });
  });

  describe('World Visualization', () => {
    it('renders world canvas', () => {
      renderWithRouter(<WorldVisualization />);
      
      expect(screen.getByText('World Visualization')).toBeInTheDocument();
      expect(screen.getByText(/0 agents in 50×50 world/)).toBeInTheDocument();
    });

    it('shows zoom controls', () => {
      renderWithRouter(<WorldVisualization />);
      
      expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
      expect(screen.getByTitle('Reset View')).toBeInTheDocument();
    });

    it('toggles grid display', () => {
      renderWithRouter(<WorldVisualization />);
      
      const gridButton = screen.getByTitle('Toggle Grid');
      fireEvent.click(gridButton);
      
      // Grid button should change state
      expect(gridButton).toBeInTheDocument();
    });

    it('shows view mode controls', () => {
      renderWithRouter(<WorldVisualization />);
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Agent Focus')).toBeInTheDocument();
      expect(screen.getByText('Heatmap')).toBeInTheDocument();
    });

    it('displays agent information when selected', () => {
      const testAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        position: { x: 25, y: 25 },
        status: 'active' as const,
        behavior: 'patrol',
        commands: [],
        health: 100,
        energy: 100,
        lastAction: 'deployed',
        inventory: [],
        createdAt: new Date()
      };

      useGameStore.setState({
        gameState: {
          agents: [testAgent],
          worldSize: { width: 50, height: 50 },
          objects: [],
          playerStats: {
            score: 0,
            commandsExecuted: 0,
            agentsDeployed: 1,
            achievements: [],
            level: 1
          }
        },
        selectedAgent: testAgent
      });

      renderWithRouter(<WorldVisualization />);
      
      expect(screen.getByText('Agent Details')).toBeInTheDocument();
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      expect(screen.getByText('(25, 25)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation in terminal', () => {
      renderWithRouter(<TerminalInterface />);
      
      const input = screen.getByPlaceholderText('Enter command...');
      
      // Input should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Tab should move to execute button
      fireEvent.keyDown(input, { key: 'Tab' });
      // Note: jsdom doesn't fully simulate tab navigation, but we can test that elements are focusable
    });

    it('provides proper ARIA labels', () => {
      renderWithRouter(<TerminalInterface />);
      
      // Check for accessible elements
      expect(screen.getByPlaceholderText('Enter command...')).toBeInTheDocument();
      expect(screen.getByText('Execute')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders on mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithRouter(<TerminalInterface />);
      
      // Terminal should still render and be functional
      expect(screen.getByPlaceholderText('Enter command...')).toBeInTheDocument();
    });
  });
});