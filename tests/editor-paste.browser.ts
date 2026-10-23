// Run with the dev server running: npx tsx --test tests/editor-paste.browser.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3130';

test('image paste stays in the editor and is handled once', async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const path of ['/editor', '/es/editor', '/']) {
      const context = await browser.newContext({
        permissions: ['clipboard-read', 'clipboard-write'],
        viewport: { width: 1440, height: 1000 },
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await page.goto(`${baseURL}${path}`, { timeout: 120000 });
      if (path.endsWith('/editor')) {
        await page.getByText('Drag & drop, click to browse, or paste', { exact: true }).waitFor();
        await page.locator('#image-render-card [tabindex="0"]').focus();
      } else {
        await page.locator('a[href="/editor"]').first().waitFor();
      }

      await page.evaluate(async () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 100;
        canvas.getContext('2d')!.fillRect(0, 0, 100, 100);
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!)));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      });
      await page.keyboard.press('ControlOrMeta+v');
      const expectedPath = path === '/' ? '/editor' : path;
      await page.waitForURL(`${baseURL}${expectedPath}`);
      await page.waitForFunction(() => {
        const image = document.querySelector<HTMLImageElement>('img[alt="Main image"]');
        return image?.complete && image.naturalWidth === 100;
      });
      assert.equal(await page.getByRole('button', { name: 'Delete slide', exact: true }).count(), 0,
        'one paste must not create duplicate slides');
      assert.equal(await page.locator('[data-overlay-id]').count(), 0);
      const mainSrc = await page.locator('img[alt="Main image"]').getAttribute('src');

      // Also exercise the paste event used by browser menus, with a loaded canvas.
      await page.evaluate(async () => {
        const item = (await navigator.clipboard.read())[0];
        const data = new DataTransfer();
        data.items.add(new File([await item.getType('image/png')], 'pasted.png', { type: 'image/png' }));
        document.body.dispatchEvent(new ClipboardEvent('paste', {
          clipboardData: data, bubbles: true, cancelable: true,
        }));
      });
      await page.locator('[data-overlay-id] img').waitFor();
      assert.equal(await page.locator('[data-overlay-id]').count(), 1);
      assert.equal(await page.locator('img[alt="Main image"]').getAttribute('src'), mainSrc);
      assert.equal(new URL(page.url()).pathname, expectedPath);

      await page.keyboard.press('ControlOrMeta+z');
      await page.locator('[data-overlay-id]').waitFor({ state: 'detached' });
      await page.keyboard.press('ControlOrMeta+Shift+z');
      await page.locator('[data-overlay-id] img').waitFor();

      // History must still work when removing the image unmounts the canvas.
      await page.getByRole('button', { name: 'Remove', exact: true }).click();
      await page.locator('img[alt="Main image"]').waitFor({ state: 'detached' });
      await page.keyboard.press('ControlOrMeta+z');
      await page.locator('img[alt="Main image"]').waitFor();
      await page.waitForFunction(() => {
        const image = document.querySelector<HTMLImageElement>('img[alt="Main image"]');
        return image?.complete && image.naturalWidth === 100;
      });
      assert.equal(await page.evaluate(async (src) => (await fetch(src!)).ok, mainSrc), true,
        'undo must restore a readable image, not a revoked blob URL');
      await page.keyboard.press('ControlOrMeta+y');
      await page.locator('img[alt="Main image"]').waitFor({ state: 'detached' });
      await page.keyboard.press('ControlOrMeta+z');
      await page.locator('img[alt="Main image"]').waitFor();

      await page.getByRole('button', { name: 'Add Text', exact: true }).last().click();
      const text = page.locator('[data-text-overlay-id]').last();
      await text.click();
      await page.keyboard.press('Escape');
      assert.equal(await text.getAttribute('data-export-clean-outline'), null);
      await text.click();
      await page.keyboard.press('Backspace');
      await page.locator('[data-text-overlay-id]').waitFor({ state: 'detached' });
      await context.close();
    }
  } finally {
    await browser.close();
  }
});
