export interface LLMResponse {
  command: string;
  confidence: number;
  explanation: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  sessionId?: string;
  conversationId?: string;
  contextUsed?: string[];
}

export interface LLMContext {
  worldState: {
    agents: any[];
    objects: any[];
    worldSize: { width: number; height: number };
    playerStats: any;
    activeEvents?: any[];
  };
  recentCommands: string[];
  activeChallenge?: any;
  selectedAgent?: any;
  sessionHistory?: LLMMessage[];
}

export interface LLMMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    command?: string;
    confidence?: number;
    worldState?: any;
  };
}

export interface LLMSession {
  id: string;
  userId?: string;
  messages: LLMMessage[];
  context: LLMContext;
  createdAt: Date;
  updatedAt: Date;
}

interface CommandMapping {
  patterns: string[];
  template: string;
  parameters: string[];
}

const COMMAND_MAPPINGS: CommandMapping[] = [
  {
    patterns: ['deploy', 'create', 'spawn', 'send'],
    template: 'DeployAgent[{count}] {location} {behavior}',
    parameters: ['count', 'location', 'behavior']
  },
  {
    patterns: ['scan', 'search', 'look', 'check'],
    template: 'ScanArea {x} {y} {radius}',
    parameters: ['x', 'y', 'radius']
  },
  {
    patterns: ['list', 'show', 'display'],
    template: 'ListAgents',
    parameters: []
  },
  {
    patterns: ['status', 'info', 'stats'],
    template: 'Status',
    parameters: []
  }
];

