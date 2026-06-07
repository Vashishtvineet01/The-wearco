"use client";

import { forwardRef, type CSSProperties, type PointerEvent } from "react";
import type { ProductCategory } from "@/lib/products";
import type { CustomDesign } from "@/lib/types";

type Props = {
  category: ProductCategory;
  fabric: string;
  printArea?: { x: number; y: number; w: number; h: number };
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
 * SVG-based garment mockup. Avoids needing real product photos.
 *
 * The print area is a positioned overlay sized to the printable region,
 * inside which the design is rendered. The design wrapper is translated
 * by `posX/posY` (% of the wrapper / print area), so 50% means halfway
 * out of the print area horizontally — making drag math intuitive.
 */
const ProductMockup = forwardRef<HTMLDivElement, Props>(function ProductMockup(
  {
    category,
    fabric,
    printArea = { x: 30, y: 28, w: 40, h: 30 },
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
  const printStyle: CSSProperties = {
    left: `${printArea.x}%`,
    top: `${printArea.y}%`,
    width: `${printArea.w}%`,
    height: `${printArea.h}%`
  };

  const isLightFabric = isLight(fabric);

  const transform = design
    ? `translate(${design.posX}%, ${design.posY}%) scale(${design.scale}) rotate(${design.rotation}deg)`
    : undefined;

  const hasDesignContent = !!(design?.imageDataUrl || design?.text || printText);

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
        </defs>
        <rect width="400" height="400" fill="url(#bgGlow)" />
        {category === "tee" && <Tee fabric={fabric} />}
        {category === "hoodie" && <Hoodie fabric={fabric} />}
        {category === "cap" && <Cap fabric={fabric} />}
        {category === "sleeve" && <Tee fabric={fabric} />}
      </svg>

      <div
        ref={printAreaRef}
        className={`absolute select-none ${
          showPrintArea ? "ring-1 ring-dashed ring-white/20" : ""
        } ${interactive && hasDesignContent ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
        style={printStyle}
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
            {design?.imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={design.imageDataUrl}
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
                  position: design?.imageDataUrl ? "absolute" : "static",
                  bottom: design?.imageDataUrl ? "-1.6em" : undefined
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

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 160;
}

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
