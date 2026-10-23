'use client';

import * as React from 'react';
import { Tick02Icon } from 'hugeicons-react';
import { DeviceShell } from '@/components/mockups/DeviceShell';
import {
  PresetPreview,
  PresetPreviewBackground,
  PresetPreviewOverlay,
  TEMPLATE_PREVIEW_RENDER_SCALE,
} from '@/components/presets/PresetGallery';
import { getMockupDefinition } from '@/lib/constants/mockups';
import { createDeviceScreen } from '@/lib/device-mockups/layouts';
import { useImageStore } from '@/lib/store';
import {
  IMAGE_TEMPLATE_CATEGORY_LABELS,
  IMAGE_TEMPLATES,
  type ImageTemplate,
} from '@/lib/templates/image-templates';
import {
  TEMPLATE_DEMO_IMAGE_NAME,
  TEMPLATE_DEMO_IMAGE_URL,
} from '@/lib/templates/demo-media';
import { cn } from '@/lib/utils';

const TEMPLATE_SCREEN = createDeviceScreen(
  TEMPLATE_DEMO_IMAGE_URL,
  TEMPLATE_DEMO_IMAGE_NAME,
);

export function ImageTemplatePreview({
  template,
  className,
}: {
  template: ImageTemplate;
  className?: string;
}) {
  if (template.scene.kind === 'screenshot') {
    return (
      <PresetPreview
        preset={template.preset}
        previewImageUrl={TEMPLATE_DEMO_IMAGE_URL}
        placement={template.scene.placement}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn('relative isolate aspect-video overflow-hidden', className)}
      style={{
        borderRadius: template.preset.backgroundBorderRadius * TEMPLATE_PREVIEW_RENDER_SCALE,
      }}
    >
      <PresetPreviewBackground preset={template.preset} />
      {template.scene.devices.map((device, index) => {
        const definition = getMockupDefinition(device.definitionId);
        if (!definition) return null;

        return (
          <div
            key={`${device.definitionId}-${index}`}
            className="pointer-events-none absolute drop-shadow-2xl"
            style={{
              left: `${device.position.x * 100}%`,
              top: `${device.position.y * 100}%`,
              width: `${device.size * 100}%`,
              aspectRatio: definition.aspectRatio,
              transform: `translate(-50%, -50%) rotate(${device.rotation}deg)`,
            }}
          >
            <DeviceShell definition={definition} screen={TEMPLATE_SCREEN} />
          </div>
        );
      })}
      <PresetPreviewOverlay preset={template.preset} />
    </div>
  );
}

function ImageTemplateCard({
  template,
  onSelect,
}: {
  template: ImageTemplate;
  onSelect: (template: ImageTemplate) => void;
}) {
  const selectedAspectRatio = useImageStore((state) => state.selectedAspectRatio);
  const backgroundConfig = useImageStore((state) => state.backgroundConfig);
  const editorMode = useImageStore((state) => state.editorMode);
  const mockups = useImageStore((state) => state.mockups);
  const { preset, scene } = template;
  const matchingBackground =
    selectedAspectRatio === preset.aspectRatio &&
    backgroundConfig.type === preset.backgroundConfig.type &&
    backgroundConfig.value === preset.backgroundConfig.value;
  const isApplied = scene.kind === 'device'
    ? editorMode === 'device'
      && matchingBackground
      && mockups.length === scene.devices.length
      && mockups.every((mockup, index) => mockup.definitionId === scene.devices[index]?.definitionId)
    : editorMode === 'screenshot' && matchingBackground;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      aria-label={`View image template ${preset.name}`}
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
        <ImageTemplatePreview template={template} />
        {isApplied ? (
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-border/50 bg-background/70 text-foreground backdrop-blur-md">
            <Tick02Icon size={12} />
          </span>
        ) : null}
      </div>
      <div className="px-0.5 pt-2">
        <span className="block truncate text-xs font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
          {preset.name}
        </span>
      </div>
    </button>
  );
}

export function ImageTemplateGallery({
  onTemplateSelect,
}: {
  onTemplateSelect: (template: ImageTemplate) => void;
}) {
  const groups = React.useMemo(
    () => Object.entries(IMAGE_TEMPLATE_CATEGORY_LABELS).map(([category, label]) => ({
      category,
      label,
      templates: IMAGE_TEMPLATES.filter((template) => template.category === category),
    })),
    [],
  );

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.category} className="space-y-2.5">
          <h3 className="text-xs font-medium text-muted-foreground">{group.label}</h3>
          <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
            {group.templates.map((template) => (
              <ImageTemplateCard
                key={template.preset.id}
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
