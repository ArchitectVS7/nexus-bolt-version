import { useState, useCallback } from 'react';
import { ValidationResult, Command } from '../types';
import { useGameStore } from '../store/gameStore';

export function useCommandValidation() {
  const { commands, customCommands, gameState } = useGameStore();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const allCommands = [...commands, ...customCommands];

  const validateCommand = useCallback((input: string): ValidationResult => {
    const trimmed = input.trim();
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!trimmed) {
      errors.push('Command cannot be empty');
      return { isValid: false, errors, warnings };
    }

    // Check if command exists
    const commandName = trimmed.split(/[\[\s]/)[0].toLowerCase();
    const matchingCommand = allCommands.find(cmd => 
      cmd.name.toLowerCase() === commandName ||
      cmd.syntax.toLowerCase().startsWith(commandName)
    );

    if (!matchingCommand) {
      errors.push(`Unknown command: ${commandName}`);
      return { isValid: false, errors, warnings };
    }

    // Validate DeployAgent command
    if (commandName === 'deployagent') {
      const match = trimmed.match(/deployagent\[(\d+)\]\s*(\w+)?\s*(\w+)?/i);
      if (!match) {
        errors.push('Invalid DeployAgent syntax. Use: DeployAgent[count] location behavior');
      } else {
        const count = parseInt(match[1]);
        const location = match[2];
        const behavior = match[3];

        if (count <= 0) {
          errors.push('Agent count must be greater than 0');
        }

        if (count > 10) {
          warnings.push('Deploying more than 10 agents may impact performance');
        }

        if (gameState.agents.length + count > 50) {
          warnings.push('Approaching maximum agent limit (50)');
        }

        const validBehaviors = ['patrol', 'scout', 'guard', 'gather', 'guardarea'];
        if (behavior && !validBehaviors.includes(behavior.toLowerCase())) {
          errors.push(`Invalid behavior: ${behavior}. Valid behaviors: ${validBehaviors.join(', ')}`);
        }

        const validLocations = ['center', 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
        if (location && !validLocations.includes(location.toLowerCase()) && !/^\d+\s+\d+$/.test(location)) {
          errors.push(`Invalid location: ${location}. Use named locations or coordinates (x y)`);
        }
      }
    }

    // Validate ScanArea command
    if (commandName === 'scanarea') {
      const match = trimmed.match(/scanarea\s+(\d+)\s+(\d+)\s*(\d+)?/i);
      if (!match) {
        errors.push('Invalid ScanArea syntax. Use: ScanArea x y radius');
      } else {
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        const radius = parseInt(match[3]) || 5;

        if (x < 0 || x >= gameState.worldSize.width) {
          errors.push(`X coordinate ${x} is out of bounds (0-${gameState.worldSize.width - 1})`);
        }

        if (y < 0 || y >= gameState.worldSize.height) {
          errors.push(`Y coordinate ${y} is out of bounds (0-${gameState.worldSize.height - 1})`);
        }

        if (radius > 20) {
          warnings.push('Large scan radius may be slow');
        }
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationResult(result);
    return result;
  }, [allCommands, gameState]);

  return {
    validateCommand,
    validationResult
  };
}