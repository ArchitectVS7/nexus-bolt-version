import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Star, CheckCircle, Lock, Play, Award } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Challenge, Objective } from '../../types';

const ChallengeSystem: React.FC = () => {
  const { gameState, addNotification, executeCommand } = useGameStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    // Load from Supabase or use default challenges
    const defaultChallenges: Challenge[] = [
      {
        id: 'first_deployment',
        title: 'First Deployment',
        description: 'Deploy your first agent to begin your journey in the Matrix.',
        objectives: [
          {
            id: 'deploy_agent',
            description: 'Deploy 1 agent',
            completed: false,
            progress: 0,
            maxProgress: 1,
            type: 'deploy'
          }
        ],
        reward: { score: 100, unlocks: ['scout_behavior'] },
        difficulty: 'easy'
      },
      {
        id: 'data_collector',
        title: 'Data Collector',
        description: 'Collect data nodes to increase your score and unlock new capabilities.',
        objectives: [
          {
            id: 'collect_data',
            description: 'Collect 5 data nodes',
            completed: false,
            progress: 0,
            maxProgress: 5,
            type: 'collect'
          }
        ],
        reward: { score: 250, unlocks: ['advanced_scanning'] },
        difficulty: 'easy'
      },
      {
        id: 'area_scanner',
        title: 'Area Scanner',
        description: 'Master the art of reconnaissance by scanning different areas.',
        objectives: [
          {
            id: 'scan_areas',
            description: 'Scan 10 different areas',
            completed: false,
            progress: 0,
            maxProgress: 10,
            type: 'scan'
          }
        ],
        reward: { score: 300, unlocks: ['long_range_scan'] },
        difficulty: 'medium'
      },
      {
        id: 'agent_commander',
        title: 'Agent Commander',
        description: 'Build a formidable force by deploying multiple agents.',
        objectives: [
          {
            id: 'deploy_squad',
            description: 'Deploy 10 agents total',
            completed: false,
            progress: 0,
            maxProgress: 10,
            type: 'deploy'
          },
          {
            id: 'maintain_health',
            description: 'Keep all agents above 75% health',
            completed: false,
            progress: 0,
            maxProgress: 1,
            type: 'custom'
          }
        ],
        reward: { score: 500, unlocks: ['elite_agents', 'formation_commands'] },
        difficulty: 'hard'
      },
      {
        id: 'matrix_master',
        title: 'Matrix Master',
        description: 'Achieve mastery over the digital realm through advanced operations.',
        objectives: [
          {
            id: 'high_score',
            description: 'Reach 2000 points',
            completed: false,
            progress: 0,
            maxProgress: 2000,
            type: 'custom'
          },
          {
            id: 'survive_events',
            description: 'Survive 5 world events',
            completed: false,
            progress: 0,
            maxProgress: 5,
            type: 'survive'
          },
          {
            id: 'create_commands',
            description: 'Create 3 custom commands',
            completed: false,
            progress: 0,
            maxProgress: 3,
            type: 'custom'
          }
        ],
        reward: { score: 1000, unlocks: ['world_editor', 'agent_programming'] },
        difficulty: 'expert'
      }
    ];

    setChallenges(defaultChallenges);
    updateChallengeProgress(defaultChallenges);
  };

  const updateChallengeProgress = (challengeList: Challenge[]) => {
    const updatedChallenges = challengeList.map(challenge => {
      const updatedObjectives = challenge.objectives.map(objective => {
        let progress = objective.progress;
        let completed = objective.completed;

        switch (objective.type) {
          case 'deploy':
            progress = gameState.playerStats.agentsDeployed;
            completed = progress >= objective.maxProgress;
            break;
          case 'collect':
            // This would be tracked by a separate counter in real implementation
            progress = Math.min(objective.progress, objective.maxProgress);
            completed = progress >= objective.maxProgress;
            break;
          case 'scan':
            // This would be tracked by scan command executions
            progress = Math.min(objective.progress, objective.maxProgress);
            completed = progress >= objective.maxProgress;
            break;
          case 'custom':
            if (objective.id === 'high_score') {
              progress = gameState.playerStats.score;
              completed = progress >= objective.maxProgress;
            } else if (objective.id === 'maintain_health') {
              const healthyAgents = gameState.agents.filter(agent => agent.health >= 75).length;
              progress = gameState.agents.length > 0 && healthyAgents === gameState.agents.length ? 1 : 0;
              completed = progress >= objective.maxProgress;
            }
            break;
        }

        return { ...objective, progress, completed };
      });

      const allCompleted = updatedObjectives.every(obj => obj.completed);
      return {
        ...challenge,
        objectives: updatedObjectives,
        completedAt: allCompleted && !challenge.completedAt ? new Date() : challenge.completedAt
      };
    });

    setChallenges(updatedChallenges);
  };

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    addNotification({
      type: 'info',
      title: 'Challenge Started',
      message: `Started challenge: ${challenge.title}`,
      duration: 3000
    });
  };

  const claimReward = (challenge: Challenge) => {
    if (!challenge.completedAt) return;

    // Award points and unlocks
    addNotification({
      type: 'success',
      title: 'Challenge Completed!',
      message: `Earned ${challenge.reward.score} points and unlocked: ${challenge.reward.unlocks.join(', ')}`,
      duration: 5000
    });

    // Update challenge as claimed
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id ? { ...c, isActive: false } : c
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-matrix-green border-matrix-green';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'hard': return 'text-orange-500 border-orange-500';
      case 'expert': return 'text-red-500 border-red-500';
      default: return 'text-matrix-dim-green border-border-green';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      case 'expert': return '⭐⭐⭐⭐';
      default: return '⭐';
    }
  };

  const filteredChallenges = challenges.filter(challenge => 
    selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty
  );

  return (
    <div className="h-full flex flex-col bg-console-gray">
      {/* Header */}
      <div className="p-6 border-b border-border-green bg-console-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold matrix-glow">Challenge System</h1>
            <p className="text-matrix-dim-green">
              Complete objectives to earn rewards and unlock new capabilities
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-matrix-dim-green">Completed: </span>
              <span className="text-matrix-green">
                {challenges.filter(c => c.completedAt).length}/{challenges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-matrix-dim-green">Filter by difficulty:</span>
          {['all', 'easy', 'medium', 'hard', 'expert'].map(difficulty => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-glow-green text-matrix-green border border-matrix-green'
                  : 'text-matrix-dim-green hover:text-matrix-green border border-border-green'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto matrix-scrollbar">
        <div className="p-6 space-y-4">
          {filteredChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-6 transition-all ${
                challenge.completedAt
                  ? 'border-matrix-green bg-glow-green'
                  : challenge.isActive
                  ? 'border-info bg-opacity-5 bg-info'
                  : 'border-border-green hover:border-matrix-dark-green'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-matrix-green">
                      {challenge.title}
                    </h3>
                    <span className={`px-2 py-1 rounded border text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {getDifficultyIcon(challenge.difficulty)} {challenge.difficulty.toUpperCase()}
                    </span>
                    {challenge.completedAt && (
                      <CheckCircle className="w-5 h-5 text-matrix-green" />
                    )}
                  </div>
                  <p className="text-matrix-green text-sm mb-4">
                    {challenge.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!challenge.completedAt && !challenge.isActive && (
                    <button
                      onClick={() => startChallenge(challenge)}
                      className="matrix-button px-4 py-2 rounded flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start</span>
                    </button>
                  )}
                  
                  {challenge.completedAt && (
                    <button
                      onClick={() => claimReward(challenge)}
                      className="px-4 py-2 bg-matrix-green text-neutral-black rounded flex items-center space-x-2 hover:bg-matrix-dark-green transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span>Claim Reward</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-matrix-green">Objectives:</h4>
                {challenge.objectives.map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        objective.completed 
                          ? 'bg-matrix-green border-matrix-green' 
                          : 'border-border-green'
                      }`}>
                        {objective.completed && (
                          <CheckCircle className="w-3 h-3 text-neutral-black" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        objective.completed ? 'text-matrix-green' : 'text-matrix-dim-green'
                      }`}>
                        {objective.description}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-console-gray rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            objective.completed ? 'bg-matrix-green' : 'bg-matrix-dim-green'
                          }`}
                          style={{ 
                            width: `${Math.min((objective.progress / objective.maxProgress) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-matrix-dim-green w-12 text-right">
                        {objective.progress}/{objective.maxProgress}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards */}
              <div className="mt-4 pt-4 border-t border-border-green">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-matrix-green" />
                      <span className="text-matrix-dim-green">Reward:</span>
                      <span className="text-matrix-green">{challenge.reward.score} points</span>
                    </div>
                    {challenge.reward.unlocks.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Lock className="w-4 h-4 text-info" />
                        <span className="text-matrix-dim-green">Unlocks:</span>
                        <span className="text-info">{challenge.reward.unlocks.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Challenge Panel */}
      <AnimatePresence>
        {activeChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="border-t border-border-green bg-console-dark p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-matrix-green">Active Challenge</h4>
                <p className="text-xs text-matrix-dim-green">{activeChallenge.title}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-xs text-matrix-dim-green">
                  Progress: {activeChallenge.objectives.filter(obj => obj.completed).length}/{activeChallenge.objectives.length}
                </div>
                <button
                  onClick={() => setActiveChallenge(null)}
                  className="text-xs px-2 py-1 border border-border-green rounded hover:border-matrix-green transition-colors"
                >
                  Minimize
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengeSystem;