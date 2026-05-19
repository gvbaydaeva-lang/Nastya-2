#!/usr/bin/env python3
"""Extract laptop / notebook / pen cutouts from directions-workspace.jpg."""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "directions-workspace.jpg"
OUT = ROOT / "assets" / "directions"
OUT.mkdir(parents=True, exist_ok=True)

# Crops for 1200×1600 source (x1, y1, x2, y2)
CROPS = {
    "directions-laptop": (480, 90, 1185, 620),
    "directions-notebook": (368, 530, 808, 1365),
    "directions-pen": (308, 655, 358, 1045),
}


def _edge_bg_samples(img: Image.Image) -> list[tuple[int, int, int]]:
    w, h = img.size
    px = img.load()
    samples: list[tuple[int, int, int]] = []
    step = max(1, min(w, h) // 24)
    for x in range(0, w, step):
        samples.append(px[x, 2][:3])
        samples.append(px[x, h - 3][:3])
    for y in range(0, h, step):
        samples.append(px[2, y][:3])
        samples.append(px[w - 3, y][:3])
    return samples


def bg_alpha(img: Image.Image, tol: int = 42, soften: int = 28) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    samples = _edge_bg_samples(img)
    bg = tuple(sum(s[i] for s in samples) // len(samples) for i in range(3))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            chroma = max(r, g, b) - min(r, g, b)
            dist = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])

            # Keep ink, pen, deep shadows
            if lum < 62 or (lum < 95 and chroma < 28):
                alpha = 255
            elif dist < tol:
                alpha = 0
            elif dist < tol + soften:
                alpha = int(255 * (dist - tol) / soften)
            else:
                alpha = 255

            # Fade very light speckled table inside crop
            if lum > 210 and chroma < 35:
                alpha = min(alpha, int(255 * (235 - lum) / 25))

            px[x, y] = (r, g, b, min(a, max(0, alpha)))

    return img.filter(ImageFilter.GaussianBlur(radius=0.5))


def main() -> None:
    source = Image.open(SRC)
    for name, box in CROPS.items():
        crop = source.crop(box)
        cut = bg_alpha(crop)
        cut.save(OUT / f"{name}.webp", "WEBP", quality=92, method=6)
        cut.save(OUT / f"{name}.png", "PNG")
        print(f"Wrote {name} ({cut.size[0]}×{cut.size[1]})")


if __name__ == "__main__":
    main()
