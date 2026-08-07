import { useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext.js';

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

export default function BackgroundEffects() {
  const lightBallRef1 = useRef<HTMLDivElement | null>(null);
  const lightBallRef2 = useRef<HTMLDivElement | null>(null);
  const lightBallRef3 = useRef<HTMLDivElement | null>(null);
  const darkBallRef1 = useRef<HTMLDivElement | null>(null);
  const darkBallRef2 = useRef<HTMLDivElement | null>(null);
  const darkBallRef3 = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const MIN_SPEED = 1.0;
    const MAX_SPEED = 2.2;
    const WANDER_STRENGTH = 0.12;

    const allRefs = {
      light: [lightBallRef1, lightBallRef2, lightBallRef3],
      dark: [darkBallRef1, darkBallRef2, darkBallRef3],
    };

    const getInitialRefs = () => allRefs[themeRef.current];
    const initialRefs = getInitialRefs();

    const getBallSize = (ref: React.RefObject<HTMLDivElement | null>) => {
      const measured = ref.current?.offsetWidth ?? 0;
      if (measured > 0) return measured;
      if (ref === lightBallRef3 || ref === darkBallRef3) return 300;
      if (ref === lightBallRef2 || ref === darkBallRef2) return 400;
      return 500;
    };

    const balls: Ball[] = initialRefs.map((ref, index) => {
      const size = getBallSize(ref);
      const angle = (index / 3) * Math.PI * 2 + Math.random() * 0.5;
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
        angleInterval: 80 + Math.random() * 100,
      };
    });

    for (let attempt = 0; attempt < balls.length; attempt++) {
      for (let j = attempt + 1; j < balls.length; j++) {
        const a = balls[attempt];
        const b = balls[j];
        const dx = (b.x + b.radius) - (a.x + a.radius);
        const dy = (b.y + b.radius) - (a.y + a.radius);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;
        if (dist < minDist && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
    }

    let animationId: number;
    let lastTime = performance.now();

    const getVisibleRefs = () => allRefs[themeRef.current];

    const animate = (currentTime: number) => {
      const dt = Math.max(0.1, Math.min((currentTime - lastTime) / 16.667, 2));
      lastTime = currentTime;

      const visibleRefs = getVisibleRefs();
      for (let i = 0; i < balls.length; i++) {
        balls[i].ref = visibleRefs[i];
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      balls.forEach((ball) => {
        ball.angleTimer += dt;
        if (ball.angleTimer >= ball.angleInterval) {
          ball.angleTimer = 0;
          ball.angleInterval = 80 + Math.random() * 100;
          ball.targetAngle += (Math.random() - 0.5) * Math.PI * 1.2;
        }

        const currentAngle = Math.atan2(ball.vy, ball.vx);
        let angleDiff = ball.targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const steering = angleDiff * WANDER_STRENGTH * dt;

        ball.vx += Math.cos(currentAngle + steering) * 0.02 * dt;
        ball.vy += Math.sin(currentAngle + steering) * 0.02 * dt;

        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const targetSpeed = MIN_SPEED + Math.abs(Math.sin(currentTime * 0.0006 + ball.phase)) * (MAX_SPEED - MIN_SPEED);
        if (speed > 0.0001) {
          const newSpeed = speed + (targetSpeed - speed) * 0.03 * dt;
          const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
          ball.vx = (ball.vx / speed) * clamped;
          ball.vy = (ball.vy / speed) * clamped;
        } else {
          const angle = Math.random() * Math.PI * 2;
          ball.vx = Math.cos(angle) * MIN_SPEED;
          ball.vy = Math.sin(angle) * MIN_SPEED;
        }

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
      });

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = (b2.x + b2.radius) - (b1.x + b1.radius);
          const dy = (b2.y + b2.radius) - (b1.y + b1.radius);
          const distSq = dx * dx + dy * dy;
          const minDist = b1.radius + b2.radius;

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
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
              const restitution = 0.8;
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
        const size = ball.radius * 2;
        if (ball.x <= 0) {
          ball.x = 0;
          ball.vx = Math.abs(ball.vx);
          ball.targetAngle = Math.abs(Math.atan2(ball.vy, ball.vx));
        } else if (ball.x + size >= width) {
          ball.x = width - size;
          ball.vx = -Math.abs(ball.vx);
          ball.targetAngle = Math.PI - Math.abs(Math.atan2(ball.vy, ball.vx));
        }

        if (ball.y <= 0) {
          ball.y = 0;
          ball.vy = Math.abs(ball.vy);
          ball.targetAngle = Math.abs(Math.atan2(ball.vy, ball.vx));
        } else if (ball.y + size >= height) {
          ball.y = height - size;
          ball.vy = -Math.abs(ball.vy);
          ball.targetAngle = -Math.abs(Math.atan2(ball.vy, ball.vx));
        }
      });

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
      const visibleRefs = getVisibleRefs();
      balls.forEach((ball, index) => {
        const newSize = getBallSize(visibleRefs[index]);
        const newRadius = newSize / 2;
        ball.radius = newRadius;
        const size = newSize;
        if (ball.x + size > width) ball.x = Math.max(0, width - size);
        if (ball.y + size > height) ball.y = Math.max(0, height - size);
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Smoke background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Light mode smoke */}
        <div className="dark:hidden">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-200/70 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-300/60 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-blue-100/80 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-200/50 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/4 w-[45vw] h-[45vw] max-w-[450px] max-h-[450px] rounded-full bg-blue-300/40 blur-[90px] animate-[smoke-drift-1_24s_ease-in-out_infinite]" />
          <div className="absolute -bottom-10 right-1/3 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-100/60 blur-[100px] animate-[smoke-drift-2_20s_ease-in-out_infinite]" />
        </div>

        {/* Dark mode smoke */}
        <div className="hidden dark:block">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-500/25 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-400/20 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-slate-700/30 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-600/15 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/4 w-[45vw] h-[45vw] max-w-[450px] max-h-[450px] rounded-full bg-blue-500/20 blur-[90px] animate-[smoke-drift-1_24s_ease-in-out_infinite]" />
          <div className="absolute -bottom-10 right-1/3 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-600/18 blur-[100px] animate-[smoke-drift-2_20s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Decorative background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Light mode ellipses */}
        <div className="dark:hidden">
          <div
            ref={lightBallRef1}
            className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-30 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(37,99,235,0.35) 15px, rgba(37,99,235,0.35) 30px)',
            }}
          />
          <div
            ref={lightBallRef2}
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-30 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(37,99,235,0.3) 12px, rgba(37,99,235,0.3) 24px)',
            }}
          />
          <div
            ref={lightBallRef3}
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full opacity-25 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(37,99,235,0.28) 10px, rgba(37,99,235,0.28) 20px)',
            }}
          />
        </div>

        {/* Dark mode ellipses */}
        <div className="hidden dark:block">
          <div
            ref={darkBallRef1}
            className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-25 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(37,99,235,0.45) 15px, rgba(37,99,235,0.45) 30px)',
            }}
          />
          <div
            ref={darkBallRef2}
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-25 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(37,99,235,0.4) 12px, rgba(37,99,235,0.4) 24px)',
            }}
          />
          <div
            ref={darkBallRef3}
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full opacity-20 will-change-transform"
            style={{
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(37,99,235,0.35) 10px, rgba(37,99,235,0.35) 20px)',
            }}
          />
        </div>
      </div>
    </>
  );
}
