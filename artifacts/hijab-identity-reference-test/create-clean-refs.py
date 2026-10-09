"""Face-masked hijab references for identity A/B (experimental only)."""
from __future__ import annotations

import json
import os
import statistics
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PROD = ROOT / "public" / "media" / "catalog" / "hijab_styles"
OUT_CLEAN = HERE / "refs" / "clean"
OUT_ORIG = HERE / "refs" / "original"

STYLES = [
    "women_hijab_01",
    "women_hijab_02",
    "women_hijab_04",
    "women_hijab_05",
    "women_hijab_08",
]


def sample_hijab_rgb(img: Image.Image) -> tuple[int, int, int]:
    w, h = img.size
    px = img.load()
    rs, gs, bs = [], [], []
    for y in range(int(h * 0.15), int(h * 0.55)):
        for x in range(w):
            if int(w * 0.08) < x < int(w * 0.92):
                continue
            r, g, b = px[x, y][:3]
            rs.append(r)
            gs.append(g)
            bs.append(b)
    if not rs:
        return (240, 240, 240)
    return (
        int(statistics.median(rs)),
        int(statistics.median(gs)),
        int(statistics.median(bs)),
    )


def build_clean(img: Image.Image) -> Image.Image:
    w, h = img.size
    out = img.convert("RGB").copy()
    draw = ImageDraw.Draw(out)
    fill = sample_hijab_rgb(out)
    # Face oval
    cx, cy = w * 0.5, h * 0.36
    rx, ry = w * 0.24, h * 0.21
    draw.ellipse(
        (cx - rx, cy - ry, cx + rx, cy + ry),
        fill=fill,
        outline=fill,
    )
    # Remove blouse / shoulders (keep hijab neck folds only)
    draw.rectangle((0, int(h * 0.72), w, h), fill=fill)
    return out


def main() -> None:
    OUT_CLEAN.mkdir(parents=True, exist_ok=True)
    OUT_ORIG.mkdir(parents=True, exist_ok=True)
    summary = []
    for style_id in STYLES:
        src = PROD / f"{style_id}.png"
        orig_copy = OUT_ORIG / f"{style_id}.png"
        if not orig_copy.exists():
            orig_copy.write_bytes(src.read_bytes())
        im = Image.open(src)
        clean = build_clean(im)
        out_path = OUT_CLEAN / f"{style_id}.png"
        clean.save(out_path, format="PNG", optimize=True)
        summary.append(
            {
                "styleId": style_id,
                "w": im.size[0],
                "h": im.size[1],
                "outPath": str(out_path),
            }
        )
    manifest = HERE / "refs" / "clean-manifest.json"
    manifest.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
