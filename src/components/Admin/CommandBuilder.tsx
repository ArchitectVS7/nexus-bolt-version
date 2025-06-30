import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code2, Play, Save, Copy, Settings, Zap, Target, Layers } from 'lucide-react';
import { Command, Parameter, Effect } from '../../types';
import { useGameStore } from '../../store/gameStore';

interface CommandBuilderProps {
  command: Partial<Command> | null;
  onCommandChange: (command: Partial<Command> | null) => void;
}

const CommandBuilder: React.FC<CommandBuilderProps> = ({ command, onCommandChange }) => {
  const { addCustomCommand, addNotification } = useGameStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'parameters' | 'effects'>('basic');
  const [isValid, setIsValid] = useState(false);

  const [formData, setFormData] = useState<Partial<Command>>({
    name: '',
    syntax: '',
    description: '',
    parameters: [],
    effects: [],
    category: 'agent',
    ...command
  });

  useEffect(() => {
    if (command) {
      setFormData({ ...command });
    }
  }, [command]);

  useEffect(() => {
    const valid = formData.name && formData.syntax && formData.description && 
                  formData.parameters && formData.effects;
    setIsValid(!!valid);
  }, [formData]);

  const handleBasicChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    if (field === 'name') {
      // Auto-generate syntax based on name
      updated.syntax = `${value}${updated.parameters?.length ? '[params]' : ''}`;
    }
    setFormData(updated);
    onCommandChange(updated);
  };

  const addParameter = () => {
    const newParam: Parameter = {
      name: 'param',
      type: 'string',
      required: true,
      description: 'Parameter description'
    };
    const updated = {
      ...formData,
      parameters: [...(formData.parameters || []), newParam]
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const updated = {
      ...formData,
      parameters: formData.parameters?.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      ) || []
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const removeParameter = (index: number) => {
    const updated = {
      ...formData,
      parameters: formData.parameters?.filter((_, i) => i !== index) || []
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const addEffect = () => {
    const newEffect: Effect = {
      type: 'create_agent',
      target: 'world',
      action: 'spawn',
      parameters: {}
    };
    const updated = {
      ...formData,
      effects: [...(formData.effects || []), newEffect]
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const updateEffect = (index: number, field: string, value: any) => {
    const updated = {
      ...formData,
      effects: formData.effects?.map((effect, i) => 
        i === index ? { ...effect, [field]: value } : effect
      ) || []
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const removeEffect = (index: number) => {
    const updated = {
      ...formData,
      effects: formData.effects?.filter((_, i) => i !== index) || []
    };
    setFormData(updated);
    onCommandChange(updated);
  };

  const saveCommand = () => {
    if (isValid && formData.name && formData.syntax && formData.description) {
      addCustomCommand({
        name: formData.name,
        syntax: formData.syntax,
        description: formData.description,
        parameters: formData.parameters || [],
        effects: formData.effects || [],
        category: formData.category || 'agent'
      });
      
      addNotification({
        type: 'success',
        title: 'Command Saved',
        message: `Custom command "${formData.name}" has been saved successfully.`,
        duration: 3000
      });

      // Reset form
      const newCommand = {
        name: '',
        syntax: '',
        description: '',
        parameters: [],
        effects: [],
        category: 'agent' as const
      };
      setFormData(newCommand);
      onCommandChange(newCommand);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Code2 },
    { id: 'parameters', label: 'Parameters', icon: Settings },
    { id: 'effects', label: 'Effects', icon: Zap }
  ];

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Tab Navigation */}
      <div className="flex space-x-1 p-4 border-b border-border-green bg-console-dark">
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-matrix-green mb-2">
                      Command Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleBasicChange('name', e.target.value)}
                      placeholder="e.g., DeploySquad"
                      className="w-full bg-console-dark border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-matrix-green mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category || 'agent'}
                      onChange={(e) => handleBasicChange('category', e.target.value)}
                      className="w-full bg-console-dark border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
                    >
                      <option value="agent">Agent</option>
                      <option value="world">World</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-matrix-green mb-2">
                    Command Syntax
                  </label>
                  <input
                    type="text"
                    value={formData.syntax || ''}
                    onChange={(e) => handleBasicChange('syntax', e.target.value)}
                    placeholder="e.g., DeploySquad[count] location formation"
                    className="w-full bg-console-dark border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none font-mono"
                  />
                  <p className="text-xs text-matrix-dim-green mt-1">
                    Use [brackets] for required parameters, optional parameters without brackets
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-matrix-green mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleBasicChange('description', e.target.value)}
                    placeholder="Describe what this command does..."
                    rows={4}
                    className="w-full bg-console-dark border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none resize-none"
                  />
                </div>

                {/* Preview */}
                <div className="bg-console-dark border border-border-green rounded-lg p-4">
                  <h3 className="text-sm font-bold text-matrix-green mb-2">Command Preview</h3>
                  <div className="font-mono text-sm">
                    <div className="text-matrix-green">
                      {'>'} {formData.syntax || 'CommandName[params]'}
                    </div>
                    <div className="text-matrix-dim-green mt-1">
                      {formData.description || 'Command description will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parameters Tab */}
            {activeTab === 'parameters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-matrix-green">Command Parameters</h3>
                  <button
                    onClick={addParameter}
                    className="matrix-button px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                {formData.parameters && formData.parameters.length === 0 ? (
                  <div className="text-center py-8 text-matrix-dim-green">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No parameters defined</p>
                    <p className="text-sm">Add parameters to make your command configurable</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.parameters?.map((param, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-console-dark border border-border-green rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-matrix-green">
                            Parameter {index + 1}
                          </h4>
                          <button
                            onClick={() => removeParameter(index)}
                            className="text-warning-orange hover:bg-glow-green p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Name</label>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => updateParameter(index, 'name', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Type</label>
                            <select
                              value={param.type}
                              onChange={(e) => updateParameter(index, 'type', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="array">Array</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Required</label>
                            <input
                              type="checkbox"
                              checked={param.required}
                              onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                              className="w-4 h-4 text-matrix-green"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Default Value</label>
                            <input
                              type="text"
                              value={param.defaultValue || ''}
                              onChange={(e) => updateParameter(index, 'defaultValue', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs text-matrix-dim-green mb-1">Description</label>
                          <input
                            type="text"
                            value={param.description}
                            onChange={(e) => updateParameter(index, 'description', e.target.value)}
                            placeholder="Describe this parameter..."
                            className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-matrix-green">Command Effects</h3>
                  <button
                    onClick={addEffect}
                    className="matrix-button px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Effect</span>
                  </button>
                </div>

                {formData.effects && formData.effects.length === 0 ? (
                  <div className="text-center py-8 text-matrix-dim-green">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No effects defined</p>
                    <p className="text-sm">Add effects to define what your command does</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.effects?.map((effect, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-console-dark border border-border-green rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-matrix-green">
                            Effect {index + 1}
                          </h4>
                          <button
                            onClick={() => removeEffect(index)}
                            className="text-warning-orange hover:bg-glow-green p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Type</label>
                            <select
                              value={effect.type}
                              onChange={(e) => updateEffect(index, 'type', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            >
                              <option value="create_agent">Create Agent</option>
                              <option value="move_agent">Move Agent</option>
                              <option value="modify_world">Modify World</option>
                              <option value="system_action">System Action</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Target</label>
                            <input
                              type="text"
                              value={effect.target}
                              onChange={(e) => updateEffect(index, 'target', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-matrix-dim-green mb-1">Action</label>
                            <input
                              type="text"
                              value={effect.action}
                              onChange={(e) => updateEffect(index, 'action', e.target.value)}
                              className="w-full bg-console-gray border border-border-green rounded px-2 py-1 text-sm text-matrix-green"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border-green bg-console-dark p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-matrix-green' : 'bg-warning-orange'}`}></div>
            <span className="text-sm text-matrix-dim-green">
              {isValid ? 'Command ready to save' : 'Complete all fields to save'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newCommand = {
                  name: '',
                  syntax: '',
                  description: '',
                  parameters: [],
                  effects: [],
                  category: 'agent' as const
                };
                setFormData(newCommand);
                onCommandChange(newCommand);
              }}
              className="px-4 py-2 border border-border-green text-matrix-dim-green rounded hover:text-matrix-green hover:border-matrix-green transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={saveCommand}
              disabled={!isValid}
              className="matrix-button px-6 py-2 rounded flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Save Command</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandBuilder;