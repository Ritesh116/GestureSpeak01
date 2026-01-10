import React from 'react';
import { supportedLanguages, Language } from '@/lib/languageUtils';
import { GameCard } from '@/components/ui/game-card';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <GameCard variant="accent" className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <span className="text-xl">🌍</span>
        Output Language
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {supportedLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`
              p-3 rounded-xl text-center transition-all duration-200
              ${selectedLanguage === lang.code
                ? 'bg-primary text-primary-foreground shadow-game scale-105'
                : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/30'
              }
            `}
          >
            <span className="text-2xl block mb-1">{lang.flag}</span>
            <span className="text-xs font-semibold">{lang.name}</span>
          </button>
        ))}
      </div>
    </GameCard>
  );
};

export default LanguageSelector;
