import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/Auth/AuthModal';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null })
    })
  },
  isSupabaseEnabled: true
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthModal', () => {
    it('renders sign in form by default', () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Access Terminal')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('switches to sign up mode', () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByText("Don't have an account? Create one"));
      
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />);
      
      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);
      
      // Form should not submit without required fields
      expect(screen.getByPlaceholderText('Enter your email')).toBeInvalid();
    });
  });

  describe('useAuth hook', () => {
    it('initializes with loading state', () => {
      const TestComponent = () => {
        const { loading, user } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="user">{user ? 'logged-in' : 'logged-out'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
    });
  });
});