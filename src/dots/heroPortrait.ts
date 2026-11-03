const MAX_SHIFT = 22;
const FOLLOW = 0.075;
const LIGHT_RADIUS = 0.48;

export function initHeroPortrait() {
  const root = document.querySelector<HTMLElement>("[data-hero-portrait]");
  const canvas = root?.querySelector("canvas");
  const track = root?.querySelector<HTMLElement>("[data-hero-track]");
  if (!root || !canvas || !track) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const photo = new Image();
  photo.src = "/images/portrait.jpg";

  const grey = document.createElement("canvas");
  const greyCtx = grey.getContext("2d");
  if (!greyCtx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;
  let lightOn = false;
  let shiftX = 0;
  let shiftY = 0;
  let targetX = 0;
  let targetY = 0;
  let ready = false;

  const resize = () => {
    const size = Math.round(track.getBoundingClientRect().width);
    if (size <= 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = size;
    height = size;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    grey.width = canvas.width;
    grey.height = canvas.height;
    if (photo.complete && photo.naturalWidth) paintGrey();
  };

  const paintGrey = () => {
    greyCtx.setTransform(1, 0, 0, 1, 0, 0);
    greyCtx.clearRect(0, 0, grey.width, grey.height);
    greyCtx.filter = "grayscale(1)";
    greyCtx.drawImage(photo, 0, 0, grey.width, grey.height);
    greyCtx.filter = "none";
    ready = true;
  };

  const pointerFromEvent = (event: PointerEvent) => {
    const canvasRect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - canvasRect.left) / canvasRect.width) * width;
    pointerY = ((event.clientY - canvasRect.top) / canvasRect.height) * height;

    const rect = root.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - dist / (rect.width * 0.72));
    targetX = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dx * 0.12)) * influence;
    targetY = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dy * 0.12)) * influence;
  };

  const tick = () => {
    shiftX += (targetX - shiftX) * FOLLOW;
    shiftY += (targetY - shiftY) * FOLLOW;
    track.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(1.08)`;

    if (ready) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(grey, 0, 0, width, height);

      if (lightOn) {
        const radius = width * LIGHT_RADIUS;
        const gradient = ctx.createRadialGradient(
          pointerX,
          pointerY,
          radius * 0.12,
          pointerX,
          pointerY,
          radius,
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.75)");
        gradient.addColorStop(0.72, "rgba(0, 0, 0, 0.28)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    requestAnimationFrame(tick);
  };

  photo.addEventListener("load", () => {
    resize();
    paintGrey();
  });
  if (photo.complete) {
    resize();
    paintGrey();
  }

  root.addEventListener("pointerenter", (event) => {
    pointerFromEvent(event);
    lightOn = true;
  });
  root.addEventListener("pointermove", (event) => {
    pointerFromEvent(event);
    lightOn = true;
  });
  root.addEventListener("pointerdown", (event) => {
    root.setPointerCapture(event.pointerId);
    pointerFromEvent(event);
    lightOn = true;
  });
  root.addEventListener("pointerup", () => {
    lightOn = false;
  });
  root.addEventListener("pointercancel", () => {
    lightOn = false;
    targetX = 0;
    targetY = 0;
  });
  root.addEventListener("pointerleave", () => {
    lightOn = false;
    targetX = 0;
    targetY = 0;
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
}
