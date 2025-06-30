import React from 'react';
import { motion } from 'framer-motion';
import { TerminalLine } from '../../types';

interface TerminalOutputProps {
  lines: TerminalLine[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines }) => {
  const getLineClass = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-matrix-green';
      case 'output':
        return 'text-matrix-green';
      case 'error':
        return 'text-warning-orange';
      case 'system':
        return 'text-info matrix-glow-dim';
      default:
        return 'text-matrix-dim-green';
    }
  };

  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'input':
        return '';
      case 'output':
        return '→ ';
      case 'error':
        return '✗ ';
      case 'system':
        return '◦ ';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-1 font-mono text-sm">
      {lines.map((line, index) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            ease: 'easeOut'
          }}
          className={`${getLineClass(line.type)} leading-relaxed`}
        >
          <div className="flex items-start space-x-2">
            <span className="text-matrix-dim-green text-xs flex-shrink-0 w-20">
              {line.timestamp.toLocaleTimeString([], { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
            
            <div className="flex-1">
              <span className="opacity-70">
                {getLinePrefix(line.type)}
              </span>
              <span className={line.type === 'input' ? 'command-highlight' : ''}>
                {line.content}
              </span>
            </div>
          </div>
          
          {line.agentId && (
            <div className="ml-22 text-xs text-matrix-dim-green opacity-70">
              Agent: {line.agentId}
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Cursor */}
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-matrix-green ml-22"
      />
    </div>
  );
};

export default TerminalOutput;