import React, { useRef, useEffect, useState, useCallback } from 'react';
import { detectGesture, GestureType, gestureEmojis } from '@/lib/gestureDetection';
import { GameCard } from '@/components/ui/game-card';

// MediaPipe types
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandResults {
  image: HTMLVideoElement | HTMLImageElement;
  multiHandLandmarks?: HandLandmark[][];
}

// Connection pairs for drawing hand skeleton
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];

interface CameraFeedProps {
  onGestureDetected: (gesture: GestureType) => void;
  isActive: boolean;
}

// Custom drawing functions
const drawConnectors = (
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  connections: [number, number][],
  style: { color: string; lineWidth: number }
) => {
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.lineCap = 'round';
  
  for (const [start, end] of connections) {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    if (startPoint && endPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    }
  }
};

const drawLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  style: { color: string; radius: number }
) => {
  ctx.fillStyle = style.color;
  
  for (const landmark of landmarks) {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      style.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
};

// Declare global types for MediaPipe loaded via script
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onGestureDetected, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureType>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastGestureRef = useRef<GestureType>('unknown');
  const gestureCountRef = useRef(0);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !handsRef.current || !isActive) return;
    
    try {
      await handsRef.current.send({ image: videoRef.current });
    } catch (e) {
      // Ignore send errors during cleanup
    }
    
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isActive]);

  const onResults = useCallback((results: HandResults) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand connections with game-like colors
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#14b8a6',
          lineWidth: 4,
        });
        drawLandmarks(ctx, landmarks, {
          color: '#f97316',
          radius: 6,
        });

        // Detect gesture
        const result = detectGesture(landmarks);
        
        if (result.gesture !== 'unknown' && result.confidence > 0.7) {
          if (result.gesture === lastGestureRef.current) {
            gestureCountRef.current++;
          } else {
            gestureCountRef.current = 1;
            lastGestureRef.current = result.gesture;
          }

          // Confirm gesture after stable detection (5 frames)
          if (gestureCountRef.current >= 5) {
            setCurrentGesture(result.gesture);
            if (gestureCountRef.current === 5) {
              onGestureDetected(result.gesture);
            }
          }
        }
      }
    } else {
      setCurrentGesture('unknown');
      gestureCountRef.current = 0;
      lastGestureRef.current = 'unknown';
    }

    ctx.restore();
  }, [onGestureDetected]);

  // Load MediaPipe scripts dynamically
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!isActive) return;

    setCameraError(null);
    setIsLoading(true);

    const initCamera = async () => {
      try {
        // Load MediaPipe scripts
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js');

        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!window.Hands) {
          throw new Error('MediaPipe Hands failed to load');
        }

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        streamRef.current = stream;

        if (!videoRef.current) {
          throw new Error('Video element not available');
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        setIsLoading(false);
        
        // Start processing frames
        animationFrameRef.current = requestAnimationFrame(processFrame);

      } catch (error) {
        console.error('Camera error:', error);
        setIsLoading(false);
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setCameraError('Camera access denied. Please allow camera access in your browser settings and refresh the page.');
          } else if (error.name === 'NotFoundError') {
            setCameraError('No camera found. Please connect a camera and refresh the page.');
          } else if (error.name === 'NotReadableError') {
            setCameraError('Camera is in use by another application. Please close other apps using the camera.');
          } else {
            setCameraError(`Camera error: ${error.message}`);
          }
        } else {
          setCameraError('Failed to access camera. Please check your permissions.');
        }
      }
    };

    initCamera();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close?.();
      }
    };
  }, [isActive, onResults, processFrame]);

  return (
    <GameCard variant="glass" padding="none" className="relative overflow-hidden">
      {/* Camera container */}
      <div className="relative aspect-video bg-foreground/5">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          playsInline
          muted
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover rounded-t-3xl"
        />

        {/* Error overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm">
            <div className="text-center p-6 max-w-sm">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📷</span>
              </div>
              <p className="text-lg font-bold text-destructive mb-2">Camera Error</p>
              <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground">Loading Camera...</p>
              <p className="text-sm text-muted-foreground">Preparing hand tracking</p>
            </div>
          </div>
        )}

        {/* Current gesture indicator */}
        {currentGesture !== 'unknown' && (
          <div className="absolute top-4 left-4 bounce-in">
            <div className="bg-success/90 backdrop-blur-sm text-success-foreground px-4 py-2 rounded-2xl font-bold text-lg flex items-center gap-2 shadow-lg">
              <span className="text-2xl">{gestureEmojis[currentGesture]}</span>
              <span className="capitalize">{currentGesture}</span>
            </div>
          </div>
        )}

        {/* Hand tracking status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentGesture !== 'unknown' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-sm font-semibold">
                {currentGesture !== 'unknown' ? 'Hand Detected' : 'Show your hand'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">MediaPipe Hands</span>
          </div>
        </div>
      </div>
    </GameCard>
  );
};

export default CameraFeed;
