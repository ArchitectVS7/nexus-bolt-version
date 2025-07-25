import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { ValidationResult } from '../../types';

interface CommandValidatorProps {
  validation: ValidationResult | null;
  isVisible: boolean;
}

const CommandValidator: React.FC<CommandValidatorProps> = ({ validation, isVisible }) => {
  if (!isVisible || !validation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-console-dark border border-border-green rounded-lg shadow-lg z-20"
      >
        <div className="p-3">
          {validation.isValid ? (
            <div className="flex items-center space-x-2 text-matrix-green">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Command is valid</span>
            </div>
          ) : (
            <div className="space-y-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-warning-orange">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2 text-yellow-500">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandValidator;