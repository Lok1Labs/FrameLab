"use client";

import * as React from "react";
import { SectionWrapper } from "./SectionWrapper";
import { Slider } from "@/components/ui/slider";
import { useImageStore, useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { meshGradients } from "@/lib/constants/mesh-gradients";

export function BackgroundEffectsSection() {
  const { setBackgroundConfig, backgroundNoise, setBackgroundNoise } = useImageStore();
  const { pattern, setPattern } = useEditorStore();

  return (
    <SectionWrapper title="Background Effects" defaultOpen={false}>
      <div className="space-y-3">
        {/* Mesh Gradients */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Mesh Gradients
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(meshGradients).map(([id, gradient]) => (
              <button
                key={id}
                onClick={() =>
                  setBackgroundConfig({
                    type: "gradient",
                    value: `mesh:${id}`,
                    opacity: 1,
                  })
                }
                className={cn(
                  "h-10 rounded-lg border transition-all duration-200 active:scale-[0.97]",
                  "border-border/30 hover:border-border/60 hover:ring-1 hover:ring-primary/30"
                )}
                style={{
                  background: gradient,
                }}
                aria-label={id.replace("mesh_", "")}
                title={id.replace("mesh_", "")}
              />
            ))}
          </div>
        </div>

        <Slider
          value={[backgroundNoise]}
          onValueChange={(value) => setBackgroundNoise(value[0])}
          min={0}
          max={100}
          step={1}
          label="Background Grain"
          valueDisplay={`${backgroundNoise}%`}
        />

        {/* Pattern Overlay */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pattern
          </p>
          <div className="flex gap-1">
            {[
              { id: "none", label: "Off" },
              { id: "grid", label: "Grid" },
              { id: "dots", label: "Dots" },
              { id: "lines", label: "Lines" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setPattern({
                    enabled: p.id !== "none",
                    type: p.id,
                    scale: pattern.scale,
                    spacing: pattern.spacing,
                    color: pattern.color,
                    rotation: pattern.rotation,
                    blur: pattern.blur,
                    opacity: pattern.opacity,
                  })
                }
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all border",
                  (p.id === "none" && !pattern.enabled) ||
                    (p.id === pattern.type && pattern.enabled)
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-border/30 text-muted-foreground hover:bg-accent"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {pattern.enabled && (
            <>
              <Slider
                value={[pattern.spacing]}
                onValueChange={(v) => setPattern({ spacing: v[0] })}
                min={5}
                max={60}
                step={1}
                label="Spacing"
                valueDisplay={`${pattern.spacing}px`}
              />
              <Slider
                value={[Math.round(pattern.opacity * 100)]}
                onValueChange={(v) => setPattern({ opacity: v[0] / 100 })}
                min={5}
                max={100}
                step={1}
                label="Pattern Opacity"
                valueDisplay={`${Math.round(pattern.opacity * 100)}%`}
              />
            </>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
