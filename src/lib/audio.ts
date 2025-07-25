class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_AUDIO !== 'false';
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    if (!this.isEnabled) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.isEnabled = false;
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    // Generate synthetic Matrix-style sounds
    const sounds = {
      keypress: this.generateKeypressSound(),
      command: this.generateCommandSound(),
      error: this.generateErrorSound(),
      success: this.generateSuccessSound(),
      ambient: this.generateAmbientSound()
    };

    for (const [name, buffer] of Object.entries(sounds)) {
      this.sounds.set(name, buffer);
    }
  }

  private generateKeypressSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 800 + Math.random() * 400;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 20) * 0.1;
    }

    return buffer;
  }

  private generateCommandSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 400 + Math.sin(t * 10) * 200;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.15;
    }

    return buffer;
  }

  private generateErrorSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + Math.sin(t * 20) * 100;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.2;
    }

    return buffer;
  }

  private generateSuccessSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 600 + Math.sin(t * 5) * 300;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2.5) * 0.12;
    }

    return buffer;
  }

  private generateAmbientSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 2.0;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() - 0.5) * 0.02;
      const hum = Math.sin(2 * Math.PI * 60 * t) * 0.01;
      data[i] = noise + hum;
    }

    return buffer;
  }

  playSound(soundName: string, volume: number = 1.0) {
    if (!this.isEnabled || !this.audioContext || !this.sounds.has(soundName)) return;

    const buffer = this.sounds.get(soundName)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.audioContext) {
      this.audioContext.suspend();
    } else if (enabled && this.audioContext) {
      this.audioContext.resume();
    }
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

export const audioManager = new AudioManager();