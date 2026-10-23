import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test, { afterEach } from 'node:test';
import { getBackgroundCSS, getBackgroundImageUrl } from '../lib/constants/backgrounds';
import { getR2ImageUrl, getR2PublicUrl } from '../lib/r2';

const originalPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
afterEach(() => {
  if (originalPublicUrl === undefined) delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  else process.env.NEXT_PUBLIC_R2_PUBLIC_URL = originalPublicUrl;
});

test('the default background uses the bundled image even with R2 configured', () => {
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://unavailable.example';
  const config = { type: 'image', value: 'backgrounds/raycast/red_distortion_4.webp' } as const;
  const localUrl = '/raycast/red_distortion_4.webp';

  assert.equal(getR2PublicUrl(config.value), localUrl);
  assert.equal(getR2PublicUrl(`/${config.value}`), localUrl);
  assert.equal(getR2ImageUrl({ src: config.value }), localUrl);
  assert.equal(getBackgroundImageUrl(config), localUrl);
  assert.equal(getBackgroundCSS(config).backgroundImage, `url(${localUrl})`);
  assert.equal(
    getBackgroundCSS(config, 32).backgroundImage,
    `url(/_next/image?url=${encodeURIComponent(localUrl)}&w=32&q=75)`,
  );
  assert.ok(existsSync(new URL(`../public${localUrl}`, import.meta.url)));
});

test('other assets retain their R2 proxy and local fallback paths', () => {
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://assets.example';
  assert.equal(getR2PublicUrl('backgrounds/raycast/blue_distortion_1.webp'),
    '/r2-assets/backgrounds/raycast/blue_distortion_1.webp');
  assert.equal(getR2PublicUrl('/overlays/shadow/window.png'), '/r2-assets/overlays/shadow/window.png');

  delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  assert.equal(getR2PublicUrl('backgrounds/raycast/blue_distortion_1.webp'), '/raycast/blue_distortion_1.webp');
  assert.equal(getR2PublicUrl('backgrounds/raycast/red_distortion_4.webp'), '/raycast/red_distortion_4.webp');
  assert.equal(getR2PublicUrl('overlays/shadow/window.png'), '/overlay-shadow/window.png');
});

test('custom background URLs are unchanged', () => {
  for (const value of ['https://example.com/image.webp', '/custom.webp', 'blob:upload', 'data:image/png;base64,AA==']) {
    assert.equal(getBackgroundImageUrl({ type: 'image', value }), value);
  }
});
