'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PlayIcon, Tick02Icon } from 'hugeicons-react';
import {
  getFrameImageStyle,
  getPreviewImageWidthPercent,
  PresetPreviewBackground,
  PresetPreviewOverlay,
  TEMPLATE_PREVIEW_RENDER_SCALE,
} from '@/components/presets/PresetGallery';
import { useImageStore } from '@/lib/store';
import {
  ANIMATED_TEMPLATE_CATEGORY_LABELS,
  ANIMATED_TEMPLATES,
  type AnimatedTemplate,
} from '@/lib/animation/templates';
import { getPresetById } from '@/lib/animation/presets';
import { presets } from '@/lib/constants/presets';
import { TEMPLATE_DEMO_IMAGE_URL } from '@/lib/templates/demo-media';
import { getImageTemplateById } from '@/lib/templates/image-templates';
import { cn } from '@/lib/utils';

type PreviewAnimation = {
  animate: {
    opacity: number[];
    transform: string[];
  };
  poster: {
    opacity: number;
    transform: string;
  };
  times: number[];
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

function getTransform(template: AnimatedTemplate, keyframeIndex: number): string {
  const properties = template.keyframes[keyframeIndex]?.properties;
  if (!properties) {
    return 'perspective(2400px) translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
  }

  return `perspective(${properties.perspective}px) `
    + `translate3d(${properties.translateX}%, ${properties.translateY}%, 0) `
    + `rotateX(${properties.rotateX}deg) rotateY(${properties.rotateY}deg) `
    + `rotateZ(${properties.rotateZ}deg) scale(${properties.scale})`;
}

function getPreviewAnimation(template: AnimatedTemplate): PreviewAnimation {
  const posterIndex = Math.max(
    0,
    template.keyframes.findIndex(({ properties }) => properties.imageOpacity >= 1),
  );
  const posterProperties = template.keyframes[posterIndex]?.properties;

  return {
    animate: {
      opacity: template.keyframes.map((keyframe) => keyframe.properties.imageOpacity),
      transform: template.keyframes.map((_, index) => getTransform(template, index)),
    },
    poster: {
      opacity: posterProperties?.imageOpacity ?? 1,
      transform: getTransform(template, posterIndex),
    },
    times: template.keyframes.map((keyframe) => keyframe.time / template.duration),
  };
}

function formatDuration(duration: number): string {
  return `${(duration / 1000).toFixed(1)}s`;
}

interface AnimatedTemplatePreviewProps {
  template: AnimatedTemplate;
  active?: boolean;
  className?: string;
  showBadges?: boolean;
}

export function AnimatedTemplatePreview({
  template,
  active = false,
  className,
  showBadges = true,
}: AnimatedTemplatePreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const imageTemplate = getImageTemplateById(template.visualPresetId);
  const visualPreset = imageTemplate?.preset
    ?? presets.find((preset) => preset.id === template.visualPresetId);
  const animationPreset = getPresetById(template.animationPresetId);
  const preview = getPreviewAnimation(template);

  if (!visualPreset || !animationPreset) return null;

  const imageBorder = template.imageStylePreset === 'default'
    ? { ...visualPreset.imageBorder, enabled: false, type: 'none' as const }
    : visualPreset.imageBorder;
  const frameStyle = getFrameImageStyle(imageBorder, visualPreset.borderRadius);
  const shadow = visualPreset.imageShadow;
  const placement = imageTemplate?.scene.kind === 'screenshot'
    ? imageTemplate.scene.placement
    : undefined;

  return (
    <div className={cn('relative isolate aspect-video overflow-hidden bg-muted', className)}>
        <PresetPreviewBackground preset={visualPreset} />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            data-animated-preview-layer="true"
            className="relative w-full"
            initial={false}
            animate={
              active && !shouldReduceMotion
                ? preview.animate
                : preview.poster
            }
            transition={
              active && !shouldReduceMotion
                ? {
                    duration: template.duration / 1000,
                    times: preview.times,
                    ease: template.duration >= 3000 ? EASE_IN_OUT : EASE_OUT,
                    repeat: Infinity,
                    repeatDelay: 0.35,
                  }
                : { duration: shouldReduceMotion ? 0 : 0.18, ease: EASE_OUT }
            }
            style={{
              width: `${getPreviewImageWidthPercent(visualPreset, imageBorder)}%`,
              left: `${(placement?.offsetX ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
              top: `${(placement?.offsetY ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
              transformStyle: 'preserve-3d',
              willChange: active && !shouldReduceMotion ? 'transform, opacity' : undefined,
            }}
          >
            <div
              className="relative overflow-hidden bg-background"
              style={{
                borderRadius: `${visualPreset.borderRadius * TEMPLATE_PREVIEW_RENDER_SCALE}px`,
                ...frameStyle,
                boxShadow: shadow.enabled
                  ? `${shadow.offsetX * TEMPLATE_PREVIEW_RENDER_SCALE}px ${shadow.offsetY * TEMPLATE_PREVIEW_RENDER_SCALE}px ${shadow.blur * TEMPLATE_PREVIEW_RENDER_SCALE}px ${(shadow.spread ?? 0) * TEMPLATE_PREVIEW_RENDER_SCALE}px ${shadow.color}`
                  : undefined,
              }}
            >
              <img
                src={TEMPLATE_DEMO_IMAGE_URL}
                alt=""
                draggable={false}
                className="block aspect-video w-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        <PresetPreviewOverlay preset={visualPreset} />

        {showBadges ? (
          <div className="absolute right-2 top-2 rounded-md border border-foreground/10 bg-background/60 px-1.5 py-1 text-[10px] font-medium tabular-nums text-muted-foreground backdrop-blur-md">
            {formatDuration(template.duration)}
          </div>
        ) : null}
    </div>
  );
}

function AnimatedTemplateCard({
  template,
  onSelect,
}: {
  template: AnimatedTemplate;
  onSelect: (template: AnimatedTemplate) => void;
}) {
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const animationClips = useImageStore((state) => state.animationClips);
  const isApplied =
    animationClips.length === 1 &&
    animationClips[0]?.name === template.name &&
    animationClips[0]?.presetId === template.animationPresetId;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      onMouseEnter={() => setIsPreviewing(true)}
      onMouseLeave={() => setIsPreviewing(false)}
      onFocus={() => setIsPreviewing(true)}
      onBlur={() => setIsPreviewing(false)}
      aria-label={`View animated template ${template.name}`}
      className={cn(
        'group min-w-0 text-left outline-none transition-transform duration-150 ease-out active:scale-[0.99]',
        'focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-foreground/30',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-muted/30 transition-[border-color,opacity] duration-150 ease-out',
          isApplied
            ? 'border-foreground/25'
            : 'border-foreground/[0.08] group-hover:border-foreground/15 group-hover:opacity-95',
        )}
      >
        <AnimatedTemplatePreview template={template} active={isPreviewing} />
        <div className="absolute inset-0 flex items-center justify-center bg-background/10 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-background/70 text-foreground shadow-sm backdrop-blur-md">
            {isApplied ? <Tick02Icon size={15} /> : <PlayIcon size={14} />}
          </span>
        </div>
      </div>

      <div className="px-0.5 pt-2">
        <span className="block truncate text-xs font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
          {template.name}
        </span>
      </div>
    </button>
  );
}

export function AnimatedTemplateGallery({
  onTemplateSelect,
}: {
  onTemplateSelect: (template: AnimatedTemplate) => void;
}) {
  const groupedTemplates = React.useMemo(() => {
    return Object.entries(ANIMATED_TEMPLATE_CATEGORY_LABELS).map(([category, label]) => ({
      category,
      label,
      templates: ANIMATED_TEMPLATES.filter((template) => template.category === category),
    }));
  }, []);

  return (
    <div className="space-y-5">
      {groupedTemplates.map((group) => (
        <section key={group.category} className="space-y-2.5">
          <h3 className="text-xs font-medium text-muted-foreground">{group.label}</h3>
          <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
            {group.templates.map((template) => (
              <AnimatedTemplateCard
                key={template.id}
                template={template}
                onSelect={onTemplateSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
