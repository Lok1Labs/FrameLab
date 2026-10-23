"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Add01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import { TOOL_DROPZONE_ACCEPT } from "./useToolQueue";
import { DROP_CARD_CLASS, DropSurface } from "./ui";

interface ToolDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  /** e.g. "PNG" on /png-to-jpg, so the prompt matches the page's promise. */
  sourceLabel?: string;
  /** Renders the slim "add more" bar instead of the full empty state. */
  compact?: boolean;
}

export function ToolDropzone({
  onFiles,
  multiple = true,
  sourceLabel,
  compact = false,
}: ToolDropzoneProps) {
  /**
   * Rejected files are forwarded too, rather than dropped here.
   *
   * react-dropzone filters on `accept` before this runs, so anything it turns
   * away would otherwise vanish with no feedback at all: dropping a lone .tiff
   * looked like the page was broken, and one bad file in a batch disappeared
   * unmentioned. The queue is the single place that validates and reports, so
   * everything is handed to it and it decides what to say.
   */
  const onDrop = React.useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      const all = [...accepted, ...rejected.map((entry) => entry.file)];
      if (all.length > 0) onFiles(all);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: TOOL_DROPZONE_ACCEPT,
    multiple,
    noClick: false,
  });

  const noun = sourceLabel ? `${sourceLabel} image` : "image";
  const plural = multiple ? `${noun}s` : noun;

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        {...getRootProps({
          className: cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/[0.03] hover:text-foreground",
            isDragActive && "border-foreground/50 bg-foreground/[0.06] text-foreground"
          ),
        })}
      >
        <input {...getInputProps()} />
        <Add01Icon size={16} aria-hidden="true" />
        {isDragActive ? `Drop to add ${plural}` : `Add more ${plural}`}
      </button>
    );
  }

  return (
    <div
      {...getRootProps({
        className: DROP_CARD_CLASS,
        role: "button",
        "aria-label": `Choose ${plural} to process`,
      })}
    >
      <input {...getInputProps()} />
      <DropSurface
        active={isDragActive}
        title={isDragActive ? `Drop to add ${plural}` : `Drop ${plural} here`}
        detail={
          multiple
            ? "Add one image or a whole batch, then pick your settings."
            : "One image at a time, cropped at full resolution."
        }
        action={`Choose ${plural}`}
        formats="PNG, JPG, WebP, and AVIF"
      />
    </div>
  );
}
