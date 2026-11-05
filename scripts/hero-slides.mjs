// Prepares the hero's photographs at one matched brightness, so crossfading between them can't pulse light and dark.
// Usage: node scripts/hero-slides.mjs
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SLIDES = ["hall-wide", "hall-pitch", "crisis-tables", "hall-clap"];
const TARGET = 104; // mean brightness, 0–255
mkdirSync("public/media/hero", { recursive: true });

// Measures the processed pixels. stats() on a pipeline would only report the untouched input.
async function meanAt(src, gain) {
  const buf = await sharp(src).resize(320).modulate({ brightness: gain }).greyscale().raw().toBuffer();
  return buf.reduce((s, v) => s + v, 0) / buf.length;
}

for (const [i, slug] of SLIDES.entries()) {
  const src = `public/media/photos/${slug}-2048.webp`;
  let gain = 1;
  // A few passes, because clipping in bright areas makes one pass land short.
  for (let pass = 0; pass < 5; pass++) gain *= TARGET / (await meanAt(src, gain));
  for (const w of [960, 1920]) {
    await sharp(src).resize(w).modulate({ brightness: gain, saturation: 0.92 }).webp({ quality: 78 }).toFile(`public/media/hero/slide-${i + 1}-${w}.webp`);
  }
  console.log(slug, "gain", gain.toFixed(2), "written mean", (await meanAt(`public/media/hero/slide-${i + 1}-960.webp`, 1)).toFixed(1));
}
