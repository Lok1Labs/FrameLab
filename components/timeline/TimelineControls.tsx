'use client';

import * as React from 'react';
import {
  PlayIcon,
  PauseIcon,
  RepeatIcon,
  RepeatOffIcon,
  Add01Icon,
  Cancel01Icon,
  Time02Icon,
  Delete02Icon,
} from 'hugeicons-react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

function formatTimeDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface TimelineControlsProps {
  onAddAnimation?: () => void;
  onClose?: () => void;
}

export function TimelineControls({ onAddAnimation, onClose }: TimelineControlsProps) {
  const {
    timeline,
    togglePlayback,
    setTimeline,
    setTimelineDuration,
    clearAnimationClips,
    animationClips,
  } = useImageStore();

  const { isPlaying, isLooping, playhead, duration } = timeline;

  const handleToggleLoop = () => setTimeline({ isLooping: !isLooping });
  const hasAnimations = animationClips.length > 0;
  const durationSeconds = duration / 1000;
  const durationLabel = Number.isInteger(durationSeconds)
    ? durationSeconds.toString()
    : durationSeconds.toFixed(1);

  return (
    <div className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-foreground/10 bg-background px-3">
      <div className="flex min-w-0 items-center">
        <button
          type="button"
          onClick={onAddAnimation}
          aria-label="Add animation"
          className={cn(
            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5',
            'bg-foreground/[0.04] border border-foreground/10',
            'text-xs font-medium text-foreground',
            'transition-colors duration-150',
            'hover:bg-foreground/[0.08] hover:border-foreground/15',
            'active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
          )}
        >
          <Add01Icon size={14} className="text-foreground" />
          <span className="max-[1100px]:hidden">Add animation</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150',
            isLooping
              ? 'bg-foreground/[0.08] text-foreground'
              : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
          )}
          onClick={handleToggleLoop}
          title={isLooping ? 'Turn looping off' : 'Turn looping on'}
          aria-label={isLooping ? 'Turn looping off' : 'Turn looping on'}
          aria-pressed={isLooping}
        >
          {isLooping ? <RepeatIcon size={15} /> : <RepeatOffIcon size={15} />}
        </button>

        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-[72px] cursor-pointer items-center justify-center rounded-md',
            'bg-primary text-primary-foreground',
            'shadow-sm',
            'transition-all duration-150',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>

        <div className="flex min-w-[66px] items-center tabular-nums">
          <span className="text-[11px] font-medium text-foreground">
            {formatTimeDisplay(playhead)}
          </span>
          <span className="ml-1 text-[11px] text-muted-foreground">
            / {formatTimeDisplay(duration)}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-1.5">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
            Duration {durationLabel}s
          </span>
          <Slider
            min={1}
            max={30}
            step={1}
            value={[durationSeconds]}
            onValueChange={(v) => setTimelineDuration((v[0] ?? 1) * 1000)}
            className="w-20 space-y-0"
            aria-label="Timeline duration"
            aria-valuetext={`${durationLabel} seconds`}
          />
          <Time02Icon size={14} className="shrink-0 text-muted-foreground" />
        </div>

        {hasAnimations ? (
          <button
            type="button"
            onClick={clearAnimationClips}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            title="Clear animations"
            aria-label="Clear animations"
          >
            <Delete02Icon size={15} />
          </button>
        ) : null}

        <div className="mx-0.5 h-4 w-px bg-foreground/10" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          title="Close timeline"
          aria-label="Close timeline"
        >
          <Cancel01Icon size={15} />
        </button>
      </div>
    </div>
  );
}
