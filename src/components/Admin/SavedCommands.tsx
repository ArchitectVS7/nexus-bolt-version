import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Edit, Trash2, Copy, Play, Star, Clock } from 'lucide-react';
import { Command } from '../../types';
import { useGameStore } from '../../store/gameStore';

interface SavedCommandsProps {
  onCommandSelect: (command: Partial<Command>) => void;
}

const SavedCommands: React.FC<SavedCommandsProps> = ({ onCommandSelect }) => {
  const { customCommands, commands, addNotification } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'category'>('created');

  const allCommands = [...commands, ...customCommands];

  const filteredCommands = allCommands
    .filter(cmd => {
      const matchesSearch = cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const handleEdit = (command: Command) => {
    onCommandSelect(command);
    addNotification({
      type: 'info',
      title: 'Command Loaded',
      message: `Command "${command.name}" loaded for editing.`,
      duration: 2000
    });
  };

  const handleCopy = (command: Command) => {
    const commandData = {
      ...command,
      name: `${command.name}_copy`,
      id: undefined,
      createdAt: undefined
    };
    onCommandSelect(commandData);
    addNotification({
      type: 'success',
      title: 'Command Copied',
      message: `Command "${command.name}" copied for editing.`,
      duration: 2000
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agent':
        return '🤖';
      case 'world':
        return '🌍';
      case 'system':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const categories = ['all', 'agent', 'world', 'system'];

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Header & Controls */}
      <div className="p-6 border-b border-border-green bg-console-dark">
        <h2 className="text-lg font-bold text-matrix-green mb-4">Command Library</h2>
        
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-matrix-dim-green" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search commands..."
                className="w-full pl-10 pr-4 py-2 bg-console-gray border border-border-green rounded text-matrix-green focus:border-matrix-green focus:outline-none"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
            >
              <option value="created">Sort by Created</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-matrix-green rounded-full"></div>
              <span className="text-matrix-dim-green">
                Total: <span className="text-matrix-green">{allCommands.length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-info rounded-full"></div>
              <span className="text-matrix-dim-green">
                Custom: <span className="text-matrix-green">{customCommands.length}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning-orange rounded-full"></div>
              <span className="text-matrix-dim-green">
                Filtered: <span className="text-matrix-green">{filteredCommands.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Command List */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        {filteredCommands.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Filter className="w-12 h-12 mx-auto mb-4 text-matrix-dim-green opacity-50" />
              <p className="text-matrix-dim-green">No commands found</p>
              <p className="text-sm text-matrix-dim-green mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first custom command'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredCommands.map((command) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-console-dark border border-border-green rounded-lg p-4 hover:border-matrix-dark-green transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getCategoryIcon(command.category)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-matrix-green">{command.name}</h3>
                      <p className="text-sm text-matrix-dim-green font-mono">{command.syntax}</p>
                    </div>
                    {command.isCustom && (
                      <span className="px-2 py-1 bg-glow-green text-xs text-matrix-green border border-matrix-green rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(command)}
                      className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
                      title="Edit Command"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleCopy(command)}
                      className="p-2 rounded hover:bg-glow-green transition-colors text-matrix-dim-green hover:text-matrix-green"
                      title="Copy Command"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {command.isCustom && (
                      <button
                        className="p-2 rounded hover:bg-glow-green transition-colors text-warning-orange hover:text-warning-orange"
                        title="Delete Command"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-matrix-green mb-3">{command.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-matrix-dim-green">
                      <span className="text-matrix-green">{command.parameters.length}</span> parameters
                    </span>
                    <span className="text-matrix-dim-green">
                      <span className="text-matrix-green">{command.effects.length}</span> effects
                    </span>
                    <span className="flex items-center space-x-1 text-matrix-dim-green">
                      <Clock className="w-3 h-3" />
                      <span>{command.createdAt.toLocaleDateString()}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-glow-green text-matrix-green rounded text-xs">
                      {command.category}
                    </span>
                  </div>
                </div>

                {/* Parameters Preview */}
                {command.parameters.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-green">
                    <div className="text-xs text-matrix-dim-green mb-1">Parameters:</div>
                    <div className="flex flex-wrap gap-2">
                      {command.parameters.map((param, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            param.required 
                              ? 'bg-warning-orange bg-opacity-20 text-warning-orange border border-warning-orange'
                              : 'bg-glow-green text-matrix-green border border-matrix-green'
                          }`}
                        >
                          {param.name}: {param.type}
                          {param.required && ' *'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCommands;