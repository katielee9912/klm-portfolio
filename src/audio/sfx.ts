// TODO: to revisit sound effects during phase 2.

const STORAGE_KEY = "klm-muted";

const clips = {
  developer: "/sfx/bubble-300.wav",
  strategist: "/sfx/bubble-200.wav",
  designer: "/sfx/bubble-100.wav",
  shopify: "/sfx/bubble-400.wav",
  cheer: "/sfx/cheer.wav",
  menuUp: "/sfx/menu-up.wav",
  menuDown: "/sfx/menu-down.wav",
} as const;

export type SfxId = keyof typeof clips;

const buffers = new Map<string, AudioBuffer>();
let context: AudioContext | null = null;
let muted = false;

function getContext() {
  if (!context) {
    context = new AudioContext();
  }
  return context;
}

async function loadBuffer(id: SfxId) {
  const cached = buffers.get(id);
  if (cached) return cached;
  const src = clips[id];
  if (!src) return null;
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audio = await getContext().decodeAudioData(arrayBuffer);
  buffers.set(id, audio);
  return audio;
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
}

export function initMuteFromStorage() {
  muted = localStorage.getItem(STORAGE_KEY) === "1";
  return muted;
}

export async function playSfx(id: SfxId) {
  if (muted) return;
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") await ctx.resume();
    const buffer = await loadBuffer(id);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // Audio is optional; ignore decode/autoplay failures.
  }
}

export function bindVolumeControl(button: HTMLButtonElement) {
  const sync = () => {
    button.setAttribute("aria-pressed", muted ? "true" : "false");
    button.setAttribute("aria-label", muted ? "Unmute sound effects" : "Mute sound effects");
  };
  initMuteFromStorage();
  sync();
  button.addEventListener("click", () => {
    setMuted(!muted);
    sync();
  });
}
