"""Generate lightweight previews from the original screenshots (requires Pillow)."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1] / "public" / "shots"
sources = [p for p in root.rglob("*.webp") if not p.name.endswith(".preview.webp") and p.name != "hero.webp"]


def generate(source):
    with Image.open(source) as image:
        preview = image.convert("RGB")
        preview.thumbnail((160, 600), Image.Resampling.LANCZOS)
        target = source.with_name(source.stem + ".preview.webp")
        preview.save(target, "WEBP", quality=25, method=6)
        return source.stat().st_size, target.stat().st_size


with ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(generate, sources))

print(f"Generated {len(sizes)} previews; originals {sum(s[0] for s in sizes):,} bytes, previews {sum(s[1] for s in sizes):,} bytes.")
