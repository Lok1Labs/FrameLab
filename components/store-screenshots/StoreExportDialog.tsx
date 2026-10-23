// Modified for FrameLab branding and maintainer contacts.
"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Download04Icon, Tick02Icon } from "hugeicons-react";
import { domToBlob } from "modern-screenshot";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STORE_OUTPUT_PROFILES } from "@/lib/store-screenshots/config";
import type { StoreOutputProfile, StoreProject } from "@/lib/store-screenshots/types";
import { StoreSlideCanvas } from "./StoreSlideCanvas";

interface RenderTarget {
  profile: StoreOutputProfile;
  slideIndex: number;
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForAssets(node: HTMLElement): Promise<void> {
  await document.fonts.ready;
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map(async (image) => {
    if (image.complete) {
      await image.decode().catch(() => undefined);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error("An image could not be rendered.")), { once: true });
    });
  }));
  await nextPaint();
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function StoreExportDialog({
  project,
  open,
  onOpenChange,
  requestId,
}: {
  project: StoreProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
}): React.JSX.Element {
  const [target, setTarget] = React.useState<RenderTarget>({
    profile: STORE_OUTPUT_PROFILES[0],
    slideIndex: 0,
  });
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });
  const renderRef = React.useRef<HTMLDivElement>(null);
  const handledRequestIdRef = React.useRef(0);

  const exportZip = React.useCallback(async (): Promise<void> => {
    if (isExporting) return;
    const profile = STORE_OUTPUT_PROFILES[0];
    const total = project.slides.length;
    setIsExporting(true);
    setProgress({ current: 0, total });

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      let completed = 0;

      const folder = zip.folder("app-store/iphone-6.9");
      if (!folder) throw new Error("Could not create the export package.");

      for (let slideIndex = 0; slideIndex < project.slides.length; slideIndex += 1) {
        flushSync(() => setTarget({ profile, slideIndex }));
        const node = renderRef.current;
        if (!node) throw new Error("The export renderer is not ready.");
        await waitForAssets(node);
        const blob = await domToBlob(node, {
          width: profile.width,
          height: profile.height,
          scale: 1,
          type: "image/png",
          backgroundColor: "#000000",
          timeout: 45_000,
        });
        folder.file(`${String(slideIndex + 1).padStart(2, "0")}.png`, blob);
        completed += 1;
        setProgress({ current: completed, total });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "framelab-store-assets.zip");
      toast.success("Store screenshots exported", {
        description: `${completed} PNG files packaged for App Store Connect.`,
      });
      onOpenChange(false);
    } catch (cause) {
      toast.error("Store export failed", {
        description: cause instanceof Error ? cause.message : "Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, onOpenChange, project]);

  React.useEffect(() => {
    if (!open || requestId === 0 || handledRequestIdRef.current === requestId) return;
    handledRequestIdRef.current = requestId;
    const frame = window.requestAnimationFrame(() => { void exportZip(); });
    return () => window.cancelAnimationFrame(frame);
  }, [exportZip, open, requestId]);

  const activeSlide = project.slides[target.slideIndex] ?? project.slides[0];

  return (
    <>
      <Dialog open={open} onOpenChange={isExporting ? undefined : onOpenChange}>
        <DialogContent className="max-w-[460px] gap-0 overflow-hidden p-0">
          <div className="p-5 pb-4">
            <DialogHeader>
              <DialogTitle>{isExporting ? "Preparing store assets" : "Export store screenshots"}</DialogTitle>
              <DialogDescription>
                {isExporting ? "Rendering exact store dimensions in your browser." : "Download your set at the exact App Store dimensions."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {isExporting ? (
            <div className="px-5 pb-5">
              <div className="rounded-lg border border-foreground/10 bg-foreground/[0.025] p-3.5">
                <div className="mb-3 flex items-center justify-between gap-4 text-xs">
                  <span className="font-medium text-foreground">
                    Screenshot {Math.min(progress.current + 1, progress.total)} of {progress.total}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {progress.total ? Math.round((progress.current / progress.total) * 100) : 0}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Store screenshot export progress"
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                  aria-valuenow={progress.current}
                  className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]"
                >
                  <div
                    className="h-full origin-left rounded-full bg-foreground transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `scaleX(${progress.total ? progress.current / progress.total : 0})` }}
                  />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Keep this window open while the full-resolution set is prepared.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-5 pb-5">
              <div className="flex w-full items-center gap-3 rounded-md border border-foreground/25 bg-foreground/[0.06] p-3 text-left">
                <span className="flex size-5 items-center justify-center rounded border border-foreground bg-foreground text-background">
                  <Tick02Icon size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{STORE_OUTPUT_PROFILES[0].shortName}</span>
                  <span className="mt-0.5 flex gap-2 text-[11px] text-muted-foreground">
                    <span>{STORE_OUTPUT_PROFILES[0].width} × {STORE_OUTPUT_PROFILES[0].height}px</span>
                    <span>{project.slides.length} {project.slides.length === 1 ? "file" : "files"}</span>
                  </span>
                </span>
              </div>
              <Button className="w-full" onClick={() => void exportZip()}>
                <Download04Icon size={16} /> Export ZIP
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {activeSlide ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -left-[20000px] top-0 overflow-hidden"
          style={{ width: target.profile.width, height: target.profile.height }}
        >
          <div ref={renderRef} style={{ width: target.profile.width, height: target.profile.height }}>
            <StoreSlideCanvas
              project={project}
              slide={activeSlide}
              slideIndex={target.slideIndex}
              profile={target.profile}
              exportMode
              className="h-full w-full"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
