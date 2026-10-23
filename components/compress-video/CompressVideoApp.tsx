'use client';

import * as React from 'react';
import {
  Cancel01Icon,
  Download04Icon,
  FileVideoIcon,
  Loading03Icon,
  MagicWand01Icon,
  RefreshIcon,
  Settings02Icon,
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { OptionGroup } from '@/components/tools/ToolOptions';
import { CARD_CLASS, DROP_CARD_CLASS, DropSurface } from '@/components/tools/ui';
import { cn } from '@/lib/utils';
import { downloadBlob } from '@/lib/image-tools/download';
import { formatBytes, savingsPercent } from '@/lib/image-tools/format';
import {
  ACCEPT,
  DEFAULT_SETTINGS,
  VideoCompressionError,
  cancelCompression,
  checkFile,
  clampTargetMb,
  compressVideo,
  compressedFileName,
  effectiveAudio,
  formatDuration,
  minimumTargetMb,
  probeVideo,
  targetVideoKbps,
  type AudioMode,
  type CompressSettings,
  type CompressionLevel,
  type ResolutionCap,
  type SizeMode,
  type VideoInfo,
} from '@/lib/video-compression';

interface Source {
  file: File;
  url: string;
}

interface Result {
  blob: Blob;
  url: string;
  elapsedMs: number;
  settings: CompressSettings;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'probing'; source: Source }
  | { kind: 'ready'; source: Source; info: VideoInfo }
  | { kind: 'working'; source: Source; info: VideoInfo; progress: number; etaSec: number | null }
  | { kind: 'done'; source: Source; info: VideoInfo; result: Result };

const MODE_OPTIONS = [
  { id: 'level', label: 'Quality level', tooltip: 'You choose how good it should look. The file size depends on the video.' },
  { id: 'target', label: 'Target size', tooltip: 'You choose the file size you need, like 25 MB. We make the video fit.' },
];

/** Plain language for people who don't know video terms; also shown under the buttons for touch screens. */
const LEVEL_HINTS: Record<CompressionLevel, string> = {
  light: 'Looks just like your original. The file gets a little smaller.',
  balanced: 'Much smaller file that still looks almost the same. Good for most videos.',
  strong: 'Even smaller file. Small details and text may look a bit blurry.',
  extreme: 'The smallest file. The video will look clearly blurry or blocky.',
};

const LEVEL_OPTIONS = (['light', 'balanced', 'strong', 'extreme'] as const).map((id) => ({
  id,
  label: id[0].toUpperCase() + id.slice(1),
  tooltip: LEVEL_HINTS[id],
}));

const TARGET_PRESETS = [10, 25, 50, 100];

const RESOLUTION_OPTIONS = [
  { id: 'original', label: 'Original', tooltip: 'Keeps the same picture size as your video.' },
  { id: '1080', label: '1080p', tooltip: 'Full HD. Sharp on computers and TVs.' },
  { id: '720', label: '720p', tooltip: 'HD. Looks good on phones and in chat apps, and the file is much smaller.' },
  { id: '480', label: '480p', tooltip: 'Small picture. Fine for quick previews, but blurry on big screens.' },
];

const AUDIO_OPTIONS = [
  { id: 'keep', label: 'Keep', tooltip: 'Keeps the sound as it is.' },
  { id: 'low', label: 'Smaller', tooltip: 'Slightly lower sound quality to save space. Voices still sound clear.' },
  { id: 'remove', label: 'Remove', tooltip: 'Removes the sound completely.' },
];

const MB = 1024 * 1024;

const ISOLATION_RELOAD_KEY = 'compress-video:isolation-reload';

function errorMessage(error: unknown): string {
  if (error instanceof VideoCompressionError) return error.message;
  return 'Something went wrong. Please try a different video.';
}

function fileProblemMessage(problem: 'invalid-type' | 'file-too-large'): string {
  return problem === 'file-too-large'
    ? 'That video is larger than 1 GB. Try a shorter clip.'
    : "That file isn't a video we can read. Use MP4, MOV, WebM, or MKV.";
}

function describe(info: VideoInfo): string {
  const parts = [`${info.width}×${info.height}`];
  if (info.durationSec) parts.push(formatDuration(info.durationSec));
  if (!info.hasAudio) parts.push('no audio');
  return parts.join(' · ');
}

/** Shows the video when the browser can play it, and a file card when it can't (MKV in Safari, for example). */
function VideoPreview({ src, label }: { src: string; label: string }) {
  const [playable, setPlayable] = React.useState(true);

  if (!playable) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-muted-foreground sm:h-72">
        <FileVideoIcon size={32} aria-hidden="true" />
        <p className="text-sm">Preview isn&apos;t available in this browser</p>
      </div>
    );
  }

  return (
    <video
      key={src}
      src={src}
      controls
      playsInline
      preload="metadata"
      aria-label={label}
      onError={() => setPlayable(false)}
      className="max-h-[52dvh] w-full rounded-lg bg-black object-contain"
    />
  );
}

