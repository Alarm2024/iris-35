#!/usr/bin/env python3
"""Draw the IRIS mark as PNG icons for the manifest and the iOS home screen.

Same shapes as favicon.svg: a dark rounded square, a cyan iris, a dark pupil.
Drawn with Pillow so the Pages build needs no SVG rasteriser.
"""
from pathlib import Path

from PIL import Image, ImageDraw

BG = (5, 1, 12)
CYAN = (25, 251, 255)
OUT = Path("_site")
SS = 4  # supersample, then downscale for clean edges


def draw_mark(size, pad_ratio, rounded):
    s = size * SS
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, s - 1, s - 1], fill=BG)

    cx = cy = s / 2
    rx = s * (0.5 - pad_ratio)
    ry = rx * 0.5
    w = max(2, int(s * 0.05))
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=CYAN, width=w)
    pr = rx * 0.27
    d.ellipse([cx - pr, cy - pr, cx + pr, cy + pr], fill=CYAN)
    ir = pr * 0.4
    d.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=BG)
    return im.resize((size, size), Image.LANCZOS)


def save(im, name):
    OUT.mkdir(parents=True, exist_ok=True)
    flat = Image.new("RGB", im.size, BG)
    flat.paste(im, mask=im.split()[3])
    flat.save(OUT / name, "PNG", optimize=True)
    print("wrote", OUT / name)


if __name__ == "__main__":
    save(draw_mark(192, 0.10, True), "icon-192.png")
    save(draw_mark(512, 0.10, True), "icon-512.png")
    # Maskable icons get cropped to a circle by Android: keep the mark well inside.
    save(draw_mark(512, 0.22, False), "icon-maskable-512.png")
