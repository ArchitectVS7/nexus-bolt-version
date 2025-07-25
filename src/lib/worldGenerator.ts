import { WorldObject, WorldTemplate, WorldEvent } from '../types';

export interface GenerationConfig {
  seed: string;
  width: number;
  height: number;
  density: {
    obstacles: number;
    datanodes: number;
    terminals: number;
    portals: number;
  };
  biome: 'matrix' | 'corrupted' | 'pristine' | 'chaotic';
  difficulty: number;
}

export interface WorldEvent {
  id: string;
  type: 'emp_burst' | 'rogue_agent' | 'corrupt_zone' | 'data_surge' | 'system_glitch';
  position?: { x: number; y: number };
  radius?: number;
  duration: number;
  effects: Record<string, any>;
  message: string;
  timestamp: Date;
}

class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export class WorldGenerator {
  private rng: SeededRandom;
  private config: GenerationConfig;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.rng = new SeededRandom(config.seed);
  }

  generateWorld(): WorldTemplate {
    const objects: WorldObject[] = [];
    const spawnPoints: { x: number; y: number }[] = [];

    // Generate terrain features
    this.generateTerrain(objects);
    
    // Place interactive objects
    this.placeDataNodes(objects);
    this.placeTerminals(objects);
    this.placeObstacles(objects);
    this.placePortals(objects);
    
    // Generate spawn points
    this.generateSpawnPoints(spawnPoints, objects);

    return {
      id: `generated_${Date.now()}`,
      name: `${this.config.biome}_world_${this.config.seed}`,
      description: `Procedurally generated ${this.config.biome} world`,
      size: { width: this.config.width, height: this.config.height },
      objects,
      spawnPoints,
      difficulty: this.config.difficulty,
      createdBy: 'system',
      isPublic: false,
      createdAt: new Date()
    };
  }

  private generateTerrain(objects: WorldObject[]): void {
    const { width, height } = this.config;
    
    // Create terrain clusters based on biome
    switch (this.config.biome) {
      case 'matrix':
        this.generateMatrixTerrain(objects);
        break;
      case 'corrupted':
        this.generateCorruptedTerrain(objects);
        break;
      case 'pristine':
        this.generatePristineTerrain(objects);
        break;
      case 'chaotic':
        this.generateChaoticTerrain(objects);
        break;
    }
  }

  private generateMatrixTerrain(objects: WorldObject[]): void {
    // Create structured grid patterns
    const { width, height } = this.config;
    
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        if (this.rng.next() < 0.3) {
          // Create small clusters
          this.createCluster(objects, x, y, 'wall', 2, 3);
        }
      }
    }
  }

  private generateCorruptedTerrain(objects: WorldObject[]): void {
    // Create chaotic, organic-looking patterns
    const { width, height } = this.config;
    const corruptionCenters = this.rng.nextInt(3, 6);
    
    for (let i = 0; i < corruptionCenters; i++) {
      const centerX = this.rng.nextInt(5, width - 5);
      const centerY = this.rng.nextInt(5, height - 5);
      const radius = this.rng.nextInt(3, 8);
      
      this.createCorruptionZone(objects, centerX, centerY, radius);
    }
  }

  private generatePristineTerrain(objects: WorldObject[]): void {
    // Minimal, clean layouts
    const { width, height } = this.config;
    
    // Create border walls
    for (let x = 0; x < width; x++) {
      if (this.rng.next() < 0.1) {
        objects.push(this.createObject('wall', x, 0));
        objects.push(this.createObject('wall', x, height - 1));
      }
    }
    
    for (let y = 0; y < height; y++) {
      if (this.rng.next() < 0.1) {
        objects.push(this.createObject('wall', 0, y));
        objects.push(this.createObject('wall', width - 1, y));
      }
    }
  }

  private generateChaoticTerrain(objects: WorldObject[]): void {
    // Random, unpredictable patterns
    const { width, height } = this.config;
    
    for (let i = 0; i < width * height * 0.05; i++) {
      const x = this.rng.nextInt(0, width - 1);
      const y = this.rng.nextInt(0, height - 1);
      
      if (this.rng.next() < 0.7) {
        objects.push(this.createObject('wall', x, y));
      }
    }
  }

  private createCluster(objects: WorldObject[], centerX: number, centerY: number, type: string, minSize: number, maxSize: number): void {
    const size = this.rng.nextInt(minSize, maxSize);
    
    for (let i = 0; i < size; i++) {
      const x = centerX + this.rng.nextInt(-2, 2);
      const y = centerY + this.rng.nextInt(-2, 2);
      
      if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
        objects.push(this.createObject(type, x, y));
      }
    }
  }

  private createCorruptionZone(objects: WorldObject[], centerX: number, centerY: number, radius: number): void {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance <= radius && x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
          const probability = 1 - (distance / radius);
          if (this.rng.next() < probability * 0.6) {
            objects.push(this.createObject('obstacle', x, y));
          }
        }
      }
    }
  }

  private placeDataNodes(objects: WorldObject[]): void {
    const count = Math.floor(this.config.width * this.config.height * this.config.density.datanodes);
    
    for (let i = 0; i < count; i++) {
      const position = this.findEmptyPosition(objects);
      if (position) {
        objects.push({
          id: `datanode_${i}`,
          type: 'datanode',
          position,
          properties: { 
            value: this.rng.nextInt(50, 200),
            encrypted: this.rng.next() < 0.3
          },
          isCollectable: true
        });
      }
    }
  }

  private placeTerminals(objects: WorldObject[]): void {
    const count = Math.floor(this.config.width * this.config.height * this.config.density.terminals);
    
    for (let i = 0; i < count; i++) {
      const position = this.findEmptyPosition(objects);
      if (position) {
        objects.push({
          id: `terminal_${i}`,
          type: 'terminalnode',
          position,
          properties: { 
            active: this.rng.next() < 0.7,
            accessLevel: this.rng.nextInt(1, 5)
          },
          isActivatable: true
        });
      }
    }
  }

  private placeObstacles(objects: WorldObject[]): void {
    const count = Math.floor(this.config.width * this.config.height * this.config.density.obstacles);
    
    for (let i = 0; i < count; i++) {
      const position = this.findEmptyPosition(objects);
      if (position) {
        objects.push({
          id: `obstacle_${i}`,
          type: 'obstacle',
          position,
          properties: { 
            destructible: this.rng.next() < 0.4,
            health: this.rng.nextInt(1, 3)
          },
          isBlocking: true
        });
      }
    }
  }

  private placePortals(objects: WorldObject[]): void {
    const count = Math.floor(this.config.width * this.config.height * this.config.density.portals);
    
    for (let i = 0; i < count; i++) {
      const position = this.findEmptyPosition(objects);
      if (position) {
        objects.push({
          id: `portal_${i}`,
          type: 'portal',
          position,
          properties: { 
            destination: `world_${this.rng.nextInt(1, 10)}`,
            stable: this.rng.next() < 0.8
          },
          isActivatable: true
        });
      }
    }
  }

  private generateSpawnPoints(spawnPoints: { x: number; y: number }[], objects: WorldObject[]): void {
    const spawnCount = Math.max(4, Math.floor(this.config.width * this.config.height * 0.02));
    
    for (let i = 0; i < spawnCount; i++) {
      const position = this.findEmptyPosition(objects);
      if (position) {
        spawnPoints.push(position);
      }
    }
  }

  private findEmptyPosition(objects: WorldObject[]): { x: number; y: number } | null {
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = this.rng.nextInt(0, this.config.width - 1);
      const y = this.rng.nextInt(0, this.config.height - 1);
      
      const occupied = objects.some(obj => obj.position.x === x && obj.position.y === y);
      
      if (!occupied) {
        return { x, y };
      }
    }
    
    return null;
  }

  private createObject(type: string, x: number, y: number): WorldObject {
    return {
      id: `${type}_${x}_${y}`,
      type: type as any,
      position: { x, y },
      properties: {},
      isBlocking: type === 'wall' || type === 'obstacle'
    };
  }
}

