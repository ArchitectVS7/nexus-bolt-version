import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Settings, Play, Pause, Grid, Eye } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const WorldVisualization: React.FC = () => {
  const { gameState, selectedAgent, selectAgent } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'agent' | 'heatmap'>('overview');

  const cellSize = 20;
  const worldWidth = gameState.worldSize.width;
  const worldHeight = gameState.worldSize.height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-worldWidth * cellSize / 2, -worldHeight * cellSize / 2);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#00AA33';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      
      for (let x = 0; x <= worldWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, worldHeight * cellSize);
        ctx.stroke();
      }
      
      for (let y = 0; y <= worldHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(worldWidth * cellSize, y * cellSize);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw world objects
    gameState.objects.forEach(obj => {
      const x = obj.position.x * cellSize;
      const y = obj.position.y * cellSize;
      
      ctx.fillStyle = getObjectColor(obj.type);
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      
      // Add object icon/symbol
      ctx.fillStyle = '#00FF41';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(getObjectSymbol(obj.type), x + cellSize/2, y + cellSize/2 + 4);
      
      // Add interaction indicator
      if (obj.isCollectable || obj.isActivatable) {
        ctx.strokeStyle = '#00CCFF';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.setLineDash([]);
      }
    });

    // Draw agents
    gameState.agents.forEach(agent => {
      const x = agent.position.x * cellSize;
      const y = agent.position.y * cellSize;
      
      // Agent body
      const isSelected = selectedAgent?.id === agent.id;
      ctx.fillStyle = isSelected ? '#00CCFF' : getAgentColor(agent.status);
      ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
      
      // Agent border
      ctx.strokeStyle = isSelected ? '#00CCFF' : '#00FF41';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
      
      // Agent ID
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(agent.id.slice(-2), x + cellSize/2, y + cellSize/2 + 2);
      
      // Status indicator
      if (agent.status === 'executing') {
        ctx.fillStyle = '#00CCFF';
        ctx.beginPath();
        ctx.arc(x + cellSize - 3, y + 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Health bar
      const healthWidth = (cellSize - 8) * (agent.health / 100);
      ctx.fillStyle = '#111111';
      ctx.fillRect(x + 4, y - 4, cellSize - 8, 2);
      ctx.fillStyle = agent.health > 50 ? '#00FF41' : agent.health > 25 ? '#FFAA00' : '#FF6B35';
      ctx.fillRect(x + 4, y - 4, healthWidth, 2);
    });

    ctx.restore();
  }, [gameState, zoom, pan, selectedAgent, showGrid, viewMode]);

  const getObjectColor = (type: string) => {
    switch (type) {
      case 'obstacle': return '#666666';
      case 'datanode': return '#00CCFF';
      case 'terminalnode': return '#00FF41';
      case 'portal': return '#FF6B35';
      default: return '#444444';
    }
  };

  const getObjectSymbol = (type: string) => {
    switch (type) {
      case 'obstacle': return '█';
      case 'datanode': return 'D';
      case 'terminalnode': return 'T';
      case 'portal': return 'P';
      default: return '?';
    }
  };

  const getAgentColor = (status: string) => {
    switch (status) {
      case 'active': return '#00FF41';
      case 'idle': return '#009900';
      case 'executing': return '#00CCFF';
      case 'error': return '#FF6B35';
      default: return '#666666';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = Math.floor(((x - canvas.width / 2 - pan.x) / zoom + worldWidth * cellSize / 2) / cellSize);
    const worldY = Math.floor(((y - canvas.height / 2 - pan.y) / zoom + worldHeight * cellSize / 2) / cellSize);

    // Find agent at this position
    const clickedAgent = gameState.agents.find(agent => 
      agent.position.x === worldX && agent.position.y === worldY
    );

    // Find object at this position
    const clickedObject = gameState.objects.find(obj => 
      obj.position.x === worldX && obj.position.y === worldY
    );

    if (clickedObject && (clickedObject.isCollectable || clickedObject.isActivatable)) {
      const { interactWithObject } = useGameStore.getState();
      interactWithObject(clickedObject.id);
    }

    selectAgent(clickedAgent || null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-green bg-console-dark">
        <div>
          <h2 className="text-lg font-bold matrix-glow">World Visualization</h2>
          <p className="text-sm text-matrix-dim-green">
            {gameState.agents.length} agents in {worldWidth}×{worldHeight} world
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Controls */}
          <div className="flex items-center space-x-1 mr-4">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'overview'
                  ? 'bg-glow-green text-matrix-green border border-matrix-green'
                  : 'text-matrix-dim-green hover:text-matrix-green'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('agent')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'agent'
                  ? 'bg-glow-green text-matrix-green border border-matrix-green'
                  : 'text-matrix-dim-green hover:text-matrix-green'
              }`}
            >
              Agent Focus
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'heatmap'
                  ? 'bg-glow-green text-matrix-green border border-matrix-green'
                  : 'text-matrix-dim-green hover:text-matrix-green'
              }`}
            >
              Heatmap
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid ? 'text-matrix-green bg-glow-green' : 'text-matrix-dim-green hover:text-matrix-green'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded transition-colors ${
              isPlaying ? 'text-matrix-green bg-glow-green' : 'text-matrix-dim-green hover:text-matrix-green'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <div className="h-6 w-px bg-border-green mx-2"></div>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={resetView}
            className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-console-dark border border-border-green rounded px-3 py-1">
            <span className="text-sm text-matrix-green">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Coordinates indicator */}
          <div className="absolute top-4 left-4 bg-console-dark border border-border-green rounded px-3 py-1">
            <span className="text-sm text-matrix-green font-mono">
              World: {worldWidth}×{worldHeight}
            </span>
          </div>
        </div>

        {/* Agent Info Panel */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 border-l border-border-green bg-console-dark p-4"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-matrix-green mb-2">Agent Details</h3>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedAgent.status === 'active' ? 'bg-matrix-green animate-pulse' :
                  selectedAgent.status === 'executing' ? 'bg-info' :
                  selectedAgent.status === 'error' ? 'bg-warning-orange' :
                  'bg-matrix-dim-green'
                }`}></div>
                <span className="text-matrix-green font-mono">{selectedAgent.name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-matrix-dim-green">Position</label>
                  <div className="text-matrix-green font-mono">
                    ({selectedAgent.position.x}, {selectedAgent.position.y})
                  </div>
                </div>
                <div>
                  <label className="text-xs text-matrix-dim-green">Status</label>
                  <div className="text-matrix-green capitalize">{selectedAgent.status}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-matrix-dim-green">Health</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-console-gray rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        selectedAgent.health > 75 ? 'bg-matrix-green' :
                        selectedAgent.health > 50 ? 'bg-yellow-500' :
                        selectedAgent.health > 25 ? 'bg-orange-500' :
                        'bg-warning-orange'
                      }`}
                      style={{ width: `${selectedAgent.health}%` }}
                    />
                  </div>
                  <span className="text-xs text-matrix-green">{selectedAgent.health}%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-matrix-dim-green">Energy</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-console-gray rounded-full h-2">
                    <div 
                      className="h-full bg-info rounded-full transition-all"
                      style={{ width: `${selectedAgent.energy}%` }}
                    />
                  </div>
                  <span className="text-xs text-matrix-green">{selectedAgent.energy}%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-matrix-dim-green">Behavior</label>
                <div className="text-matrix-green capitalize">{selectedAgent.behavior}</div>
              </div>

              <div>
                <label className="text-xs text-matrix-dim-green">Last Action</label>
                <div className="text-matrix-green">{selectedAgent.lastAction}</div>
              </div>

              <div>
                <label className="text-xs text-matrix-dim-green">Created</label>
                <div className="text-matrix-green text-xs">
                  {selectedAgent.createdAt.toLocaleString()}
                </div>
              </div>

              {selectedAgent.commands.length > 0 && (
                <div>
                  <label className="text-xs text-matrix-dim-green">Commands</label>
                  <div className="mt-1 space-y-1">
                    {selectedAgent.commands.map((cmd, index) => (
                      <div key={index} className="text-xs bg-console-gray px-2 py-1 rounded">
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-border-green bg-console-dark p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-matrix-green"></div>
              <span className="text-matrix-dim-green">Active Agent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-matrix-dim-green"></div>
              <span className="text-matrix-dim-green">Idle Agent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-info"></div>
              <span className="text-matrix-dim-green">Executing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning-orange"></div>
              <span className="text-matrix-dim-green">Error</span>
            </div>
          </div>
          
          <div className="text-xs text-matrix-dim-green">
            Click on agents to select • Use mouse wheel to zoom • Drag to pan
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldVisualization;