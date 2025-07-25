interface LLMResponse {
  command: string;
  confidence: number;
  explanation: string;
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

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.isEnabled = !!this.apiKey;
  }

  async parseCommand(naturalLanguage: string): Promise<LLMResponse | null> {
    if (!this.isEnabled) {
      return this.fallbackParse(naturalLanguage);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a command parser for a Matrix-style terminal game. Convert natural language to game commands.

Available commands:
- DeployAgent[count] location behavior (behaviors: patrol, scout, guard, gather, guardArea)
- ScanArea x y radius
- ListAgents
- Status
- ClearTerminal

Locations: center, north, south, east, west, northeast, northwest, southeast, southwest, or coordinates like "25 25"
Numbers should be extracted from text (e.g., "three" -> 3, "a few" -> 3, "several" -> 5)

Respond with JSON: {"command": "exact_command", "confidence": 0.0-1.0, "explanation": "brief_explanation"}`
            },
            {
              role: 'user',
              content: naturalLanguage
            }
          ],
          max_tokens: 150,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('LLM parsing failed, using fallback:', error);
    }

    return this.fallbackParse(naturalLanguage);
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
              explanation: `Matched pattern "${pattern}" to ${mapping.template}`
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
}

export const llmParser = new LLMCommandParser();