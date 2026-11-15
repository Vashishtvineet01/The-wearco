import type { PrintShape, ProductCategory } from "./products";
import type { CustomDesign } from "./types";

/**
 * Render a product mockup + custom design to a PNG data URL.
 *
 * We rebuild the garment in a 2D canvas using the same paths as the
 * SVG ProductMockup, then composite the user's text/image on top.
 * Shape-aware: circle prints get a circular clip, posters fill the frame.
 */
export async function renderMockupToDataURL(opts: {
  category: ProductCategory;
  fabric: string;
  printArea: { x: number; y: number; w: number; h: number };
  printShape?: PrintShape;
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
    printShape = "rect",
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

  // Draw garment
  ctx.save();
  ctx.scale(scale, scale);
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

  // Clip to shape before rendering design
  if (printShape === "circle") {
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    const r = Math.min(pw, ph) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
  }
  // (rect/cylinder/full → no clip, design is unconstrained within bounds)

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

    // For circle / badge prints, inscribe the image inside a circle
    const boundW = printShape === "circle" ? Math.min(pw, ph) : pw;
    const boundH = printShape === "circle" ? Math.min(pw, ph) : ph;

    let dw = boundW;
    let dh = boundW / ar;
    if (dh > boundH) {
      dh = boundH;
      dw = boundH * ar;
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
    const maxW = printShape === "circle" ? Math.min(pw, ph) * 0.8 : pw * 0.95;
    wrapText(ctx, text, 0, yOffset, maxW, fontSize * 1.05);
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

/**
 * Canvas paths mirror the SVG garments in ProductMockup. Not pixel-perfect
 * (no gradients, no clipPath) but close enough for an exported mockup.
 */
function getGarmentPaths(category: ProductCategory): GarmentPath[] {
  switch (category) {
    case "tee":
    case "sleeve":
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

    case "hoodie":
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

    case "sweatshirt":
      return [
        {
          d: "M70 125 L130 80 Q155 65 200 65 Q245 65 270 80 L330 125 L310 195 L280 185 L280 345 Q280 355 270 355 L130 355 Q120 355 120 345 L120 185 L90 195 Z",
          fill: "fabric",
          stroke: "rgba(0,0,0,0.4)"
        },
        {
          d: "M165 95 Q200 115 235 95 Q235 85 200 85 Q165 85 165 95 Z",
          fill: "rgba(0,0,0,0.25)"
        },
        // ribbed hem
        {
          d: "M120 340 L280 340 L280 355 L120 355 Z",
          fill: "rgba(0,0,0,0.18)"
        }
      ];

    case "cap":
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

    case "mug":
      return [
        // handle (drawn first so body covers inner edge)
        {
          d: "M280 170 Q340 170 340 230 Q340 290 280 290",
          stroke: "fabric",
          strokeWidth: 18
        },
        // body
        {
          d: "M100 148 L100 320 Q100 332 114 332 L266 332 Q280 332 280 320 L280 148 Z",
          fill: "fabric",
          stroke: "rgba(0,0,0,0.4)"
        },
        // rim darkening
        {
          d: "M100 148 L280 148",
          stroke: "rgba(0,0,0,0.35)",
          strokeWidth: 2
        }
      ];

    case "badge":
      return [
        // pin clip
        {
          d: "M194 80 L206 80 L206 100 L194 100 Z",
          fill: "#888"
        },
        // badge body (circle via arc path)
        {
          d: "M70 220 A 130 130 0 1 1 330 220 A 130 130 0 1 1 70 220 Z",
          fill: "fabric",
          stroke: "rgba(0,0,0,0.4)",
          strokeWidth: 2
        }
      ];

    case "poster":
      return [
        // shadow
        {
          d: "M42 42 L362 42 L362 362 L42 362 Z",
          fill: "rgba(0,0,0,0.35)"
        },
        // paper
        {
          d: "M38 38 L358 38 L358 358 L38 358 Z",
          fill: "fabric",
          stroke: "rgba(0,0,0,0.4)"
        }
      ];

    default:
      return [];
  }
}

export function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
