// Prepares the opening's portrait of Adam Smith. Usage: node scripts/smith-etching.mjs <path to AdamSmith.jpg>
// Source: https://commons.wikimedia.org/wiki/File:AdamSmith.jpg (public domain; etching after James Tassie's 1787 medallion).
// Re-inks the etching in forest ink on the site's cream paper, and vignettes it the way engraved portraits were.
import sharp from "sharp";

const [src] = process.argv.slice(2);
const OUT_W = 1100;
const PAPER = [247, 242, 230];
const INK = [16, 27, 21];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const { data, info } = await sharp(src).resize(OUT_W).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const out = Buffer.alloc(W * H * 4);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    // Levels: the aged paper becomes clean cream, and the deepest lines become full ink.
    const t = clamp((data[i] - 34) / (196 - 34)) ** 0.92;
    for (let c = 0; c < 3; c++) out[i * 4 + c] = INK[c] + (PAPER[c] - INK[c]) * t;
    // Vignette: fades out at the torso and the sides, leaving the head and shoulders on the page.
    const u = x / W, v = y / H;
    const down = 1 - smooth(0.6, 0.86, v + Math.abs(u - 0.52) * 0.28);
    const side = smooth(0, 0.07, u) * (1 - smooth(0.93, 1, u));
    const top = smooth(0, 0.012, v);
    out[i * 4 + 3] = 255 * down * side * top;
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 86, alphaQuality: 90 }).toFile("public/media/brand/adam-smith.webp");
console.log("adam-smith.webp", W, H);
