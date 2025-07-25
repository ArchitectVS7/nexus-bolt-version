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
- **Database**: None (all data stored in browser localStorage)
- **LLM Integration**: None (command parsing handled locally)
- **MCP (Model Context Protocol)**: Not implemented
- **External APIs**: None (fully offline capable)

### Planned Integrations
- **Supabase**: For persistent user data, leaderboards, and command sharing
- **OpenAI/Claude**: For natural language command processing and agent AI
- **WebSocket**: For real-time multiplayer functionality
- **GitHub API**: For command library sharing and version control

## 🎯 Future Improvements

### Short Term (v2.2)
- [ ] **Persistent Storage**: Integrate Supabase for user accounts and data persistence
- [ ] **Enhanced Agent AI**: More sophisticated agent behaviors and decision-making
- [ ] **World Objects**: Interactive elements like data nodes, terminals, and obstacles
- [ ] **Command Validation**: Real-time syntax checking and parameter validation
- [ ] **Audio System**: Matrix-style sound effects and ambient audio

### Medium Term (v2.5)
- [ ] **Natural Language Processing**: Allow commands in plain English via LLM integration
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
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

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

**[Launch NEXUS World Builder →](https://your-deployment-url.com)**

---

*"Welcome to the real world." - Morpheus*