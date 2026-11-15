"use client";

import { forwardRef, type CSSProperties, type PointerEvent } from "react";
import type { PrintShape, ProductCategory } from "@/lib/products";
import type { CustomDesign } from "@/lib/types";

type Props = {
  category: ProductCategory;
  fabric: string;
  printArea?: { x: number; y: number; w: number; h: number };
  /** Shape of the printable region. Defaults to "rect" for backwards compat. */
  printShape?: PrintShape;
  design?: CustomDesign | null;
  printText?: string;
  printColor?: string;
  className?: string;
  showPrintArea?: boolean;
  /** When true the print-area accepts pointer events (used by the design studio for drag). */
  interactive?: boolean;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
  printAreaRef?: React.RefObject<HTMLDivElement>;
};

/**
 * SVG-based product mockup. Avoids needing real product photos.
 *
 * The print area is a positioned overlay sized to the printable region,
 * inside which the design is rendered. The design wrapper is translated
 * by `posX/posY` (% of the wrapper / print area), so 50% means halfway
 * out of the print area horizontally — making drag math intuitive.
 *
 * `printShape` controls how the overlay is clipped:
 *   - "rect"     → no clip (the default)
 *   - "circle"   → circular clip (for badges / pins)
 *   - "cylinder" → rectangular overlay with slight horizontal curvature
 *   - "full"     → overlay fills the entire mockup face (for posters)
 */
