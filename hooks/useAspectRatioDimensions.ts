import { useMemo, useState, useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { getAspectRatioPreset, calculateFitDimensions, getAspectRatioCSS } from '@/lib/aspect-ratio-utils';

export function useAspectRatioDimensions(options?: {
  maxWidth?: number;
  maxHeight?: number;
}) {
  const { selectedAspectRatio } = useImageStore();
  
  const dimensions = useMemo(() => {
    const preset = getAspectRatioPreset(selectedAspectRatio);
    if (!preset) {
      return { width: 1920, height: 1080, aspectRatio: '16/9' };
    }
    
    const { maxWidth, maxHeight } = options || {};
    
    if (maxWidth || maxHeight) {
      const fitDimensions = calculateFitDimensions(
        preset.width,
        preset.height,
        maxWidth,
        maxHeight
      );
      return {
        ...fitDimensions,
        aspectRatio: getAspectRatioCSS(preset.width, preset.height),
        originalWidth: preset.width,
        originalHeight: preset.height,
      };
    }
    
    return {
      width: preset.width,
      height: preset.height,
      aspectRatio: getAspectRatioCSS(preset.width, preset.height),
      originalWidth: preset.width,
      originalHeight: preset.height,
    };
  }, [selectedAspectRatio, options]);
  
  return dimensions;
}

export function useResponsiveCanvasDimensions() {
  const selectedAspectRatio = useImageStore((s) => s.selectedAspectRatio);
  const imageName = useImageStore((s) => s.imageName);
  const customDimensions = useImageStore((s) => s.customDimensions);
  const [availableSize, setAvailableSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const viewport = document.querySelector<HTMLElement>('[data-canvas-viewport]');
    if (!viewport) return;

    const measure = () => {
      const style = getComputedStyle(viewport);
      const shortcut = viewport.querySelector<HTMLElement>('[data-stage-shortcut]');
      const shortcutHeight = shortcut?.offsetHeight
        ? shortcut.offsetHeight + (parseFloat(style.rowGap) || 0)
        : 0;
      setAvailableSize({
        width: Math.max(1, viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)),
        height: Math.max(1, viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - shortcutHeight),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    const shortcut = viewport.querySelector('[data-stage-shortcut]');
    if (shortcut) observer.observe(shortcut);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [imageName]);

  const preset = (selectedAspectRatio === 'custom' ? customDimensions : getAspectRatioPreset(selectedAspectRatio))
    ?? { width: 1920, height: 1080 };
  const dimensions = calculateFitDimensions(
    preset.width,
    preset.height,
    availableSize?.width ?? 1920,
    availableSize?.height ?? 1080,
  );

  return {
    ...dimensions,
    aspectRatio: getAspectRatioCSS(preset.width, preset.height),
    originalWidth: preset.width,
    originalHeight: preset.height,
    measured: availableSize !== null,
  };
}
