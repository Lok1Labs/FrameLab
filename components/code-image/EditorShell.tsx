// Modified for FrameLab branding; original FrameLab implementation retained.
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { domToBlob } from 'modern-screenshot';
import { toast } from 'sonner';
import { Drawer } from 'vaul';
import {
  Copy01Icon,
  Link01Icon,
  Download04Icon,
  ArrowDown01Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Share01Icon,
  Settings02Icon,
} from 'hugeicons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/i18n/LanguageSwitch';

const SCALE_OPTIONS = [2, 4] as const;
const EXPORTED_FLASH_MS = 1500;

export function decodeHashState<T>(hash: string): Partial<T> | null {
  try {
    return JSON.parse(decodeURIComponent(atob(hash)));
  } catch (error) {
    console.warn('Could not parse editor state from URL', error);
    return null;
  }
}

export function encodeHashState<T>(state: T): string {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

interface ExportOptions {
  fileName: string;
  shareTitle: string;
}

/** Export, copy, share, and keyboard shortcuts for a captured frame. */
export function useFrameExport(
  frameRef: React.RefObject<HTMLDivElement | null>,
  { fileName, shareTitle }: ExportOptions,
) {
  const [exportScale, setExportScale] = React.useState<number>(2);
  const [exporting, setExporting] = React.useState(false);
  const [justExported, setJustExported] = React.useState(false);
  const [copying, setCopying] = React.useState(false);

  const captureBlob = React.useCallback(async () => {
    if (!frameRef.current) return null;
    await document.fonts.ready;
    return domToBlob(frameRef.current, {
      scale: exportScale,
      filter: (el) => !(el instanceof HTMLTextAreaElement),
    });
  }, [frameRef, exportScale]);

  const exportPng = React.useCallback(async () => {
    setExporting(true);
    try {
      const blob = await captureBlob();
      if (!blob) throw new Error('Export produced no image');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Image exported');
      setJustExported(true);
      setTimeout(() => setJustExported(false), EXPORTED_FLASH_MS);
    } catch (error) {
      console.error('Image export failed', error);
      toast.error('Could not export image');
    } finally {
      setExporting(false);
    }
  }, [captureBlob, fileName]);

  const copyImage = React.useCallback(async () => {
    setCopying(true);
    try {
      const blob = await captureBlob();
      if (!blob) throw new Error('Copy produced no image');
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success('Image copied to clipboard');
    } catch (error) {
      console.error('Image copy failed', error);
      toast.error('Could not copy image');
    } finally {
      setCopying(false);
    }
  }, [captureBlob]);

  const copyUrl = React.useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast.success('URL copied'),
      () => toast.error('Could not copy URL'),
    );
  }, []);

  const share = React.useCallback(async () => {
    try {
      const blob = await captureBlob();
      if (blob) {
        const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: shareTitle });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success('URL copied to clipboard');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href).catch(() => {});
        toast.success('URL copied to clipboard');
      }
    }
  }, [captureBlob, fileName, shareTitle]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportPng();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyImage();
      } else if (e.key === 'Escape') {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exportPng, copyImage]);

  return {
    exportScale,
    setExportScale,
    exporting,
    justExported,
    copying,
    exportPng,
    copyImage,
    copyUrl,
    share,
  };
}

export type FrameExport = ReturnType<typeof useFrameExport>;

/** Tracks whether the stage is on screen and how wide it is. */
export function useStage() {
  const stageRef = React.useRef<HTMLElement>(null);
  const [stageVisible, setStageVisible] = React.useState(true);
  const [stageWidth, setStageWidth] = React.useState(0);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const visibility = new IntersectionObserver(
      ([entry]) => setStageVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -110px 0px', threshold: 0 },
    );
    const size = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    visibility.observe(stage);
    size.observe(stage);
    return () => {
      visibility.disconnect();
      size.disconnect();
    };
  }, []);

  return { stageRef, stageVisible, stageWidth };
}

export interface Shortcut {
  label: string;
  keys: string;
}

interface EditorTopBarProps {
  title: string;
  description: string;
  shortcuts: Shortcut[];
  frameExport: FrameExport;
}