export class WorldEventGenerator {
  private rng: SeededRandom;
  private eventTypes = ['emp_burst', 'rogue_agent', 'corrupt_zone', 'data_surge', 'system_glitch'] as const;

  constructor(seed?: string) {
    this.rng = new SeededRandom(seed || Date.now().toString());
  }

  generateEvent(worldSize: { width: number; height: number }): WorldEvent {
    const type = this.rng.choice(this.eventTypes);
    const position = {
      x: this.rng.nextInt(0, worldSize.width - 1),
      y: this.rng.nextInt(0, worldSize.height - 1)
    };

    return {
      id: `event_${Date.now()}_${this.rng.nextInt(1000, 9999)}`,
      type,
      position,
      radius: this.getEventRadius(type),
      duration: this.getEventDuration(type),
      effects: this.getEventEffects(type),
      message: this.getEventMessage(type, position),
      timestamp: new Date()
    };
  }

  private getEventRadius(type: string): number {
    switch (type) {
      case 'emp_burst': return this.rng.nextInt(3, 8);
      case 'corrupt_zone': return this.rng.nextInt(5, 12);
      case 'data_surge': return this.rng.nextInt(2, 5);
      default: return this.rng.nextInt(1, 4);
    }
  }

  private getEventDuration(type: string): number {
    switch (type) {
      case 'emp_burst': return 30000; // 30 seconds
      case 'corrupt_zone': return 120000; // 2 minutes
      case 'data_surge': return 60000; // 1 minute
      case 'rogue_agent': return 180000; // 3 minutes
      case 'system_glitch': return 45000; // 45 seconds
      default: return 60000;
    }
  }

