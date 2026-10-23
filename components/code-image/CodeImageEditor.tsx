'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { CodeFrame } from './CodeFrame';
import { BackgroundPicker } from './BackgroundPicker';
import type { BackgroundSelection } from './code-backgrounds';
import {
  CODE_THEMES,
  LANGUAGES,
  GOOGLE_FONTS_URL,
  PADDING_OPTIONS,
  FRAME_WIDTH_MIN,
  FRAME_WIDTH_MAX,
  DEFAULT_STATE,
  type CodeImageState,
  type WindowStyle,
} from './code-themes';
import {
  ControlDivider,
  ControlField,
  ControlsDrawer,
  EditorStage,
  EditorTopBar,
  FloatingControls,
  MobileActionBar,
  MobileControlRow,
  decodeHashState,
  encodeHashState,
  useFrameExport,
  useStage,
  type Shortcut,
} from './EditorShell';

const GOOGLE_FONTS_LINK_ID = 'code-image-google-fonts';
const HASH_WRITE_DELAY = 400;

const ABOUT =
  'Turn a code snippet into a beautiful, shareable image. Pick a theme, background, and window style, then export a crisp PNG.';

const SHORTCUTS: Shortcut[] = [
  { label: 'Export image', keys: 'Cmd/Ctrl+S' },
  { label: 'Copy image', keys: 'Cmd/Ctrl+Shift+C' },
  { label: 'Indent / dedent line', keys: 'Tab / Shift+Tab' },
  { label: 'Exit editing', keys: 'Esc' },
];

function decodeState(hash: string): Partial<CodeImageState> | null {
  const parsed = decodeHashState<CodeImageState>(hash);
  if (!parsed) return null;
  if (parsed.width) {
    parsed.width = Math.min(FRAME_WIDTH_MAX, Math.max(FRAME_WIDTH_MIN, parsed.width));
  }
  if (parsed.theme && !CODE_THEMES.some((t) => t.id === parsed.theme)) {
    parsed.theme = DEFAULT_STATE.theme;
  }
  return parsed;
}

function ThemeSwatch({ color }: { color: string }) {
  return (
    <span
      className="size-3 shrink-0 rounded-full border border-white/10"
      style={{ background: color }}
    />
  );
}

interface BottomControlsProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (show: boolean) => void;
  background: BackgroundSelection;
  onBackgroundChange: (background: BackgroundSelection) => void;
  lineNumbers: boolean;
  onLineNumbersChange: (on: boolean) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  lang: string;
  onLangChange: (lang: string) => void;
  windowStyle: WindowStyle;
  onWindowStyleChange: (style: WindowStyle) => void;
}

const BottomControls = React.memo(function BottomControls({
  theme,
  onThemeChange,
  dark,
  onDarkChange,
  showBackground,
  onShowBackgroundChange,
  background,
  onBackgroundChange,
  lineNumbers,
  onLineNumbersChange,
  padding,
  onPaddingChange,
  lang,
  onLangChange,
  windowStyle,
  onWindowStyleChange,
  visible,
}: BottomControlsProps & { visible: boolean }) {
  const activeTheme = CODE_THEMES.find((t) => t.id === theme) ?? CODE_THEMES[0];

  return (
    <FloatingControls visible={visible}>
      <ControlField label="Theme">
        <Select value={theme} onValueChange={onThemeChange}>
          <SelectTrigger size="sm" className="w-[150px] border-white/10 bg-white/[0.04] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CODE_THEMES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <ThemeSwatch color={t.swatch} />
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ControlField>

      <ControlDivider />

      <ControlField label="Background">
        <div className="flex items-center gap-2">
          <Switch checked={showBackground} onCheckedChange={onShowBackgroundChange} aria-label="Background" />
          <BackgroundPicker
            theme={activeTheme}
            dark={dark}
            background={background}
            onBackgroundChange={onBackgroundChange}
            disabled={!showBackground}
          />
        </div>
      </ControlField>

      <ControlField label="Dark mode">
        <Switch checked={dark} onCheckedChange={onDarkChange} aria-label="Dark mode" />
      </ControlField>

      <ControlField label="Line numbers">
        <Switch checked={lineNumbers} onCheckedChange={onLineNumbersChange} aria-label="Line numbers" />
      </ControlField>

      <ControlDivider />

      <ControlField label="Padding">
        <SegmentedControl
          size="sm"
          className="w-[168px] bg-white/[0.04]"
          options={PADDING_OPTIONS.map((p) => ({ id: String(p), label: String(p) }))}
          value={String(padding)}
          onChange={(v) => onPaddingChange(Number(v))}
        />
      </ControlField>

      <ControlField label="Window">
        <SegmentedControl
          size="sm"
          className="w-20 bg-white/[0.04]"
          options={[
            { id: 'none', label: 'None' },
            { id: 'mac', label: 'Mac' },
          ]}
          value={windowStyle}
          onChange={(v) => onWindowStyleChange(v as WindowStyle)}
        />
      </ControlField>

      <ControlDivider />

      <ControlField label="Language">
        <Select value={lang} onValueChange={onLangChange}>
          <SelectTrigger size="sm" className="w-[150px] border-white/10 bg-white/[0.04] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ControlField>
    </FloatingControls>
  );
});

