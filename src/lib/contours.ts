// Background artwork for the opening: sparse nested contours, faint graph rules and a few economic terms.
// Returned as an SVG data URL so it can be painted into a canvas.
export const CONTOUR_SIZE = { width: 1600, height: 1000 };

const CENTRES = [
  { x: 230, y: 240, seed: 0.4 },
  { x: 1340, y: 740, seed: 2.1 },
  { x: 1470, y: 120, seed: 3.7 },
  { x: 620, y: 950, seed: 5.2 },
];
const RADII = [95, 180, 275, 380];
const LABELS: [string, number, number][] = [
  ["Opportunity cost", 110, 560],
  ["Marginal benefit", 1120, 300],
  ["Price elasticity", 1290, 540],
  ["Comparative advantage", 400, 96],
  ["Market equilibrium", 800, 960],
];

function loop(cx: number, cy: number, r: number, seed: number) {
  const n = 28;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.13 * Math.sin(3 * t + seed) + 0.07 * Math.sin(5 * t + seed * 1.7) + 0.04 * Math.sin(7 * t + seed * 0.6));
    pts.push([cx + rr * Math.cos(t) * 1.35, cy + rr * Math.sin(t)]);
  }
  // A closed Catmull-Rom spline as cubic Béziers.
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

export function contourArtwork() {
  const { width, height } = CONTOUR_SIZE;
  const paths = CENTRES.flatMap((c) => RADII.map((r, k) => loop(c.x, c.y, r, c.seed + k * 0.35))).join(" ");
  const labels = LABELS.map(([t, x, y]) => `<text x="${x}" y="${y}">${t}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#121a16" stroke-opacity=".035"/></pattern></defs><rect width="${width}" height="${height}" fill="url(#g)"/><path d="${paths}" fill="none" stroke="#8a6a2b" stroke-opacity=".2" stroke-width="1.2"/><g fill="#7d5e1e" fill-opacity=".34" font-family="Georgia,serif" font-style="italic" font-size="15" letter-spacing=".4">${labels}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
