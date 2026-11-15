#!/usr/bin/env python3
"""Generate the TheWearCo Android launcher icon at every required density.

Reproduces the web header logo: a rounded square with the aurora gradient
(violet → coral → lime) and a stacked-diamond glyph in dark midnight.
Outputs ic_launcher.png for every mipmap bucket + a 1024 source.
"""
from __future__ import annotations

import os
from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android" / "app" / "src" / "main" / "res"

# Android mipmap buckets: (bucket name, pixel size)
# mdpi = 48, hdpi = 72, xhdpi = 96, xxhdpi = 144, xxxhdpi = 192, Play Store = 512, source = 1024
BUCKETS: list[tuple[str, int]] = [
    ("mipmap-mdpi", 48),
    ("mipmap-hdpi", 72),
    ("mipmap-xhdpi", 96),
    ("mipmap-xxhdpi", 144),
    ("mipmap-xxxhdpi", 192),
]

# Aurora palette (matches tailwind.config.ts)
VIOLET = (124, 92, 255)
CORAL = (255, 92, 59)
LIME = (216, 255, 54)
MIDNIGHT = (11, 10, 20)


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def three_stop_gradient(width: int, height: int) -> Image.Image:
    """Diagonal violet → coral → lime gradient, pixel accurate."""
    grad = Image.new("RGB", (width, height))
    px = grad.load()
    # Diagonal gradient: progress = (x + y) / (w + h)
    max_sum = (width - 1) + (height - 1)
    for y in range(height):
        for x in range(width):
            t = (x + y) / max_sum
            if t < 0.5:
                color = lerp(VIOLET, CORAL, t * 2)
            else:
                color = lerp(CORAL, LIME, (t - 0.5) * 2)
            px[x, y] = color
    return grad


def make_icon(size: int) -> Image.Image:
    """Compose the icon at the given pixel size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # 1. Rounded square with aurora gradient
    radius = int(size * 0.22)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=radius, fill=255
    )
    gradient = three_stop_gradient(size, size).convert("RGBA")
    img.paste(gradient, (0, 0), mask)

    # 2. Stacked-diamond glyph in midnight (same as web navbar logo)
    # SVG original: M3 7l9-5 9 5-9 5-9-5z M3 12l9 5 9-5 M3 17l9 5 9-5 on a 24-unit grid
    scale = size / 24
    stroke_w = max(2, int(2.2 * scale))

    def pt(x: float, y: float) -> tuple[float, float]:
        return (x * scale, y * scale)

    draw = ImageDraw.Draw(img)
    midnight_rgba = (*MIDNIGHT, 230)

    # Diamond lid (filled)
    diamond = [pt(3, 7), pt(12, 2), pt(21, 7), pt(12, 12)]
    draw.polygon(diamond, fill=midnight_rgba)

    # Middle fold line
    draw.line([pt(3, 12), pt(12, 17), pt(21, 12)],
              fill=midnight_rgba, width=stroke_w, joint="curve")

    # Bottom fold line
    draw.line([pt(3, 17), pt(12, 22), pt(21, 17)],
              fill=midnight_rgba, width=stroke_w, joint="curve")

    return img


def main() -> None:
    assets_dir = ROOT / "assets" / "icon"
    assets_dir.mkdir(parents=True, exist_ok=True)

    # 1024 source — committed, used by flutter_launcher_icons if we ever add it
    source = make_icon(1024)
    source.save(assets_dir / "app_icon.png", "PNG")
    print(f"✓  wrote {assets_dir / 'app_icon.png'}  (1024x1024)")

    # Each density bucket
    for bucket, size in BUCKETS:
        icon = make_icon(size)
        out = RES / bucket / "ic_launcher.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        icon.save(out, "PNG")
        print(f"✓  wrote {out}  ({size}x{size})")

    print("\nDone. Rebuild APK with: ./build-apk.sh <API_BASE_URL>")


if __name__ == "__main__":
    main()
