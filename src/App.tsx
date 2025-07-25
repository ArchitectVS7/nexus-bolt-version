import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MatrixLayout from './components/Layout/MatrixLayout';
import TerminalInterface from './components/Terminal/TerminalInterface';
import AdminPanel from './components/Admin/AdminPanel';
import WorldVisualization from './components/World/WorldVisualization';
import CommandLibrary from './components/Library/CommandLibrary';
import UserProfile from './components/Profile/UserProfile';
import ChallengeSystem from './components/Challenges/ChallengeSystem';
import WorldEditor from './components/WorldEditor/WorldEditor';
import VisualScriptEditor from './components/AgentProgramming/VisualScriptEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MatrixLayout />}>
          <Route index element={<Navigate to="/terminal" replace />} />
          <Route path="/terminal" element={<TerminalInterface />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/world" element={<WorldVisualization />} />
          <Route path="/library" element={<CommandLibrary />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/challenges" element={<ChallengeSystem />} />
          <Route path="/builder" element={<WorldEditor />} />
          <Route path="/programming" element={<VisualScriptEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;