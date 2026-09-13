#!/usr/bin/env python3
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

src = "https://35.elghaly.dev/IMG_5183.jpeg"
out = Path("_site/lockup.jpg")
out.parent.mkdir(parents=True, exist_ok=True)
path = Path("_site/src-5183.jpg")
urllib.request.urlretrieve(src, path)
im = Image.open(path).convert("RGB")
w, h = im.size
src_y = int(h * 0.743)
for y in range(int(h * 0.752), int(h * 0.86)):
    for x in range(int(w * 0.02), int(w * 0.62)):
        sy = min(h - 1, src_y + ((x + y) // 17) % 3)
        im.putpixel((x, y), im.getpixel((x, sy)))
band = im.crop((int(w * 0.02), int(h * 0.752), int(w * 0.62), int(h * 0.86))).filter(ImageFilter.GaussianBlur(1.1))
im.paste(band, (int(w * 0.02), int(h * 0.752)))

font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
font = ImageFont.truetype(font_path, max(28, int(w * 0.024)))
draw = ImageDraw.Draw(im)

def tracked(text, cx, y, spacing):
    widths = []
    for ch in text:
        bb = font.getbbox(ch)
        widths.append(bb[2] - bb[0])
    total = sum(widths) + spacing * (len(text) - 1)
    x = int(cx - total / 2)
    for ch, cw in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=(243, 245, 251))
        x += cw + spacing

cx = int(w * 0.287)
tracked("IRIS", cx, int(h * 0.855), max(14, int(w * 0.014)))
tracked("\u2014  ELGHALY  \u2014", cx, int(h * 0.905), max(6, int(w * 0.006)))
im.save(out, "JPEG", quality=90, optimize=True)
print("wrote", out, out.stat().st_size)
