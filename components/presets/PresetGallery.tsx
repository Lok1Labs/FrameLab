'use client';

import * as React from 'react';
import { useImageStore, useEditorStore } from '@/lib/store';
import { presets, type PresetConfig } from '@/lib/constants/presets';
import { aspectRatios, type AspectRatioKey } from '@/lib/constants/aspect-ratios';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { cn } from '@/lib/utils';
import { useCustomPresets } from '@/hooks/useCustomPresets';
import { Delete02Icon } from 'hugeicons-react';
import { Input } from '@/components/ui/input';

interface PresetGalleryProps {
  onPresetSelect?: (preset: PresetConfig) => void;
  layout?: 'list' | 'grid';
  showSavePreset?: boolean;
  replaceAnimation?: boolean;
  closeOnApply?: boolean;
}

// Convert aspect ratio ID to CSS aspect-ratio value
function getAspectRatioValue(aspectRatioId: AspectRatioKey): string {
  const ar = aspectRatios.find((a) => a.id === aspectRatioId);
  if (!ar) return '16 / 9'; // fallback
  return `${ar.width} / ${ar.height}`;
}

// Get frame image style (matching Frame3DOverlay.tsx)
export const TEMPLATE_PREVIEW_RENDER_SCALE = 0.16;
const CANVAS_CONTENT_WIDTH_PERCENT = 84;
const PREVIEW_NOISE_IMAGE = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2764%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.45%27/%3E%3C/svg%3E")';

export function getPreviewImageWidthPercent(
  preset: PresetConfig,
  borderConfig: PresetConfig['imageBorder'] = preset.imageBorder,
): number {
  const frameScale = borderConfig.enabled && borderConfig.type !== 'none' ? 0.88 : 1;
  return CANVAS_CONTENT_WIDTH_PERCENT * (preset.imageScale / 100) * frameScale;
}

