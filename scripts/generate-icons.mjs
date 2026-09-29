// Genera los íconos de la PWA (PNG) sin dependencias: dibuja un cuadrado
// redondeado con una palomita y codifica el PNG a mano con zlib.
//   npm run icons
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const BG = [15, 17, 21]; // #0f1115
const ACCENT = [139, 124, 246]; // #8b7cf6
const WHITE = [255, 255, 255];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const png = (size, rgba) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const distToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

// `bleed`: el fondo cubre todo el lienzo (íconos maskable / apple-touch, que
// el sistema recorta); si no, un cuadrado redondeado con esquinas transparentes.
// `scale`: qué tan grande es el círculo del logo respecto al lienzo.
const render = (size, { bleed, scale }) => {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3; // supersampling para bordes suaves
  const c = size / 2;
  const radius = (size * scale) / 2;
  const corner = size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
          let col = null;
          // Fondo
          const inRounded = (() => {
            const qx = Math.abs(px - c) - (c - corner), qy = Math.abs(py - c) - (c - corner);
            return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) <= corner;
          })();
          if (bleed || inRounded) col = BG;
          // Círculo de acento
          if (col && Math.hypot(px - c, py - c) <= radius) col = ACCENT;
          // Palomita
          const k = radius / 100;
          const stroke = 11 * k;
          const d = Math.min(
            distToSegment(px, py, c - 38 * k, c + 2 * k, c - 10 * k, c + 30 * k),
            distToSegment(px, py, c - 10 * k, c + 30 * k, c + 40 * k, c - 26 * k),
          );
          if (col && d <= stroke) col = WHITE;
          if (col) { r += col[0]; g += col[1]; b += col[2]; a += 255; }
        }
      }
      const n = SS * SS, i = (y * size + x) * 4;
      const cover = a / 255;
      rgba[i] = cover ? Math.round(r / cover) : 0;
      rgba[i + 1] = cover ? Math.round(g / cover) : 0;
      rgba[i + 2] = cover ? Math.round(b / cover) : 0;
      rgba[i + 3] = Math.round(a / n);
    }
  }
  return rgba;
};

mkdirSync(OUT, { recursive: true });
const write = (name, size, opts) => {
  writeFileSync(join(OUT, name), png(size, render(size, opts)));
  console.log(`  ${name} (${size}×${size})`);
};
write('icon-192.png', 192, { bleed: false, scale: 0.7 });
write('icon-512.png', 512, { bleed: false, scale: 0.7 });
// Maskable: el logo dentro de la "zona segura" (80 % central) sobre fondo a sangre.
write('maskable-icon-512.png', 512, { bleed: true, scale: 0.56 });
write('apple-touch-icon.png', 180, { bleed: true, scale: 0.62 });
write('favicon-48.png', 48, { bleed: false, scale: 0.78 });
