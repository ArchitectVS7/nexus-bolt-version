import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Code, Settings } from 'lucide-react';
import CommandBuilder from './CommandBuilder';
import CommandTester from './CommandTester';
import SavedCommands from './SavedCommands';
import { Command } from '../../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'tester' | 'library'>('builder');
  const [currentCommand, setCurrentCommand] = useState<Partial<Command> | null>(null);

  const tabs = [
    { id: 'builder', label: 'Command Builder', icon: Code },
    { id: 'tester', label: 'Test Environment', icon: Play },
    { id: 'library', label: 'Saved Commands', icon: Settings },
  ];

  return (
    <div className="h-full bg-console-gray">
      {/* Header */}
      <div className="bg-console-dark border-b border-border-green p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold matrix-glow">Command Builder</h1>
            <p className="text-sm text-matrix-dim-green">
              Create and test custom commands for agent deployment
            </p>
          </div>
          
          <button className="matrix-button px-4 py-2 rounded flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Command</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
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
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === 'builder' && (
            <CommandBuilder 
              command={currentCommand}
              onCommandChange={setCurrentCommand}
            />
          )}
          
          {activeTab === 'tester' && (
            <CommandTester 
              command={currentCommand}
            />
          )}
          
          {activeTab === 'library' && (
            <SavedCommands 
              onCommandSelect={setCurrentCommand}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;