import React from 'react';
import { GestureType, gestureEmojis, gestureLabels } from '@/lib/gestureDetection';
import { GameCard } from '@/components/ui/game-card';
import { GameButton } from '@/components/ui/game-button';
import { Trash2, Volume2 } from 'lucide-react';

interface SentenceBuilderProps {
  gestures: GestureType[];
  sentence: string;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
}

const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  gestures,
  sentence,
  onClear,
  onSpeak,
  isSpeaking,
}) => {
  return (
    <GameCard variant="primary" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Sentence Builder
        </h3>
        <div className="flex gap-2">
          <GameButton
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={gestures.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </GameButton>
        </div>
      </div>

      {/* Gesture chips */}
      <div className="flex flex-wrap gap-2 min-h-[48px]">
        {gestures.length === 0 ? (
          <p className="text-muted-foreground italic">
            Start making gestures to build a sentence...
          </p>
        ) : (
          gestures.map((gesture, index) => (
            <div
              key={index}
              className="bounce-in bg-card rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm border-2 border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-xl">{gestureEmojis[gesture]}</span>
              <span className="font-semibold capitalize">{gesture}</span>
            </div>
          ))
        )}
      </div>

      {/* Sentence output */}
      {sentence && (
        <div className="bg-card rounded-2xl p-4 border-2 border-success/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Translated Sentence:</p>
              <p className="text-2xl font-bold text-success">{sentence}</p>
            </div>
            <GameButton
              variant="success"
              size="icon"
              onClick={onSpeak}
              disabled={isSpeaking}
              className={isSpeaking ? 'animate-pulse' : ''}
            >
              <Volume2 className="w-5 h-5" />
            </GameButton>
          </div>
        </div>
      )}
    </GameCard>
  );
};

export default SentenceBuilder;
