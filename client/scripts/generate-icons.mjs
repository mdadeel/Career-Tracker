/**
 * Generates the favicon PNG/ICO package for CareerTrack.
 * Pure Node (zlib only) — no image dependencies.
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public");

const BRAND = [0x00, 0x64, 0xff]; // #0064FF
const WHITE = [0xff, 0xff, 0xff];

function rgba(px) {
  return [px[0], px[1], px[2], 255];
}

/** Bar-chart mark on rounded square. size = output px, s = mark scale. */
function render(size, s = 1) {
  const img = Buffer.alloc(size * size * 4, 0);
  const R = Math.max(2, Math.round(size * 0.22));
  const pad = Math.round(size * 0.18);
  const inner = size - pad * 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      // rounded rect background
      const inCorner = (cx, cy) => {
        const dx = cx - x, dy = cy - y;
        return dx * dx + dy * dy <= R * R;
      };
      const inRect = x >= R && x < size - R && y >= R && y < size - R;
      const top = y < R && x >= R && x < size - R;
      const bottom = y >= size - R && x >= R && x < size - R;
      const left = x < R && y >= R && y < size - R;
      const right = x >= size - R && y >= R && y < size - R;
      const corners = (y < R && x < R && inCorner(R, R)) ||
        (y < R && x >= size - R && inCorner(size - R - 1, R)) ||
        (y >= size - R && x < R && inCorner(R, size - R - 1)) ||
        (y >= size - R && x >= size - R && inCorner(size - R - 1, size - R - 1));
      const bg = inRect || top || bottom || left || right || corners;
      if (!bg) continue;

      const lx = pad + Math.round(inner * 0.2);
      const lw = Math.max(1, Math.round(inner * 0.2));
      const mw = Math.max(1, Math.round(inner * 0.2));
      const rx = pad + Math.round(inner * 0.6);
      const barsTop = pad + Math.round(inner * 0.35);

      const bar1 = x >= lx && x < lx + lw && y >= barsTop;
      const bar2 = x >= lx + lw + Math.round(inner * 0.1) && x < lx + lw + Math.round(inner * 0.1) + mw && y >= barsTop + Math.round(inner * 0.1);
      const bar3 = x >= rx && x < rx + lw && y >= barsTop + Math.round(inner * 0.22);

      const px = bar1 || bar2 || bar3 ? rgba(WHITE) : rgba(BRAND);
      img[o] = px[0]; img[o + 1] = px[1]; img[o + 2] = px[2]; img[o + 3] = px[3];
    }
  }
  return img;
}

function encodePng(w, h, raw) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  };
  // scanlines with filter byte 0
  const stride = w * 4 + 1;
  const scan = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    scan[y * stride] = 0;
    raw.copy(scan, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = deflateSync(scan, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

/** ICO container holding a PNG entry (supported by all modern browsers). */
function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type icon
  header.writeUInt16LE(pngs.length, 4);
  const dirSize = 16 * pngs.length;
  const entries = [];
  let offset = 6 + dirSize;
  const dir = Buffer.alloc(dirSize);
  pngs.forEach(({ size, png }, i) => {
    const e = i * 16;
    dir[e] = size >= 256 ? 0 : size;
    dir[e + 1] = size >= 256 ? 0 : size;
    dir[e + 2] = 0;
    dir[e + 3] = 0;
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    entries.push(png);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries]);
}

mkdirSync(OUT_DIR, { recursive: true });
const pngs = [];
for (const size of [16, 32, 48, 180, 192, 512]) {
  const png = encodePng(size, size, render(size));
  pngs.push({ size, png });
  const name = size === 180 ? "apple-touch-icon.png" : size === 16 ? "favicon-16x16.png" : size === 32 ? "favicon-32x32.png" : `favicon-${size}.png`;
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`✓ ${name} (${size}x${size})`);
}
writeFileSync(join(OUT_DIR, "favicon.ico"), encodeIco(pngs.filter((p) => p.size <= 48)));
console.log("✓ favicon.ico");

const ogW = 1200, ogH = 630;
const og = Buffer.alloc(ogW * ogH * 4, 0);
// paper background
for (let y = 0; y < ogH; y++) {
  for (let x = 0; x < ogW; x++) {
    const o = (y * ogW + x) * 4;
    og[o] = 0xf2; og[o + 1] = 0xef; og[o + 2] = 0xe8; og[o + 3] = 255;
  }
}
// simple bars accent bottom-left
const barCols = [
  [0x00, 0x64, 0xff],
  [0x00, 0x4a, 0xbf],
  [0x00, 0x35, 0x8a],
];
for (let i = 0; i < barCols.length; i++) {
  const bw = 72, bh = [220, 320, 420][i], gap = 24;
  const bx = 90 + i * (bw + gap), by = ogH - bh - 80;
  for (let y = by; y < by + bh; y++)
    for (let x = bx; x < bx + bw; x++) {
      const o = (y * ogW + x) * 4;
      og[o] = barCols[i][0]; og[o + 1] = barCols[i][1]; og[o + 2] = barCols[i][2]; og[o + 3] = 255;
    }
}
writeFileSync(join(OUT_DIR, "og-cover.png"), encodePng(ogW, ogH, og));
console.log("✓ og-cover.png (1200x630)");
