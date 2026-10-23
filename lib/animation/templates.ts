import type {
  AnimatableProperties,
  AnimationClip,
  AnimationTrack,
  EasingFunction,
} from '@/types/animation';
import { getPresetById } from './presets';

export type AnimatedTemplateCategory = 'reveals' | 'camera-moves';

export interface AnimatedTemplate {
  id: string;
  name: string;
  description: string;
  category: AnimatedTemplateCategory;
  visualPresetId: string;
  animationPresetId: string;
  imageStylePreset?: 'default';
  duration: number;
  accent: string;
  keyframes: Array<{
    time: number;
    properties: AnimatableProperties;
    easing: EasingFunction;
  }>;
}

export interface AnimatedTemplateTimeline {
  clip: AnimationClip;
  tracks: AnimationTrack[];
  duration: number;
}

export const ANIMATED_TEMPLATE_CATEGORY_LABELS: Record<AnimatedTemplateCategory, string> = {
  reveals: 'Reveals',
  'camera-moves': 'Camera moves',
};

export const ANIMATED_TEMPLATES: AnimatedTemplate[] = [
  {
    id: 'soft-reveal',
    name: 'Soft Reveal',
    description: 'A quiet rise and fade for product introductions.',
    category: 'reveals',
    visualPresetId: 'template-violet-showcase',
    animationPresetId: 'fade-rise',
    duration: 8000,
    accent: 'var(--chart-2)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 6, scale: 0.98, imageOpacity: 0 }, easing: 'ease-out' },
      { time: 700, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1, imageOpacity: 1 }, easing: 'ease-out-cubic' },
      { time: 6500, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: -1, scale: 1.025, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 8000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1.02, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
  {
    id: 'focus-pull',
    name: 'Focus Pull',
    description: 'A composed close-up that settles into the full frame.',
    category: 'reveals',
    visualPresetId: 'template-midnight-focus',
    animationPresetId: 'fade-zoom-out',
    duration: 8000,
    accent: 'var(--chart-1)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1.1, imageOpacity: 0 }, easing: 'ease-out' },
      { time: 800, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1.04, imageOpacity: 1 }, easing: 'ease-out-cubic' },
      { time: 6500, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 8000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
  {
    id: 'side-reveal',
    name: 'Side Reveal',
    description: 'A minimal lateral entrance with a gentle finish.',
    category: 'reveals',
    visualPresetId: 'template-editorial-paper',
    animationPresetId: 'slide-left',
    duration: 8000,
    accent: 'var(--chart-3)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 10, translateY: 0, scale: 0.99, imageOpacity: 0 }, easing: 'ease-out' },
      { time: 850, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1, imageOpacity: 1 }, easing: 'ease-out-cubic' },
      { time: 6500, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: -2, translateY: 0, scale: 1.025, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 8000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1.02, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
  {
    id: 'slow-push',
    name: 'Slow Push',
    description: 'A steady camera move that draws attention inward.',
    category: 'camera-moves',
    visualPresetId: 'template-violet-showcase',
    animationPresetId: 'kenburns-zoom-in',
    duration: 10000,
    accent: 'var(--chart-2)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, scale: 1, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 5000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: -1, scale: 1.045, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 10000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: -2, scale: 1.08, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
  {
    id: 'close-pan',
    name: 'Close Pan',
    description: 'A close crop that travels smoothly from right to left.',
    category: 'camera-moves',
    visualPresetId: 'template-midnight-focus',
    animationPresetId: 'kenburns-pan-left',
    imageStylePreset: 'default',
    duration: 10000,
    accent: 'var(--chart-1)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 18, translateY: 0, scale: 1.45, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 10000, properties: { perspective: 2400, rotateX: 0, rotateY: 0, rotateZ: 0, translateX: -18, translateY: 0, scale: 1.45, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
  {
    id: 'studio-drift',
    name: 'Studio Drift',
    description: 'A restrained floating loop with subtle depth.',
    category: 'camera-moves',
    visualPresetId: 'template-editorial-paper',
    animationPresetId: 'breathe-3d',
    duration: 9000,
    accent: 'var(--chart-3)',
    keyframes: [
      { time: 0, properties: { perspective: 2400, rotateX: 0, rotateY: -1, rotateZ: 0, translateX: 1, translateY: 1, scale: 1.01, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 4500, properties: { perspective: 2400, rotateX: 1, rotateY: 1, rotateZ: 0, translateX: -1, translateY: -1, scale: 1.035, imageOpacity: 1 }, easing: 'ease-in-out' },
      { time: 9000, properties: { perspective: 2400, rotateX: 0, rotateY: -1, rotateZ: 0, translateX: 1, translateY: 1, scale: 1.01, imageOpacity: 1 }, easing: 'ease-in-out' },
    ],
  },
];

export function getAnimatedTemplateById(id: string): AnimatedTemplate | undefined {
  return ANIMATED_TEMPLATES.find((template) => template.id === id);
}

export function buildAnimatedTemplateTimeline(
  template: AnimatedTemplate,
  uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
): AnimatedTemplateTimeline | null {
  const preset = getPresetById(template.animationPresetId);
  if (!preset) return null;

  const clipId = `template-clip-${template.id}-${uniqueToken}`;
  const clip: AnimationClip = {
    id: clipId,
    presetId: preset.id,
    name: template.name,
    startTime: 0,
    duration: template.duration,
    color: template.accent,
  };

  const transformTrack: AnimationTrack = {
    id: `template-transform-${uniqueToken}`,
    name: `${template.name} motion`,
    type: 'transform',
    clipId,
    originalDuration: template.duration,
    isLocked: false,
    isVisible: true,
    keyframes: template.keyframes.map((keyframe, index) => {
      const { imageOpacity: _imageOpacity, ...properties } = keyframe.properties;
      return {
        id: `template-transform-kf-${uniqueToken}-${index}`,
        time: keyframe.time,
        properties,
        easing: keyframe.easing,
      };
    }),
  };
  const opacityTrack: AnimationTrack = {
    id: `template-opacity-${uniqueToken}`,
    name: `${template.name} opacity`,
    type: 'opacity',
    clipId,
    originalDuration: template.duration,
    isLocked: false,
    isVisible: true,
    keyframes: template.keyframes.map((keyframe, index) => ({
      id: `template-opacity-kf-${uniqueToken}-${index}`,
      time: keyframe.time,
      properties: { imageOpacity: keyframe.properties.imageOpacity },
      easing: keyframe.easing,
    })),
  };

  return {
    clip,
    tracks: [transformTrack, opacityTrack],
    duration: template.duration,
  };
}