const ProductMockup = forwardRef<HTMLDivElement, Props>(function ProductMockup(
  {
    category,
    fabric,
    printArea,
    printShape = "rect",
    design,
    printText,
    printColor = "#f7f7f7",
    className = "",
    showPrintArea = false,
    interactive = false,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    printAreaRef
  },
  ref
) {
  const resolvedArea = printArea ?? defaultPrintAreaFor(category);
  const printStyle: CSSProperties = {
    left: `${resolvedArea.x}%`,
    top: `${resolvedArea.y}%`,
    width: `${resolvedArea.w}%`,
    height: `${resolvedArea.h}%`
  };

  const isLightFabric = isLight(fabric);

  const transform = design
    ? `translate(${design.posX}%, ${design.posY}%) scale(${design.scale}) rotate(${design.rotation}deg)`
    : undefined;

  const designImage = design?.imageUrl || design?.imageDataUrl;
  const hasDesignContent = !!(designImage || design?.text || printText);

  // Shape-specific overlay styling
  const shapeClass =
    printShape === "circle"
      ? "rounded-full"
      : printShape === "cylinder"
        ? "rounded-md"
        : "";

  const shapeRing =
    showPrintArea && printShape === "circle"
      ? "ring-1 ring-dashed ring-white/20 rounded-full"
      : showPrintArea
        ? "ring-1 ring-dashed ring-white/20"
        : "";

  // Cylinder wrap — slight horizontal squeeze to suggest curvature
  const extraOverlayStyle: CSSProperties =
    printShape === "cylinder"
      ? {
          transform: "perspective(600px) rotateY(-6deg)",
          transformOrigin: "center"
        }
      : {};

  return (
    <div ref={ref} className={`relative aspect-square w-full ${className}`}>
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="fabricShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </linearGradient>
          <linearGradient id="mugShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="20%" stopColor="rgba(0,0,0,0)" />
            <stop offset="80%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bgGlow)" />
        {renderGarment(category, fabric)}
      </svg>

      <div
        ref={printAreaRef}
        className={`absolute select-none ${shapeClass} ${shapeRing} ${
          interactive && hasDesignContent
            ? "cursor-grab active:cursor-grabbing"
            : "pointer-events-none"
        }`}
        style={{
          ...printStyle,
          ...extraOverlayStyle,
          overflow: printShape === "circle" ? "hidden" : undefined
        }}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? onPointerUp : undefined}
        onPointerCancel={interactive ? onPointerUp : undefined}
      >
        {hasDesignContent && (
          <div
            className="flex h-full w-full items-center justify-center overflow-visible"
            style={{ transform, transformOrigin: "center" }}
          >
            {designImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={designImage}
                alt="Custom design"
                draggable={false}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
              />
            ) : null}
            {(design?.text || printText) && (
              <div
                className="text-center font-display font-bold leading-none"
                style={{
                  color:
                    design?.textColor ||
                    printColor ||
                    (isLightFabric ? "#0a0a0a" : "#f7f7f7"),
                  fontFamily: design?.font || "'Space Grotesk', Inter, sans-serif",
                  fontSize: "clamp(14px, 3vw, 32px)",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                  position: designImage ? "absolute" : "static",
                  bottom: designImage ? "-1.6em" : undefined
                }}
              >
                {design?.text || printText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductMockup;

/** Default print areas tuned for each category when the product doesn't specify one. */
function defaultPrintAreaFor(category: ProductCategory) {
  switch (category) {
    case "hoodie":
      return { x: 32, y: 32, w: 36, h: 28 };
    case "sweatshirt":
      return { x: 30, y: 32, w: 40, h: 28 };
    case "cap":
      return { x: 30, y: 35, w: 40, h: 18 };
    case "mug":
      return { x: 25, y: 38, w: 44, h: 28 };
    case "badge":
      return { x: 28, y: 28, w: 44, h: 44 };
    case "poster":
      return { x: 14, y: 14, w: 72, h: 72 };
    case "tee":
    case "sleeve":
    default:
      return { x: 30, y: 28, w: 40, h: 30 };
  }
}

function renderGarment(category: ProductCategory, fabric: string) {
  switch (category) {
    case "hoodie":
      return <Hoodie fabric={fabric} />;
    case "sweatshirt":
      return <Sweatshirt fabric={fabric} />;
    case "cap":
      return <Cap fabric={fabric} />;
    case "mug":
      return <Mug fabric={fabric} />;
    case "badge":
      return <Badge fabric={fabric} />;
    case "poster":
      return <Poster fabric={fabric} />;
    case "tee":
    case "sleeve":
    default:
      return <Tee fabric={fabric} />;
  }
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 160;
}

/* --------------------------- Garments (SVG) --------------------------- */

function Tee({ fabric }: { fabric: string }) {
  return (
    <g>
      <path
        d="M80 110 L140 70 L160 90 Q200 110 240 90 L260 70 L320 110 L300 170 L270 160 L270 340 Q270 350 260 350 L140 350 Q130 350 130 340 L130 160 L100 170 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
      />
      <path
        d="M80 110 L140 70 L160 90 Q200 110 240 90 L260 70 L320 110 L300 170 L270 160 L270 340 Q270 350 260 350 L140 350 Q130 350 130 340 L130 160 L100 170 Z"
        fill="url(#fabricShade)"
      />
      <path
        d="M160 90 Q200 115 240 90"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="2"
      />
      <path
        d="M138 350 L138 165"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M262 350 L262 165"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
    </g>
  );
}

function Hoodie({ fabric }: { fabric: string }) {
  return (
    <g>
      <path
        d="M70 130 L130 80 Q150 60 200 60 Q250 60 270 80 L330 130 L310 200 L280 190 L280 350 Q280 360 270 360 L130 360 Q120 360 120 350 L120 190 L90 200 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
      />
      <path
        d="M70 130 L130 80 Q150 60 200 60 Q250 60 270 80 L330 130 L310 200 L280 190 L280 350 Q280 360 270 360 L130 360 Q120 360 120 350 L120 190 L90 200 Z"
        fill="url(#fabricShade)"
      />
      <path
        d="M150 90 Q200 40 250 90 Q230 70 200 70 Q170 70 150 90 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
      />
      <path
        d="M150 90 Q200 40 250 90"
        fill="url(#fabricShade)"
        opacity="0.6"
      />
      <line x1="190" y1="100" x2="188" y2="160" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="210" y1="100" x2="212" y2="160" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="188" cy="162" r="2" fill="#aaa" />
      <circle cx="212" cy="162" r="2" fill="#aaa" />
      <path
        d="M150 230 L250 230 L260 290 L140 290 Z"
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1.2"
      />
    </g>
  );
}

function Sweatshirt({ fabric }: { fabric: string }) {
  // Like a hoodie but without the hood — crew neck, ribbed cuffs/hem
  return (
    <g>
      <path
        d="M70 125 L130 80 Q155 65 200 65 Q245 65 270 80 L330 125 L310 195 L280 185 L280 345 Q280 355 270 355 L130 355 Q120 355 120 345 L120 185 L90 195 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
      />
      <path
        d="M70 125 L130 80 Q155 65 200 65 Q245 65 270 80 L330 125 L310 195 L280 185 L280 345 Q280 355 270 355 L130 355 Q120 355 120 345 L120 185 L90 195 Z"
        fill="url(#fabricShade)"
      />
      {/* crew neck rib */}
      <path
        d="M165 95 Q200 115 235 95 Q235 85 200 85 Q165 85 165 95 Z"
        fill="rgba(0,0,0,0.25)"
      />
      {/* hem rib */}
      <rect x="120" y="340" width="160" height="15" fill="rgba(0,0,0,0.18)" />
      {/* cuff ribs */}
      <path d="M90 195 L120 185 L125 215 L95 220 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M310 195 L280 185 L275 215 L305 220 Z" fill="rgba(0,0,0,0.2)" />
    </g>
  );
}

function Cap({ fabric }: { fabric: string }) {
  return (
    <g>
      <path
        d="M90 240 Q200 290 310 240 L320 260 Q200 320 80 260 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
      />
      <path
        d="M120 240 Q120 130 200 130 Q280 130 280 240 Z"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
      />
      <path
        d="M120 240 Q120 130 200 130 Q280 130 280 240 Z"
        fill="url(#fabricShade)"
      />
      <line x1="200" y1="130" x2="200" y2="240" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <path d="M160 240 Q160 150 200 130" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
      <path d="M240 240 Q240 150 200 130" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
      <circle cx="200" cy="135" r="3" fill={fabric} stroke="rgba(0,0,0,0.4)" />
    </g>
  );
}

function Mug({ fabric }: { fabric: string }) {
  // Side view of a cylindrical mug with a handle on the right
  return (
    <g>
      {/* body */}
      <rect
        x="100"
        y="130"
        width="180"
        height="200"
        rx="14"
        ry="18"
        fill={fabric}
        stroke="rgba(0,0,0,0.4)"
      />
      {/* horizontal curvature shading */}
      <rect x="100" y="130" width="180" height="200" rx="14" ry="18" fill="url(#mugShade)" />
      {/* inner top ellipse (opening) */}
      <ellipse cx="190" cy="132" rx="90" ry="14" fill="rgba(0,0,0,0.35)" />
      <ellipse cx="190" cy="130" rx="90" ry="12" fill={fabric} stroke="rgba(0,0,0,0.3)" />
      {/* bottom ellipse (base) */}
      <ellipse cx="190" cy="330" rx="86" ry="10" fill="rgba(0,0,0,0.25)" />
      {/* handle */}
      <path
        d="M280 170 Q340 170 340 230 Q340 290 280 290"
        fill="none"
        stroke={fabric}
        strokeWidth="18"
      />
      <path
        d="M280 170 Q340 170 340 230 Q340 290 280 290"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1"
      />
    </g>
  );
}

function Badge({ fabric }: { fabric: string }) {
  // Circular enamel pin with a small pin clip at the top
  return (
    <g>
      {/* pin clip */}
      <rect x="194" y="80" width="12" height="20" rx="3" fill="#888" />
      <circle cx="200" cy="96" r="7" fill="#888" />
      {/* badge body */}
      <circle cx="200" cy="220" r="130" fill={fabric} stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
      <circle cx="200" cy="220" r="130" fill="url(#fabricShade)" />
      {/* subtle inner bevel */}
      <circle cx="200" cy="220" r="118" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* specular highlight */}
      <ellipse
        cx="160"
        cy="170"
        rx="42"
        ry="18"
        fill="rgba(255,255,255,0.12)"
        transform="rotate(-30 160 170)"
      />
    </g>
  );
}

function Poster({ fabric }: { fabric: string }) {
  // Flat poster with a thin frame + subtle drop shadow
  return (
    <g>
      {/* shadow */}
      <rect x="42" y="42" width="320" height="320" fill="rgba(0,0,0,0.4)" />
      {/* paper */}
      <rect x="38" y="38" width="320" height="320" fill={fabric} stroke="rgba(0,0,0,0.4)" />
      <rect x="38" y="38" width="320" height="320" fill="url(#fabricShade)" />
      {/* inner paper border */}
      <rect
        x="48"
        y="48"
        width="300"
        height="300"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeDasharray="2 3"
      />
    </g>
  );
}
