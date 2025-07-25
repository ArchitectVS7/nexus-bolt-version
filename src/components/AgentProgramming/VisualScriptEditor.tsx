import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'react-flow-renderer';
import { Save, Play, Download, Upload, Plus, Trash2, Settings } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { AgentScript, ScriptBlock, ScriptTrigger } from '../../types';

interface BlockType {
  id: string;
  name: string;
  category: 'trigger' | 'condition' | 'action' | 'control';
  color: string;
  inputs: number;
  outputs: number;
  parameters: { name: string; type: string; default?: any }[];
}

const VisualScriptEditor: React.FC = () => {
  const { gameState, addNotification } = useGameStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null);
  const [scriptName, setScriptName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const blockTypes: BlockType[] = [
    {
      id: 'health_trigger',
      name: 'Health Low',
      category: 'trigger',
      color: '#FF6B35',
      inputs: 0,
      outputs: 1,
      parameters: [{ name: 'threshold', type: 'number', default: 25 }]
    },
    {
      id: 'energy_trigger',
      name: 'Energy Low',
      category: 'trigger',
      color: '#FF6B35',
      inputs: 0,
      outputs: 1,
      parameters: [{ name: 'threshold', type: 'number', default: 20 }]
    },
    {
      id: 'enemy_nearby',
      name: 'Enemy Nearby',
      category: 'trigger',
      color: '#FF6B35',
      inputs: 0,
      outputs: 1,
      parameters: [{ name: 'radius', type: 'number', default: 5 }]
    },
    {
      id: 'if_condition',
      name: 'If Condition',
      category: 'condition',
      color: '#00CCFF',
      inputs: 1,
      outputs: 2,
      parameters: [{ name: 'condition', type: 'string', default: 'health > 50' }]
    },
    {
      id: 'move_action',
      name: 'Move To',
      category: 'action',
      color: '#00FF41',
      inputs: 1,
      outputs: 1,
      parameters: [
        { name: 'x', type: 'number', default: 0 },
        { name: 'y', type: 'number', default: 0 }
      ]
    },
    {
      id: 'scan_action',
      name: 'Scan Area',
      category: 'action',
      color: '#00FF41',
      inputs: 1,
      outputs: 1,
      parameters: [{ name: 'radius', type: 'number', default: 5 }]
    },
    {
      id: 'patrol_action',
      name: 'Patrol',
      category: 'action',
      color: '#00FF41',
      inputs: 1,
      outputs: 1,
      parameters: [{ name: 'pattern', type: 'string', default: 'random' }]
    },
    {
      id: 'wait_action',
      name: 'Wait',
      category: 'action',
      color: '#00FF41',
      inputs: 1,
      outputs: 1,
      parameters: [{ name: 'duration', type: 'number', default: 1000 }]
    },
    {
      id: 'loop',
      name: 'Loop',
      category: 'control',
      color: '#FFAA00',
      inputs: 1,
      outputs: 2,
      parameters: [{ name: 'iterations', type: 'number', default: -1 }]
    }
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addBlock = (blockType: BlockType, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${blockType.id}_${Date.now()}`,
      type: 'default',
      position,
      data: {
        label: (
          <div className="p-2 text-center">
            <div className="font-bold text-xs">{blockType.name}</div>
            <div className="text-xs opacity-75">{blockType.category}</div>
          </div>
        ),
        blockType: blockType.id,
        parameters: blockType.parameters.reduce((acc, param) => {
          acc[param.name] = param.default;
          return acc;
        }, {} as Record<string, any>)
      },
      style: {
        background: blockType.color,
        color: '#000',
        border: '2px solid #000',
        borderRadius: '8px',
        fontSize: '12px',
        width: 120,
        height: 60
      }
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 60,
        y: event.clientY - reactFlowBounds.top - 30,
      };

      if (selectedBlockType) {
        addBlock(selectedBlockType, position);
      }
    },
    [selectedBlockType]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const saveScript = () => {
    if (!scriptName.trim()) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Please enter a script name',
        duration: 3000
      });
      return;
    }

    const script: AgentScript = {
      id: `script_${Date.now()}`,
      name: scriptName,
      description: `Visual script created in editor`,
      blocks: nodes.map(node => ({
        id: node.id,
        type: node.data.blockType,
        position: node.position,
        parameters: node.data.parameters,
        connections: edges.filter(edge => edge.source === node.id).map(edge => edge.target)
      })),
      triggers: [], // Would be extracted from trigger blocks
      variables: {},
      createdAt: new Date()
    };

    // Save to localStorage
    try {
      const savedScripts = JSON.parse(localStorage.getItem('agentScripts') || '[]');
      savedScripts.push(script);
      localStorage.setItem('agentScripts', JSON.stringify(savedScripts));

      addNotification({
        type: 'success',
        title: 'Script Saved',
        message: `Agent script "${scriptName}" saved successfully`,
        duration: 3000
      });

      setScriptName('');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save agent script',
        duration: 3000
      });
    }
  };

  const testScript = () => {
    if (nodes.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Script',
        message: 'Add some blocks to test the script',
        duration: 3000
      });
      return;
    }

    // Simulate script execution
    addNotification({
      type: 'info',
      title: 'Script Test',
      message: `Testing script with ${nodes.length} blocks...`,
      duration: 3000
    });

    // In a real implementation, this would execute the script logic
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Test Complete',
        message: 'Script executed successfully in test environment',
        duration: 3000
      });
    }, 2000);
  };

  const assignToAgent = () => {
    if (!selectedAgent || nodes.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Assignment Failed',
        message: 'Select an agent and create a script first',
        duration: 3000
      });
      return;
    }

    addNotification({
      type: 'success',
      title: 'Script Assigned',
      message: `Script assigned to agent ${selectedAgent}`,
      duration: 3000
    });
  };

  const clearScript = () => {
    setNodes([]);
    setEdges([]);
    addNotification({
      type: 'info',
      title: 'Script Cleared',
      message: 'All blocks removed from script',
      duration: 2000
    });
  };

  return (
    <div className="h-full flex bg-console-gray">
      {/* Block Palette */}
      <div className="w-64 border-r border-border-green bg-console-dark p-4">
        <h2 className="text-lg font-bold matrix-glow mb-4">Agent Programming</h2>
        
        {/* Script Info */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-matrix-dim-green mb-1">Script Name</label>
            <input
              type="text"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Enter script name..."
              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green placeholder-matrix-dim-green"
            />
          </div>
          
          <div>
            <label className="block text-xs text-matrix-dim-green mb-1">Assign to Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
            >
              <option value="">Select agent...</option>
              {gameState.agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Block Categories */}
        {['trigger', 'condition', 'action', 'control'].map(category => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-medium text-matrix-green mb-2 capitalize">
              {category}s
            </h3>
            <div className="space-y-1">
              {blockTypes.filter(block => block.category === category).map(block => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => setSelectedBlockType(block)}
                  className="p-2 rounded cursor-move border border-border-green hover:border-matrix-green transition-colors"
                  style={{ backgroundColor: `${block.color}20` }}
                >
                  <div className="text-xs font-medium" style={{ color: block.color }}>
                    {block.name}
                  </div>
                  <div className="text-xs text-matrix-dim-green">
                    {block.inputs}→{block.outputs}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={saveScript}
            className="w-full matrix-button px-3 py-2 rounded text-sm flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Script</span>
          </button>
          
          <button
            onClick={testScript}
            className="w-full matrix-button px-3 py-2 rounded text-sm flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Test Script</span>
          </button>
          
          <button
            onClick={assignToAgent}
            className="w-full matrix-button px-3 py-2 rounded text-sm flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Assign to Agent</span>
          </button>
          
          <button
            onClick={clearScript}
            className="w-full px-3 py-2 rounded text-sm border border-warning-orange text-warning-orange hover:bg-warning-orange hover:bg-opacity-10 flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Visual Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-green bg-console-dark">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-matrix-dim-green">
              Blocks: <span className="text-matrix-green">{nodes.length}</span>
            </span>
            <span className="text-sm text-matrix-dim-green">
              Connections: <span className="text-matrix-green">{edges.length}</span>
            </span>
          </div>
          
          <div className="text-sm text-matrix-dim-green">
            Drag blocks from the palette to create your script
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" style={{ background: '#1A1A1A' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            style={{ background: '#1A1A1A' }}
          >
            <Controls style={{ background: '#2A2A2A', border: '1px solid #00AA33' }} />
            <MiniMap 
              style={{ background: '#2A2A2A', border: '1px solid #00AA33' }}
              nodeColor="#00FF41"
            />
            <Background color="#00AA33" gap={20} />
          </ReactFlow>
        </div>

        {/* Instructions */}
        <div className="p-4 border-t border-border-green bg-console-dark">
          <div className="text-xs text-matrix-dim-green space-y-1">
            <div>• Drag blocks from the palette to the canvas</div>
            <div>• Connect blocks by dragging from output to input</div>
            <div>• Triggers start the script execution</div>
            <div>• Actions perform operations on the agent</div>
            <div>• Conditions control the flow of execution</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualScriptEditor;