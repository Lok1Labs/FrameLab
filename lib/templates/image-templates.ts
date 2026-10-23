import { presets, type PresetConfig } from '@/lib/constants/presets';

export type ImageTemplateCategory = 'screenshots' | 'devices';

export type ImageTemplateScene =
  | {
      kind: 'screenshot';
      placement?: {
        offsetX: number;
        offsetY: number;
        rotation: number;
      };
    }
  | {
      kind: 'device';
      devices: ReadonlyArray<{
        definitionId: string;
        position: { x: number; y: number };
        size: number;
        rotation: number;
      }>;
    };

export interface ImageTemplate {
  category: ImageTemplateCategory;
  preset: PresetConfig;
  scene: ImageTemplateScene;
}

export const IMAGE_TEMPLATE_CATEGORY_LABELS: Record<ImageTemplateCategory, string> = {
  screenshots: 'Screenshots',
  devices: 'Device mockups',
};

function fromPreset(
  baseId: string,
  category: ImageTemplateCategory,
  overrides: Partial<PresetConfig> & Pick<PresetConfig, 'id' | 'name' | 'description'>,
  scene: ImageTemplateScene = { kind: 'screenshot' },
): ImageTemplate {
  const base = presets.find((preset) => preset.id === baseId);

  if (!base) {
    throw new Error(`Missing base preset: ${baseId}`);
  }

  return {
    category,
    scene,
    preset: {
      ...base,
      ...overrides,
      backgroundConfig: overrides.backgroundConfig ?? base.backgroundConfig,
      imageBorder: overrides.imageBorder ?? base.imageBorder,
      imageShadow: overrides.imageShadow ?? base.imageShadow,
      perspective3D: overrides.perspective3D ?? base.perspective3D,
    },
  };
}

const NEUTRAL_PERSPECTIVE = {
  perspective: 2400,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
};

export const IMAGE_TEMPLATES: ImageTemplate[] = [
  fromPreset('lifted', 'screenshots', {
    id: 'template-violet-showcase',
    name: 'Violet Showcase',
    description: 'A spacious violet spotlight for polished product launches.',
    aspectRatio: '16_9',
    backgroundConfig: { type: 'image', value: 'assets/asset-4.jpg', opacity: 1 },
    borderRadius: 12,
    backgroundBorderRadius: 20,
    imageScale: 106,
    imageShadow: {
      enabled: true,
      blur: 30,
      offsetX: 0,
      offsetY: 12,
      spread: 5,
      color: 'color-mix(in srgb, var(--shadow-color) 32%, transparent)',
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
    perspective3D: NEUTRAL_PERSPECTIVE,
    shadowOverlay: undefined,
  }, {
    kind: 'screenshot',
    placement: { offsetX: 0, offsetY: 42, rotation: 0 },
  }),
  fromPreset('spotlight', 'screenshots', {
    id: 'template-midnight-focus',
    name: 'Midnight Focus',
    description: 'A premium dark stage with a precise product spotlight.',
    aspectRatio: '16_9',
    backgroundConfig: { type: 'gradient', value: 'magic:magic_cyan_topright', opacity: 1 },
    imageScale: 103,
    borderRadius: 12,
    imageBorder: {
      enabled: true,
      width: 8,
      color: 'var(--foreground)',
      type: 'glass-light',
      opacity: 0.25,
      padding: 1,
    },
    perspective3D: NEUTRAL_PERSPECTIVE,
  }),
  fromPreset('editorial', 'screenshots', {
    id: 'template-editorial-paper',
    name: 'Editorial Paper',
    description: 'A warm editorial composition for product stories and case studies.',
    aspectRatio: '16_9',
    backgroundConfig: { type: 'gradient', value: 'mesh:mesh_peach', opacity: 1 },
    imageScale: 82,
    borderRadius: 8,
    perspective3D: NEUTRAL_PERSPECTIVE,
  }),
  fromPreset(
    'lifted',
    'devices',
    {
      id: 'template-laptop-stage',
      name: 'Laptop Stage',
      description: 'A focused MacBook presentation with generous breathing room.',
      aspectRatio: '16_9',
      backgroundConfig: { type: 'image', value: 'assets/asset-4.jpg', opacity: 1 },
      backgroundBorderRadius: 20,
      perspective3D: NEUTRAL_PERSPECTIVE,
    },
    {
      kind: 'device',
      devices: [{
        definitionId: 'macbook-pro-studio-front',
        position: { x: 0.5, y: 0.51 },
        size: 0.62,
        rotation: 0,
      }],
    },
  ),
  fromPreset(
    'neon-dreams',
    'devices',
    {
      id: 'template-phone-duo',
      name: 'Phone Duo',
      description: 'A layered pair of iPhones for mobile product launches.',
      aspectRatio: '16_9',
      backgroundConfig: { type: 'gradient', value: 'mesh:mesh_ocean', opacity: 1 },
      backgroundBorderRadius: 20,
      perspective3D: NEUTRAL_PERSPECTIVE,
    },
    {
      kind: 'device',
      devices: [
        {
          definitionId: 'iphone-15-perspective',
          position: { x: 0.4, y: 0.52 },
          size: 0.3,
          rotation: -5,
        },
        {
          definitionId: 'iphone-17-pro-front',
          position: { x: 0.64, y: 0.5 },
          size: 0.18,
          rotation: 4,
        },
      ],
    },
  ),
  fromPreset(
    'spotlight',
    'devices',
    {
      id: 'template-product-suite',
      name: 'Product Suite',
      description: 'A complete laptop, phone, and watch product ecosystem.',
      aspectRatio: '16_9',
      backgroundConfig: { type: 'gradient', value: 'magic:magic_gray_gold_orb', opacity: 1 },
      backgroundBorderRadius: 20,
      perspective3D: NEUTRAL_PERSPECTIVE,
    },
    {
      kind: 'device',
      devices: [
        {
          definitionId: 'macbook-pro-studio-front',
          position: { x: 0.47, y: 0.48 },
          size: 0.53,
          rotation: 0,
        },
        {
          definitionId: 'iphone-17-pro-front',
          position: { x: 0.75, y: 0.58 },
          size: 0.16,
          rotation: 4,
        },
        {
          definitionId: 'apple-watch-midnight-pride-sport-loop',
          position: { x: 0.2, y: 0.61 },
          size: 0.13,
          rotation: -6,
        },
      ],
    },
  ),
];

export function getImageTemplateById(id: string): ImageTemplate | undefined {
  return IMAGE_TEMPLATES.find(({ preset }) => preset.id === id);
}
