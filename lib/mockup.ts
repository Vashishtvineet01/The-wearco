import type { ProductCategory } from "./products";
import type { CustomDesign } from "./types";

/**
 * Render a product mockup + custom design to a PNG data URL.
 *
 * We rebuild the garment in a 2D canvas using the same paths as the
 * SVG ProductMockup, then composite the user's text/image on top.
 * This keeps the export self-contained — no html-to-image dependency.
 */
export async function renderMockupToDataURL(opts: {
  category: ProductCategory;
  fabric: string;
  printArea: { x: number; y: number; w: number; h: number };
  design?: CustomDesign | null;
  printText?: string;
  printColor?: string;
  size?: number;
  background?: string;
}): Promise<string> {
  const {
    category,
    fabric,
    printArea,
    design,
    printText,
    printColor,
    size = 1200,
    background = "transparent"
  } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable");

  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }

  const scale = size / 400; // mockup viewBox is 400x400

  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = fabric;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  for (const path of getGarmentPaths(category)) {
    const p = new Path2D(path.d);
    if (path.fill) {
      ctx.fillStyle = path.fill === "fabric" ? fabric : path.fill;
      ctx.fill(p);
    }
    if (path.stroke) {
      ctx.strokeStyle = path.stroke;
      ctx.lineWidth = path.strokeWidth ?? 1;
      ctx.stroke(p);
    }
  }
  ctx.restore();

  // Print area in canvas coordinates
  const px = (printArea.x / 100) * size;
  const py = (printArea.y / 100) * size;
  const pw = (printArea.w / 100) * size;
  const ph = (printArea.h / 100) * size;

  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);

  const posX = (design?.posX ?? 0) / 100;
  const posY = (design?.posY ?? 0) / 100;
  ctx.translate(posX * pw, posY * ph);
  ctx.rotate(((design?.rotation ?? 0) * Math.PI) / 180);
  const s = design?.scale ?? 1;
  ctx.scale(s, s);

  let imgHeight = 0;
  const designSrc = design?.imageUrl || design?.imageDataUrl;
  if (designSrc) {
    const img = await loadImage(designSrc);
    const ar = img.width / Math.max(1, img.height);
    let dw = pw;
    let dh = pw / ar;
    if (dh > ph) {
      dh = ph;
      dw = ph * ar;
    }
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    imgHeight = dh;
  }

  const text = design?.text || printText;
  if (text) {
    const fontSize = Math.max(20, Math.min(pw * 0.12, 90));
    const family = design?.font || "'Space Grotesk', Inter, sans-serif";
    ctx.font = `700 ${fontSize}px ${family}`;
    ctx.fillStyle =
      design?.textColor || printColor || (isLight(fabric) ? "#0a0a0a" : "#f7f7f7");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const yOffset = imgHeight ? imgHeight / 2 + fontSize : 0;
    wrapText(ctx, text, 0, yOffset, pw * 0.95, fontSize * 1.05);
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const totalH = lines.length * lineHeight;
  const startY = y - totalH / 2 + lineHeight / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

type GarmentPath = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

function getGarmentPaths(category: ProductCategory): GarmentPath[] {
  if (category === "tee") {
    return [
      {
        d: "M80 110 L140 70 L160 90 Q200 110 240 90 L260 70 L320 110 L300 170 L270 160 L270 340 Q270 350 260 350 L140 350 Q130 350 130 340 L130 160 L100 170 Z",
        fill: "fabric",
        stroke: "rgba(0,0,0,0.4)"
      },
      {
        d: "M160 90 Q200 115 240 90",
        stroke: "rgba(0,0,0,0.35)",
        strokeWidth: 2
      }
    ];
  }
  if (category === "hoodie") {
    return [
      {
        d: "M70 130 L130 80 Q150 60 200 60 Q250 60 270 80 L330 130 L310 200 L280 190 L280 350 Q280 360 270 360 L130 360 Q120 360 120 350 L120 190 L90 200 Z",
        fill: "fabric",
        stroke: "rgba(0,0,0,0.4)"
      },
      {
        d: "M150 90 Q200 40 250 90 Q230 70 200 70 Q170 70 150 90 Z",
        fill: "fabric",
        stroke: "rgba(0,0,0,0.4)"
      },
      {
        d: "M150 230 L250 230 L260 290 L140 290 Z",
        stroke: "rgba(0,0,0,0.3)",
        strokeWidth: 1.2
      }
    ];
  }
  // cap (or sleeve fallback)
  return [
    {
      d: "M90 240 Q200 290 310 240 L320 260 Q200 320 80 260 Z",
      fill: "fabric",
      stroke: "rgba(0,0,0,0.4)"
    },
    {
      d: "M120 240 Q120 130 200 130 Q280 130 280 240 Z",
      fill: "fabric",
      stroke: "rgba(0,0,0,0.4)"
    },
    {
      d: "M200 130 L200 240",
      stroke: "rgba(0,0,0,0.2)"
    }
  ];
}

export function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
