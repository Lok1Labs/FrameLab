'use client';

import * as React from 'react';
import {
  ArrowLeftRightIcon,
  Cancel01Icon,
  Download04Icon,
  RefreshIcon,
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CARD_CLASS, DROP_CARD_CLASS, DropSurface } from '@/components/tools/ui';
import { cn } from '@/lib/utils';
import { downloadBlob } from '@/lib/image-tools/download';
import { formatBytes } from '@/lib/image-tools/format';
import {
  BackgroundRemovalError,
  SUPPORTED_TYPES,
  backgroundRemover,
  checkFile,
  cutoutFileName,
  type EdgeStyle,
  type RemovalProgress,
  type RemovalResult,
} from '@/lib/background-removal';

type EngineStatus =
  | { kind: 'checking' }
  | { kind: 'ready'; cached: boolean; modelBytes: number; gpu: boolean }
  | { kind: 'unsupported' };

type Phase =
  | { kind: 'idle' }
  | { kind: 'working'; file: File; sourceUrl: string; progress: RemovalProgress }
  | { kind: 'done'; file: File; sourceUrl: string; result: RemovalResult; resultUrl: string }
  | { kind: 'error'; message: string };

const EDGE_OPTIONS = [
  { id: 'crisp', label: 'Crisp edges' },
  { id: 'soft', label: 'Soft edges' },
];

const INITIAL_PROGRESS: RemovalProgress = {
  step: 'decoding',
  value: 0,
  label: 'Reading image',
};

/** Checkerboard that reads as "transparent" in both themes. */
const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: 'var(--background)',
  backgroundImage:
    'linear-gradient(45deg, var(--border) 25%, transparent 25%), linear-gradient(-45deg, var(--border) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--border) 75%), linear-gradient(-45deg, transparent 75%, var(--border) 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
};

function errorMessage(error: unknown): string {
  if (error instanceof BackgroundRemovalError) return error.message;
  return 'Something went wrong. Please try a different image.';
}

function StatusLine({ status }: { status: EngineStatus }) {
  let text: string;
  let tone = 'bg-muted-foreground/40';

  if (status.kind === 'checking') {
    text = 'Checking your browser…';
  } else if (status.kind === 'unsupported') {
    text = "Your browser can't run this tool. Please update it or use a current Chrome, Edge, Firefox, or Safari.";
    tone = 'bg-destructive';
  } else if (status.cached) {
    text = `Ready · AI model saved on this device · runs on ${status.gpu ? 'GPU' : 'CPU'}`;
    tone = 'bg-emerald-400';
  } else {
    text = `Ready · first use downloads the AI model (${formatBytes(status.modelBytes)})`;
    tone = 'bg-emerald-400';
  }

  return (
    <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground" aria-live="polite">
      <span className={cn('size-1.5 shrink-0 rounded-full', tone, status.kind === 'checking' && 'animate-pulse')} />
      {text}
    </p>
  );
}

function CompareSlider({ sourceUrl, resultUrl, width, height }: {
  sourceUrl: string;
  resultUrl: string;
  width: number;
  height: number;
}) {
  const [position, setPosition] = React.useState(50);

  return (
    <div
      className="relative mx-auto max-h-[60dvh] max-w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: `${width} / ${height}`, width: `min(100%, calc(60dvh * ${width / height}))` }}
    >
      <div className="absolute inset-0" style={CHECKERBOARD} />
      <img src={resultUrl} alt="Image with background removed" className="absolute inset-0 h-full w-full object-contain" />
      <img
        src={sourceUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]">
          <ArrowLeftRightIcon size={16} />
        </span>
      </div>
      <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
        Before
      </span>
      <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
        After
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function RemoveBackgroundApp() {
  const [status, setStatus] = React.useState<EngineStatus>({ kind: 'checking' });
  const [phase, setPhase] = React.useState<Phase>({ kind: 'idle' });
  const [edgeStyle, setEdgeStyle] = React.useState<EdgeStyle>('crisp');
  const [restyling, setRestyling] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const dragDepthRef = React.useRef(0);
  const urlsRef = React.useRef<string[]>([]);

  const trackUrl = React.useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  }, []);

  const releaseUrls = React.useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const { supported, gpu } = await backgroundRemover.detect();
      if (!supported) throw new Error('unsupported');
      const backend = gpu ? 'webgpu' : 'wasm';
      const cached = await backgroundRemover.preloadIfCached(backend);
      if (active) {
        setStatus({ kind: 'ready', cached, modelBytes: backgroundRemover.weightsBytes(backend), gpu });
      }
    })().catch(() => {
      if (active) setStatus({ kind: 'unsupported' });
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
      releaseUrls();
    };
  }, [releaseUrls]);

  const start = React.useCallback(
    async (file: File) => {
      const problem = checkFile(file);
      if (problem) {
        setPhase({
          kind: 'error',
          message:
            problem === 'file-too-large'
              ? 'That image is larger than 50 MB. Try a smaller copy.'
              : "That file type isn't supported. Use PNG, JPG, WebP, or AVIF.",
        });
        return;
      }

      abortRef.current?.abort();
      releaseUrls();
      const controller = new AbortController();
      abortRef.current = controller;

      const sourceUrl = trackUrl(file);
      setPhase({ kind: 'working', file, sourceUrl, progress: INITIAL_PROGRESS });

      try {
        const result = await backgroundRemover.remove(file, {
          edgeStyle,
          signal: controller.signal,
          onProgress: (progress) =>
            setPhase((current) =>
              current.kind === 'working' && current.file === file ? { ...current, progress } : current
            ),
        });
        setPhase({ kind: 'done', file, sourceUrl, result, resultUrl: trackUrl(result.blob) });
        setStatus((current) =>
          current.kind === 'ready'
            ? { ...current, cached: true, gpu: result.backend === 'webgpu' }
            : current
        );
      } catch (error) {
        if (error instanceof BackgroundRemovalError && error.code === 'aborted') return;
        setPhase({ kind: 'error', message: errorMessage(error) });
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [edgeStyle, releaseUrls, trackUrl]
  );

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    releaseUrls();
    setPhase({ kind: 'idle' });
  }, [releaseUrls]);

  const reset = React.useCallback(() => {
    releaseUrls();
    setPhase({ kind: 'idle' });
  }, [releaseUrls]);

  const changeEdgeStyle = React.useCallback(
    async (next: string) => {
      const nextStyle = next as EdgeStyle;
      setEdgeStyle(nextStyle);
      if (phase.kind !== 'done' || phase.result.edgeStyle === nextStyle) return;

      setRestyling(true);
      try {
        const result = await backgroundRemover.restyle(phase.result.id, nextStyle);
        const previousUrl = phase.resultUrl;
        const resultUrl = trackUrl(result.blob);
        setPhase((current) =>
          current.kind === 'done' && current.result.id === result.id
            ? { ...current, result, resultUrl }
            : current
        );
        URL.revokeObjectURL(previousUrl);
        urlsRef.current = urlsRef.current.filter((url) => url !== previousUrl);
      } catch (error) {
        setPhase({ kind: 'error', message: errorMessage(error) });
      } finally {
        setRestyling(false);
      }
    },
    [phase, trackUrl]
  );

  const download = React.useCallback(() => {
    if (phase.kind !== 'done') return;
    downloadBlob(phase.result.blob, cutoutFileName(phase.file.name));
  }, [phase]);

  const openPicker = React.useCallback(() => inputRef.current?.click(), []);

  // The app shell is one big drop target. data-local-dropzone keeps the
  // site-wide GlobalDropZone from sending the image to the editor instead.
  const dragHandlers = {
    onDragEnter: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!event.dataTransfer.types.includes('Files')) return;
      dragDepthRef.current += 1;
      setDragging(true);
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setDragging(false);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = 0;
      setDragging(false);
      const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/'))
        ?? event.dataTransfer.files[0];
      if (file) void start(file);
    },
  };

  const busy = phase.kind === 'working';
  const unsupported = status.kind === 'unsupported';

  return (
    <div
      data-local-dropzone=""
      className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center"
      {...dragHandlers}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void start(file);
        }}
      />

      <div className="w-full max-w-3xl">
        {phase.kind === 'idle' || phase.kind === 'error' ? (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={openPicker}
              disabled={unsupported}
              className={DROP_CARD_CLASS}
            >
              <DropSurface
                active={dragging}
                title={dragging ? 'Release to start' : 'Drop a photo here'}
                detail="The subject stays, the background turns transparent."
                action="Choose a photo"
                formats="PNG, JPG, WebP, or AVIF up to 50 MB"
              />
            </button>

            {phase.kind === 'error' ? (
              <p role="alert" className="text-sm text-destructive">
                {phase.message}
              </p>
            ) : null}

            <StatusLine status={status} />
          </div>
        ) : null}

        {phase.kind === 'working' ? (
          <div className={cn(CARD_CLASS, 'p-2')}>
            <div className="relative flex justify-center overflow-hidden rounded-xl bg-background/70 p-4 sm:p-6">
              <img
                src={phase.sourceUrl}
                alt="Image being processed"
                className="max-h-[52dvh] max-w-full rounded-lg object-contain opacity-40 blur-[1px]"
              />
              <div className="absolute inset-0 animate-pulse bg-foreground/[0.03]" />
            </div>
            <div className="flex items-center gap-4 px-3 pb-1 pt-3">
              <div className="min-w-0 flex-1" aria-live="polite">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{phase.progress.label}</span>
                  <span className="tabular-nums">{Math.round(phase.progress.value * 100)}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(phase.progress.value * 100)}
                  aria-label="Background removal progress"
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(2, phase.progress.value * 100)}%` }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancel}
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Cancel01Icon size={16} />
                Stop
              </Button>
            </div>
          </div>
        ) : null}

        {phase.kind === 'done' ? (
          <div className="flex flex-col items-center gap-4">
            <div className={cn(CARD_CLASS, 'w-full p-2')}>
              <div className="flex justify-center rounded-xl bg-background/70 p-4 sm:p-6">
                <CompareSlider
                  sourceUrl={phase.sourceUrl}
                  resultUrl={phase.resultUrl}
                  width={phase.result.width}
                  height={phase.result.height}
                />
              </div>

              <div className="flex flex-col gap-2 px-1 pb-1 pt-2 sm:flex-row sm:items-center">
                <SegmentedControl
                  options={EDGE_OPTIONS}
                  value={edgeStyle}
                  onChange={changeEdgeStyle}
                  ariaLabel="Edge style"
                  size="sm"
                  className="w-full sm:w-56"
                />
                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={openPicker}
                    disabled={busy}
                    className="flex-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:flex-none"
                  >
                    <RefreshIcon size={16} />
                    New image
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={download}
                    disabled={restyling}
                    className="flex-1 sm:flex-none"
                  >
                    <Download04Icon size={16} />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {phase.result.width}×{phase.result.height} ·{' '}
              {phase.result.backend === 'webgpu' ? 'GPU' : 'CPU'} ·{' '}
              {restyling ? 'applying edge style…' : `${(phase.result.elapsedMs / 1000).toFixed(1)}s`} ·{' '}
              <button type="button" onClick={reset} className="underline-offset-2 hover:text-foreground hover:underline">
                Clear
              </button>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
