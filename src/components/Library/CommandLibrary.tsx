import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Upload, Star, Trash2, Edit, Share, Filter } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const CommandLibrary: React.FC = () => {
  const { commands, customCommands, addNotification } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allCommands = [...commands, ...customCommands];
  
  const filteredCommands = allCommands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCommand = (command: any) => {
    const exportData = {
      ...command,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${command.name.toLowerCase().replace(/\s+/g, '-')}-command.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Command Exported',
      message: `Command "${command.name}" exported successfully.`,
      duration: 3000
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'agent': return 'text-matrix-green border-matrix-green';
      case 'world': return 'text-info border-info';
      case 'system': return 'text-warning-orange border-warning-orange';
      default: return 'text-matrix-dim-green border-border-green';
    }
  };

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Header */}
      <div className="p-6 border-b border-border-green bg-console-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold matrix-glow">Command Library</h1>
            <p className="text-matrix-dim-green">
              Manage and explore your command collection
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="matrix-button px-4 py-2 rounded flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="matrix-button px-4 py-2 rounded flex items-center space-x-2">
              <Share className="w-4 h-4" />
              <span>Share Collection</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-matrix-dim-green" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search commands by name or description..."
              className="w-full pl-10 pr-4 py-3 bg-console-gray border border-border-green rounded-lg text-matrix-green placeholder-matrix-dim-green focus:border-matrix-green focus:outline-none"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-console-gray border border-border-green rounded-lg px-4 py-3 text-matrix-green focus:border-matrix-green focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="agent">Agent Commands</option>
            <option value="world">World Commands</option>
            <option value="system">System Commands</option>
          </select>
          
          <div className="flex border border-border-green rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-glow-green text-matrix-green' : 'text-matrix-dim-green hover:text-matrix-green'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 border-l border-border-green ${viewMode === 'list' ? 'bg-glow-green text-matrix-green' : 'text-matrix-dim-green hover:text-matrix-green'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 mt-4 text-sm">
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

      {/* Command Grid/List */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        {filteredCommands.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Filter className="w-16 h-16 mx-auto mb-4 text-matrix-dim-green opacity-50" />
              <h3 className="text-lg text-matrix-green mb-2">No commands found</h3>
              <p className="text-matrix-dim-green">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first custom command'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommands.map((command) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-console-dark border border-border-green rounded-lg p-6 hover:border-matrix-dark-green transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-matrix-green mb-1">
                          {command.name}
                        </h3>
                        <p className="text-sm font-mono text-matrix-dim-green">
                          {command.syntax}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {command.isCustom && (
                          <button
                            className="p-1 rounded hover:bg-glow-green text-matrix-dim-green hover:text-matrix-green"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleExportCommand(command)}
                          className="p-1 rounded hover:bg-glow-green text-matrix-dim-green hover:text-matrix-green"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {command.isCustom && (
                          <button
                            className="p-1 rounded hover:bg-glow-green text-warning-orange hover:text-warning-orange"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-matrix-green text-sm mb-4 line-clamp-3">
                      {command.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="text-matrix-dim-green">
                          <span className="text-matrix-green">{command.parameters.length}</span> params
                        </span>
                        <span className="text-matrix-dim-green">
                          <span className="text-matrix-green">{command.effects.length}</span> effects
                        </span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded border text-xs ${getCategoryColor(command.category)}`}>
                        {command.category}
                      </span>
                    </div>

                    {command.isCustom && (
                      <div className="mt-3 pt-3 border-t border-border-green">
                        <div className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-info" />
                          <span className="text-xs text-info">Custom Command</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommands.map((command) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-console-dark border border-border-green rounded-lg p-4 hover:border-matrix-dark-green transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-matrix-green">
                            {command.name}
                          </h3>
                          <span className={`px-2 py-1 rounded border text-xs ${getCategoryColor(command.category)}`}>
                            {command.category}
                          </span>
                          {command.isCustom && (
                            <span className="px-2 py-1 bg-glow-green text-xs text-matrix-green border border-matrix-green rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-mono text-matrix-dim-green mb-2">
                          {command.syntax}
                        </p>
                        
                        <p className="text-matrix-green text-sm mb-2">
                          {command.description}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-xs text-matrix-dim-green">
                          <span>{command.parameters.length} parameters</span>
                          <span>{command.effects.length} effects</span>
                          <span>Created {command.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {command.isCustom && (
                          <button
                            className="p-2 rounded hover:bg-glow-green text-matrix-dim-green hover:text-matrix-green"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleExportCommand(command)}
                          className="p-2 rounded hover:bg-glow-green text-matrix-dim-green hover:text-matrix-green"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {command.isCustom && (
                          <button
                            className="p-2 rounded hover:bg-glow-green text-warning-orange hover:text-warning-orange"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandLibrary;