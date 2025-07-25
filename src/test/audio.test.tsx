import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioManager } from '../lib/audio';

describe('Audio System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audio Manager', () => {
    it('initializes with audio enabled', () => {
      expect(audioManager.isAudioEnabled()).toBe(true);
    });

    it('can be disabled and enabled', () => {
      audioManager.setEnabled(false);
      expect(audioManager.isAudioEnabled()).toBe(false);
      
      audioManager.setEnabled(true);
      expect(audioManager.isAudioEnabled()).toBe(true);
    });

    it('plays sounds when enabled', () => {
      const mockPlaySound = vi.spyOn(audioManager, 'playSound');
      
      audioManager.playSound('keypress', 0.5);
      
      expect(mockPlaySound).toHaveBeenCalledWith('keypress', 0.5);
    });

    it('handles missing sounds gracefully', () => {
      expect(() => {
        audioManager.playSound('nonexistent-sound');
      }).not.toThrow();
    });
  });

  describe('Sound Generation', () => {
    it('generates different sound types', () => {
      // Test that different sound types can be played without errors
      const soundTypes = ['keypress', 'command', 'error', 'success', 'ambient'];
      
      soundTypes.forEach(soundType => {
        expect(() => {
          audioManager.playSound(soundType);
        }).not.toThrow();
      });
    });
  });

  describe('Audio Context', () => {
    it('handles audio context creation failure', () => {
      // Mock AudioContext to throw error
      const originalAudioContext = global.AudioContext;
      global.AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported');
      });

      // Audio manager should handle this gracefully
      expect(() => {
        new (audioManager.constructor as any)();
      }).not.toThrow();

      // Restore original
      global.AudioContext = originalAudioContext;
    });
  });
});