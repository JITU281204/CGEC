import React, { useEffect, useRef } from 'react';

export const InteractiveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Glowing orange embers and floating fiery energy particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 45);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      glowRadius: Math.random() * 16 + 8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2), // gentle upward float like embers
      alpha: Math.random() * 0.6 + 0.25,
      hue: Math.random() > 0.4 ? 28 : 38, // fiery orange (28) or amber yellow (38)
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around smoothly
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Radial glow gradient for realistic neon/firefly halo
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.glowRadius
        );
        grad.addColorStop(0, `hsla(${p.hue}, 95%, 60%, ${p.alpha})`);
        grad.addColorStop(0.3, `hsla(${p.hue}, 90%, 50%, ${p.alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + 10}, 100%, 85%, ${p.alpha * 1.2})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Background ambient radial lighting gradients in corners */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-orange-600/18 via-amber-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 -left-32 w-[550px] h-[550px] bg-amber-600/10 blur-[140px] rounded-full" />
      </div>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        aria-hidden="true"
      />
    </>
  );
};
