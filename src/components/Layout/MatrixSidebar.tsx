import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Settings, 
  Globe, 
  Library, 
  User, 
  ChevronLeft,
  Activity,
  Zap,
  Trophy,
  Edit,
  Code
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const MatrixSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, gameState } = useGameStore();

  const navItems = [
    { path: '/terminal', icon: Terminal, label: 'Terminal', description: 'Command Interface' },
    { path: '/admin', icon: Settings, label: 'Admin', description: 'Command Builder' },
    { path: '/world', icon: Globe, label: 'World', description: 'Game Visualization' },
    { path: '/library', icon: Library, label: 'Library', description: 'Command Repository' },
    { path: '/challenges', icon: Trophy, label: 'Challenges', description: 'Mission System' },
    { path: '/builder', icon: Edit, label: 'Builder', description: 'World Editor' },
    { path: '/programming', icon: Code, label: 'Programming', description: 'Agent Scripts' },
    { path: '/profile', icon: User, label: 'Profile', description: 'User Statistics' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-console-dark border-r border-border-green z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-green">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2"
            >
              <Zap className="w-6 h-6 text-matrix-green" />
              <span className="font-bold text-lg matrix-glow">NEXUS</span>
            </motion.div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-glow-green transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
        
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-xs text-matrix-dim-green"
          >
            World Builder v2.1.0
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-glow-green border border-matrix-green matrix-glow'
                  : 'hover:bg-glow-green hover:border hover:border-matrix-dark-green'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="ml-3 flex-1"
              >
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-matrix-dim-green">
                  {item.description}
                </div>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status Panel */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="bg-console-gray rounded-lg p-3 border border-border-green">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-matrix-green" />
              <span className="text-sm font-medium">System Status</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-matrix-dim-green">Agents:</span>
                <span className="text-matrix-green">{gameState.agents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-dim-green">Score:</span>
                <span className="text-matrix-green">{gameState.playerStats.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-dim-green">Level:</span>
                <span className="text-matrix-green">{gameState.playerStats.level}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MatrixSidebar;