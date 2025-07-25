# NEXUS World Builder

A Matrix-inspired terminal-based world building game where players deploy and manage intelligent agents in a virtual grid world through command-line interfaces.

## 🎮 Game Overview

NEXUS World Builder is an immersive simulation game that combines retro terminal aesthetics with modern web technologies. Players act as "Matrix Operators" who deploy, command, and monitor AI agents in a virtual world through a sophisticated command-line interface.

### Core Gameplay Features

- **Terminal Interface**: Execute commands through an authentic terminal experience with autocomplete, command history, and real-time feedback
- **Agent Management**: Deploy intelligent agents with different behaviors (patrol, guard, explore) and monitor their status
- **World Visualization**: Real-time 2D grid-based world view with zoom, pan, and agent tracking
- **Command Builder**: Create custom commands with parameters and effects through a visual interface
- **Command Library**: Browse, manage, and export your collection of built-in and custom commands
- **User Profile**: Track statistics, achievements, and progression through the game

## 🚀 How to Play

### Getting Started

1. **Launch the Terminal**: Navigate to the Terminal tab to access the main command interface
2. **Learn the Basics**: Type `help` to see available commands or `tutorial` for a guided introduction
3. **Deploy Your First Agent**: Use `DeployAgent[1] center patrol` to create an agent at the world center
4. **Monitor Progress**: Check the Agent Status panel or switch to World view to see your agents in action

### Essential Commands

```bash
# Deploy agents
DeployAgent[count] location behavior
# Example: DeployAgent[3] center patrol

# Scan areas for objects and agents
ScanArea x y radius
# Example: ScanArea 25 25 10

# List all active agents
ListAgents

# Check system status
Status

# Clear terminal output
ClearTerminal

# Start interactive tutorial
Tutorial
```

### Game Progression

- **Score Points**: Execute successful commands to earn points and level up
- **Unlock Achievements**: Complete objectives like deploying agents, creating commands, and reaching score milestones
- **Create Custom Commands**: Use the Admin panel to build your own commands with custom parameters and effects
- **Manage Your World**: Monitor agent health, energy, and behaviors through the visualization tools

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom Matrix theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Consistent icon library
- **React Router** - Client-side routing

### State Management
- **Zustand** - Lightweight state management for game state, commands, and UI

### Build Tools
- **Vite** - Fast development server and build tool
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing with Tailwind

### Styling & Theme
- **Custom Matrix Theme** - Green-on-black terminal aesthetic with CRT effects
- **Responsive Design** - Works on desktop and mobile devices
- **Accessibility** - Keyboard navigation and screen reader support

## 🔌 External Connections

### Current Status
- **Database**: Supabase integration available (falls back to localStorage if not configured)
- **LLM Integration**: OpenAI API integration for natural language command parsing
- **MCP (Model Context Protocol)**: Not implemented
- **External APIs**: OpenAI API for command parsing (optional)

### Planned Integrations
- **WebSocket**: For real-time multiplayer functionality
- **GitHub API**: For command library sharing and version control
- **Claude API**: Alternative LLM provider for command parsing
- **MCP Integration**: Model Context Protocol for enhanced AI interactions

## 🎯 Future Improvements

### Short Term (v2.2)
- [x] **Persistent Storage**: Integrate Supabase for user accounts and data persistence
- [x] **Enhanced Agent AI**: More sophisticated agent behaviors and decision-making
- [x] **World Objects**: Interactive elements like data nodes, terminals, and obstacles
- [x] **Command Validation**: Real-time syntax checking and parameter validation
- [x] **Audio System**: Matrix-style sound effects and ambient audio
- [x] **LLM Integration**: Natural language command parsing with OpenAI/Claude API
- [x] **Test Suite**: Comprehensive testing with Vitest and React Testing Library

### Medium Term (v2.5)
- [ ] **Advanced Natural Language Processing**: Enhanced LLM integration with context awareness
- [ ] **Multiplayer Mode**: Shared worlds with multiple operators
- [ ] **Agent Programming**: Visual scripting interface for complex agent behaviors
- [ ] **World Editor**: Drag-and-drop world building tools
- [ ] **Challenge System**: Structured missions and objectives

