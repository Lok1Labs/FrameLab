import { gradientColors, GradientKey } from './gradient-colors';
import { SolidColorKey, solidColors } from './solid-colors';
import { meshGradients, magicGradients, MeshGradientKey, MagicGradientKey } from './mesh-gradients';
import { getR2ImageUrl, getResizedImageUrl } from '@/lib/r2';
import { backgroundPaths } from '@/lib/r2-backgrounds';

export type BackgroundType = 'gradient' | 'solid' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  value: GradientKey | SolidColorKey | string;
  opacity?: number;
}

const isCssGradient = (value: string): boolean =>
  /^(?:linear|radial|conic)-gradient\(/.test(value);

export const getBackgroundStyle = (config: BackgroundConfig): string => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient': {
      if (isCssGradient(value)) {
        return value;
      }
      if (typeof value === 'string' && value.startsWith('mesh:')) {
        const meshKey = value.replace('mesh:', '') as MeshGradientKey;
        return meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      }
      if (typeof value === 'string' && value.startsWith('magic:')) {
        const magicKey = value.replace('magic:', '') as MagicGradientKey;
        return magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      }
      return gradientColors[value as GradientKey];
    }

    case 'solid': {
      if (value === 'transparent') {
        return 'transparent';
      }
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return value;
      }
      const color = solidColors[value as SolidColorKey];
      return color || '#ffffff';
    }

    case 'image':
      return `url(${value})`;

    default:
      return gradientColors.vibrant_orange_pink;
  }
};

/** Resolved URL of an image background, or null for gradients and solids. */
export const getBackgroundImageUrl = (config: BackgroundConfig): string | null => {
  const { type, value } = config;
  if (type !== 'image' || typeof value !== 'string') return null;
  const isR2Path =
    !value.startsWith('/') &&
    !value.startsWith('blob:') &&
    !value.startsWith('http') &&
    !value.startsWith('data:') &&
    backgroundPaths.includes(value);
  return isR2Path ? getR2ImageUrl({ src: value }) : value;
};

export const getBackgroundCSS = (
  config: BackgroundConfig,
  imageWidth?: number
): React.CSSProperties => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient': {
      let gradient: string;

      if (isCssGradient(value)) {
        gradient = value;
      } else if (typeof value === 'string' && value.startsWith('mesh:')) {
        const meshKey = value.replace('mesh:', '') as MeshGradientKey;
        gradient = meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      } else if (typeof value === 'string' && value.startsWith('magic:')) {
        const magicKey = value.replace('magic:', '') as MagicGradientKey;
        gradient = magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      } else {
        gradient = gradientColors[value as GradientKey] || gradientColors.vibrant_orange_pink;
      }

      return {
        background: gradient,
        opacity,
      };
    }

    case 'solid': {
      // Handle transparent background
      if (value === 'transparent') {
        return {
          backgroundColor: 'transparent',
          opacity: 1,
        };
      }
      // Handle direct color values (hex, rgb, rgba)
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return {
          backgroundColor: value,
          opacity,
        };
      }
      const color = solidColors[value as SolidColorKey] || '#ffffff';
      return {
        backgroundColor: color,
        opacity,
      };
    }

    case 'image': {
      const url = getBackgroundImageUrl(config) ?? (value as string);
      const imageUrl = imageWidth ? getResizedImageUrl(url, imageWidth) : url;

      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
      };
    }

    default:
      return {
        background: gradientColors.vibrant_orange_pink,
        opacity,
      };
  }
};
