// FrameLab: deterministic derivatives of the owner's original artwork.
import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

const source = process.argv[2] || 'public/branding/original.png';
await mkdir('public/branding', { recursive: true });
if (source !== 'public/branding/original.png') await copyFile(source, 'public/branding/original.png');
const original = 'public/branding/original.png';
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
for (const [name, size] of Object.entries({
  'logo-mark.png': 128, 'favicon-16x16.png': 16, 'favicon-32x32.png': 32,
  'favicon-96x96.png': 96, 'apple-touch-icon.png': 180,
  'icon-192.png': 192, 'icon-512.png': 512,
  'web-app-manifest-192x192.png': 192, 'web-app-manifest-512x512.png': 512,
})) {
  await sharp(original).resize(size, size, { fit: 'contain', background: transparent }).png({ compressionLevel: 9 }).toFile(`public/${name}`);
}
await sharp(original).resize(256, 256, { fit: 'contain', background: transparent }).webp({ quality: 90 }).toFile('public/branding/logo.webp');
const png = await sharp(original).resize(32, 32, { fit: 'contain', background: transparent }).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico[6] = 32; ico[7] = 32;
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, png]));
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,${(await sharp(original).resize(96,96).png().toBuffer()).toString('base64')}"/></svg>`);
const logo = await sharp(original).resize(460, 460, { fit: 'contain', background: transparent }).toBuffer();
const text = Buffer.from('<svg width="1200" height="630"><style>text{font-family:Arial,sans-serif;fill:#ededed}</style><text x="560" y="270" font-size="76" font-weight="700">FrameLab</text><text x="560" y="330" font-size="25">Make your work look remarkable.</text><text x="560" y="380" font-size="20" fill="#999">A creative workspace for digital products.</text></svg>');
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#0a0a0a' } }).composite([{ input: logo, left: 55, top: 85 }, { input: text }]).jpeg({ quality: 88 }).toFile('public/og.jpg');
