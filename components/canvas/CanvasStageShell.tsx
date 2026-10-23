"use client";

import { useImageStore } from "@/lib/store";
import { useResponsiveCanvasDimensions } from "@/hooks/useAspectRatioDimensions";
import { getBackgroundCSS } from "@/lib/constants/backgrounds";
import { cn } from "@/lib/utils";

type CanvasStageShellProps = {
  children?: React.ReactNode;
  breathe?: boolean;
  showBackground?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
};

export function CanvasStageShell({
  children,
  breathe = false,
  showBackground = false,
  className,
  id,
  style,
}: CanvasStageShellProps): React.JSX.Element {
  const backgroundBorderRadius = useImageStore((s) => s.backgroundBorderRadius);
  const backgroundConfig = useImageStore((s) => s.backgroundConfig);
  const { measured, width, height, originalWidth } =
    useResponsiveCanvasDimensions();
  const backgroundStyle = showBackground
    ? getBackgroundCSS(backgroundConfig, 32)
    : undefined;

  return (
    <div
      id={id}
      className={cn(
        "relative shrink-0 transition-[border-radius] duration-300",
        "shadow-xl ring-1 ring-foreground/10",
        breathe && "canvas-stage-breathe",
        !measured && "canvas-stage-presize",
        className
      )}
      style={{
        ...(measured
          ? { width: `${width}px`, height: `${height}px` }
          : ({
              "--stage-w": `${originalWidth}px`,
              "--stage-ratio": width / height,
            } as React.CSSProperties)),
        borderRadius: `${backgroundBorderRadius}px`,
        ...style,
      }}
    >
      {showBackground ? (
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-muted" aria-hidden>
          <div className="absolute inset-0 scale-110 blur-2xl" style={backgroundStyle} />
        </div>
      ) : null}
      {children}
    </div>
  );
}
