// Gesture detection utilities for sign language recognition

export interface HandLandmarks {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'hello' | 'hi' | 'i' | 'love' | 'you' | 'unknown';

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
}

// Helper to check if a finger is extended
const isFingerExtended = (
  landmarks: HandLandmarks[],
  fingerTip: number,
  fingerPip: number,
  fingerMcp: number
): boolean => {
  const tipY = landmarks[fingerTip].y;
  const pipY = landmarks[fingerPip].y;
  const mcpY = landmarks[fingerMcp].y;
  
  // Finger is extended if tip is above pip and pip is above mcp (lower y = higher position)
  return tipY < pipY && pipY < mcpY;
};

// Helper to check if thumb is extended (different logic due to thumb orientation)
const isThumbExtended = (landmarks: HandLandmarks[]): boolean => {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  
  // Check horizontal extension for thumb
  const thumbExtended = Math.abs(thumbTip.x - thumbMcp.x) > 0.05;
  return thumbExtended && thumbTip.y < thumbIp.y;
};

// Check if fingers are curled
const isFingerCurled = (
  landmarks: HandLandmarks[],
  fingerTip: number,
  fingerPip: number
): boolean => {
  return landmarks[fingerTip].y > landmarks[fingerPip].y;
};

// Detect "Hello" - Open palm, all fingers extended
const detectHello = (landmarks: HandLandmarks[]): number => {
  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 10, 9);
  const ringExtended = isFingerExtended(landmarks, 16, 14, 13);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18, 17);
  const thumbExtended = isThumbExtended(landmarks);
  
  const allExtended = indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended;
  
  return allExtended ? 0.9 : 0;
};

// Detect "Hi" - Wave gesture (similar to hello but with hand tilted)
const detectHi = (landmarks: HandLandmarks[]): number => {
  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 10, 9);
  const ringCurled = isFingerCurled(landmarks, 16, 14);
  const pinkyCurled = isFingerCurled(landmarks, 20, 18);
  
  // Two fingers up (peace sign / hi)
  const twoFingersUp = indexExtended && middleExtended && ringCurled && pinkyCurled;
  
  return twoFingersUp ? 0.85 : 0;
};

// Detect "I" - Pinky finger only extended
const detectI = (landmarks: HandLandmarks[]): number => {
  const indexCurled = isFingerCurled(landmarks, 8, 6);
  const middleCurled = isFingerCurled(landmarks, 12, 10);
  const ringCurled = isFingerCurled(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18, 17);
  
  const onlyPinky = indexCurled && middleCurled && ringCurled && pinkyExtended;
  
  return onlyPinky ? 0.9 : 0;
};

// Detect "Love" - Thumb and index forming heart shape or "L" shape
const detectLove = (landmarks: HandLandmarks[]): number => {
  const thumbExtended = isThumbExtended(landmarks);
  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleCurled = isFingerCurled(landmarks, 12, 10);
  const ringCurled = isFingerCurled(landmarks, 16, 14);
  const pinkyCurled = isFingerCurled(landmarks, 20, 18);
  
  // L shape (thumb + index only)
  const lShape = thumbExtended && indexExtended && middleCurled && ringCurled && pinkyCurled;
  
  return lShape ? 0.85 : 0;
};

// Detect "You" - Pointing gesture (index finger only)
const detectYou = (landmarks: HandLandmarks[]): number => {
  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleCurled = isFingerCurled(landmarks, 12, 10);
  const ringCurled = isFingerCurled(landmarks, 16, 14);
  const pinkyCurled = isFingerCurled(landmarks, 20, 18);
  
  const pointing = indexExtended && middleCurled && ringCurled && pinkyCurled;
  
  return pointing ? 0.9 : 0;
};

export const detectGesture = (landmarks: HandLandmarks[]): GestureResult => {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'unknown', confidence: 0 };
  }
  
  const gestures: { gesture: GestureType; confidence: number }[] = [
    { gesture: 'hello', confidence: detectHello(landmarks) },
    { gesture: 'hi', confidence: detectHi(landmarks) },
    { gesture: 'i', confidence: detectI(landmarks) },
    { gesture: 'love', confidence: detectLove(landmarks) },
    { gesture: 'you', confidence: detectYou(landmarks) },
  ];
  
  // Find the gesture with highest confidence
  const bestMatch = gestures.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  if (bestMatch.confidence > 0.7) {
    return bestMatch;
  }
  
  return { gesture: 'unknown', confidence: 0 };
};

export const gestureLabels: Record<GestureType, string> = {
  hello: '👋 Hello',
  hi: '✌️ Hi',
  i: '🤙 I',
  love: '❤️ Love',
  you: '👆 You',
  unknown: '❓ Unknown',
};

export const gestureEmojis: Record<GestureType, string> = {
  hello: '👋',
  hi: '✌️',
  i: '🤙',
  love: '❤️',
  you: '👆',
  unknown: '❓',
};
