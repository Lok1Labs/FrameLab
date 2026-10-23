'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TiltJoystickProps {
  value: { x: number; y: number }; // rotateY, rotateX
  onChange: (value: { x: number; y: number }) => void;
  onToggle?: () => void;
  maxTilt?: number; // Maximum tilt angle in degrees
  size?: number; // Base size in pixels
  className?: string;
}

export function TiltJoystick({
  value,
  onChange,
  onToggle,
  maxTilt = 30,
  size = 72,
  className,
}: TiltJoystickProps) {
  const baseRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const hasTilt = value.x !== 0 || value.y !== 0;

  // Convert tilt values to joystick position (-1 to 1)
  const normalizedX = Math.max(-1, Math.min(1, value.x / maxTilt));
  const normalizedY = Math.max(-1, Math.min(1, value.y / maxTilt));

  // Calculate knob position
  const borderWidth = 5;
  const knobSize = size * 0.5;
  const maxOffset = (size - knobSize) / 2 - borderWidth;
  const knobX = normalizedX * maxOffset;
  const knobY = normalizedY * maxOffset;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate offset from center
    let offsetX = e.clientX - centerX;
    let offsetY = e.clientY - centerY;

    // Clamp to circular boundary
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const maxDistance = maxOffset;

    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      offsetX *= scale;
      offsetY *= scale;
    }

    // Convert to tilt angles
    const tiltX = (offsetX / maxOffset) * maxTilt; // rotateY
    const tiltY = (offsetY / maxOffset) * maxTilt; // rotateX (inverted)

    onChange({ x: tiltX, y: -tiltY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleReset = () => {
    onChange({ x: 0, y: 0 });
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Tilt Toggle Button */}
      <button
        onClick={onToggle || handleReset}
        className={cn(
          'px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer select-none',
          hasTilt
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-border dark:bg-secondary text-foreground/80 hover:bg-muted-foreground/40 dark:hover:bg-accent'
        )}
      >
        Tilt
      </button>

      {/* Joystick Base - Thick white ring with dark center */}
      <div
        ref={baseRef}
        onDoubleClick={handleReset}
        className="relative flex justify-center items-center rounded-full bg-border dark:bg-muted-foreground"
        style={{
          height: size,
          width: size,
          padding: borderWidth,
        }}
      >
        {/* Inner dark area */}
        <div
          className="absolute rounded-full bg-foreground dark:bg-background"
          style={{
            width: size - borderWidth * 2,
            height: size - borderWidth * 2,
          }}
        />

        {/* Knob */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 rounded-full bg-muted-foreground dark:bg-accent"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            height: knobSize,
            width: knobSize,
            touchAction: 'none',
            transform: `translate(${knobX}px, ${-knobY}px)`,
          }}
        />
      </div>
    </div>
  );
}