export function CompressVideoApp() {
  const [phase, setPhase] = React.useState<Phase>({ kind: 'idle' });
  const [error, setError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<CompressSettings>(DEFAULT_SETTINGS);
  const [targetDraft, setTargetDraft] = React.useState(String(DEFAULT_SETTINGS.targetMb));
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragDepthRef = React.useRef(0);
  const runRef = React.useRef(0);
  const urlsRef = React.useRef<string[]>([]);

  const trackUrl = React.useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  }, []);

  const releaseUrl = React.useCallback((url: string) => {
    URL.revokeObjectURL(url);
    urlsRef.current = urlsRef.current.filter((item) => item !== url);
  }, []);

  const releaseUrls = React.useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  React.useEffect(() => {
    return () => {
      runRef.current += 1;
      releaseUrls();
    };
  }, [releaseUrls]);

  // Client-side navigation keeps the previous page's headers, so arriving via
  // a <Link> leaves the page without cross-origin isolation and FFmpeg falls
  // back to one thread, about 3x slower. One reload picks up this route's
  // COOP/COEP headers; the flag stops a loop in browsers that can't isolate.
  React.useEffect(() => {
    try {
      if (globalThis.crossOriginIsolated) {
        sessionStorage.removeItem(ISOLATION_RELOAD_KEY);
      } else if (!sessionStorage.getItem(ISOLATION_RELOAD_KEY)) {
        sessionStorage.setItem(ISOLATION_RELOAD_KEY, '1');
        window.location.reload();
      }
    } catch {
      // Storage blocked: run single-threaded rather than risk a reload loop.
    }
  }, []);

  const busy = phase.kind === 'probing' || phase.kind === 'working';

  const update = React.useCallback((updates: Partial<CompressSettings>) => {
    setSettings((current) => ({ ...current, ...updates }));
  }, []);

  const open = React.useCallback(
    async (file: File) => {
      const problem = checkFile(file);
      if (problem) {
        setError(fileProblemMessage(problem));
        return;
      }

      const run = ++runRef.current;
      releaseUrls();
      setError(null);
      const source = { file, url: trackUrl(file) };
      setPhase({ kind: 'probing', source });

      try {
        const info = await probeVideo(file);
        if (runRef.current !== run) return;
        setPhase({ kind: 'ready', source, info });
        if (info.durationSec === null) update({ mode: 'level' });
      } catch (caught) {
        if (runRef.current !== run) return;
        if (caught instanceof VideoCompressionError && caught.code === 'aborted') return;
        releaseUrls();
        setPhase({ kind: 'idle' });
        setError(errorMessage(caught));
      }
    },
    [releaseUrls, trackUrl, update]
  );

  const start = React.useCallback(async () => {
    if (phase.kind !== 'ready' && phase.kind !== 'done') return;
    const { source, info } = phase;
    if (phase.kind === 'done') releaseUrl(phase.result.url);

    const run = ++runRef.current;
    const used = { ...settings };
    const startedAt = performance.now();
    setError(null);
    setPhase({ kind: 'working', source, info, progress: 0, etaSec: null });

    try {
      const output = await compressVideo(source.file, info, used, {
        onProgress: (progress) => {
          if (runRef.current !== run) return;
          const elapsedSec = (performance.now() - startedAt) / 1000;
          // Early rates are noisy while the encoder warms up.
          const etaSec = progress > 0.03 && elapsedSec > 3 ? (elapsedSec * (1 - progress)) / progress : null;
          setPhase((current) => (current.kind === 'working' ? { ...current, progress, etaSec } : current));
        },
      });
      if (runRef.current !== run) return;
      setPhase({
        kind: 'done',
        source,
        info,
        result: { blob: output.blob, url: trackUrl(output.blob), elapsedMs: output.elapsedMs, settings: used },
      });
    } catch (caught) {
      if (runRef.current !== run) return;
      setPhase({ kind: 'ready', source, info });
      if (caught instanceof VideoCompressionError && caught.code === 'aborted') return;
      setError(errorMessage(caught));
    }
  }, [phase, releaseUrl, settings, trackUrl]);

  const stop = React.useCallback(() => {
    if (phase.kind !== 'working' && phase.kind !== 'probing') return;
    runRef.current += 1;
    cancelCompression();
    if (phase.kind === 'working') {
      setPhase({ kind: 'ready', source: phase.source, info: phase.info });
    } else {
      releaseUrls();
      setPhase({ kind: 'idle' });
    }
  }, [phase, releaseUrls]);

  const reset = React.useCallback(() => {
    if (busy) cancelCompression();
    runRef.current += 1;
    releaseUrls();
    setError(null);
    setPhase({ kind: 'idle' });
  }, [busy, releaseUrls]);

  const editSettings = React.useCallback(() => {
    if (phase.kind !== 'done') return;
    releaseUrl(phase.result.url);
    setPhase({ kind: 'ready', source: phase.source, info: phase.info });
  }, [phase, releaseUrl]);

  const download = React.useCallback(() => {
    if (phase.kind !== 'done') return;
    downloadBlob(phase.result.blob, compressedFileName(phase.source.file.name));
  }, [phase]);

  const openPicker = React.useCallback(() => inputRef.current?.click(), []);

  const commitTarget = React.useCallback(
    (raw: string) => {
      const targetMb = clampTargetMb(Number(raw));
      setTargetDraft(String(targetMb));
      update({ targetMb });
    },
    [update]
  );

  // data-local-dropzone keeps the site-wide GlobalDropZone from claiming the drop.
  const dragHandlers = {
    onDragEnter: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (busy || !event.dataTransfer.types.includes('Files')) return;
      dragDepthRef.current += 1;
      setDragging(true);
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = busy ? 'none' : 'copy';
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
      if (busy) return;
      const file = event.dataTransfer.files[0];
      if (file) void open(file);
    },
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      className="sr-only"
      tabIndex={-1}
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) void open(file);
      }}
    />
  );

  if (phase.kind === 'idle') {
    return (
      <div data-local-dropzone="" className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4" {...dragHandlers}>
        {fileInput}
        <button type="button" onClick={openPicker} className={DROP_CARD_CLASS}>
          <DropSurface
            active={dragging}
            title={dragging ? 'Release to open' : 'Drop a video here'}
            detail="Pick how small it should be, then compress it on your device."
            action="Choose a video"
            formats="MP4, MOV, WebM, or MKV up to 1 GB"
          />
        </button>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">
          The first video downloads the compression engine (about 30 MB). It is cached after that.
        </p>
      </div>
    );
  }

  const { source } = phase;
  const info = phase.kind === 'probing' ? null : phase.info;
  const duration = info?.durationSec ?? null;
  const targetKbps =
    settings.mode === 'target' && info && duration !== null
      ? targetVideoKbps(settings.targetMb, duration, effectiveAudio(info, settings.audio))
      : null;
  const targetProblem =
    settings.mode !== 'target' || !info
      ? null
      : duration === null
        ? "This video doesn't store its length, so a target size can't be calculated. Use a quality level instead."
        : targetKbps === null
          ? `Too small for a ${formatDuration(duration)} video. Use at least ${minimumTargetMb(duration, effectiveAudio(info, settings.audio))} MB${
              info.hasAudio && settings.audio !== 'remove'
                ? `, or remove the audio to go down to ${minimumTargetMb(duration, 'remove')} MB`
                : ''
            }.`
          : null;
  const alreadyUnderTarget =
    settings.mode === 'target' && !targetProblem && source.file.size <= settings.targetMb * MB;
  const controlsDisabled = busy;

  return (
    <div
      data-local-dropzone=""
      className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]"
      {...dragHandlers}
    >
      {fileInput}

      <div className={cn(CARD_CLASS, 'p-2', dragging && 'ring-foreground/40')}>
        <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
          <p className="min-w-0 truncate text-sm font-medium text-foreground" title={source.file.name}>
            {source.file.name}
            <span className="font-normal text-muted-foreground">
              {' '}
              · {formatBytes(source.file.size)}
              {info ? ` · ${describe(info)}` : ''}
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RefreshIcon size={15} aria-hidden="true" />
            New video
          </Button>
        </div>

        <div className="relative flex justify-center overflow-hidden rounded-xl bg-background/70 p-3 sm:p-4">
          {phase.kind === 'done' ? (
            <VideoPreview src={phase.result.url} label="Compressed video" />
          ) : (
            <VideoPreview src={source.url} label="Original video" />
          )}
        </div>

        {phase.kind === 'probing' || phase.kind === 'working' ? (
          <div className="flex items-center gap-4 px-3 pb-1 pt-3">
            <div className="min-w-0 flex-1" aria-live="polite">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {phase.kind === 'probing'
                    ? 'Loading the video engine and reading the file…'
                    : phase.etaSec !== null
                      ? `Compressing - about ${formatDuration(phase.etaSec)} min left`
                      : 'Compressing…'}
                </span>
                {phase.kind === 'working' ? (
                  <span className="tabular-nums">{Math.round(phase.progress * 100)}%</span>
                ) : null}
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={phase.kind === 'working' ? Math.round(phase.progress * 100) : undefined}
                aria-label="Video compression progress"
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    'h-full rounded-full bg-foreground transition-[width] duration-300 ease-out',
                    phase.kind === 'probing' && 'animate-pulse'
                  )}
                  style={{ width: phase.kind === 'working' ? `${Math.max(2, phase.progress * 100)}%` : '12%' }}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={stop}
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Cancel01Icon size={16} aria-hidden="true" />
              Stop
            </Button>
          </div>
        ) : null}
      </div>

      <aside className={cn(CARD_CLASS, 'flex flex-col gap-5 p-5 lg:sticky lg:top-24')}>
        {phase.kind === 'done' ? (
          <DoneSummary
            originalBytes={source.file.size}
            result={phase.result}
            onDownload={download}
            onEditSettings={editSettings}
          />
        ) : (
          <>
            <OptionGroup label="Compress by">
              <SegmentedControl
                options={MODE_OPTIONS}
                value={settings.mode}
                onChange={(mode) => update({ mode: mode as SizeMode })}
                ariaLabel="Compress by"
                size="sm"
              />
            </OptionGroup>

            {settings.mode === 'level' ? (
              <OptionGroup label="Compression" hint={LEVEL_HINTS[settings.level]}>
                <SegmentedControl
                  options={LEVEL_OPTIONS}
                  value={settings.level}
                  onChange={(level) => update({ level: level as CompressionLevel })}
                  ariaLabel="Compression level"
                  size="sm"
                />
              </OptionGroup>
            ) : (
              <OptionGroup
                label="Target size"
                hint="The video is compressed to fit under this size, for upload limits like email (25 MB) or Discord (10 MB)."
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={1}
                    value={targetDraft}
                    disabled={controlsDisabled}
                    onChange={(event) => setTargetDraft(event.target.value)}
                    onBlur={(event) => commitTarget(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitTarget(event.currentTarget.value);
                    }}
                    aria-label="Target size in megabytes"
                    className="w-24 tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">MB</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={controlsDisabled}
                      onClick={() => commitTarget(String(preset))}
                      aria-pressed={settings.targetMb === preset}
                      className={cn(
                        'h-7 rounded-md px-2.5 text-xs font-medium ring-1 ring-inset ring-border transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 disabled:opacity-50 max-[768px]:h-9',
                        settings.targetMb === preset ? 'bg-foreground/[0.1] text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {preset} MB
                    </button>
                  ))}
                </div>
                {targetProblem ? (
                  <p className="text-xs text-amber-500">{targetProblem}</p>
                ) : alreadyUnderTarget ? (
                  <p className="text-xs text-muted-foreground">
                    Your video is already under {settings.targetMb} MB, so this won&apos;t make it smaller.
                  </p>
                ) : null}
              </OptionGroup>
            )}

            <OptionGroup label="Max resolution" hint="Lower resolutions shrink the file most. Videos are never upscaled.">
              <SegmentedControl
                options={RESOLUTION_OPTIONS}
                value={settings.resolution}
                onChange={(resolution) => update({ resolution: resolution as ResolutionCap })}
                ariaLabel="Maximum resolution"
                size="sm"
              />
            </OptionGroup>

            {!info || info.hasAudio ? (
              <OptionGroup label="Audio">
                <SegmentedControl
                  options={AUDIO_OPTIONS}
                  value={settings.audio}
                  onChange={(audio) => update({ audio: audio as AudioMode })}
                  ariaLabel="Audio"
                  size="sm"
                />
              </OptionGroup>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-border pt-5">
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {busy ? (
                <Button disabled size="lg" className="w-full">
                  <Loading03Icon size={16} className="animate-spin" aria-hidden="true" />
                  {phase.kind === 'probing' ? 'Reading video' : 'Compressing'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => void start()}
                  disabled={Boolean(targetProblem)}
                  className="w-full"
                >
                  <MagicWand01Icon size={16} aria-hidden="true" />
                  Compress video
                </Button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function DoneSummary({
  originalBytes,
  result,
  onDownload,
  onEditSettings,
}: {
  originalBytes: number;
  result: Result;
  onDownload: () => void;
  onEditSettings: () => void;
}) {
  const saved = savingsPercent(originalBytes, result.blob.size);
  const overTarget = result.settings.mode === 'target' && result.blob.size > result.settings.targetMb * MB;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl bg-foreground/[0.04] px-3.5 py-3 text-sm">
        <span className="text-muted-foreground">
          {formatBytes(originalBytes)} →{' '}
          <span className="text-foreground">{formatBytes(result.blob.size)}</span>
        </span>
        {saved > 0 ? (
          <span className="font-semibold text-emerald-500">{saved}% smaller</span>
        ) : saved < 0 ? (
          <span className="font-semibold text-amber-500">{Math.abs(saved)}% bigger</span>
        ) : (
          <span className="text-muted-foreground">Same size</span>
        )}
      </div>

      {saved <= 0 ? (
        <p className="text-xs text-muted-foreground">
          Your original is already well compressed. Keep it, or try a stronger level or a lower resolution.
        </p>
      ) : overTarget ? (
        <p className="text-xs text-amber-500">
          This came out just over {result.settings.targetMb} MB. Try a slightly lower target.
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        MP4 (H.264) · done in {formatDuration(result.elapsedMs / 1000)}
      </p>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Button size="lg" onClick={onDownload} className="w-full">
          <Download04Icon size={16} aria-hidden="true" />
          Download MP4
        </Button>
        <Button variant="ghost" onClick={onEditSettings} className="w-full text-muted-foreground">
          <Settings02Icon size={16} aria-hidden="true" />
          Change settings
        </Button>
      </div>
    </div>
  );
}
