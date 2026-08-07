import { useRef, useEffect } from 'react';
import Spinner from '../ui/Spinner.js';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  ref: React.RefObject<HTMLDivElement | null>;
  phase: number;
  targetAngle: number;
  angleTimer: number;
  angleInterval: number;
}

interface PresentationScreenProps {
  remoteStream: MediaStream | null;
  sessionEnded?: boolean;
  sessionEndMessage?: string;
}

export default function PresentationScreen({ remoteStream, sessionEnded, sessionEndMessage }: PresentationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lightBallRef1 = useRef<HTMLDivElement | null>(null);
  const lightBallRef2 = useRef<HTMLDivElement | null>(null);
  const lightBallRef3 = useRef<HTMLDivElement | null>(null);
  const darkBallRef1 = useRef<HTMLDivElement | null>(null);
  const darkBallRef2 = useRef<HTMLDivElement | null>(null);
  const darkBallRef3 = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      video.srcObject = remoteStream;
      video.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const ballRefs = isDark
      ? [darkBallRef1, darkBallRef2, darkBallRef3]
      : [lightBallRef1, lightBallRef2, lightBallRef3];

    const MIN_SPEED = 1.0;
    const MAX_SPEED = 2.2;
    const WANDER_STRENGTH = 0.18;

    const balls: Ball[] = ballRefs.map((ref) => {
      const size = ref.current?.offsetWidth || 300;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * Math.max(0, window.innerWidth - size),
        y: Math.random() * Math.max(0, window.innerHeight - size),
        vx: Math.cos(angle) * MIN_SPEED,
        vy: Math.sin(angle) * MIN_SPEED,
        radius: size / 2,
        ref,
        phase: Math.random() * Math.PI * 2,
        targetAngle: angle,
        angleTimer: 0,
        angleInterval: 60 + Math.random() * 120,
      };
    });

    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.667, 2);
      lastTime = currentTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      balls.forEach((ball) => {
        ball.angleTimer += dt;
        if (ball.angleTimer >= ball.angleInterval) {
          ball.angleTimer = 0;
          ball.angleInterval = 60 + Math.random() * 120;
          ball.targetAngle += (Math.random() - 0.5) * Math.PI * 1.5;
        }

        const currentAngle = Math.atan2(ball.vy, ball.vx);
        let angleDiff = ball.targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const newAngle = currentAngle + angleDiff * WANDER_STRENGTH * dt;

        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const targetSpeed = MIN_SPEED + Math.abs(Math.sin(currentTime * 0.0008 + ball.phase)) * (MAX_SPEED - MIN_SPEED);
        const newSpeed = speed + (targetSpeed - speed) * 0.02 * dt;

        ball.vx = Math.cos(newAngle) * newSpeed;
        ball.vy = Math.sin(newAngle) * newSpeed;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        const size = ball.radius * 2;
        if (ball.x <= 0) {
          ball.x = 0;
          ball.vx = Math.abs(ball.vx);
          ball.targetAngle = Math.acos(Math.abs(ball.vx) / Math.max(0.0001, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy))) * (Math.random() < 0.5 ? 1 : -1);
        } else if (ball.x + size >= width) {
          ball.x = width - size;
          ball.vx = -Math.abs(ball.vx);
          ball.targetAngle = Math.PI - Math.acos(Math.abs(ball.vx) / Math.max(0.0001, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy))) * (Math.random() < 0.5 ? 1 : -1);
        }

        if (ball.y <= 0) {
          ball.y = 0;
          ball.vy = Math.abs(ball.vy);
          ball.targetAngle = Math.asin(Math.abs(ball.vy) / Math.max(0.0001, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy))) * (Math.random() < 0.5 ? 1 : -1);
        } else if (ball.y + size >= height) {
          ball.y = height - size;
          ball.vy = -Math.abs(ball.vy);
          ball.targetAngle = -Math.asin(Math.abs(ball.vy) / Math.max(0.0001, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy))) * (Math.random() < 0.5 ? 1 : -1);
        }
      });

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = (b2.x + b2.radius) - (b1.x + b1.radius);
          const dy = (b2.y + b2.radius) - (b1.y + b1.radius);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            const dvx = b1.vx - b2.vx;
            const dvy = b1.vy - b2.vy;
            const dot = dvx * nx + dvy * ny;

            if (dot > 0) {
              const restitution = 0.9;
              const impulse = dot * restitution;
              b1.vx -= impulse * nx;
              b1.vy -= impulse * ny;
              b2.vx += impulse * nx;
              b2.vy += impulse * ny;
            }
          }
        }
      }

      balls.forEach((ball) => {
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed > 0.0001) {
          const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
          ball.vx = (ball.vx / speed) * clamped;
          ball.vy = (ball.vy / speed) * clamped;
        }

        if (ball.ref.current) {
          ball.ref.current.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0)`;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      balls.forEach((ball) => {
        const size = ball.radius * 2;
        if (ball.x + size > width) ball.x = width - size;
        if (ball.y + size > height) ball.y = height - size;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Smoke background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Light mode smoke */}
        <div className="dark:hidden">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-200/70 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-300/60 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-blue-100/80 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-200/50 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
        </div>

        {/* Dark mode smoke */}
        <div className="hidden dark:block">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-500/25 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-400/20 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-slate-700/30 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-600/15 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Decorative background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Light mode ellipses */}
        <div className="dark:hidden">
          {/* Large ellipse */}
          <div
            ref={lightBallRef1}
            className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(37,99,235,0.25) 20px, rgba(37,99,235,0.25) 40px)',
            }}
          />
          {/* Medium ellipse */}
          <div
            ref={lightBallRef2}
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(37,99,235,0.22) 15px, rgba(37,99,235,0.22) 30px)',
            }}
          />
          {/* Small ellipse */}
          <div
            ref={lightBallRef3}
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full opacity-15 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(37,99,235,0.2) 12px, rgba(37,99,235,0.2) 24px)',
            }}
          />
        </div>

        {/* Dark mode ellipses */}
        <div className="hidden dark:block">
          {/* Large ellipse */}
          <div
            ref={darkBallRef1}
            className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)',
            }}
          />
          {/* Medium ellipse */}
          <div
            ref={darkBallRef2}
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.25) 15px, rgba(255,255,255,0.25) 30px)',
            }}
          />
          {/* Small ellipse */}
          <div
            ref={darkBallRef3}
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full opacity-15 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.2) 12px, rgba(255,255,255,0.2) 24px)',
            }}
          />
        </div>
      </div>

      {/* Content */}
      {remoteStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 z-10 h-full w-full"
          style={{ objectFit: 'contain' }}
        />
      ) : sessionEnded ? (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Session Ended</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">{sessionEndMessage}</p>
        </div>
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
          <Spinner size="lg" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Waiting for Stream</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">The presenter will begin sharing shortly...</p>
          <div className="flex items-center gap-2 text-base text-slate-500 dark:text-slate-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>No active stream</span>
          </div>
        </div>
      )}
    </div>
  );
}
