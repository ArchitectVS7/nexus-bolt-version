import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  onKeyPress,
  disabled,
  placeholder
}) => {
  const { commands, customCommands, commandHistory } = useGameStore();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = [...commands, ...customCommands];

  useEffect(() => {
    const trimmedValue = value.trim().toLowerCase();
    
    if (trimmedValue.length > 0) {
      const matches = allCommands
        .filter(cmd => 
          cmd.name.toLowerCase().includes(trimmedValue) ||
          cmd.syntax.toLowerCase().includes(trimmedValue)
        )
        .map(cmd => cmd.syntax)
        .slice(0, 5);
      
      setAutocompleteOptions(matches);
      setShowAutocomplete(matches.length > 0);
      setSelectedOption(0);
    } else {
      setShowAutocomplete(false);
      setAutocompleteOptions([]);
    }
  }, [value, allCommands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedOption(prev => 
          prev < autocompleteOptions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedOption(prev => 
          prev > 0 ? prev - 1 : autocompleteOptions.length - 1
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (autocompleteOptions[selectedOption]) {
          onChange(autocompleteOptions[selectedOption]);
          setShowAutocomplete(false);
        }
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }

    // Command history navigation
    if (e.key === 'ArrowUp' && !showAutocomplete) {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        onChange(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && !showAutocomplete) {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex < commandHistory.length - 1 
          ? historyIndex + 1 
          : -1;
        setHistoryIndex(newIndex);
        onChange(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    }

    onKeyPress(e);
  };

  const handleAutocompleteSelect = (option: string) => {
    onChange(option);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHistoryIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-matrix-green font-mono placeholder-matrix-dim-green focus:ring-0"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showAutocomplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-console-dark border border-border-green rounded-lg shadow-lg z-20"
          >
            <div className="p-2 border-b border-border-green text-xs text-matrix-dim-green">
              Command Suggestions
            </div>
            
            <div className="max-h-40 overflow-y-auto matrix-scrollbar">
              {autocompleteOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAutocompleteSelect(option)}
                  className={`w-full text-left p-2 text-sm font-mono transition-colors ${
                    index === selectedOption
                      ? 'bg-glow-green text-matrix-green'
                      : 'hover:bg-glow-green text-matrix-dim-green hover:text-matrix-green'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-border-green text-xs text-matrix-dim-green">
              Press Tab to autocomplete, Esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TerminalInput;