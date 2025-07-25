import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Load, Trash2, Grid, Eye, Palette, Download, Upload, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { WorldObject, WorldTemplate } from '../../types';

interface EditorTool {
  id: string;
  name: string;
  icon: string;
  objectType: string;
  color: string;
}

const WorldEditor: React.FC = () => {
  const { gameState, addNotification } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedTool, setSelectedTool] = useState<EditorTool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([...gameState.objects]);
  const [worldSize, setWorldSize] = useState(gameState.worldSize);
  const [templateName, setTemplateName] = useState('');

  const tools: EditorTool[] = [
    { id: 'wall', name: 'Wall', icon: '█', objectType: 'wall', color: '#666666' },
    { id: 'obstacle', name: 'Obstacle', icon: '▓', objectType: 'obstacle', color: '#444444' },
    { id: 'datanode', name: 'Data Node', icon: 'D', objectType: 'datanode', color: '#00CCFF' },
    { id: 'terminal', name: 'Terminal', icon: 'T', objectType: 'terminalnode', color: '#00FF41' },
    { id: 'portal', name: 'Portal', icon: 'P', objectType: 'portal', color: '#FF6B35' },
    { id: 'eraser', name: 'Eraser', icon: '✗', objectType: 'eraser', color: '#FF6B35' }
  ];

  const cellSize = 20;

  const drawWorld = useCallback(() => {
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
    ctx.translate(-worldSize.width * cellSize / 2, -worldSize.height * cellSize / 2);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#00AA33';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      
      for (let x = 0; x <= worldSize.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, worldSize.height * cellSize);
        ctx.stroke();
      }
      
      for (let y = 0; y <= worldSize.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(worldSize.width * cellSize, y * cellSize);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw objects
    worldObjects.forEach(obj => {
      const x = obj.position.x * cellSize;
      const y = obj.position.y * cellSize;
      
      const tool = tools.find(t => t.objectType === obj.type);
      ctx.fillStyle = tool?.color || '#666666';
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      
      // Add object icon
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tool?.icon || '?', x + cellSize/2, y + cellSize/2 + 4);
    });

    ctx.restore();
  }, [worldObjects, worldSize, zoom, pan, showGrid, tools]);

  React.useEffect(() => {
    drawWorld();
  }, [drawWorld]);

  const getWorldCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const worldX = Math.floor(((x - canvas.width / 2 - pan.x) / zoom + worldSize.width * cellSize / 2) / cellSize);
    const worldY = Math.floor(((y - canvas.height / 2 - pan.y) / zoom + worldSize.height * cellSize / 2) / cellSize);

    if (worldX >= 0 && worldX < worldSize.width && worldY >= 0 && worldY < worldSize.height) {
      return { x: worldX, y: worldY };
    }
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!selectedTool) return;
    
    setIsDrawing(true);
    handleCanvasInteraction(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !selectedTool) return;
    handleCanvasInteraction(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasInteraction = (e: React.MouseEvent) => {
    const coords = getWorldCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (selectedTool.objectType === 'eraser') {
      // Remove object at position
      setWorldObjects(prev => prev.filter(obj => 
        !(obj.position.x === coords.x && obj.position.y === coords.y)
      ));
    } else {
      // Add or replace object at position
      setWorldObjects(prev => {
        const filtered = prev.filter(obj => 
          !(obj.position.x === coords.x && obj.position.y === coords.y)
        );
        
        const newObject: WorldObject = {
          id: `${selectedTool.objectType}_${coords.x}_${coords.y}`,
          type: selectedTool.objectType as any,
          position: coords,
          properties: getDefaultProperties(selectedTool.objectType),
          isBlocking: selectedTool.objectType === 'wall' || selectedTool.objectType === 'obstacle',
          isCollectable: selectedTool.objectType === 'datanode',
          isActivatable: selectedTool.objectType === 'terminalnode' || selectedTool.objectType === 'portal'
        };
        
        return [...filtered, newObject];
      });
    }
  };

  const getDefaultProperties = (objectType: string): Record<string, any> => {
    switch (objectType) {
      case 'datanode':
        return { value: 100, encrypted: false };
      case 'terminalnode':
        return { active: true, accessLevel: 1 };
      case 'portal':
        return { destination: 'world_1', stable: true };
      default:
        return {};
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Please enter a template name',
        duration: 3000
      });
      return;
    }

    const template: WorldTemplate = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: `Custom world template created in editor`,
      size: worldSize,
      objects: worldObjects,
      spawnPoints: [
        { x: Math.floor(worldSize.width / 2), y: Math.floor(worldSize.height / 2) }
      ],
      difficulty: 1,
      createdBy: 'user',
      isPublic: false,
      createdAt: new Date()
    };

    // Save to localStorage or Supabase
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('worldTemplates') || '[]');
      savedTemplates.push(template);
      localStorage.setItem('worldTemplates', JSON.stringify(savedTemplates));

      addNotification({
        type: 'success',
        title: 'Template Saved',
        message: `World template "${templateName}" saved successfully`,
        duration: 3000
      });

      setTemplateName('');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save world template',
        duration: 3000
      });
    }
  };

  const loadTemplate = async () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('worldTemplates') || '[]');
      if (savedTemplates.length === 0) {
        addNotification({
          type: 'info',
          title: 'No Templates',
          message: 'No saved templates found',
          duration: 3000
        });
        return;
      }

      // For demo, load the first template
      const template = savedTemplates[0];
      setWorldObjects(template.objects);
      setWorldSize(template.size);

      addNotification({
        type: 'success',
        title: 'Template Loaded',
        message: `Loaded template "${template.name}"`,
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load world template',
        duration: 3000
      });
    }
  };

  const clearWorld = () => {
    setWorldObjects([]);
    addNotification({
      type: 'info',
      title: 'World Cleared',
      message: 'All objects removed from world',
      duration: 2000
    });
  };

  const exportWorld = () => {
    const template: WorldTemplate = {
      id: `export_${Date.now()}`,
      name: templateName || 'Exported World',
      description: 'Exported from World Editor',
      size: worldSize,
      objects: worldObjects,
      spawnPoints: [],
      difficulty: 1,
      createdBy: 'user',
      isPublic: false,
      createdAt: new Date()
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'world'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'World Exported',
      message: 'World template exported successfully',
      duration: 3000
    });
  };

  return (
    <div className="h-full flex bg-console-gray">
      {/* Tool Palette */}
      <div className="w-64 border-r border-border-green bg-console-dark p-4">
        <h2 className="text-lg font-bold matrix-glow mb-4">World Editor</h2>
        
        {/* Tools */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-medium text-matrix-green">Tools</h3>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className={`w-full flex items-center space-x-3 p-2 rounded transition-colors ${
                selectedTool?.id === tool.id
                  ? 'bg-glow-green border border-matrix-green'
                  : 'hover:bg-glow-green border border-transparent'
              }`}
            >
              <span className="text-lg font-mono" style={{ color: tool.color }}>
                {tool.icon}
              </span>
              <span className="text-sm">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* World Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-matrix-green">World Settings</h3>
          
          <div>
            <label className="block text-xs text-matrix-dim-green mb-1">Width</label>
            <input
              type="number"
              value={worldSize.width}
              onChange={(e) => setWorldSize(prev => ({ ...prev, width: parseInt(e.target.value) || 50 }))}
              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
              min="10"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-xs text-matrix-dim-green mb-1">Height</label>
            <input
              type="number"
              value={worldSize.height}
              onChange={(e) => setWorldSize(prev => ({ ...prev, height: parseInt(e.target.value) || 50 }))}
              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
              min="10"
              max="100"
            />
          </div>
        </div>

        {/* Template Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-matrix-green">Template</h3>
          
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name..."
            className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green placeholder-matrix-dim-green"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveTemplate}
              className="matrix-button px-2 py-1 rounded text-xs flex items-center justify-center space-x-1"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
            
            <button
              onClick={loadTemplate}
              className="matrix-button px-2 py-1 rounded text-xs flex items-center justify-center space-x-1"
            >
              <Load className="w-3 h-3" />
              <span>Load</span>
            </button>
            
            <button
              onClick={exportWorld}
              className="matrix-button px-2 py-1 rounded text-xs flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            
            <button
              onClick={clearWorld}
              className="px-2 py-1 rounded text-xs border border-warning-orange text-warning-orange hover:bg-warning-orange hover:bg-opacity-10 flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-green bg-console-dark">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-matrix-dim-green">
              Selected: <span className="text-matrix-green">{selectedTool?.name || 'None'}</span>
            </span>
            <span className="text-sm text-matrix-dim-green">
              Objects: <span className="text-matrix-green">{worldObjects.length}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
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
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
              className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
              title="Zoom In"
            >
              +
            </button>
            
            <button
              onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.3))}
              className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
              title="Zoom Out"
            >
              -
            </button>
            
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full h-full cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-console-dark border border-border-green rounded px-3 py-2 text-xs">
            <div className="text-matrix-green mb-1">Instructions:</div>
            <div className="text-matrix-dim-green space-y-1">
              <div>• Select a tool from the palette</div>
              <div>• Click and drag to place objects</div>
              <div>• Use eraser tool to remove objects</div>
              <div>• Save your work as a template</div>
            </div>
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-console-dark border border-border-green rounded px-3 py-1">
            <span className="text-sm text-matrix-green">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldEditor;