import assert from 'node:assert/strict';
import test from 'node:test';
import { getMosaicGrid } from '../lib/export/mosaic';
import { useImageStore } from '../lib/store';

test('mosaic grid covers the whole region from its top-left corner', () => {
  assert.deepEqual(getMosaicGrid(100, 40, 10), { columns: 10, rows: 4 });
  assert.deepEqual(getMosaicGrid(105, 41, 10), { columns: 11, rows: 5 });
  assert.deepEqual(getMosaicGrid(30, 30, 60), { columns: 1, rows: 1 });
  assert.deepEqual(getMosaicGrid(0, 30, 10), { columns: 0, rows: 0 });
  assert.deepEqual(getMosaicGrid(3, 2, 0), { columns: 3, rows: 2 });
});

test('switching a blur region to mosaic can be undone', () => {
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
  useImageStore.getState().addBlurRegion({
    position: { x: 10, y: 10 },
    size: { width: 120, height: 40 },
    blurAmount: 10,
    isVisible: true,
  });
  const { id } = useImageStore.getState().blurRegions[0];
  assert.equal(useImageStore.getState().blurRegions[0].style, undefined);

  useImageStore.getState().updateBlurRegion(id, { style: 'mosaic' });
  assert.equal(useImageStore.getState().blurRegions[0].style, 'mosaic');
  useImageStore.temporal.getState().undo();
  assert.equal(useImageStore.getState().blurRegions[0].style, undefined);
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
});