interface MobileControlsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (show: boolean) => void;
  background: BackgroundSelection;
  onBackgroundChange: (background: BackgroundSelection) => void;
  lineNumbers: boolean;
  onLineNumbersChange: (on: boolean) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  lang: string;
  onLangChange: (lang: string) => void;
  windowStyle: WindowStyle;
  onWindowStyleChange: (style: WindowStyle) => void;
}

const MobileControlsDrawer = React.memo(function MobileControlsDrawer({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  dark,
  onDarkChange,
  showBackground,
  onShowBackgroundChange,
  background,
  onBackgroundChange,
  lineNumbers,
  onLineNumbersChange,
  padding,
  onPaddingChange,
  lang,
  onLangChange,
  windowStyle,
  onWindowStyleChange,
}: MobileControlsDrawerProps) {
  const activeTheme = CODE_THEMES.find((t) => t.id === theme) ?? CODE_THEMES[0];

  return (
    <ControlsDrawer open={open} onOpenChange={onOpenChange}>
      <MobileControlRow label="Theme">
        <Select value={theme} onValueChange={onThemeChange}>
          <SelectTrigger size="sm" className="w-[160px] border-white/10 bg-white/[0.04] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CODE_THEMES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <ThemeSwatch color={t.swatch} />
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MobileControlRow>

      <MobileControlRow label="Language">
        <Select value={lang} onValueChange={onLangChange}>
          <SelectTrigger size="sm" className="w-[160px] border-white/10 bg-white/[0.04] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MobileControlRow>

      <div className="h-px bg-white/10" />

      <MobileControlRow label="Background">
        <div className="flex items-center gap-3">
          <BackgroundPicker
            theme={activeTheme}
            dark={dark}
            background={background}
            onBackgroundChange={onBackgroundChange}
            disabled={!showBackground}
          />
          <Switch checked={showBackground} onCheckedChange={onShowBackgroundChange} />
        </div>
      </MobileControlRow>

      <MobileControlRow label="Dark mode">
        <Switch checked={dark} onCheckedChange={onDarkChange} />
      </MobileControlRow>

      <MobileControlRow label="Line numbers">
        <Switch checked={lineNumbers} onCheckedChange={onLineNumbersChange} />
      </MobileControlRow>

      <div className="h-px bg-white/10" />

      <MobileControlRow label="Padding">
        <SegmentedControl
          size="sm"
          className="w-[180px] bg-white/[0.04]"
          options={PADDING_OPTIONS.map((p) => ({ id: String(p), label: String(p) }))}
          value={String(padding)}
          onChange={(v) => onPaddingChange(Number(v))}
        />
      </MobileControlRow>

      <MobileControlRow label="Window">
        <SegmentedControl
          size="sm"
          className="w-[110px] bg-white/[0.04]"
          options={[
            { id: 'none', label: 'None' },
            { id: 'mac', label: 'Mac' },
          ]}
          value={windowStyle}
          onChange={(v) => onWindowStyleChange(v as WindowStyle)}
        />
      </MobileControlRow>
    </ControlsDrawer>
  );
});

