import type { SampledDot } from "./sample";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  r: number;
  color: string;
  colorR: number;
  colorG: number;
  colorB: number;
  grey: number;
};

type Pointer = { x: number; y: number; active: boolean };

type FieldOptions = {
  radius?: number;
  drift?: number;
  follow?: number;
  followRadius?: number;
  spring?: number;
  damping?: number;
  flashlight?: boolean;
  flashlightRadius?: number;
};

function parseRgb(color: string) {
  const match = color.match(/\d+/g);
  if (!match) return { r: 255, g: 255, b: 255 };
  return { r: Number(match[0]), g: Number(match[1]), b: Number(match[2]) };
}

function makeParticle(
  x: number,
  y: number,
  color: string,
  radius: number,
): Particle {
  const rgb = parseRgb(color);
  const grey = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    homeX: x,
    homeY: y,
    targetX: x,
    targetY: y,
    r: radius,
    color,
    colorR: rgb.r,
    colorG: rgb.g,
    colorB: rgb.b,
    grey,
  };
}

export class DotField {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  pointer: Pointer = { x: 0, y: 0, active: false };
  width = 0;
  height = 0;
  dpr = 1;
  private raf = 0;
  private options: Required<FieldOptions>;
  look = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, options: FieldOptions = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is unavailable");
    this.canvas = canvas;
    this.ctx = ctx;
    this.options = {
      radius: options.radius ?? 1.7,
      drift: options.drift ?? 0.18,
      follow: options.follow ?? 0.12,
      followRadius: options.followRadius ?? 70,
      spring: options.spring ?? 0.045,
      damping: options.damping ?? 0.82,
      flashlight: options.flashlight ?? false,
      flashlightRadius: options.flashlightRadius ?? 92,
    };
  }

  resize(cssWidth: number, cssHeight: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = cssWidth;
    this.height = cssHeight;
    this.canvas.width = Math.round(cssWidth * this.dpr);
    this.canvas.height = Math.round(cssHeight * this.dpr);
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setDots(dots: SampledDot[], mapSize?: { width: number; height: number }) {
    const sx = mapSize ? this.width / mapSize.width : 1;
    const sy = mapSize ? this.height / mapSize.height : 1;
    this.particles = dots.map((dot) =>
      makeParticle(dot.x * sx, dot.y * sy, dot.color, this.options.radius),
    );
  }

  morphTo(dots: SampledDot[], mapSize?: { width: number; height: number }) {
    const sx = mapSize ? this.width / mapSize.width : 1;
    const sy = mapSize ? this.height / mapSize.height : 1;
    const targets = dots.map((dot) => ({ x: dot.x * sx, y: dot.y * sy, color: dot.color }));
    const n = Math.max(this.particles.length, targets.length);
    for (let i = 0; i < n; i += 1) {
      const target = targets[i % Math.max(targets.length, 1)] ?? {
        x: this.width / 2,
        y: this.height / 2,
        color: "#fff",
      };
      if (!this.particles[i]) {
        this.particles[i] = makeParticle(target.x, target.y, target.color, this.options.radius);
      } else {
        const rgb = parseRgb(target.color);
        this.particles[i].targetX = target.x;
        this.particles[i].targetY = target.y;
        this.particles[i].homeX = target.x;
        this.particles[i].homeY = target.y;
        this.particles[i].color = target.color;
        this.particles[i].colorR = rgb.r;
        this.particles[i].colorG = rgb.g;
        this.particles[i].colorB = rgb.b;
        this.particles[i].grey = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
      }
    }
    if (this.particles.length > targets.length && targets.length > 0) {
      this.particles.length = targets.length;
    }
  }

  bindPointer() {
    const update = (clientX: number, clientY: number, active: boolean) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = clientX - rect.left;
      this.pointer.y = clientY - rect.top;
      this.pointer.active = active;
    };
    this.canvas.addEventListener("pointerenter", (event) => update(event.clientX, event.clientY, true));
    this.canvas.addEventListener("pointermove", (event) => update(event.clientX, event.clientY, true));
    this.canvas.addEventListener("pointerleave", () => {
      this.pointer.active = false;
    });
    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        update(touch.clientX, touch.clientY, true);
      },
      { passive: true },
    );
    this.canvas.addEventListener("touchend", () => {
      this.pointer.active = false;
    });
  }

  setDrift(value: number) {
    this.options.drift = value;
  }

  start() {
    const tick = () => {
      this.step();
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  private step() {
    const { drift, follow, followRadius, spring, damping } = this.options;
    const time = performance.now() / 1000;
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      const idleX = Math.sin(time * 0.8 + i) * drift;
      const idleY = Math.cos(time * 0.7 + i * 0.37) * drift;
      let tx = p.targetX + idleX + this.look.x;
      let ty = p.targetY + idleY + this.look.y;

      if (this.pointer.active && follow > 0) {
        const dx = this.pointer.x - p.x;
        const dy = this.pointer.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < followRadius) {
          const pull = (1 - dist / followRadius) * follow;
          tx += dx * pull;
          ty += dy * pull;
        }
      }

      p.vx += (tx - p.x) * spring;
      p.vy += (ty - p.y) * spring;
      p.vx *= damping;
      p.vy *= damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { flashlight, flashlightRadius } = this.options;
    for (const p of this.particles) {
      let fill = `rgb(${p.grey}, ${p.grey}, ${p.grey})`;
      if (flashlight && this.pointer.active) {
        const dist = Math.hypot(this.pointer.x - p.x, this.pointer.y - p.y);
        const t = Math.max(0, 1 - dist / flashlightRadius);
        const ease = t * t * (3 - 2 * t);
        const r = Math.round(p.grey + (p.colorR - p.grey) * ease);
        const g = Math.round(p.grey + (p.colorG - p.grey) * ease);
        const b = Math.round(p.grey + (p.colorB - p.grey) * ease);
        fill = `rgb(${r}, ${g}, ${b})`;
      } else if (!flashlight) {
        fill = p.color;
      }
      this.ctx.fillStyle = fill;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
