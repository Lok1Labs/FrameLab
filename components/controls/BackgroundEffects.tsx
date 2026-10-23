'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';

export function BackgroundEffects() {
  const {
    backgroundBlur,
    backgroundNoise,
    setBackgroundBlur,
    setBackgroundNoise,
  } = useImageStore();

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Background Effects</h4>
      <div className="space-y-2">
        <Slider
          value={[backgroundBlur]}
          onValueChange={(value) => setBackgroundBlur(value[0])}
          min={0}
          max={50}
          step={1}
          label="Blur"
          valueDisplay={`${backgroundBlur}px`}
        />
        <Slider
          value={[backgroundNoise]}
          onValueChange={(value) => setBackgroundNoise(value[0])}
          min={0}
          max={100}
          step={1}
          label="Noise"
          valueDisplay={`${backgroundNoise}%`}
        />
      </div>
    </div>
  );
}
