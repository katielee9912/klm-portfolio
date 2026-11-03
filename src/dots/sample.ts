export type SampledDot = {
  x: number;
  y: number;
  color: string;
};

type SampleOptions = {
  step?: number;
  minAlpha?: number;
  minLuma?: number;
  maxDots?: number;
  circular?: boolean;
  forceColor?: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function sampleImage(
  src: string,
  width: number,
  height: number,
  options: SampleOptions = {},
): Promise<SampledDot[]> {
  const {
    step = 6,
    minAlpha = 40,
    minLuma = 18,
    maxDots = 1400,
    circular = false,
    forceColor,
  } = options;

  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) * 0.98;
  const dots: SampledDot[] = [];

  for (let y = step / 2; y < canvas.height; y += step) {
    for (let x = step / 2; x < canvas.width; x += step) {
      if (circular) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > radius * radius) continue;
      }
      const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
      const a = data[i + 3];
      if (a < minAlpha) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luma < minLuma && a < 200) continue;
      const color = forceColor ?? `rgb(${r}, ${g}, ${b})`;
      dots.push({ x, y, color });
    }
  }

  if (dots.length <= maxDots) return dots;
  const picked: SampledDot[] = [];
  const stride = dots.length / maxDots;
  for (let i = 0; i < maxDots; i += 1) {
    picked.push(dots[Math.floor(i * stride)]);
  }
  return picked;
}

export function blobDots(
  count: number,
  width: number,
  height: number,
  color: string,
): SampledDot[] {
  const dots: SampledDot[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    dots.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      color,
    });
  }
  return dots;
}

export function smileDots(width: number, height: number, count: number, color: string): SampledDot[] {
  const dots: SampledDot[] = [];
  const perEye = Math.floor(count / 2);
  const eyes = [
    { cx: width * 0.28, cy: height * 0.48 },
    { cx: width * 0.72, cy: height * 0.48 },
  ];
  eyes.forEach((eye) => {
    for (let i = 0; i < perEye; i += 1) {
      const t = i / Math.max(1, perEye - 1);
      const x = eye.cx + (t - 0.5) * width * 0.28;
      const y = eye.cy + Math.sin(t * Math.PI) * height * 0.16;
      dots.push({ x, y, color });
    }
  });
  return dots;
}
