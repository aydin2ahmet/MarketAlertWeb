"""Generate previews and responsive delivery files; preserve originals (Pillow)."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1] / "public" / "shots"
sources = [p for p in root.rglob("*.webp") if not p.name.endswith(".preview.webp") and ".sharp-" not in p.name and p.name != "hero.webp"]


def generate(source):
    with Image.open(source) as image:
        preview = image.convert("RGB")
        preview.thumbnail((160, 600), Image.Resampling.LANCZOS)
        target = source.with_name(source.stem + ".preview.webp")
        preview.save(target, "WEBP", quality=25, method=6)
        delivery_bytes = 0
        for label, width in [("360", 360), ("720", 720), ("full", image.width)]:
            delivery = image.convert("RGB").resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            delivery_target = source.with_name(source.stem + f".sharp-{label}.webp")
            delivery.save(delivery_target, "WEBP", quality=95, method=6)
            delivery_bytes += delivery_target.stat().st_size
        return source.stat().st_size, target.stat().st_size, delivery_bytes


with ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(generate, sources))

print(f"Generated {len(sizes)} previews and {len(sizes) * 3} responsive files; originals {sum(s[0] for s in sizes):,} bytes, previews {sum(s[1] for s in sizes):,} bytes, responsive {sum(s[2] for s in sizes):,} bytes.")