export function getFrameImageStyle(
  borderConfig: PresetConfig['imageBorder'],
  borderRadius: number
): React.CSSProperties | null {
  if (!borderConfig.enabled || borderConfig.type === 'none') {
    return null;
  }

  const arcBorderWidth = Math.max(1, (borderConfig.width || 8) * TEMPLATE_PREVIEW_RENDER_SCALE);
  const scaledRadius = Math.max(0, borderRadius * TEMPLATE_PREVIEW_RENDER_SCALE);

  switch (borderConfig.type) {
    case 'arc-light': {
      const lightOpacity = borderConfig.opacity ?? 0.5;
      return {
        border: `${arcBorderWidth}px solid rgba(255, 255, 255, ${lightOpacity})`,
        borderRadius: `${scaledRadius}px`,
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      };
    }

    case 'arc-dark': {
      const darkOpacity = borderConfig.opacity ?? 0.7;
      return {
        border: `${arcBorderWidth}px solid rgba(0, 0, 0, ${darkOpacity})`,
        borderRadius: `${scaledRadius}px`,
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      };
    }

    case 'photograph':
      return {
        borderWidth: `${8 * TEMPLATE_PREVIEW_RENDER_SCALE}px ${8 * TEMPLATE_PREVIEW_RENDER_SCALE}px ${24 * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
        borderStyle: 'solid' as const,
        borderColor: 'white',
        borderRadius: `${8 * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      };

    case 'glass-light':
    case 'glass-dark':
    case 'outline-light':
    case 'border-light':
    case 'border-dark': {
      const backgrounds: Record<string, string> = {
        'glass-light': `color-mix(in srgb, ${borderConfig.color} ${(borderConfig.opacity ?? 0.25) * 100}%, transparent)`,
        'glass-dark': `color-mix(in srgb, ${borderConfig.color} ${(borderConfig.opacity ?? 0.7) * 100}%, transparent)`,
        'outline-light': `color-mix(in srgb, ${borderConfig.color} ${(borderConfig.opacity ?? 0.35) * 100}%, transparent)`,
        'border-light': borderConfig.color,
        'border-dark': borderConfig.color,
      };
      const padding = Math.max(0, borderConfig.padding ?? 0);

      return {
        backgroundColor: backgrounds[borderConfig.type],
        borderRadius: `${scaledRadius + padding * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
        overflow: 'hidden',
        padding: `${padding}%`,
      };
    }

    default:
      return {
        border: `${Math.max(1, borderConfig.width * TEMPLATE_PREVIEW_RENDER_SCALE)}px solid ${borderConfig.color}`,
        borderRadius: `${scaledRadius}px`,
        overflow: 'hidden',
        boxSizing: 'border-box' as const,
      };
  }
}

export function PresetPreviewBackground({
  preset,
}: {
  preset: PresetConfig;
}): React.JSX.Element {
  return (
    <>
      <div
        className="absolute inset-0 scale-110"
        style={{
          ...getBackgroundCSS(preset.backgroundConfig),
          filter: (preset.backgroundBlur ?? 0) > 0
            ? `blur(${(preset.backgroundBlur ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px)`
            : undefined,
        }}
      />
      {(preset.backgroundNoise ?? 0) > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: PREVIEW_NOISE_IMAGE,
            backgroundRepeat: 'repeat',
            opacity: (preset.backgroundNoise ?? 0) / 100,
          }}
        />
      ) : null}
    </>
  );
}

export function PresetPreviewOverlay({
  preset,
}: {
  preset: PresetConfig;
}): React.JSX.Element | null {
  if (!preset.shadowOverlay) return null;

  return (
    <img
      src={preset.shadowOverlay.src}
      alt=""
      className="pointer-events-none absolute inset-0 z-20 block size-full object-cover"
      style={{ opacity: preset.shadowOverlay.opacity }}
    />
  );
}

// Build shadow filter for 3D transforms (matching Perspective3DOverlay.tsx)
function buildShadowFilter(shadow: PresetConfig['imageShadow']): string {
  if (!shadow.enabled) {
    return '';
  }

  const baseBlur = shadow.blur || 25;
  const baseOffset = Math.max(shadow.offsetX || 0, shadow.offsetY || 0) || 15;

  // Parse shadow color
  let r = 0, g = 0, b = 0;
  const colorMatch = shadow.color.match(/rgba?\(([^)]+)\)/);

  if (colorMatch) {
    const parts = colorMatch[1].split(',').map((s) => s.trim());
    r = parseInt(parts[0]) || 0;
    g = parseInt(parts[1]) || 0;
    b = parseInt(parts[2]) || 0;
  } else if (shadow.color.startsWith('#')) {
    const hex = shadow.color.replace('#', '');
    r = parseInt(hex.slice(0, 2), 16) || 0;
    g = parseInt(hex.slice(2, 4), 16) || 0;
    b = parseInt(hex.slice(4, 6), 16) || 0;
  }

  const shadowR = Math.floor(r * 0.3);
  const shadowG = Math.floor(g * 0.3);
  const shadowB = Math.floor(b * 0.3);

  // Create layered shadows for depth
  const shadows = [
    `drop-shadow(${baseOffset * 0.5}px ${baseOffset * 0.6}px ${baseBlur * 0.5}px rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.5))`,
    `drop-shadow(${baseOffset * 0.25}px ${baseOffset * 0.4}px ${baseBlur * 0.75}px rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.35))`,
    `drop-shadow(${baseOffset * 0.1}px ${baseOffset * 0.2}px ${baseBlur}px rgba(0, 0, 0, 0.25))`,
  ];

  return shadows.join(' ');
}

// Check if preset has 3D transform active
function has3DTransform(perspective3D?: PresetConfig['perspective3D']): boolean {
  if (!perspective3D) return false;
  return (
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1
  );
}

interface PresetPreviewProps {
  preset: PresetConfig;
  previewImageUrl: string | null;
  className?: string;
  placement?: {
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
}

export function PresetPreview({
  preset,
  previewImageUrl,
  className,
  placement,
}: PresetPreviewProps) {
  const frameStyle = getFrameImageStyle(preset.imageBorder, preset.borderRadius);
  const is3D = has3DTransform(preset.perspective3D);
  const shadowFilter = is3D ? buildShadowFilter(preset.imageShadow) : '';

  const transform3D = preset.perspective3D
    ? `translate(${preset.perspective3D.translateX}%, ${preset.perspective3D.translateY}%) scale(${preset.perspective3D.scale}) rotateX(${preset.perspective3D.rotateX}deg) rotateY(${preset.perspective3D.rotateY}deg) rotateZ(${preset.perspective3D.rotateZ}deg)`
    : 'translate(0%, 0%) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        aspectRatio: getAspectRatioValue(preset.aspectRatio),
        overflow: 'hidden',
        borderRadius: `${preset.backgroundBorderRadius * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
        isolation: 'isolate',
      }}
    >
      <PresetPreviewBackground preset={preset} />

      {previewImageUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: `${preset.perspective3D?.perspective || 2400}px`,
            transformStyle: 'preserve-3d',
            zIndex: 15,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: `${getPreviewImageWidthPercent(preset)}%`,
              left: `${(placement?.offsetX ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
              top: `${(placement?.offsetY ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
              transform: `${transform3D} rotate(${placement?.rotation ?? 0}deg)`,
              transformOrigin: 'center center',
              filter: shadowFilter || undefined,
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: `${preset.borderRadius * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
                overflow: 'hidden',
                ...frameStyle,
                boxShadow: preset.imageShadow.enabled && !is3D
                  ? `${preset.imageShadow.offsetX * TEMPLATE_PREVIEW_RENDER_SCALE}px ${preset.imageShadow.offsetY * TEMPLATE_PREVIEW_RENDER_SCALE}px ${preset.imageShadow.blur * TEMPLATE_PREVIEW_RENDER_SCALE}px ${(preset.imageShadow.spread ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px ${preset.imageShadow.color}`
                  : undefined,
              }}
            >
              <img
                src={previewImageUrl}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  opacity: preset.imageOpacity,
                  borderRadius: `${preset.borderRadius * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-xs text-muted-foreground/50">{preset.name}</div>
        </div>
      )}
      <PresetPreviewOverlay preset={preset} />
    </div>
  );
}

function PresetCard({
  preset,
  isActive,
  previewImageUrl,
  onApply,
}: {
  preset: PresetConfig;
  isActive: boolean;
  previewImageUrl: string | null;
  onApply: () => void;
}) {
  return (
    <button
      onClick={onApply}
      className={cn(
        'w-full rounded-md border transition-all overflow-hidden text-left cursor-pointer',
        'outline-none focus-visible:ring-2 focus-visible:ring-foreground/25',
        isActive
          ? 'border-foreground/30 ring-1 ring-foreground/20'
          : 'border-foreground/10 hover:border-foreground/20'
      )}
    >
      <PresetPreview preset={preset} previewImageUrl={previewImageUrl} />

      <div className={cn(
        "p-3 border-t",
        isActive
          ? "bg-foreground/[0.08] border-foreground/15"
          : "bg-background border-foreground/10"
      )}>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <div className="text-sm font-medium text-foreground">{preset.name}</div>
        </div>
        <div className={cn("text-xs text-muted-foreground mt-0.5", isActive && "ml-3.5")}>{preset.description}</div>
      </div>
    </button>
  );
}

export function PresetGallery({
  onPresetSelect,
  layout = 'list',
  showSavePreset = true,
  replaceAnimation = false,
  closeOnApply = false,
}: PresetGalleryProps) {
  const {
    uploadedImageUrl,
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    borderRadius,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    perspective3D,
    applyVisualPreset,
  } = useImageStore();

  const { screenshot } = useEditorStore();
  const { customPresets, savePreset, deletePreset } = useCustomPresets();
  const [showSaveForm, setShowSaveForm] = React.useState(false);
  const [presetName, setPresetName] = React.useState('');

  const isPresetActive = React.useCallback((preset: PresetConfig) => {
    return (
      preset.aspectRatio === selectedAspectRatio &&
      preset.backgroundConfig.type === backgroundConfig.type &&
      preset.backgroundConfig.value === backgroundConfig.value &&
      preset.backgroundBorderRadius === backgroundBorderRadius &&
      preset.borderRadius === borderRadius &&
      preset.imageOpacity === imageOpacity &&
      preset.imageScale === imageScale &&
      preset.imageBorder.enabled === imageBorder.enabled &&
      preset.imageShadow.enabled === imageShadow.enabled &&
      (preset.backgroundBlur ?? 0) === backgroundBlur &&
      (preset.backgroundNoise ?? 0) === backgroundNoise
    );
  }, [
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    borderRadius,
    imageOpacity,
    imageScale,
    imageBorder.enabled,
    imageShadow.enabled,
  ]);

  const applyPreset = React.useCallback((preset: PresetConfig) => {
    applyVisualPreset(preset, {
      clearAnimation: replaceAnimation,
      closeTemplates: closeOnApply,
    });
    onPresetSelect?.(preset);
  }, [
    applyVisualPreset,
    closeOnApply,
    onPresetSelect,
    replaceAnimation,
  ]);

  const handleSavePreset = React.useCallback(() => {
    if (!presetName.trim()) return;

    savePreset(presetName.trim(), {
      aspectRatio: selectedAspectRatio,
      backgroundConfig,
      borderRadius,
      backgroundBorderRadius,
      imageOpacity,
      imageScale,
      imageBorder,
      imageShadow,
      backgroundBlur,
      backgroundNoise,
      perspective3D,
    });

    setPresetName('');
    setShowSaveForm(false);
  }, [
    presetName,
    savePreset,
    selectedAspectRatio,
    backgroundConfig,
    borderRadius,
    backgroundBorderRadius,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
  ]);

  const previewImageUrl = uploadedImageUrl || (screenshot?.src ?? null);

  return (
    <div className="space-y-3">
      {showSavePreset ? <div>
        {!showSaveForm ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className="w-full rounded-md border border-dashed border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.04] p-4 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            + Save Current as Preset
          </button>
        ) : (
          <div className="flex gap-2">
            <Input
              autoFocus
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePreset();
                if (e.key === 'Escape') { setShowSaveForm(false); setPresetName(''); }
              }}
              placeholder="Preset name"
              className="h-9 text-sm bg-foreground/[0.04] border-foreground/10"
            />
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className="shrink-0 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Save
            </button>
          </div>
        )}
      </div> : null}

      {customPresets.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            My Presets
          </div>
          <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
            {customPresets.map((preset) => (
              <div key={preset.id} className="group relative">
                <PresetCard
                  preset={preset}
                  isActive={isPresetActive(preset)}
                  previewImageUrl={previewImageUrl}
                  onApply={() => applyPreset(preset)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-card border border-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 cursor-pointer"
                  aria-label={`Delete ${preset.name}`}
                >
                  <Delete02Icon size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Built-in Presets
          </div>
        </>
      )}

      <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={isPresetActive(preset)}
            previewImageUrl={previewImageUrl}
            onApply={() => applyPreset(preset)}
          />
        ))}
      </div>

      {!uploadedImageUrl && !screenshot?.src && (
        <div className="p-4 rounded-md bg-foreground/[0.04] border border-foreground/10 text-center">
          <p className="text-xs text-muted-foreground">
            Upload an image to see preset previews
          </p>
        </div>
      )}
    </div>
  );
}
