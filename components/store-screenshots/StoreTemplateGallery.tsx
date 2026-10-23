"use client";

import * as React from "react";
import { Cancel01Icon, Delete02Icon, Layers01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getStoreProfile } from "@/lib/store-screenshots/config";
import { createStarterStoreProject } from "@/lib/store-screenshots/project";
import type { StoreProject } from "@/lib/store-screenshots/types";
import { StoreSlideCanvas } from "./StoreSlideCanvas";

export function StoreTemplateGallery({
  onApply,
  onClose,
}: {
  onApply: (project: StoreProject) => void;
  onClose: () => void;
}): React.JSX.Element {
  const profile = getStoreProfile("app-store");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const chatGptTemplate = React.useMemo(() => createStarterStoreProject(), []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !confirmOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmOpen, onClose]);

  return (
    <>
      <section className="flex h-full min-h-0 flex-col bg-background">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-foreground/10 px-5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">App templates</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Start with a complete, coordinated screenshot set.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close template gallery"
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <Cancel01Icon size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-[1240px]">
            <article className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-sm">
              <div className="flex flex-col gap-4 border-b border-foreground/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.045] text-foreground">
                    <Layers01Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">ChatGPT</h2>
                      <span className="rounded-full border border-foreground/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        8 screens
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A polished feature story with soft gradients and ready-to-edit copy.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setConfirmOpen(true)}
                >
                  Use template
                </Button>
              </div>

              <div className="overflow-x-auto bg-foreground/[0.018] p-4 sm:p-5">
                <div className="grid min-w-[900px] grid-cols-8 gap-3">
                  {chatGptTemplate.slides.map((slide, index) => (
                    <StoreSlideCanvas
                      key={slide.id}
                      project={chatGptTemplate}
                      slide={slide}
                      slideIndex={index}
                      profile={profile}
                      className="w-full rounded-md shadow-md ring-1 ring-foreground/10"
                    />
                  ))}
                </div>
              </div>
            </article>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              More templates coming soon
            </p>
          </div>
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
              <Delete02Icon aria-hidden="true" size={18} />
            </div>
            <AlertDialogTitle>Use the ChatGPT template?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces your current screenshots and edits with the complete eight-screen template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onApply(chatGptTemplate)}>
              Use template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
