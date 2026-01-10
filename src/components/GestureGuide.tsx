import React from 'react';
import { GestureType, gestureEmojis } from '@/lib/gestureDetection';
import { GameCard } from '@/components/ui/game-card';

interface GestureGuideProps {
  detectedGestures: Set<GestureType>;
}

const gestureInstructions: Record<GestureType, string> = {
  hello: 'Open palm, all fingers extended',
  hi: 'Peace sign - index & middle fingers up',
  i: 'Only pinky finger extended',
  love: 'L shape - thumb & index finger',
  you: 'Pointing - only index finger',
  unknown: '',
};

const GestureGuide: React.FC<GestureGuideProps> = ({ detectedGestures }) => {
  const gestures: GestureType[] = ['hello', 'hi', 'i', 'love', 'you'];

  return (
    <GameCard variant="secondary" className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <span className="text-xl">🤟</span>
        Gesture Guide
      </h3>
      <div className="space-y-2">
        {gestures.map((gesture) => (
          <div
            key={gesture}
            className={`
              flex items-center gap-3 p-2 rounded-xl transition-all duration-300
              ${detectedGestures.has(gesture)
                ? 'bg-success/20 border-2 border-success/50'
                : 'bg-card/50 border-2 border-transparent'
              }
            `}
          >
            <span className="text-2xl w-10 text-center">
              {gestureEmojis[gesture]}
            </span>
            <div className="flex-1">
              <p className="font-bold capitalize">{gesture}</p>
              <p className="text-xs text-muted-foreground">
                {gestureInstructions[gesture]}
              </p>
            </div>
            {detectedGestures.has(gesture) && (
              <span className="text-success text-lg">✓</span>
            )}
          </div>
        ))}
      </div>
    </GameCard>
  );
};

export default GestureGuide;
