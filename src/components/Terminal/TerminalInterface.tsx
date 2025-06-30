import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, History, Download } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import TerminalOutput from './TerminalOutput';
import TerminalInput from './TerminalInput';
import AgentStatusPanel from './AgentStatusPanel';

const TerminalInterface: React.FC = () => {
  const {
    terminalLines,
    currentInput,
    isExecuting,
    commandHistory,
    executeCommand,
    setCurrentInput,
  } = useGameStore();

  const [showHistory, setShowHistory] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleExecuteCommand = () => {
    if (currentInput.trim() && !isExecuting) {
      executeCommand(currentInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteCommand();
    }
  };

  const handleHistorySelect = (command: string) => {
    setCurrentInput(command);
    setShowHistory(false);
  };

  const exportTerminalLog = () => {
    const log = terminalLines.map(line => 
      `[${line.timestamp.toLocaleTimeString()}] ${line.type.toUpperCase()}: ${line.content}`
    ).join('\n');
    
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-terminal-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex">
      {/* Main Terminal */}
      <div className="flex-1 flex flex-col bg-console-gray">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-green bg-console-dark">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-matrix-green rounded-full"></div>
            <span className="ml-4 text-sm font-mono text-matrix-dim-green">
              nexus@matrix-terminal
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded hover:bg-glow-green transition-colors"
              title="Command History"
            >
              <History className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportTerminalLog}
              className="p-2 rounded hover:bg-glow-green transition-colors"
              title="Export Log"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Command History Dropdown */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 right-4 bg-console-dark border border-border-green rounded-lg shadow-lg z-10 max-w-md"
          >
            <div className="p-3 border-b border-border-green">
              <h3 className="text-sm font-medium">Command History</h3>
            </div>
            <div className="max-h-64 overflow-y-auto matrix-scrollbar">
              {commandHistory.length === 0 ? (
                <div className="p-3 text-sm text-matrix-dim-green">
                  No commands in history
                </div>
              ) : (
                commandHistory.slice(-10).reverse().map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistorySelect(cmd)}
                    className="w-full text-left p-2 hover:bg-glow-green transition-colors text-sm font-mono"
                  >
                    {cmd}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 matrix-scrollbar"
        >
          <TerminalOutput lines={terminalLines} />
        </div>

        {/* Terminal Input */}
        <div className="border-t border-border-green bg-console-dark p-4">
          <div className="flex items-center space-x-2">
            <span className="text-matrix-green font-mono text-sm flex-shrink-0">
              nexus@matrix:~$
            </span>
            
            <div className="flex-1 relative">
              <TerminalInput
                value={currentInput}
                onChange={setCurrentInput}
                onKeyPress={handleKeyPress}
                disabled={isExecuting}
                placeholder="Enter command..."
              />
            </div>
            
            <button
              onClick={handleExecuteCommand}
              disabled={!currentInput.trim() || isExecuting}
              className="matrix-button px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Execute</span>
            </button>
          </div>
          
          {isExecuting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center space-x-2 text-matrix-dim-green text-sm"
            >
              <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
              <span>Processing command...</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Agent Status Panel */}
      <div className="w-80 border-l border-border-green">
        <AgentStatusPanel />
      </div>
    </div>
  );
};

export default TerminalInterface;