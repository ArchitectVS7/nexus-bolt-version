export interface LLMResponse {
  command: string;
  confidence: number;
  explanation: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  sessionId?: string;
}

export interface LLMContext {
  worldState?: Partial<GameState>;
  recentCommands: string[];
  activeChallenge?: Challenge;
  agentStates?: Agent[];
  worldEvents?: WorldEvent[];
  userId?: string;
  userId?: string;
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
  private sessionMemory: Map<string, any[]> = new Map();
  private devMode: boolean = false;
  private sessionContext: Map<string, LLMContext> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.isEnabled = !!this.apiKey;
    this.devMode = import.meta.env.DEV || false;
  }

  async parseCommand(
    naturalLanguage: string, 
    context?: Partial<LLMContext>,
    sessionId?: string
  ): Promise<LLMResponse | null> {
    if (!this.isEnabled) {
      return this.fallbackParse(naturalLanguage);
    }

    // Set or create session
    if (sessionId) {
      this.currentSession = sessionId;
    } else if (!this.currentSession) {
      this.currentSession = `session_${Date.now()}`;
    }

    // Get session memory
    const sessionHistory = this.sessionMemory.get(this.currentSession) || [];
    
    // Update session context
    if (context) {
      const existingContext = this.sessionContext.get(this.currentSession) || {};
      this.sessionContext.set(this.currentSession, { ...existingContext, ...context });
    }
    
    const fullContext = this.sessionContext.get(this.currentSession);

    try {
      const systemPrompt = this.buildSystemPrompt(fullContext);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...sessionHistory,
        { role: 'user', content: naturalLanguage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 200,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        const result = JSON.parse(content);
        
        // Store in session memory
        sessionHistory.push(
          { role: 'user', content: naturalLanguage },
          { role: 'assistant', content: content }
        );
        
        // Keep only last 10 exchanges
        if (sessionHistory.length > 20) {
          sessionHistory.splice(0, sessionHistory.length - 20);
        }
        
        this.sessionMemory.set(this.currentSession, sessionHistory);
        
        // Save session to Supabase if enabled
        if (import.meta.env.VITE_SUPABASE_URL && fullContext?.userId) {
          this.saveLLMSession(this.currentSession, sessionHistory, fullContext);
        }
        
        // Log in dev mode
        if (this.devMode) {
          console.log('LLM Session:', this.currentSession);
          console.log('Input:', naturalLanguage);
          console.log('Output:', result);
          console.log('Context:', context);
        }
        
        return {
          ...result,
          sessionId: this.currentSession
        };
      }
    } catch (error) {
      console.warn('LLM parsing failed, using fallback:', error);
    }

    return this.fallbackParse(naturalLanguage);
  }

  private async saveLLMSession(sessionId: string, messages: any[], context: LLMContext): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;
      
      await supabase.from('llm_sessions').upsert({
        id: sessionId,
        user_id: context.userId || 'anonymous',
        messages,
        context: {
          worldState: context.worldState,
          recentCommands: context.recentCommands,
          activeChallenge: context.activeChallenge
        },
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to save LLM session:', error);
    }
  }

  private buildSystemPrompt(context?: Partial<LLMContext>): string {
    let prompt = `You are a command parser for a Matrix-style terminal game. Convert natural language to game commands.

Available commands:
- DeployAgent[count] location behavior (behaviors: patrol, scout, guard, gather, guardArea)
- ScanArea x y radius
- ListAgents
- Status
- ClearTerminal
- StartChallenge "challenge_name"
- SaveWorld "template_name"
- LoadWorld "template_name"
- GenerateWorld seed biome difficulty
- ProgramAgent agent_id script_name

Locations: center, north, south, east, west, northeast, northwest, southeast, southwest, or coordinates like "25 25"
Numbers should be extracted from text (e.g., "three" -> 3, "a few" -> 3, "several" -> 5)`;

    if (context) {
      prompt += `\n\nCurrent Context:`;
      
      if (context.worldState) {
        prompt += `\n- World Size: ${context.worldState.worldSize?.width}x${context.worldState.worldSize?.height}`;
        prompt += `\n- Active Agents: ${context.agentStates?.length || 0}`;
      }
      
      if (context.recentCommands?.length) {
        prompt += `\n- Recent Commands: ${context.recentCommands.slice(-3).join(', ')}`;
      }
      
      if (context.activeChallenge) {
        prompt += `\n- Active Challenge: ${context.activeChallenge.title}`;
      }
      
      if (context.worldEvents?.length) {
        prompt += `\n- Recent Events: ${context.worldEvents.slice(-2).map(e => e.type).join(', ')}`;
      }
    }

    prompt += `\n\nIf the command is ambiguous or needs clarification, set "needsClarification": true and provide a "clarificationPrompt".

Respond with JSON: {"command": "exact_command", "confidence": 0.0-1.0, "explanation": "brief_explanation", "needsClarification": false, "clarificationPrompt": null}`;

    return prompt;
  }

  clearSession(sessionId?: string): void {
    const targetSession = sessionId || this.currentSession;
    if (targetSession) {
      this.sessionMemory.delete(targetSession);
      this.sessionContext.delete(targetSession);
    }
    if (!sessionId) {
      this.currentSession = null;
    }
  }

  getSessionHistory(sessionId?: string): any[] {
    const targetSession = sessionId || this.currentSession;
    return targetSession ? this.sessionMemory.get(targetSession) || [] : [];
  }

  async getClarification(sessionId: string, response: string): Promise<LLMResponse | null> {
    const session = sessionId || this.currentSession;
    if (!session) return null;
    
    const history = this.sessionMemory.get(session) || [];
    history.push({ role: 'user', content: response });
    
    return this.parseCommand(response, undefined, session);
  }

  private fallbackParse(input: string): LLMResponse | null {
    const lowercaseInput = input.toLowerCase();
    
    // Simple pattern matching for common commands
    for (const mapping of COMMAND_MAPPINGS) {
      for (const pattern of mapping.patterns) {
        if (lowercaseInput.includes(pattern)) {
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