export class LLMCommandParser {
  private apiKey: string | null;
  private isEnabled: boolean;
  private currentSession: string | null = null;
  private sessionMemory: Map<string, LLMSession> = new Map();
  private devMode: boolean = false;
  private maxSessionHistory = 20;
  private contextWindow = 10;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.isEnabled = !!this.apiKey;
    this.devMode = import.meta.env.DEV || false;
  }

  async parseCommand(
    naturalLanguage: string, 
    context?: LLMContext,
    sessionId?: string,
    userId?: string
  ): Promise<LLMResponse | null> {
    // Create or get session
    const session = this.getOrCreateSession(sessionId, userId, context);
    
    if (!this.isEnabled) {
      return this.fallbackParse(naturalLanguage, session);
    }

    try {
      const systemPrompt = this.buildAdvancedSystemPrompt(session.context);
      const conversationHistory = this.buildConversationHistory(session);
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: naturalLanguage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          max_tokens: 300,
          temperature: 0.1,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        const result = JSON.parse(content);
        
        // Add to session history
        const userMessage: LLMMessage = {
          id: `msg_${Date.now()}_user`,
          role: 'user',
          content: naturalLanguage,
          timestamp: new Date(),
          metadata: { worldState: session.context.worldState }
        };
        
        const assistantMessage: LLMMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: content,
          timestamp: new Date(),
          metadata: { 
            command: result.command,
            confidence: result.confidence
          }
        };
        
        session.messages.push(userMessage, assistantMessage);
        session.updatedAt = new Date();
        
        // Trim session history if too long
        if (session.messages.length > this.maxSessionHistory) {
          session.messages = session.messages.slice(-this.maxSessionHistory);
        }
        
        this.sessionMemory.set(session.id, session);
        
        // Log in dev mode
        if (this.devMode) {
          console.log('LLM Session:', session.id);
          console.log('Input:', naturalLanguage);
          console.log('Output:', result);
          console.log('Context:', session.context);
          console.log('Session Messages:', session.messages.length);
        }
        
        return {
          ...result,
          sessionId: session.id,
          conversationId: session.id,
          contextUsed: this.getContextSummary(session.context)
        };
      }
    } catch (error) {
      console.warn('LLM parsing failed, using fallback:', error);
    }

    return this.fallbackParse(naturalLanguage, session);
  }

  private getOrCreateSession(sessionId?: string, userId?: string, context?: LLMContext): LLMSession {
    const id = sessionId || this.currentSession || `session_${Date.now()}`;
    
    let session = this.sessionMemory.get(id);
    
    if (!session) {
      session = {
        id,
        userId,
        messages: [],
        context: context || this.getDefaultContext(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.sessionMemory.set(id, session);
    } else if (context) {
      // Update context with new information
      session.context = { ...session.context, ...context };
      session.updatedAt = new Date();
    }
    
    this.currentSession = id;
    return session;
  }

  private getDefaultContext(): LLMContext {
    return {
      worldState: {
        agents: [],
        objects: [],
        worldSize: { width: 50, height: 50 },
        playerStats: { score: 0, level: 1, commandsExecuted: 0, agentsDeployed: 0, achievements: [] }
      },
      recentCommands: []
    };
  }

  private buildConversationHistory(session: LLMSession): any[] {
    // Get recent messages for context
    const recentMessages = session.messages.slice(-this.contextWindow);
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  private buildAdvancedSystemPrompt(context: LLMContext): string {
    let prompt = `You are a command parser for a Matrix-style terminal game. Convert natural language to game commands.

CORE MISSION: Convert natural language to precise game commands while maintaining conversation context and providing intelligent suggestions.

Available commands:
- DeployAgent[count] location behavior (behaviors: patrol, scout, guard, gather, guardArea)
- ScanArea x y radius
- ListAgents
- Status
- ClearTerminal
- StartChallenge challenge_name
- GenerateWorld seed biome difficulty
- SaveWorld template_name
- LoadWorld template_name
- ProgramAgent agent_id script_name

LOCATION PARSING:
- Named: center, north, south, east, west, northeast, northwest, southeast, southwest
- Coordinates: "25 25" or "x:25 y:25"
- Relative: "near agent_1", "around the terminal", "by the data nodes"

NUMBER EXTRACTION:
- Text to numbers: "three" -> 3, "a few" -> 3, "several" -> 5, "many" -> 10
- Ranges: "2-4 agents" -> use middle value (3)
- Contextual: "all available" -> check current resources`;

    // Add detailed world state context
    if (context.worldState) {
      prompt += `\n\n=== CURRENT WORLD STATE ===`;
      
      const ws = context.worldState;
      prompt += `\nWorld: ${ws.worldSize.width}x${ws.worldSize.height} grid`;
      prompt += `\nAgents: ${ws.agents.length} active`;
      
      if (ws.agents.length > 0) {
        prompt += `\nAgent Details:`;
        ws.agents.slice(0, 5).forEach(agent => {
          prompt += `\n  - ${agent.name}: ${agent.behavior} at (${agent.position.x}, ${agent.position.y}), ${agent.health}% health, ${agent.status}`;
        });
        if (ws.agents.length > 5) {
          prompt += `\n  ... and ${ws.agents.length - 5} more agents`;
        }
      }
      
      if (ws.objects && ws.objects.length > 0) {
        const objectCounts = ws.objects.reduce((acc: any, obj: any) => {
          acc[obj.type] = (acc[obj.type] || 0) + 1;
          return acc;
        }, {});
        prompt += `\nObjects: ${Object.entries(objectCounts).map(([type, count]) => `${count} ${type}s`).join(', ')}`;
      }
      
      prompt += `\nPlayer: Level ${ws.playerStats.level}, Score ${ws.playerStats.score}, ${ws.playerStats.commandsExecuted} commands executed`;
      
      if (ws.activeEvents && ws.activeEvents.length > 0) {
        prompt += `\nActive Events: ${ws.activeEvents.map((e: any) => e.type).join(', ')}`;
      }
    }
    
    // Add command history context
    if (context.recentCommands && context.recentCommands.length > 0) {
      prompt += `\n\n=== RECENT COMMANDS ===`;
      context.recentCommands.slice(-5).forEach((cmd, i) => {
        prompt += `\n${i + 1}. ${cmd}`;
      });
    }
    
    // Add challenge context
    if (context.activeChallenge) {
      prompt += `\n\n=== ACTIVE CHALLENGE ===`;
      prompt += `\nTitle: ${context.activeChallenge.title}`;
      prompt += `\nDescription: ${context.activeChallenge.description}`;
      if (context.activeChallenge.objectives) {
        prompt += `\nObjectives:`;
        context.activeChallenge.objectives.forEach((obj: any, i: number) => {
          const status = obj.completed ? '✓' : `${obj.progress}/${obj.maxProgress}`;
          prompt += `\n  ${i + 1}. ${obj.description} [${status}]`;
        });
      }
    }
    
    // Add selected agent context
    if (context.selectedAgent) {
      prompt += `\n\n=== SELECTED AGENT ===`;
      const agent = context.selectedAgent;
      prompt += `\nName: ${agent.name}`;
      prompt += `\nPosition: (${agent.position.x}, ${agent.position.y})`;
      prompt += `\nBehavior: ${agent.behavior}`;
      prompt += `\nStatus: ${agent.status}`;
      prompt += `\nHealth: ${agent.health}%, Energy: ${agent.energy}%`;
    }

    prompt += `\n\n=== RESPONSE GUIDELINES ===
1. CONTEXT AWARENESS: Reference previous commands and current world state
2. CLARIFICATION: If ambiguous, ask specific questions
3. SUGGESTIONS: Offer strategic advice based on world state
4. EFFICIENCY: Prefer commands that work with existing agents/objects
5. SAFETY: Warn about risky actions (low health agents, dangerous areas)

MULTI-TURN EXAMPLES:
User: "Send scouts to explore"
You: Consider recent deployments, suggest specific locations based on unexplored areas

User: "My agents are dying"
You: Check agent health in context, suggest retreat or healing commands

User: "What should I do next?"
You: Analyze world state, active challenges, suggest strategic next steps`;

    prompt += `\n\nRespond with JSON: {
  "command": "exact_command_syntax",
  "confidence": 0.0-1.0,
  "explanation": "detailed_explanation_with_context",
  "needsClarification": false,
  "clarificationPrompt": null,
  "strategicAdvice": "optional_strategic_suggestion"
}`;

    return prompt;
  }

  private getContextSummary(context: LLMContext): string[] {
    const summary: string[] = [];
    
    if (context.worldState) {
      summary.push(`world_${context.worldState.worldSize.width}x${context.worldState.worldSize.height}`);
      summary.push(`agents_${context.worldState.agents.length}`);
      summary.push(`level_${context.worldState.playerStats.level}`);
    }
    
    if (context.recentCommands && context.recentCommands.length > 0) {
      summary.push(`recent_commands_${context.recentCommands.length}`);
    }
    
    if (context.activeChallenge) {
      summary.push(`challenge_${context.activeChallenge.title.replace(/\s+/g, '_')}`);
    }
    
    if (context.selectedAgent) {
      summary.push(`selected_${context.selectedAgent.name}`);
    }
    
    return summary;
  }

  async askClarification(
    originalInput: string,
    clarificationResponse: string,
    sessionId?: string,
    context?: LLMContext
  ): Promise<LLMResponse | null> {
    const session = this.getOrCreateSession(sessionId, undefined, context);
    
    // Add clarification to conversation
    const clarificationMessage: LLMMessage = {
      id: `msg_${Date.now()}_clarification`,
      role: 'user',
      content: `Original: "${originalInput}" | Clarification: "${clarificationResponse}"`,
      timestamp: new Date(),
      metadata: { originalInput, clarificationResponse }
    };
    
    session.messages.push(clarificationMessage);
    
    return this.parseCommand(
      `${originalInput} (clarification: ${clarificationResponse})`,
      context,
      sessionId
    );
  }

  getSessionSummary(sessionId?: string): {
    id: string;
    messageCount: number;
    duration: number;
    commandsParsed: number;
    averageConfidence: number;
    topCommands: string[];
  } | null {
    const session = this.sessionMemory.get(sessionId || this.currentSession || '');
    if (!session) return null;
    
    const commands = session.messages
      .filter(msg => msg.role === 'assistant' && msg.metadata?.command)
      .map(msg => msg.metadata!.command!);
    
    const confidences = session.messages
      .filter(msg => msg.role === 'assistant' && msg.metadata?.confidence)
      .map(msg => msg.metadata!.confidence!);
    
    const commandCounts = commands.reduce((acc, cmd) => {
      const baseCmd = cmd.split(/[\[\s]/)[0];
      acc[baseCmd] = (acc[baseCmd] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCommands = Object.entries(commandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([cmd]) => cmd);
    
    return {
      id: session.id,
      messageCount: session.messages.length,
      duration: session.updatedAt.getTime() - session.createdAt.getTime(),
      commandsParsed: commands.length,
      averageConfidence: confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
        : 0,
      topCommands
    };
  }

  exportSession(sessionId?: string): LLMSession | null {
    return this.sessionMemory.get(sessionId || this.currentSession || '') || null;
  }

  importSession(session: LLMSession): void {
    this.sessionMemory.set(session.id, session);
    this.currentSession = session.id;
  }

  private fallbackParse(input: string, session?: LLMSession): LLMResponse | null {
    const lowercaseInput = input.toLowerCase();
    
    // Enhanced pattern matching with context awareness
    for (const mapping of COMMAND_MAPPINGS) {
      for (const pattern of mapping.patterns) {
        if (lowercaseInput.includes(pattern)) {
          const command = this.buildCommand(mapping, input, session?.context);
          if (command) {
            return {
              command,
              confidence: 0.7,
              explanation: `Pattern-matched "${pattern}" to ${mapping.template}${session ? ' (using session context)' : ''}`,
              needsClarification: false,
              sessionId: session?.id
            };
          }
        }
      }
    }

    return null;
  }

  private buildCommand(mapping: CommandMapping, input: string, context?: LLMContext): string | null {
    const lowercaseInput = input.toLowerCase();
    let command = mapping.template;

    // Extract numbers with context awareness
    const numbers = input.match(/\d+/g) || [];
    const textNumbers = this.extractTextNumbers(input);
    let allNumbers = [...numbers.map(n => parseInt(n)), ...textNumbers];
    
    // Use context to provide better defaults
    if (context?.worldState) {
      const ws = context.worldState;
      
      // Smart defaults based on world state
      if (allNumbers.length === 0) {
        if (lowercaseInput.includes('all') && ws.agents.length > 0) {
          allNumbers.push(Math.min(ws.agents.length, 10));
        } else if (lowercaseInput.includes('few')) {
          allNumbers.push(3);
        } else if (lowercaseInput.includes('many')) {
          allNumbers.push(Math.min(10, Math.floor(ws.worldSize.width * ws.worldSize.height * 0.02)));
        }
      }
    }

          const command = this.buildCommand(mapping, input);
          if (command) {
            return {
              command,
              confidence: 0.7,
              explanation: `Matched pattern "${pattern}" to ${mapping.template}`,
              needsClarification: false
            };
          }
        }
      }
    }

    return null;
  }

  private buildCommand(mapping: CommandMapping, input: string): string | null {
    const lowercaseInput = input.toLowerCase();
    let command = mapping.template;

    // Extract numbers
    const numbers = input.match(/\d+/g) || [];
    const textNumbers = this.extractTextNumbers(input);
    const allNumbers = [...numbers.map(n => parseInt(n)), ...textNumbers];

    // Extract locations
    const locations = ['center', 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
    const foundLocation = locations.find(loc => lowercaseInput.includes(loc)) || 'center';

    // Extract behaviors
    const behaviors = ['patrol', 'scout', 'guard', 'gather', 'guardarea'];
    const foundBehavior = behaviors.find(behavior => lowercaseInput.includes(behavior)) || 'patrol';

    // Replace parameters
    command = command.replace('{count}', (allNumbers[0] || 1).toString());
    command = command.replace('{location}', foundLocation);
    command = command.replace('{behavior}', foundBehavior);
    command = command.replace('{x}', (allNumbers[0] || 25).toString());
    command = command.replace('{y}', (allNumbers[1] || 25).toString());
    command = command.replace('{radius}', (allNumbers[2] || 5).toString());

    return command;
  }

  private extractTextNumbers(input: string): number[] {
    const textToNumber: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1, 'a few': 3, 'several': 5, 'many': 10
    };

    const numbers: number[] = [];
    const lowercaseInput = input.toLowerCase();

    for (const [text, number] of Object.entries(textToNumber)) {
      if (lowercaseInput.includes(text)) {
        numbers.push(number);
      }
    }

    return numbers;
  }

  isLLMEnabled(): boolean {
    return this.isEnabled;
  }

  setDevMode(enabled: boolean): void {
    this.devMode = enabled;
  }
}

export const llmParser = new LLMCommandParser();