export function EditorTopBar({ title, description, shortcuts, frameExport }: EditorTopBarProps) {
  const {
    exportScale,
    setExportScale,
    exporting,
    justExported,
    copying,
    exportPng,
    copyImage,
    copyUrl,
  } = frameExport;

  return (
    <header className="flex h-[50px] shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Choose a FrameLab tool"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo-mark.png"
            alt="FrameLab"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
        </Link>
        <span className="text-sm font-medium text-white/90">{title}</span>
        <span className="hidden text-xs text-white/40 sm:inline">
          FrameLab · by Lok1Labs
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitch />
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">
              <InformationCircleIcon size={16} />
              About
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.label} className="flex items-center justify-between">
                  <span>{shortcut.label}</span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">{shortcut.keys}</kbd>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="hidden items-center lg:flex">
          <Button
            type="button"
            size="sm"
            onClick={exportPng}
            disabled={exporting}
            className="rounded-r-none"
          >
            {justExported ? (
              <CheckmarkCircle02Icon size={16} />
            ) : (
              <Download04Icon size={16} />
            )}
            {justExported ? 'Exported' : exporting ? 'Exporting…' : 'Export Image'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                aria-label="More export options"
                className="rounded-l-none border-l border-l-black/15 px-2"
              >
                <ArrowDown01Icon size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={exportPng}>
                <Download04Icon size={15} />
                Export PNG
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyImage} disabled={copying}>
                <Copy01Icon size={15} />
                {copying ? 'Copying…' : 'Copy Image'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyUrl}>
                <Link01Icon size={15} />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {SCALE_OPTIONS.map((scale) => (
                <DropdownMenuItem key={scale} onSelect={() => setExportScale(scale)}>
                  <span className={exportScale === scale ? 'font-medium text-foreground' : ''}>
                    Export at {scale}x
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

interface EditorStageProps {
  stageRef: React.RefObject<HTMLElement | null>;
  scale: number;
  frameWidth: number;
  header?: React.ReactNode;
  children: React.ReactNode;
}

/** The dark stage that centers the frame and scales it down to fit small screens. */
export function EditorStage({ stageRef, scale, frameWidth, header, children }: EditorStageProps) {
  const frameBoxRef = React.useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = React.useState(0);

  React.useEffect(() => {
    const box = frameBoxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setFrameHeight(entry.contentRect.height));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const scaled = scale < 1;

  return (
    <main
      ref={stageRef}
      className="relative min-h-[calc(100dvh-50px)] flex-1 overflow-hidden lg:overflow-auto"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%)',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-50px)] flex-col items-center justify-center gap-6 px-3 pb-24 pt-6 lg:min-w-fit lg:px-6 lg:pb-32 lg:pt-10">
        {header}
        <div style={scaled ? { width: frameWidth * scale, height: frameHeight * scale } : undefined}>
          <div
            ref={frameBoxRef}
            style={scaled ? { width: frameWidth, transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export function FloatingControls({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-20 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl bg-[#1f1f1f]/95 shadow-2xl ring-1 ring-white/10 backdrop-blur transition-all duration-300 ease-out motion-reduce:transition-none ${
        mounted && visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="scrollbar-none flex items-end gap-5 overflow-x-auto sm:overflow-visible px-4 py-3">
        {children}
      </div>
      <div className="mx-auto h-1 w-10 rounded-full bg-white/10" aria-hidden />
    </div>
  );
}

export function ControlDivider() {
  return <span className="mb-1.5 h-8 w-px shrink-0 bg-white/10" aria-hidden />;
}

export function ControlField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">
        {label}
      </span>
      {children}
    </div>
  );
}

export function MobileControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-4">
      <span className="text-base text-white/80">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface ControlsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ControlsDrawer({ open, onOpenChange, children }: ControlsDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] rounded-t-2xl bg-[#1f1f1f] text-white outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/30" />
          <Drawer.Title className="sr-only">Customize</Drawer.Title>
          <div
            className="space-y-1 overflow-y-auto px-5 pt-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function MobileActionBar({
  onCustomize,
  frameExport,
}: {
  onCustomize: () => void;
  frameExport: FrameExport;
}) {
  const { share, exportPng, exporting, justExported } = frameExport;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-[#1f1f1f]/95 backdrop-blur-lg"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCustomize}
          className="text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Settings02Icon size={18} />
          Customize
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={share}
          className="text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Share01Icon size={18} />
          Share
        </Button>
        <Button type="button" size="sm" onClick={exportPng} disabled={exporting}>
          {justExported ? <CheckmarkCircle02Icon size={16} /> : <Download04Icon size={16} />}
          {justExported ? 'Exported' : exporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>
    </div>
  );
}
