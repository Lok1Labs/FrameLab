/**
 * Type definitions for Sharp-based image export
 */

export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type QualityPreset = 'high' | 'medium' | 'low';

export interface QualitySettings {
  jpeg: number;
  pngCompression: number;
  webp: number;
}

export const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  high: { jpeg: 85, pngCompression: 6, webp: 82 },
  medium: { jpeg: 75, pngCompression: 9, webp: 72 },
  low: { jpeg: 60, pngCompression: 9, webp: 55 },
};

export const QUALITY_PRESET_LABELS: Record<QualityPreset, { label: string; description: Record<ExportFormat, string> }> = {
  high: {
    label: 'High',
    description: {
      png: 'Best quality, larger file',
      jpeg: '85% quality, sharp & shareable',
      webp: '82% quality, smallest file',
    },
  },
  medium: {
    label: 'Medium',
    description: {
      png: 'Lossless, better compression',
      jpeg: '75% quality, good compression',
      webp: '72% quality, very small file',
    },
  },
  low: {
    label: 'Low',
    description: {
      png: 'Lossless, max compression',
      jpeg: '60% quality, maximum compression',
      webp: '55% quality, tiny file',
    },
  },
};
