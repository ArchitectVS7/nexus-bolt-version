import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, Shield, Activity, Clock, User, LogOut, Volume2, VolumeX, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseEnabled, checkSupabaseConnection } from '../../lib/supabase';
import { llmParser } from '../../lib/llm';

const MatrixHeader: React.FC = () => {
  const location = useLocation();
  const { gameState, isExecuting, audioEnabled, toggleAudio } = useGameStore();
  const { user, signOut } = useAuth();
  const [dbConnected, setDbConnected] = React.useState<boolean | null>(null);
  
  // Check database connection on mount
  React.useEffect(() => {
    if (isSupabaseEnabled) {
      checkSupabaseConnection().then(setDbConnected);
    } else {
      setDbConnected(false);
    }
  }, []);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/terminal':
        return 'Terminal Interface';
      case '/admin':
        return 'Command Builder';
      case '/world':
        return 'World Visualization';
      case '/library':
        return 'Command Library';
      case '/profile':
        return 'User Profile';
      case '/challenges':
        return 'Challenge System';
      case '/builder':
        return 'World Editor';
      case '/programming':
        return 'Agent Programming';
      default:
        return 'Nexus World Builder';
    }
  };

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/terminal':
        return 'Execute commands and deploy agents';
      case '/admin':
        return 'Create and test custom commands';
      case '/world':
        return 'Monitor agent activities and world state';
      case '/library':
        return 'Browse and manage command repository';
      case '/profile':
        return 'View statistics and achievements';
      case '/challenges':
        return 'Complete missions and earn rewards';
      case '/builder':
        return 'Design and build custom worlds';
      case '/programming':
        return 'Create visual scripts for agents';
      default:
        return 'Matrix-based world building system';
    }
  };

  return (
    <header className="bg-console-dark border-b border-border-green p-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl font-bold matrix-glow">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-matrix-dim-green">
              {getPageDescription()}
            </p>
          </motion.div>
          
          {isExecuting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 px-3 py-1 bg-glow-green rounded-full"
            >
              <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Executing...</span>
            </motion.div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-matrix-green" />
              <span className="text-sm">
                <span className="text-matrix-dim-green">User:</span>
                <span className="text-matrix-green ml-1">{user.user_metadata?.username || user.email}</span>
              </span>
              <button
                onClick={signOut}
                className="p-1 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Database Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Database className={`w-4 h-4 ${dbConnected ? 'text-matrix-green' : 'text-matrix-dim-green'}`} />
              {dbConnected === true && <CheckCircle className="w-3 h-3 text-matrix-green" />}
              {dbConnected === false && <AlertCircle className="w-3 h-3 text-warning-orange" />}
            </div>
            <span className="text-sm">
              <span className="text-matrix-dim-green">Database:</span>
              <span className={`ml-1 ${dbConnected ? 'text-matrix-green matrix-glow' : 'text-matrix-dim-green'}`}>
                {dbConnected === null ? 'CHECKING...' : dbConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </span>
          </div>
          
          {/* LLM Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                llmParser.isLLMEnabled() ? 'border-matrix-green text-matrix-green' : 'border-matrix-dim-green text-matrix-dim-green'
              }`}>
                <span className="text-xs font-bold">AI</span>
              </div>
              {llmParser.isLLMEnabled() && <CheckCircle className="w-3 h-3 text-matrix-green" />}
              {!llmParser.isLLMEnabled() && <AlertCircle className="w-3 h-3 text-warning-orange" />}
            </div>
            <span className="text-sm">
              <span className="text-matrix-dim-green">LLM:</span>
              <span className={`ml-1 ${llmParser.isLLMEnabled() ? 'text-matrix-green matrix-glow' : 'text-matrix-dim-green'}`}>
                {llmParser.isLLMEnabled() ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </span>
          </div>
          
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className="flex items-center space-x-2 p-1 rounded hover:bg-glow-green transition-colors"
            title={audioEnabled ? 'Disable Audio' : 'Enable Audio'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-matrix-green" />
            ) : (
              <VolumeX className="w-4 h-4 text-matrix-dim-green" />
            )}
          </button>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-matrix-green" />
            <span className="text-sm">
              <span className="text-matrix-dim-green">Connection:</span>
              <span className="text-matrix-green ml-1 matrix-glow">ACTIVE</span>
            </span>
          </div>

          {/* Security Status */}
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-matrix-green" />
            <span className="text-sm">
              <span className="text-matrix-dim-green">Security:</span>
              <span className="text-matrix-green ml-1">SECURED</span>
            </span>
          </div>

          {/* System Load */}
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-matrix-green" />
            <span className="text-sm">
              <span className="text-matrix-dim-green">Load:</span>
              <span className="text-matrix-green ml-1">
                {Math.round((gameState.agents.length / 10) * 100)}%
              </span>
            </span>
          </div>

          {/* Current Time */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-matrix-green" />
            <span className="text-sm text-matrix-green font-mono">
              {new Date().toLocaleTimeString([], { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MatrixHeader;