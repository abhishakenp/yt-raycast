import { useEffect, useRef } from "react";

function initLaunchBackdrop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};
  const context = ctx;

  const particles: Array<{
    x: number;
    y: number;
    life: number;
    speed: number;
    size: number;
    seed: number;
    hue: number;
    alpha: number;
  }> = [];

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let tick = 0;
  let raf = 0;

  function noise2d(x: number, y: number) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothNoise(x: number, y: number) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const a = noise2d(ix, iy);
    const b = noise2d(ix + 1, iy);
    const c = noise2d(ix, iy + 1);
    const d = noise2d(ix + 1, iy + 1);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function resetParticle(
    p: (typeof particles)[number],
    edge?: "left",
  ) {
    p.x = edge === "left" ? -12 : Math.random() * width;
    p.y = Math.random() * height;
    p.life = 0.45 + Math.random() * 0.55;
    p.speed = 0.45 + Math.random() * 1.35;
    p.size = 0.45 + Math.random() * 1.05;
    p.seed = Math.random() * 200;
    p.hue = Math.random() > 0.42 ? 190 : 310;
    p.alpha =
      p.hue === 310 ? 0.45 + Math.random() * 0.35 : 0.08 + Math.random() * 0.18;
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.max(
      150,
      Math.min(260, Math.floor((width * height) / 9000)),
    );
    while (particles.length < target) {
      const p = {
        x: 0,
        y: 0,
        life: 0,
        speed: 0,
        size: 0,
        seed: 0,
        hue: 0,
        alpha: 0,
      };
      resetParticle(p);
      particles.push(p);
    }
    particles.length = target;
  }

  function draw() {
    if (!document.body.contains(canvas)) return;
    raf = window.requestAnimationFrame(draw);
    tick += 1;

    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(2, 4, 18, 0.065)";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";

    for (const p of particles) {
      const px = p.x;
      const py = p.y;
      const n = smoothNoise(
        p.x * 0.0036 + tick * 0.0007,
        p.y * 0.0036 + p.seed,
      );
      const drift = smoothNoise(p.x * 0.0022, p.y * 0.0022 + 50);
      const angle = n * Math.PI * 5.4 - Math.PI * 0.22;
      const speed = p.speed * (0.75 + drift * 1.45);

      p.x += Math.cos(angle) * speed + 0.34;
      p.y += Math.sin(angle) * speed * 0.82;
      p.life -= 0.0011;

      if (
        p.life <= 0 ||
        p.x < -40 ||
        p.x > width + 40 ||
        p.y < -40 ||
        p.y > height + 40
      ) {
        resetParticle(p, Math.random() > 0.35 ? "left" : undefined);
        continue;
      }

      const pulse = 0.65 + Math.sin(tick * 0.035 + p.seed) * 0.35;
      const alpha = Math.max(0, p.life) * p.alpha * pulse;
      context.beginPath();
      context.moveTo(px, py);
      context.lineTo(p.x, p.y);
      context.strokeStyle = `hsla(${p.hue}, 100%, ${p.hue === 310 ? 80 : 62}%, ${alpha})`;
      context.lineWidth = p.size;
      context.stroke();
    }

    context.globalAlpha = 1;
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  draw();

  return () => {
    window.removeEventListener("resize", resize);
    cancelAnimationFrame(raf);
  };
}

export function LaunchBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    return initLaunchBackdrop(canvas);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen max-w-screen max-h-screen z-0 pointer-events-none overflow-hidden isolate" aria-hidden="true" style={{
      background: `
        radial-gradient(circle at 70% 30%, rgba(28, 171, 255, 0.16), transparent 29rem),
        radial-gradient(circle at 88% 26%, rgba(255, 55, 221, 0.12), transparent 25rem),
        radial-gradient(circle at 36% 84%, rgba(45, 217, 255, 0.08), transparent 32rem),
        linear-gradient(135deg, #020413 0%, #050822 44%, #12051f 100%)
      `
    }}>
      <div className="absolute inset-[-12%_-18%_-18%_-24%] z-0 pointer-events-none opacity-58 blur-[7px] saturate-[1.4] animate-pulse" style={{
        background: `
          radial-gradient(circle at 67% 39%, rgba(28, 206, 255, 0.18), transparent 30rem),
          radial-gradient(circle at 78% 28%, rgba(255, 55, 221, 0.12), transparent 24rem)
        `,
        animation: 'heroAuraOnly 5.5s ease-in-out infinite alternate'
      }} />
      <canvas ref={canvasRef} className="absolute inset-0 z-1 w-full h-full pointer-events-none opacity-82 mix-blend-screen saturate-[1.35] contrast-[1.05]" />
    </div>
  );
}
