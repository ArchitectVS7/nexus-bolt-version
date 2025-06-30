import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Target, Clock, TrendingUp, Award, Settings, Download } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const UserProfile: React.FC = () => {
  const { gameState, customCommands, commandHistory } = useGameStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats' | 'settings'>('overview');

  const stats = {
    totalCommands: commandHistory.length,
    customCommands: customCommands.length,
    activeAgents: gameState.agents.length,
    totalAgents: gameState.playerStats.agentsDeployed,
    successRate: Math.round((gameState.playerStats.commandsExecuted / Math.max(commandHistory.length, 1)) * 100),
    playTime: '12h 34m', // Mock data
    avgResponseTime: '0.8s' // Mock data
  };

  const achievements = [
    {
      id: 'first_command',
      title: 'First Steps',
      description: 'Execute your first command',
      icon: '🎯',
      unlocked: commandHistory.length > 0,
      progress: Math.min(commandHistory.length, 1),
      maxProgress: 1
    },
    {
      id: 'agent_master',
      title: 'Agent Master',
      description: 'Deploy 10 agents',
      icon: '🤖',
      unlocked: gameState.playerStats.agentsDeployed >= 10,
      progress: gameState.playerStats.agentsDeployed,
      maxProgress: 10
    },
    {
      id: 'command_creator',
      title: 'Command Creator',
      description: 'Create 5 custom commands',
      icon: '⚡',
      unlocked: customCommands.length >= 5,
      progress: customCommands.length,
      maxProgress: 5
    },
    {
      id: 'score_hunter',
      title: 'Score Hunter',
      description: 'Reach 1000 points',
      icon: '🏆',
      unlocked: gameState.playerStats.score >= 1000,
      progress: gameState.playerStats.score,
      maxProgress: 1000
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const exportUserData = () => {
    const userData = {
      profile: {
        level: gameState.playerStats.level,
        score: gameState.playerStats.score,
        commandsExecuted: gameState.playerStats.commandsExecuted,
        agentsDeployed: gameState.playerStats.agentsDeployed,
        achievements: gameState.playerStats.achievements
      },
      customCommands: customCommands.length,
      commandHistory: commandHistory.length,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Header */}
      <div className="p-6 border-b border-border-green bg-console-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-glow-green rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-matrix-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold matrix-glow">User Profile</h1>
              <p className="text-matrix-dim-green">Level {gameState.playerStats.level} Matrix Operator</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-matrix-green rounded-full"></div>
                  <span className="text-matrix-dim-green">Online</span>
                </span>
                <span className="text-matrix-dim-green">
                  Score: <span className="text-matrix-green">{gameState.playerStats.score.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={exportUserData}
            className="matrix-button px-4 py-2 rounded flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-glow-green border border-matrix-green text-matrix-green'
                  : 'border border-border-green text-matrix-dim-green hover:text-matrix-green hover:border-matrix-dark-green'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-console-dark border border-border-green rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-matrix-green" />
                    <span className="text-sm text-matrix-dim-green">Commands</span>
                  </div>
                  <div className="text-2xl font-bold text-matrix-green">{stats.totalCommands}</div>
                </div>

                <div className="bg-console-dark border border-border-green rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-info" />
                    <span className="text-sm text-matrix-dim-green">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-matrix-green">{stats.successRate}%</div>
                </div>

                <div className="bg-console-dark border border-border-green rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-warning-orange" />
                    <span className="text-sm text-matrix-dim-green">Active Agents</span>
                  </div>
                  <div className="text-2xl font-bold text-matrix-green">{stats.activeAgents}</div>
                </div>

                <div className="bg-console-dark border border-border-green rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-matrix-green" />
                    <span className="text-sm text-matrix-dim-green">Play Time</span>
                  </div>
                  <div className="text-2xl font-bold text-matrix-green">{stats.playTime}</div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Level Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-matrix-dim-green">Level {gameState.playerStats.level}</span>
                  <span className="text-matrix-dim-green">
                    {gameState.playerStats.score} / {(gameState.playerStats.level + 1) * 1000} XP
                  </span>
                </div>
                <div className="w-full bg-console-gray rounded-full h-3">
                  <div 
                    className="bg-matrix-green h-3 rounded-full transition-all"
                    style={{ 
                      width: `${(gameState.playerStats.score % 1000) / 10}%` 
                    }}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {commandHistory.slice(-5).reverse().map((cmd, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-console-gray rounded">
                      <div className="w-2 h-2 bg-matrix-green rounded-full"></div>
                      <span className="font-mono text-sm text-matrix-green">{cmd}</span>
                      <span className="text-xs text-matrix-dim-green ml-auto">
                        {Math.floor(Math.random() * 60)} minutes ago
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-matrix-green mb-2">Achievements</h2>
                <p className="text-matrix-dim-green">
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`border rounded-lg p-6 ${
                      achievement.unlocked
                        ? 'border-matrix-green bg-glow-green'
                        : 'border-border-green bg-console-dark opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-matrix-green">{achievement.title}</h3>
                        <p className="text-sm text-matrix-dim-green">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Trophy className="w-6 h-6 text-matrix-green" />
                      )}
                    </div>

                    <div className="w-full bg-console-gray rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.unlocked ? 'bg-matrix-green' : 'bg-matrix-dim-green'
                        }`}
                        style={{ 
                          width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="text-xs text-matrix-dim-green mt-2">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Command Statistics */}
                <div className="bg-console-dark border border-border-green rounded-lg p-6">
                  <h3 className="text-lg font-bold text-matrix-green mb-4">Command Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Total Executed:</span>
                      <span className="text-matrix-green">{gameState.playerStats.commandsExecuted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Custom Created:</span>
                      <span className="text-matrix-green">{customCommands.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Success Rate:</span>
                      <span className="text-matrix-green">{stats.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Avg Response Time:</span>
                      <span className="text-matrix-green">{stats.avgResponseTime}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Statistics */}
                <div className="bg-console-dark border border-border-green rounded-lg p-6">
                  <h3 className="text-lg font-bold text-matrix-green mb-4">Agent Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Total Deployed:</span>
                      <span className="text-matrix-green">{gameState.playerStats.agentsDeployed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Currently Active:</span>
                      <span className="text-matrix-green">{gameState.agents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Avg Health:</span>
                      <span className="text-matrix-green">
                        {gameState.agents.length > 0 
                          ? Math.round(gameState.agents.reduce((sum, agent) => sum + agent.health, 0) / gameState.agents.length)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-matrix-dim-green">Avg Energy:</span>
                      <span className="text-matrix-green">
                        {gameState.agents.length > 0 
                          ? Math.round(gameState.agents.reduce((sum, agent) => sum + agent.energy, 0) / gameState.agents.length)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-matrix-green mb-1">
                      {gameState.playerStats.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-matrix-dim-green">Total Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-matrix-green mb-1">
                      {gameState.playerStats.level}
                    </div>
                    <div className="text-sm text-matrix-dim-green">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-matrix-green mb-1">
                      {stats.playTime}
                    </div>
                    <div className="text-sm text-matrix-dim-green">Play Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-green">Matrix Rain Effect</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-green">CRT Scanlines</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-green">Text Glow Effect</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-green">Sound Effects</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Terminal Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-matrix-dim-green mb-1">Font Size</label>
                    <select className="bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green">
                      <option>Small (12px)</option>
                      <option selected>Medium (14px)</option>
                      <option>Large (16px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-matrix-dim-green mb-1">Auto-complete</label>
                    <select className="bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green">
                      <option selected>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-matrix-dim-green mb-1">Command History</label>
                    <select className="bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green">
                      <option>50 commands</option>
                      <option selected>100 commands</option>
                      <option>200 commands</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-console-dark border border-border-green rounded-lg p-6">
                <h3 className="text-lg font-bold text-matrix-green mb-4">Data Management</h3>
                <div className="space-y-4">
                  <button className="w-full matrix-button px-4 py-2 rounded text-left">
                    Export All Data
                  </button>
                  <button className="w-full matrix-button px-4 py-2 rounded text-left">
                    Import Data
                  </button>
                  <button className="w-full border border-warning-orange text-warning-orange px-4 py-2 rounded text-left hover:bg-warning-orange hover:bg-opacity-10">
                    Clear Command History
                  </button>
                  <button className="w-full border border-warning-orange text-warning-orange px-4 py-2 rounded text-left hover:bg-warning-orange hover:bg-opacity-10">
                    Reset All Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;