### Long Term (v3.0)
- [ ] **3D Visualization**: Upgrade to Three.js for immersive 3D world view
- [ ] **VR Support**: Virtual reality interface for world exploration
- [ ] **Blockchain Integration**: NFT agents and decentralized world ownership
- [ ] **AI-Generated Content**: Procedural world generation and dynamic events
- [ ] **Mobile App**: Native iOS/Android companion app

## 🏗 Architecture

### Component Structure
```
src/
├── components/
│   ├── Admin/          # Command builder and testing tools
│   ├── Layout/         # App shell and navigation
│   ├── Library/        # Command management and browsing
│   ├── Profile/        # User statistics and settings
│   ├── Terminal/       # Main game interface
│   ├── UI/            # Shared UI components
│   └── World/         # 2D visualization and agent monitoring
├── store/             # Zustand state management
├── types/             # TypeScript type definitions
└── styles/            # Global CSS and theme
```

### Key Design Patterns
- **Component Composition**: Modular, reusable components
- **Custom Hooks**: Shared logic for game mechanics
- **State Management**: Centralized game state with Zustand
- **Type Safety**: Comprehensive TypeScript coverage
- **Responsive Design**: Mobile-first approach with desktop enhancements

## 🚦 Getting Started (Development)

```bash
# Clone the repository
git clone <repository-url>
cd nexus-world-builder

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env.local)
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Environment Setup

To enable all features, configure these environment variables in `.env.local`:

```env
# Supabase (for persistent storage)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for LLM command parsing)
VITE_OPENAI_API_KEY=your_openai_api_key

# Audio (optional)
VITE_ENABLE_AUDIO=true
```

**Note**: The game works fully offline without these configurations, using localStorage and pattern-matching for commands.

### Supabase Setup

If you want to enable persistent storage:

1. Create a new Supabase project
2. Run the following SQL to create required tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  commands_executed INTEGER DEFAULT 0,
  agents_deployed INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_commands table
CREATE TABLE custom_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  syntax TEXT NOT NULL,
  description TEXT NOT NULL,
  parameters JSONB DEFAULT '[]',
  effects JSONB DEFAULT '[]',
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create world_states table
CREATE TABLE world_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agents JSONB DEFAULT '[]',
  objects JSONB DEFAULT '[]',
  world_size JSONB DEFAULT '{"width": 50, "height": 50}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own commands" ON custom_commands
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own world state" ON world_states
  FOR ALL USING (auth.uid() = user_id);
```

3. Add your Supabase URL and anon key to `.env.local`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Play Now

Experience the Matrix. Build your world. Command your agents.

### ✅ v2.2 Features Completed:

- ✅ **Supabase Integration**: Full user authentication and data persistence
- ✅ **LLM Command Parsing**: Natural language to game commands via OpenAI API
- ✅ **Enhanced Agent AI**: New behaviors (scout, gather, guardArea) with obstacle avoidance
- ✅ **Interactive World Objects**: Collectable data nodes, activatable terminals, blocking obstacles
- ✅ **Real-time Command Validation**: Syntax checking with helpful error messages and warnings
- ✅ **Matrix Audio System**: Terminal typing sounds, command feedback, and ambient audio
- ✅ **Comprehensive Test Suite**: 80%+ coverage with Vitest and React Testing Library

### 🔧 Setup Required:

Some features require additional configuration:

- ⚠️ **Supabase Database**: 
    - Create a Supabase project at https://supabase.com
    - Run the SQL schema provided in the setup section above
    - Add your Supabase URL and anon key to `.env.local`

- ⚠️ **OpenAI API**: 
    - Get an API key from https://platform.openai.com
    - Add `VITE_OPENAI_API_KEY=your_key` to `.env.local`
    - Without this, the game uses pattern-matching fallback for command parsing

---

*"Welcome to the real world." - Morpheus*