// TODO: to revisit sound effects during phase 2.
// import { playSfx } from "../audio/sfx";
import { DotField } from "./DotField";
import { sampleImage, smileDots } from "./sample";

export async function initFooterEyes() {
  const root = document.querySelector<HTMLElement>("[data-eyes]");
  const canvas = root?.querySelector("canvas");
  if (!root || !canvas) return;

  const field = new DotField(canvas, {
    radius: 1.6,
    drift: 0.12,
    follow: 0,
    spring: 0.07,
    damping: 0.8,
  });

  const rect = root.getBoundingClientRect();
  const width = Math.max(280, Math.round(rect.width));
  const height = Math.max(110, Math.round(rect.height || width * 0.39));
  field.resize(width, height);

  let open = await sampleImage("/images/eyes.svg", width, height, {
    step: 5,
    maxDots: 700,
    minLuma: 20,
    forceColor: "#ffffff",
  });
  if (!open.length) {
    open = smileDots(width, height, 180, "#ffffff");
  }
  const smile = smileDots(width, height, Math.max(120, open.length), "#ffffff");
  field.setDots(open);
  field.start();

  const onMove = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = (event.clientX - cx) / box.width;
    const dy = (event.clientY - cy) / box.height;
    field.look.x = Math.max(-18, Math.min(18, dx * 28));
    field.look.y = Math.max(-10, Math.min(10, dy * 16));
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let smiling = false;
  let lastCheerAt = 0;
  const CHEER_COOLDOWN_MS = 4000;

  const smileOn = () => {
    if (smiling) return;
    smiling = true;
    field.morphTo(smile);
    field.look.x = 0;
    field.look.y = 4;
    const now = Date.now();
    if (now - lastCheerAt >= CHEER_COOLDOWN_MS) {
      lastCheerAt = now;
      // TODO: to revisit sound effects during phase 2.
      // void playSfx("cheer");
    }
  };
  const smileOff = () => {
    smiling = false;
    field.morphTo(open);
  };

  document.querySelectorAll("[data-eyes-trigger]").forEach((el) => {
    el.addEventListener("pointerenter", smileOn);
    el.addEventListener("focus", smileOn);
    el.addEventListener("pointerleave", smileOff);
    el.addEventListener("blur", smileOff);
  });
}
