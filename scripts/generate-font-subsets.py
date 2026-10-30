"""Keep the existing variable fonts; split out five extended Turkish glyphs (fontTools[woff])."""
from pathlib import Path
import shutil

from fontTools import subset
from fontTools.ttLib import TTFont


root = Path(__file__).resolve().parents[1]
target = root / "public" / "fonts"
target.mkdir(exist_ok=True)
characters = [0x011E, 0x011F, 0x0130, 0x015E, 0x015F]

for family in ["inter", "space-grotesk", "jetbrains-mono"]:
    package = root / "node_modules" / "@fontsource-variable" / family
    source = package / "files" / f"{family}-latin-ext-wght-normal.woff2"
    font = TTFont(source)
    options = subset.Options()
    options.layout_features = ["*"]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=characters)
    subsetter.subset(font)
    font.flavor = "woff2"
    output = target / f"{family}-tr.woff2"
    font.save(output)
    shutil.copyfile(package / "LICENSE", target / f"{family}.LICENSE")
    print(f"{family}: {source.stat().st_size:,} -> {output.stat().st_size:,} bytes")
