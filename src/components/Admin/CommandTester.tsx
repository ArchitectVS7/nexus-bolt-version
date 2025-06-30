import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Command } from '../../types';

interface CommandTesterProps {
  command: Partial<Command> | null;
}

interface TestResult {
  id: string;
  input: string;
  output: string;
  success: boolean;
  timestamp: Date;
  executionTime: number;
}

const CommandTester: React.FC<CommandTesterProps> = ({ command }) => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    if (!command || !testInput.trim()) return;

    setIsRunning(true);
    const startTime = Date.now();

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const success = Math.random() > 0.3; // 70% success rate for demo
    const executionTime = Date.now() - startTime;

    const result: TestResult = {
      id: Date.now().toString(),
      input: testInput,
      output: success 
        ? `Command executed successfully. ${command.effects?.length || 0} effects applied.`
        : `Error: Invalid parameter format or missing required field.`,
      success,
      timestamp: new Date(),
      executionTime
    };

    setTestResults(prev => [result, ...prev]);
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-matrix-green" />
    ) : (
      <XCircle className="w-4 h-4 text-warning-orange" />
    );
  };

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Test Input */}
      <div className="p-6 border-b border-border-green bg-console-dark">
        <h2 className="text-lg font-bold text-matrix-green mb-4">Command Tester</h2>
        
        {!command ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-matrix-dim-green opacity-50" />
            <p className="text-matrix-dim-green">No command selected for testing</p>
            <p className="text-sm text-matrix-dim-green mt-1">
              Create a command in the Builder tab first
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-matrix-green mb-2">
                Test Command: <span className="font-mono">{command.syntax}</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={`Enter test command (e.g., ${command.syntax})`}
                  className="flex-1 bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green font-mono focus:border-matrix-green focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && runTest()}
                />
                <button
                  onClick={runTest}
                  disabled={isRunning || !testInput.trim()}
                  className="matrix-button px-4 py-2 rounded flex items-center space-x-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Test</span>
                </button>
              </div>
            </div>

            {/* Command Info */}
            <div className="bg-console-gray border border-border-green rounded-lg p-4">
              <h3 className="text-sm font-bold text-matrix-green mb-2">Command Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-matrix-dim-green">Parameters:</span>
                  <span className="text-matrix-green">{command.parameters?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-matrix-dim-green">Effects:</span>
                  <span className="text-matrix-green">{command.effects?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-matrix-dim-green">Category:</span>
                  <span className="text-matrix-green">{command.category}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border-green">
          <h3 className="text-lg font-bold text-matrix-green">
            Test Results ({testResults.length})
          </h3>
          {testResults.length > 0 && (
            <button
              onClick={clearResults}
              className="px-3 py-1 border border-border-green text-matrix-dim-green rounded hover:text-matrix-green hover:border-matrix-green transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto matrix-scrollbar">
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-b border-border-green"
            >
              <div className="flex items-center space-x-2 text-matrix-green">
                <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
                <span className="text-sm">Running test...</span>
              </div>
            </motion.div>
          )}

          {testResults.length === 0 && !isRunning ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Play className="w-12 h-12 mx-auto mb-4 text-matrix-dim-green opacity-50" />
                <p className="text-matrix-dim-green">No test results yet</p>
                <p className="text-sm text-matrix-dim-green mt-1">
                  Run a test to see results here
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {testResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? 'border-matrix-green bg-glow-green' 
                      : 'border-warning-orange bg-opacity-5 bg-warning-orange'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getResultIcon(result.success)}
                      <span className="text-sm font-medium text-matrix-green">
                        Test {result.success ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-xs text-matrix-dim-green">
                      {result.executionTime}ms • {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-matrix-dim-green">Input:</span>
                      <div className="bg-console-dark rounded px-2 py-1 mt-1 font-mono text-sm text-matrix-green">
                        {result.input}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-matrix-dim-green">Output:</span>
                      <div className={`rounded px-2 py-1 mt-1 text-sm ${
                        result.success ? 'bg-console-dark text-matrix-green' : 'bg-console-dark text-warning-orange'
                      }`}>
                        {result.output}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandTester;