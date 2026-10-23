import assert from 'node:assert/strict';
import test from 'node:test';
import { getAspectRatioPreset } from '../lib/aspect-ratio-utils';
import { useImageStore } from '../lib/store';
import { getDraggedTextPosition } from '../components/canvas/html/HTMLTextOverlayLayer';
import { getFontCSS, getAvailableFontWeights } from '../lib/constants/fonts';

test('Chrome Web Store presets resolve to exact requested pixel sizes', () => {
  for (const [id, width, height] of [
    ['chrome_web_store', 1280, 800],
    ['chrome_web_store_small', 640, 400],
  ] as const) {
    useImageStore.getState().setAspectRatio(id);
    const preset = getAspectRatioPreset(useImageStore.getState().selectedAspectRatio)!;
    assert.equal(preset.width, width);
    assert.equal(preset.height, height);
  }
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
});

test('text can be created and undone without an uploaded image', () => {
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
  const id = useImageStore.getState().addTextOverlay();
  const state = useImageStore.getState();
  assert.equal(state.uploadedImageUrl, null);
  assert.equal(state.slides.length, 0);
  assert.equal(state.textOverlays[0].id, id);
  assert.deepEqual(state.textOverlays[0].position, { x: 50, y: 50 });
  assert.equal(state.textOverlays[0].fontFamily, 'inter');
  assert.match(getFontCSS('inter'), /--font-inter/);
  assert.match(getFontCSS('geist'), /--font-geist-sans/);
  assert.ok(getAvailableFontWeights('geist').includes('600'));
  useImageStore.temporal.getState().undo();
  assert.equal(useImageStore.getState().textOverlays.length, 0);
  useImageStore.temporal.getState().redo();
  assert.equal(useImageStore.getState().textOverlays[0].id, id);
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
});

test('text dragging uses displayed canvas dimensions and bounds its center', () => {
  const start = { x: 50, y: 50 };
  assert.deepEqual(getDraggedTextPosition(start, 100, -50, 500, 250), { x: 70, y: 30 });
  assert.deepEqual(getDraggedTextPosition(start, 200, -100, 1000, 500), { x: 70, y: 30 });
  assert.deepEqual(getDraggedTextPosition(start, -999, 999, 500, 250), { x: 0, y: 100 });
  assert.deepEqual(getDraggedTextPosition(start, 100, 100, 0, 0), start);
});
