import React from 'react';
import { GameCard } from '@/components/ui/game-card';
import { Star, Trophy, Zap } from 'lucide-react';

interface GameStatsProps {
  points: number;
  streak: number;
  totalGestures: number;
}

const GameStats: React.FC<GameStatsProps> = ({ points, streak, totalGestures }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <GameCard variant="accent" padding="sm" className="text-center">
        <Star className="w-6 h-6 mx-auto mb-1 text-accent-foreground" />
        <p className="text-2xl font-black">{points}</p>
        <p className="text-xs font-semibold text-muted-foreground">Points</p>
      </GameCard>
      
      <GameCard variant="primary" padding="sm" className="text-center">
        <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
        <p className="text-2xl font-black">{streak}</p>
        <p className="text-xs font-semibold text-muted-foreground">Streak</p>
      </GameCard>
      
      <GameCard variant="success" padding="sm" className="text-center">
        <Trophy className="w-6 h-6 mx-auto mb-1 text-success" />
        <p className="text-2xl font-black">{totalGestures}</p>
        <p className="text-xs font-semibold text-muted-foreground">Gestures</p>
      </GameCard>
    </div>
  );
};

export default GameStats;