  private getEventEffects(type: string): Record<string, any> {
    switch (type) {
      case 'emp_burst':
        return { disableAgents: true, energyDrain: 50 };
      case 'rogue_agent':
        return { spawnHostile: true, agentType: 'rogue' };
      case 'corrupt_zone':
        return { corruptData: true, healthDrain: 10 };
      case 'data_surge':
        return { bonusData: true, multiplier: 2 };
      case 'system_glitch':
        return { randomTeleport: true, commandDelay: 2000 };
      default:
        return {};
    }
  }

  private getEventMessage(type: string, position: { x: number; y: number }): string {
    switch (type) {
      case 'emp_burst':
        return `⚡ EMP BURST detected at (${position.x}, ${position.y})! Agent systems compromised.`;
      case 'rogue_agent':
        return `🤖 ROGUE AGENT spotted at (${position.x}, ${position.y})! Hostile entity detected.`;
      case 'corrupt_zone':
        return `☠️ CORRUPTION ZONE expanding from (${position.x}, ${position.y})! Data integrity at risk.`;
      case 'data_surge':
        return `💎 DATA SURGE at (${position.x}, ${position.y})! Enhanced collection rates active.`;
      case 'system_glitch':
        return `⚠️ SYSTEM GLITCH at (${position.x}, ${position.y})! Reality matrix unstable.`;
      default:
        return `Unknown event at (${position.x}, ${position.y})`;
    }
  }

  scheduleRandomEvent(worldSize: { width: number; height: number }, callback: (event: WorldEvent) => void): NodeJS.Timeout {
    const delay = this.rng.nextInt(30000, 300000); // 30 seconds to 5 minutes
    
    return setTimeout(() => {
      const event = this.generateEvent(worldSize);
      callback(event);
    }, delay);
  }
}

export const worldGenerator = {
  generate: (config: GenerationConfig) => new WorldGenerator(config).generateWorld(),
  createEventGenerator: (seed?: string) => new WorldEventGenerator(seed)
};