import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ANIMATED_TEMPLATES,
  buildAnimatedTemplateTimeline,
} from '../lib/animation/templates';
import { IMAGE_TEMPLATES } from '../lib/templates/image-templates';
import { getPresetById } from '../lib/animation/presets';
import { getMockupDefinition } from '../lib/constants/mockups';
import { presets } from '../lib/constants/presets';

test('animated templates reference valid visual and motion presets', () => {
  const templateIds = new Set<string>();

  assert.equal(ANIMATED_TEMPLATES.length, 6);

  for (const template of ANIMATED_TEMPLATES) {
    assert.equal(templateIds.has(template.id), false, `duplicate template id: ${template.id}`);
    templateIds.add(template.id);

    assert.ok(
      presets.some((preset) => preset.id === template.visualPresetId)
        || IMAGE_TEMPLATES.some(({ preset }) => preset.id === template.visualPresetId),
      `missing visual preset: ${template.visualPresetId}`,
    );
    assert.ok(
      getPresetById(template.animationPresetId),
      `missing animation preset: ${template.animationPresetId}`,
    );
    assert.ok(template.duration >= 7000, `${template.id} is too abrupt`);
    assert.equal(template.keyframes[0]?.time, 0);
    assert.equal(template.keyframes.at(-1)?.time, template.duration);
    assert.ok(template.keyframes.length >= 2);

    for (const keyframe of template.keyframes) {
      const properties = keyframe.properties;
      assert.ok(Math.abs(properties.rotateX) <= 2, `${template.id} rotates too far on X`);
      assert.ok(Math.abs(properties.rotateY) <= 2, `${template.id} rotates too far on Y`);
      assert.ok(Math.abs(properties.rotateZ) <= 2, `${template.id} rotates too far on Z`);
      assert.ok(
        Math.abs(properties.translateX) <= (template.id === 'close-pan' ? 18 : 10),
        `${template.id} moves too far on X`,
      );
      assert.ok(Math.abs(properties.translateY) <= 6, `${template.id} moves too far on Y`);
      assert.ok(
        properties.scale >= 0.97 && properties.scale <= (template.id === 'close-pan' ? 1.45 : 1.12),
      );
      assert.notEqual(keyframe.easing, 'ease-in');
    }
  }
});

test('Close Pan keeps a close crop while moving right to left for the full timeline', () => {
  const closePan = ANIMATED_TEMPLATES.find(({ id }) => id === 'close-pan');

  assert.ok(closePan);
  assert.equal(closePan.duration, 10000);
  assert.equal(closePan.imageStylePreset, 'default');
  assert.equal(closePan.keyframes.length, 2);
  assert.equal(closePan.keyframes[0]?.properties.translateX, 18);
  assert.equal(closePan.keyframes[0]?.properties.scale, 1.45);
  assert.equal(closePan.keyframes[1]?.properties.translateX, -18);
  assert.equal(closePan.keyframes[1]?.properties.scale, 1.45);
});

test('animated template timelines are editable and internally linked', () => {
  const template = ANIMATED_TEMPLATES[0];
  assert.ok(template);

  const timeline = buildAnimatedTemplateTimeline(template, 'test');
  assert.ok(timeline);
  assert.equal(timeline.duration, template.duration);
  assert.equal(timeline.clip.startTime, 0);
  assert.equal(timeline.clip.duration, template.duration);
  assert.equal(timeline.clip.presetId, template.animationPresetId);
  assert.ok(timeline.tracks.length > 0);
  assert.ok(timeline.tracks.every((track) => track.clipId === timeline.clip.id));
  assert.ok(timeline.tracks.every((track) => track.keyframes.length > 0));
});

test('image templates have unique identities and valid compositions', () => {
  const ids = IMAGE_TEMPLATES.map(({ preset }) => preset.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(IMAGE_TEMPLATES.length, 6);

  for (const { preset, scene } of IMAGE_TEMPLATES) {
    assert.ok(preset.name.length > 0);
    assert.ok(preset.description.length > 0);
    assert.ok(preset.imageScale >= 60 && preset.imageScale <= 120);

    if (scene.kind === 'device') {
      assert.ok(scene.devices.length > 0);
      assert.ok(scene.devices.every(({ definitionId }) => getMockupDefinition(definitionId)));
    }
  }

  assert.equal(
    IMAGE_TEMPLATES.filter(({ scene }) => scene.kind === 'device').length,
    3,
  );

  const violetTemplate = IMAGE_TEMPLATES.find(
    ({ preset }) => preset.id === 'template-violet-showcase',
  );
  const violetShowcase = violetTemplate?.preset;

  assert.ok(violetShowcase);
  assert.equal(violetShowcase.backgroundConfig.value, 'assets/asset-4.jpg');
  assert.equal(violetShowcase.aspectRatio, '16_9');
  assert.equal(violetShowcase.imageScale, 106);
  assert.equal(violetShowcase.borderRadius, 12);
  assert.equal(violetShowcase.perspective3D?.translateY, 0);
  assert.equal(violetTemplate.scene.kind, 'screenshot');
  if (violetTemplate.scene.kind === 'screenshot') {
    assert.deepEqual(violetTemplate.scene.placement, {
      offsetX: 0,
      offsetY: 42,
      rotation: 0,
    });
  }

  const midnightFocus = IMAGE_TEMPLATES.find(
    ({ preset }) => preset.id === 'template-midnight-focus',
  )?.preset;

  assert.ok(midnightFocus);
  assert.equal(midnightFocus.backgroundConfig.value, 'magic:magic_cyan_topright');
  assert.equal(midnightFocus.imageScale, 103);
  assert.equal(midnightFocus.borderRadius, 12);
  assert.equal(midnightFocus.imageBorder.type, 'glass-light');
  assert.equal(midnightFocus.imageBorder.opacity, 0.25);
  assert.equal(midnightFocus.imageBorder.padding, 1);
});
