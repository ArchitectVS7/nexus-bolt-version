import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { llmParser } from '../../lib/llm';
import { CommandSuggestion } from '../../types';

interface LLMCommandSuggestionsProps {
  input: string;
  onSuggestionSelect: (command: string) => void;
  isVisible: boolean;
}

const LLMCommandSuggestions: React.FC<LLMCommandSuggestionsProps> = ({
  input,
  onSuggestionSelect,
  isVisible
}) => {
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !input.trim() || input.length < 5) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      setLoading(true);
      try {
        const result = await llmParser.parseCommand(input);
        if (result) {
          setSuggestions([{
            command: result.command,
            description: result.explanation,
            confidence: result.confidence
          }]);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('LLM suggestion error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [input, isVisible]);

  if (!isVisible || (!loading && suggestions.length === 0)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-console-dark border border-info rounded-lg shadow-lg z-20"
      >
        <div className="p-3 border-b border-border-green">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-info" />
            <span className="text-sm text-info font-medium">
              {llmParser.isLLMEnabled() ? 'AI Command Suggestions' : 'Smart Suggestions'}
            </span>
          </div>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex items-center space-x-2 p-2 text-matrix-dim-green">
              <div className="w-4 h-4 border-2 border-info border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Analyzing command...</span>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSuggestionSelect(suggestion.command)}
                className="w-full text-left p-2 rounded hover:bg-glow-green transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-matrix-green">
                    {suggestion.command}
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        suggestion.confidence > 0.8 ? 'bg-matrix-green' :
                        suggestion.confidence > 0.6 ? 'bg-yellow-500' :
                        'bg-warning-orange'
                      }`} />
                      <span className="text-xs text-matrix-dim-green">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-matrix-dim-green" />
                  </div>
                </div>
                <p className="text-xs text-matrix-dim-green">
                  {suggestion.description}
                </p>
              </motion.button>
            ))
          )}
        </div>

        {!llmParser.isLLMEnabled() && (
          <div className="p-2 border-t border-border-green text-xs text-matrix-dim-green">
            <Zap className="w-3 h-3 inline mr-1" />
            Configure OpenAI API key for enhanced AI suggestions
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LLMCommandSuggestions;