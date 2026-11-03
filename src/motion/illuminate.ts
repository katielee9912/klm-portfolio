import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Rgba = { r: number; g: number; b: number; a: number };

function mix(a: Rgba, b: Rgba, t: number): Rgba {
  const k = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
    a: a.a + (b.a - a.a) * k,
  };
}

function toCss(c: Rgba) {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

function split(el: HTMLElement) {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  el.textContent = "";
  const chars: HTMLSpanElement[] = [];
  for (const char of text) {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.display = char === " " ? "inline" : "inline-block";
    el.append(span);
    chars.push(span);
  }
  return chars;
}

export function initIlluminate() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blue: Rgba = { r: 29, g: 104, b: 255, a: 1 };

  document.querySelectorAll<HTMLElement>("[data-illuminate]").forEach((el) => {
    const onLight = el.dataset.illuminateOn === "light";
    const rest: Rgba = onLight ? { r: 0, g: 0, b: 0, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
    const idle: Rgba = { ...rest, a: 0.3 };
    const chars = split(el);

    chars.forEach((span) => {
      span.style.color = reduce ? toCss(rest) : toCss(idle);
    });

    if (reduce) return;

    const state = { progress: 0 };
    const paint = () => {
      const n = chars.length;
      chars.forEach((span, i) => {
        const head = state.progress * (n + 8) - 4;
        const dist = i - head;
        let color = idle;
        if (dist <= 0) {
          const behind = Math.min(1, Math.abs(dist) / 12);
          color = mix(blue, rest, behind);
        } else if (dist < 1.4) {
          color = mix(idle, blue, 1 - dist / 1.4);
        }
        span.style.color = toCss(color);
        span.style.fontWeight = dist > -0.6 && dist < 0.8 ? "700" : "";
      });
    };

    const tween = gsap.to(state, {
      progress: 1,
      duration: 1.35,
      ease: "power2.out",
      paused: true,
      onUpdate: paint,
      onReverseComplete: () => {
        chars.forEach((span) => {
          span.style.color = toCss(idle);
          span.style.fontWeight = "";
        });
      },
      onComplete: () => {
        chars.forEach((span) => {
          span.style.color = toCss(rest);
          span.style.fontWeight = "";
        });
      },
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      onEnter: () => tween.play(),
      onLeaveBack: () => tween.reverse(),
    });
  });
}
