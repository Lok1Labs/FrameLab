import assert from 'node:assert/strict';
import test from 'node:test';
import { ANIMATION_PRESETS, CATEGORY_LABELS } from '../lib/animation/presets';
import { DEFAULT_ANIMATABLE_PROPERTIES } from '../types/animation';
import { getClipLocalInterpolatedProperties } from '../lib/animation/interpolation';

test('new motion presets have unique IDs, visible categories and finite playable keyframes', () => {
  assert.equal(new Set(ANIMATION_PRESETS.map(({ id }) => id)).size, ANIMATION_PRESETS.length);
  for (const preset of ANIMATION_PRESETS.filter(({ category }) => category === 'bounce' || category === 'effects')) {
    assert.ok(CATEGORY_LABELS[preset.category]);
    const clip = { id: 'test', presetId: preset.id, startTime: 0, duration: preset.duration, name: preset.name };
    const tracks = preset.tracks.map((track) => ({ ...track, clipId: clip.id }));
    for (const track of tracks) {
      assert.ok(track.keyframes.length >= 2);
      assert.equal(track.keyframes[0].time, 0);
      assert.ok(track.keyframes.at(-1)!.time <= preset.duration);
    }
    for (const time of [0, preset.duration / 2, preset.duration]) {
      const values = getClipLocalInterpolatedProperties(tracks, time, preset.duration, preset.duration, DEFAULT_ANIMATABLE_PROPERTIES);
      assert.ok(Object.values(values).every(Number.isFinite), preset.id);
    }
  }
});
