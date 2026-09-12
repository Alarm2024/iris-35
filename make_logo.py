from PIL import Image, ImageDraw, ImageFont
import urllib.request
url = "https://35.elghaly.dev/IMG_5183.jpeg"
urllib.request.urlretrieve(url, "/tmp/base.jpg")
im = Image.open("/tmp/base.jpg").convert("RGB")
w, h = im.size
draw = ImageDraw.Draw(im)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", max(28, w // 32))
text = "IRIS"
gap = max(12, w // 80)
total = sum(draw.textbbox((0, 0), ch, font=font)[2] for ch in text) + gap * (len(text) - 1)
start = int(w * 0.285 - total / 2)
y = int(h * 0.905)
x = start
for ch in text:
    draw.text((x, y), ch, font=font, fill=(236, 238, 245))
    x += draw.textbbox((0, 0), ch, font=font)[2] + gap
im.save("_site/logo.jpg", "JPEG", quality=86, optimize=True)
