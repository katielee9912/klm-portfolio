// TODO: revisit at another time; consider for phase 2.
// TODO: to revisit sound effects during phase 2.
// import { playSfx } from "../audio/sfx";
import { DotField } from "./DotField";
import { blobDots, sampleImage, type SampledDot } from "./sample";

type PersonaId = "developer" | "strategist" | "designer" | "shopify";

const personas: Record<
  PersonaId,
  { label: string; color: string; blob: string; lineart: string }
> = {
  developer: {
    label: "Developer",
    color: "#4d7cff",
    blob: "/images/blob-developer.svg",
    lineart: "/images/lineart-developer.svg",
  },
  strategist: {
    label: "Strategist",
    color: "#d4e24a",
    blob: "/images/blob-strategist.svg",
    lineart: "/images/lineart-strategist.svg",
  },
  designer: {
    label: "Designer",
    color: "#ff4ec8",
    blob: "/images/blob-designer.svg",
    lineart: "/images/lineart-designer.svg",
  },
  shopify: {
    label: "Shopify Expert",
    color: "#7cff4a",
    blob: "/images/blob-shopify.svg",
    lineart: "/images/lineart-shopify.svg",
  },
};

function typeLabel(el: HTMLElement, text: string, reduce: boolean) {
  if (reduce) {
    el.textContent = text;
    return;
  }
  el.textContent = "";
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) window.setTimeout(tick, 38);
  };
  tick();
}

export async function initPersonas() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-persona]");

  for (const button of buttons) {
    const id = button.dataset.persona as PersonaId;
    const config = personas[id];
    const canvas = button.querySelector("canvas");
    const label = button.querySelector<HTMLElement>("[data-persona-label]");
    const stage = button.querySelector<HTMLElement>(".persona-stage");
    if (!config || !canvas || !label || !stage) continue;

    const field = new DotField(canvas, {
      radius: 1.8,
      drift: 0.9,
      follow: 0.08,
      followRadius: 48,
      spring: 0.05,
      damping: 0.8,
    });

    const size = Math.round(stage.getBoundingClientRect().width || 200);
    field.resize(size, size);

    let idle: SampledDot[] = blobDots(220, size, size, config.color);
    let formed: SampledDot[] = idle;
    try {
      idle = await sampleImage(config.blob, size, size, {
        step: 5,
        maxDots: 280,
        circular: true,
        forceColor: config.color,
        minAlpha: 30,
      });
      formed = await sampleImage(config.lineart, size, size, {
        step: 4,
        maxDots: 320,
        minLuma: 24,
        forceColor: config.color,
      });
    } catch {
      formed = idle;
    }

    field.setDots(idle.length ? idle : blobDots(220, size, size, config.color));
    field.bindPointer();
    field.start();

    let active = false;
    const activate = () => {
      if (active) return;
      active = true;
      button.setAttribute("aria-pressed", "true");
      field.morphTo(formed.length ? formed : idle);
      field.setDrift(0.35);
      typeLabel(label, config.label, reduce);
      // TODO: to revisit sound effects during phase 2.
      // void playSfx(id);
    };

    const deactivate = () => {
      if (!active) return;
      active = false;
      button.setAttribute("aria-pressed", "false");
      field.morphTo(idle);
      field.setDrift(0.9);
      label.textContent = "";
    };

    button.addEventListener("pointerenter", activate);
    button.addEventListener("focus", activate);
    button.addEventListener("pointerleave", () => {
      if (document.activeElement === button) return;
      deactivate();
    });
    button.addEventListener("blur", deactivate);
    button.addEventListener("click", (event) => {
      if (event.detail === 0) {
        if (active) deactivate();
        else activate();
        return;
      }
      activate();
    });
  }
}
