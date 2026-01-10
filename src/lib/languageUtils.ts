import { GestureType } from './gestureDetection';

export interface Language {
  code: string;
  name: string;
  flag: string;
  voiceLang: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', voiceLang: 'en-US' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', voiceLang: 'es-ES' },
  { code: 'fr', name: 'French', flag: '🇫🇷', voiceLang: 'fr-FR' },
  { code: 'de', name: 'German', flag: '🇩🇪', voiceLang: 'de-DE' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', voiceLang: 'hi-IN' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', voiceLang: 'ja-JP' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', voiceLang: 'zh-CN' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', voiceLang: 'pt-BR' },
];

// Translations for each gesture
export const translations: Record<string, Record<GestureType, string>> = {
  en: {
    hello: 'Hello',
    hi: 'Hi',
    i: 'I',
    love: 'love',
    you: 'you',
    unknown: '',
  },
  es: {
    hello: 'Hola',
    hi: 'Hola',
    i: 'Yo',
    love: 'amo',
    you: 'te',
    unknown: '',
  },
  fr: {
    hello: 'Bonjour',
    hi: 'Salut',
    i: 'Je',
    love: 'aime',
    you: 'te',
    unknown: '',
  },
  de: {
    hello: 'Hallo',
    hi: 'Hi',
    i: 'Ich',
    love: 'liebe',
    you: 'dich',
    unknown: '',
  },
  hi: {
    hello: 'नमस्ते',
    hi: 'नमस्ते',
    i: 'मैं',
    love: 'प्यार करता हूं',
    you: 'तुमसे',
    unknown: '',
  },
  ja: {
    hello: 'こんにちは',
    hi: 'やあ',
    i: '私は',
    love: '愛してる',
    you: 'あなたを',
    unknown: '',
  },
  zh: {
    hello: '你好',
    hi: '嗨',
    i: '我',
    love: '爱',
    you: '你',
    unknown: '',
  },
  pt: {
    hello: 'Olá',
    hi: 'Oi',
    i: 'Eu',
    love: 'amo',
    you: 'você',
    unknown: '',
  },
};

// Sentence construction rules for different languages
export const constructSentence = (gestures: GestureType[], languageCode: string): string => {
  const langTranslations = translations[languageCode] || translations.en;
  const words = gestures
    .filter(g => g !== 'unknown')
    .map(g => langTranslations[g]);
  
  if (words.length === 0) return '';
  
  // Special handling for "I love you" type sentences
  if (gestures.includes('i') && gestures.includes('love') && gestures.includes('you')) {
    switch (languageCode) {
      case 'es': return 'Yo te amo';
      case 'fr': return 'Je t\'aime';
      case 'de': return 'Ich liebe dich';
      case 'hi': return 'मैं तुमसे प्यार करता हूं';
      case 'ja': return '私はあなたを愛してる';
      case 'zh': return '我爱你';
      case 'pt': return 'Eu amo você';
      default: return 'I love you';
    }
  }
  
  // Default: join words with spaces
  return words.join(' ');
};

// Text-to-speech function
export const speakText = (text: string, languageCode: string): void => {
  if (!text || !window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const language = supportedLanguages.find(l => l.code === languageCode);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language?.voiceLang || 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
};
