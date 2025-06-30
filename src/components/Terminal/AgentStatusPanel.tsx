import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Heart, MapPin, Clock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const AgentStatusPanel: React.FC = () => {
  const { gameState, selectedAgent, selectAgent } = useGameStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-matrix-green';
      case 'idle':
        return 'text-matrix-dim-green';
      case 'executing':
        return 'text-info';
      case 'error':
        return 'text-warning-orange';
      default:
        return 'text-matrix-dim-green';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-3 h-3 animate-pulse" />;
      case 'executing':
        return <Zap className="w-3 h-3 text-info" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-current opacity-50" />;
    }
  };

  return (
    <div className="h-full bg-console-gray flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-green bg-console-dark">
        <h2 className="text-lg font-bold matrix-glow">Agent Status</h2>
        <p className="text-sm text-matrix-dim-green">
          {gameState.agents.length} Active Agents
        </p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        {gameState.agents.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-matrix-dim-green text-sm">
              No agents deployed
            </div>
            <div className="text-xs text-matrix-dim-green mt-1">
              Use DeployAgent command to create agents
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {gameState.agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id
                    ? 'border-matrix-green bg-glow-green'
                    : 'border-border-green hover:border-matrix-dark-green hover:bg-glow-green'
                }`}
                onClick={() => selectAgent(agent)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={getStatusColor(agent.status)}>
                      {getStatusIcon(agent.status)}
                    </div>
                    <span className="text-sm font-medium text-matrix-green">
                      {agent.name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(agent.status)}`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-matrix-dim-green" />
                    <span className="text-matrix-dim-green">
                      ({agent.position.x}, {agent.position.y})
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-matrix-dim-green" />
                    <span className="text-matrix-dim-green">
                      {agent.health}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-matrix-dim-green">
                  Behavior: <span className="text-matrix-green">{agent.behavior}</span>
                </div>
                
                <div className="mt-1 text-xs text-matrix-dim-green">
                  Last Action: <span className="text-matrix-green">{agent.lastAction}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border-green bg-console-dark p-4"
        >
          <h3 className="text-sm font-bold text-matrix-green mb-2">
            Agent Details
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-matrix-dim-green">ID:</span>
              <span className="text-matrix-green font-mono">{selectedAgent.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-matrix-dim-green">Energy:</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-console-gray rounded-full">
                  <div 
                    className="h-full bg-matrix-green rounded-full transition-all"
                    style={{ width: `${selectedAgent.energy}%` }}
                  />
                </div>
                <span className="text-matrix-green">{selectedAgent.energy}%</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-matrix-dim-green">Health:</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-console-gray rounded-full">
                  <div 
                    className="h-full bg-matrix-green rounded-full transition-all"
                    style={{ width: `${selectedAgent.health}%` }}
                  />
                </div>
                <span className="text-matrix-green">{selectedAgent.health}%</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-matrix-dim-green">Created:</span>
              <span className="text-matrix-green">
                {selectedAgent.createdAt.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {selectedAgent.commands.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-matrix-dim-green mb-1">Commands:</div>
              <div className="text-xs text-matrix-green">
                {selectedAgent.commands.join(', ')}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AgentStatusPanel;