export function CodeImageEditor() {
  const [state, setState] = React.useState<CodeImageState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const { stageRef, stageVisible, stageWidth } = useStage();
  const frameExport = useFrameExport(frameRef, {
    fileName: state.title || 'code-image',
    shareTitle: state.title || 'Code Image',
  });

  const update = React.useCallback((patch: Partial<CodeImageState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  React.useEffect(() => {
    if (!document.getElementById(GOOGLE_FONTS_LINK_ID)) {
      const link = document.createElement('link');
      link.id = GOOGLE_FONTS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }

    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeState(hash);
      if (decoded) {
        setState((s) => ({ ...s, ...decoded }));
      }
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', `#${encodeHashState(state)}`);
    }, HASH_WRITE_DELAY);
    return () => clearTimeout(timer);
  }, [state, hydrated]);

  const frameTotal = state.width + state.padding * 2;
  const mobileScale = isMobile && stageWidth > 0 && stageWidth < frameTotal
    ? (stageWidth - 24) / frameTotal
    : 1;

  const onThemeChange = React.useCallback((theme: string) => update({ theme }), [update]);
  const onDarkChange = React.useCallback((dark: boolean) => update({ dark }), [update]);
  const onShowBackgroundChange = React.useCallback(
    (showBackground: boolean) => update({ showBackground }),
    [update],
  );
  const onBackgroundChange = React.useCallback(
    (background: BackgroundSelection) => update({ background }),
    [update],
  );
  const onLineNumbersChange = React.useCallback(
    (lineNumbers: boolean) => update({ lineNumbers }),
    [update],
  );
  const onPaddingChange = React.useCallback((padding: number) => update({ padding }), [update]);
  const onLangChange = React.useCallback((lang: string) => update({ lang }), [update]);
  const onWindowStyleChange = React.useCallback(
    (window: WindowStyle) => update({ window }),
    [update],
  );
  const onCodeChange = React.useCallback((code: string) => update({ code }), [update]);
  const onTitleChange = React.useCallback((title: string) => update({ title }), [update]);
  const onWidthChange = React.useCallback((width: number) => update({ width }), [update]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#181818]">
      <EditorTopBar
        title="Code Images"
        description={ABOUT}
        shortcuts={SHORTCUTS}
        frameExport={frameExport}
      />

      <EditorStage stageRef={stageRef} scale={mobileScale} frameWidth={frameTotal}>
        <CodeFrame
          ref={frameRef}
          editable
          code={state.code}
          onCodeChange={onCodeChange}
          themeId={state.theme}
          lang={state.lang}
          dark={state.dark}
          showBackground={state.showBackground}
          background={state.background}
          padding={state.padding}
          lineNumbers={state.lineNumbers}
          fontId={state.font}
          windowStyle={state.window}
          title={state.title}
          onTitleChange={onTitleChange}
          width={state.width}
          onWidthChange={isMobile ? undefined : onWidthChange}
        />
      </EditorStage>

      {isMobile ? (
        <>
          <MobileActionBar
            onCustomize={() => setDrawerOpen(true)}
            frameExport={frameExport}
          />
          <MobileControlsDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            theme={state.theme}
            onThemeChange={onThemeChange}
            dark={state.dark}
            onDarkChange={onDarkChange}
            showBackground={state.showBackground}
            onShowBackgroundChange={onShowBackgroundChange}
            background={state.background}
            onBackgroundChange={onBackgroundChange}
            lineNumbers={state.lineNumbers}
            onLineNumbersChange={onLineNumbersChange}
            padding={state.padding}
            onPaddingChange={onPaddingChange}
            lang={state.lang}
            onLangChange={onLangChange}
            windowStyle={state.window}
            onWindowStyleChange={onWindowStyleChange}
          />
        </>
      ) : (
        <BottomControls
          theme={state.theme}
          onThemeChange={onThemeChange}
          dark={state.dark}
          onDarkChange={onDarkChange}
          showBackground={state.showBackground}
          onShowBackgroundChange={onShowBackgroundChange}
          background={state.background}
          onBackgroundChange={onBackgroundChange}
          lineNumbers={state.lineNumbers}
          onLineNumbersChange={onLineNumbersChange}
          padding={state.padding}
          onPaddingChange={onPaddingChange}
          lang={state.lang}
          onLangChange={onLangChange}
          windowStyle={state.window}
          onWindowStyleChange={onWindowStyleChange}
          visible={stageVisible}
        />
      )}
    </div>
  );
}
