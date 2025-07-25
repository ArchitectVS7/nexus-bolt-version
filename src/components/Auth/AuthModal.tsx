import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 matrix-backdrop"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-console-dark border border-border-green rounded-lg p-6 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold matrix-glow">
                {mode === 'signin' ? 'Access Terminal' : 'Create Account'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-glow-green transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-matrix-green mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-matrix-green mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-matrix-green mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-console-gray border border-border-green rounded px-3 py-2 text-matrix-green focus:border-matrix-green focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="p-3 bg-warning-orange bg-opacity-10 border border-warning-orange rounded text-warning-orange text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full matrix-button px-4 py-3 rounded flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-matrix-green border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <button
                onClick={switchMode}
                className="text-matrix-dim-green hover:text-matrix-green transition-colors text-sm"
              >
                {mode === 'signin' 
                  ? "Don't have an account? Create one" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>

            {/* Offline Notice */}
            <div className="mt-4 p-3 bg-console-gray border border-border-green rounded text-xs text-matrix-dim-green">
              <strong>Note:</strong> Authentication requires Supabase configuration. 
              Without it, the game runs in offline mode with localStorage.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;