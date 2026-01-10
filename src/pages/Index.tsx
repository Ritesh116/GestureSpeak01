import React, { useState, useCallback } from 'react';
import CameraFeed from '@/components/CameraFeed';
import SentenceBuilder from '@/components/SentenceBuilder';
import LanguageSelector from '@/components/LanguageSelector';
import GestureGuide from '@/components/GestureGuide';
import GameStats from '@/components/GameStats';
import { GameButton } from '@/components/ui/game-button';
import { GestureType } from '@/lib/gestureDetection';
import { constructSentence, speakText } from '@/lib/languageUtils';
import { Camera, CameraOff, Sparkles } from 'lucide-react';

const Index = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState<GestureType[]>([]);
  const [allDetectedGestures, setAllDetectedGestures] = useState<Set<GestureType>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalGestures, setTotalGestures] = useState(0);

  const handleGestureDetected = useCallback((gesture: GestureType) => {
    if (gesture === 'unknown') return;

    setDetectedGestures(prev => [...prev, gesture]);
    setAllDetectedGestures(prev => new Set([...prev, gesture]));
    setTotalGestures(prev => prev + 1);
    setStreak(prev => prev + 1);
    setPoints(prev => prev + 10 * (1 + Math.floor(streak / 5)));
  }, [streak]);

  const handleClearGestures = useCallback(() => {
    setDetectedGestures([]);
    setStreak(0);
  }, []);

  const handleSpeak = useCallback(() => {
    const sentence = constructSentence(detectedGestures, selectedLanguage);
    if (sentence) {
      setIsSpeaking(true);
      speakText(sentence, selectedLanguage);
      
      // Reset speaking state after estimated duration
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  }, [detectedGestures, selectedLanguage]);

  const sentence = constructSentence(detectedGestures, selectedLanguage);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-game">
              <span className="text-2xl">🤟</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                SignSpeak
              </h1>
              <p className="text-sm text-muted-foreground font-semibold">
                Learn sign language through play!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="font-bold text-lg">{points} XP</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left column - Camera and Sentence Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Section */}
          <div className="space-y-4">
            {!isCameraActive ? (
              <div className="bg-card rounded-3xl border-2 border-dashed border-border p-12 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">Ready to Start?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Enable your camera to start recognizing hand gestures and building sentences!
                </p>
                <GameButton
                  variant="primary"
                  size="lg"
                  onClick={() => setIsCameraActive(true)}
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </GameButton>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <GameButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCameraActive(false)}
                  >
                    <CameraOff className="w-4 h-4" />
                    Stop Camera
                  </GameButton>
                </div>
                <CameraFeed
                  onGestureDetected={handleGestureDetected}
                  isActive={isCameraActive}
                />
              </>
            )}
          </div>

          {/* Sentence Builder */}
          <SentenceBuilder
            gestures={detectedGestures}
            sentence={sentence}
            onClear={handleClearGestures}
            onSpeak={handleSpeak}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Right column - Stats, Language, Guide */}
        <div className="space-y-6">
          {/* Game Stats */}
          <GameStats
            points={points}
            streak={streak}
            totalGestures={totalGestures}
          />

          {/* Language Selector */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />

          {/* Gesture Guide */}
          <GestureGuide detectedGestures={allDetectedGestures} />
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 text-center text-sm text-muted-foreground">
        <p>
          Make gestures like <span className="font-bold">👋 Hello</span>,{' '}
          <span className="font-bold">✌️ Hi</span>,{' '}
          <span className="font-bold">🤙 I</span>,{' '}
          <span className="font-bold">❤️ Love</span>,{' '}
          <span className="font-bold">👆 You</span> to build sentences!
        </p>
      </footer>
    </div>
  );
};

export default Index;
