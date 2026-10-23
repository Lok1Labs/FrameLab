'use client';

import * as React from 'react';
import { LinkSquare02Icon, Loading03Icon } from 'hugeicons-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { BackgroundPicker } from '@/components/code-image/BackgroundPicker';
import {
  frameBackgroundStyle,
  resolveCodeBackground,
  type BackgroundSelection,
  type GradientTheme,
} from '@/components/code-image/code-backgrounds';
import { PADDING_OPTIONS } from '@/components/code-image/code-themes';
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
} from '@/components/code-image/EditorShell';
import {
  SAMPLE_TWEET,
  TWEET_WIDTH,
  TweetCard,
  parseTweetId,
  type TweetData,
  type TweetTheme,
} from './TweetCard';

const HASH_WRITE_DELAY = 400;
const FETCH_TIMEOUT_MS = 20000;
const TWEET_GRADIENT: GradientTheme = { from: '#8ec5fc', to: '#4f46e5' };

const ABOUT =
  'Turn any post on X into a clean, shareable image. Paste a link, pick a light or dark card and a background, then export a crisp PNG.';

const SHORTCUTS: Shortcut[] = [
  { label: 'Export image', keys: 'Cmd/Ctrl+S' },
  { label: 'Copy image', keys: 'Cmd/Ctrl+Shift+C' },
  { label: 'Exit editing', keys: 'Esc' },
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const PADDING_SEGMENTS = PADDING_OPTIONS.map((p) => ({ id: String(p), label: String(p) }));

interface TweetImageState {
  id: string;
  theme: TweetTheme;
  showBackground: boolean;
  background: BackgroundSelection;
  padding: number;
}

const DEFAULT_STATE: TweetImageState = {
  id: '',
  theme: 'light',
  showBackground: true,
  background: { kind: 'theme', id: '' },
  padding: 64,
};

function decodeState(hash: string): Partial<TweetImageState> | null {
  const parsed = decodeHashState<TweetImageState>(hash);
  if (!parsed) return null;
  if (parsed.theme !== 'light' && parsed.theme !== 'dark') delete parsed.theme;
  if (parsed.id && !parseTweetId(parsed.id)) delete parsed.id;
  return parsed;
}

interface TweetFrameProps {
  tweet: TweetData;
  theme: TweetTheme;
  showBackground: boolean;
  background: BackgroundSelection;
  padding: number;
}

const TweetFrame = React.forwardRef<HTMLDivElement, TweetFrameProps>(function TweetFrame(
  { tweet, theme, showBackground, background, padding },
  ref,
) {
  const dark = theme === 'dark';
  const resolved = React.useMemo(
    () => resolveCodeBackground(background, TWEET_GRADIENT, dark),
    [background, dark],
  );

  return (
    <div
      ref={ref}
      className="transition-[background-color] duration-200 ease-out motion-reduce:transition-none"
      style={{ ...frameBackgroundStyle(showBackground, resolved, dark), padding }}
    >
      <div
        style={{
          width: TWEET_WIDTH,
          borderRadius: 16,
          overflow: 'hidden',
          outline: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
          outlineOffset: -1,
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5), 0 8px 20px -8px rgba(0,0,0,0.4)',
        }}
      >
        <TweetCard tweet={tweet} theme={theme} />
      </div>
    </div>
  );
});

interface ControlsProps {
  theme: TweetTheme;
  onThemeChange: (theme: TweetTheme) => void;
  showBackground: boolean;
  onShowBackgroundChange: (show: boolean) => void;
  background: BackgroundSelection;
  onBackgroundChange: (background: BackgroundSelection) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
}

const BottomControls = React.memo(function BottomControls({
  theme,
  onThemeChange,
  showBackground,
  onShowBackgroundChange,
  background,
  onBackgroundChange,
  padding,
  onPaddingChange,
  visible,
}: ControlsProps & { visible: boolean }) {
  return (
    <FloatingControls visible={visible}>
      <ControlField label="Card">
        <SegmentedControl
          size="sm"
          className="w-[120px] bg-white/[0.04]"
          options={THEME_OPTIONS}
          value={theme}
          onChange={(v) => onThemeChange(v as TweetTheme)}
        />
      </ControlField>

      <ControlDivider />

      <ControlField label="Background">
        <div className="flex items-center gap-2">
          <Switch checked={showBackground} onCheckedChange={onShowBackgroundChange} aria-label="Background" />
          <BackgroundPicker
            theme={TWEET_GRADIENT}
            dark={theme === 'dark'}
            background={background}
            onBackgroundChange={onBackgroundChange}
            disabled={!showBackground}
          />
        </div>
      </ControlField>

      <ControlDivider />

      <ControlField label="Padding">
        <SegmentedControl
          size="sm"
          className="w-[168px] bg-white/[0.04]"
          options={PADDING_SEGMENTS}
          value={String(padding)}
          onChange={(v) => onPaddingChange(Number(v))}
        />
      </ControlField>
    </FloatingControls>
  );
});

const MobileControlsDrawer = React.memo(function MobileControlsDrawer({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  showBackground,
  onShowBackgroundChange,
  background,
  onBackgroundChange,
  padding,
  onPaddingChange,
}: ControlsProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <ControlsDrawer open={open} onOpenChange={onOpenChange}>
      <MobileControlRow label="Card">
        <SegmentedControl
          size="sm"
          className="w-[140px] bg-white/[0.04]"
          options={THEME_OPTIONS}
          value={theme}
          onChange={(v) => onThemeChange(v as TweetTheme)}
        />
      </MobileControlRow>

      <div className="h-px bg-white/10" />

      <MobileControlRow label="Background">
        <div className="flex items-center gap-3">
          <BackgroundPicker
            theme={TWEET_GRADIENT}
            dark={theme === 'dark'}
            background={background}
            onBackgroundChange={onBackgroundChange}
            disabled={!showBackground}
          />
          <Switch checked={showBackground} onCheckedChange={onShowBackgroundChange} />
        </div>
      </MobileControlRow>

      <MobileControlRow label="Padding">
        <SegmentedControl
          size="sm"
          className="w-[180px] bg-white/[0.04]"
          options={PADDING_SEGMENTS}
          value={String(padding)}
          onChange={(v) => onPaddingChange(Number(v))}
        />
      </MobileControlRow>
    </ControlsDrawer>
  );
});

interface PostLinkFormProps {
  value: string;
  onValueChange: (value: string) => void;
  onLoad: (input: string) => void;
  loading: boolean;
  error: string | null;
  showingSample: boolean;
}

function PostLinkForm({ value, onValueChange, onLoad, loading, error, showingSample }: PostLinkFormProps) {
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLoad(value);
        }}
        className="flex w-full items-center gap-1.5 rounded-xl bg-[#1f1f1f] p-1.5 ring-1 ring-white/10 transition-shadow focus-within:ring-white/25"
      >
        <div className="relative min-w-0 flex-1">
          <LinkSquare02Icon
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text');
              if (!parseTweetId(pasted)) return;
              e.preventDefault();
              onValueChange(pasted.trim());
              onLoad(pasted);
            }}
            placeholder="Paste a post link from X"
            aria-label="Post link"
            aria-invalid={error ? true : undefined}
            aria-describedby="post-link-status"
            spellCheck={false}
            autoComplete="off"
            className="h-9 w-full bg-transparent pl-9 pr-2 text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading || !value.trim()}>
          {loading ? <Loading03Icon size={15} className="motion-safe:animate-spin" aria-hidden="true" /> : null}
          {loading ? 'Loading…' : 'Load post'}
        </Button>
      </form>
      <p
        id="post-link-status"
        role={error ? 'alert' : undefined}
        className={`min-h-5 text-center text-xs ${error ? 'text-red-400' : 'text-white/40'}`}
      >
        {error ?? (showingSample ? 'Showing a sample post. Paste a link to make your own.' : '')}
      </p>
    </div>
  );
}

export function TweetImageEditor() {
  const [state, setState] = React.useState<TweetImageState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = React.useState(false);
  const [tweet, setTweet] = React.useState<TweetData>(SAMPLE_TWEET);
  const [linkInput, setLinkInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const requestRef = React.useRef<AbortController | null>(null);
  const { stageRef, stageVisible, stageWidth } = useStage();
  const frameExport = useFrameExport(frameRef, {
    fileName: `tweet-${tweet.user.screen_name}`,
    shareTitle: `Post by @${tweet.user.screen_name}`,
  });

  const update = React.useCallback((patch: Partial<TweetImageState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const loadTweet = React.useCallback(
    async (input: string) => {
      const id = parseTweetId(input);
      if (!id) {
        setError('That does not look like a post link. Try one like x.com/user/status/123.');
        return;
      }

      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/tweet/${id}`, { signal: controller.signal });
        const json = await res.json();
        if (requestRef.current !== controller) return;
        if (res.status === 404) {
          setError('Post not found. It may be deleted, private, or from a suspended account.');
        } else if (!res.ok || !json.data) {
          setError('Could not load the post. Try again in a moment.');
        } else {
          setTweet(json.data as TweetData);
          update({ id });
        }
      } catch {
        if (requestRef.current !== controller) return;
        setError(
          controller.signal.aborted
            ? 'Loading the post timed out. Try again.'
            : 'Could not load the post. Check your connection and try again.',
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (requestRef.current === controller) {
          requestRef.current = null;
          setLoading(false);
        }
      }
    },
    [update],
  );

  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    const decoded = hash ? decodeState(hash) : null;
    if (decoded) {
      setState((s) => ({ ...s, ...decoded }));
      if (decoded.id) {
        setLinkInput(`https://x.com/i/status/${decoded.id}`);
        loadTweet(decoded.id);
      }
    }
    setHydrated(true);
    return () => requestRef.current?.abort();
  }, [loadTweet]);

  React.useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', `#${encodeHashState(state)}`);
    }, HASH_WRITE_DELAY);
    return () => clearTimeout(timer);
  }, [state, hydrated]);

  const onLinkInputChange = React.useCallback((value: string) => {
    setLinkInput(value);
    setError(null);
  }, []);
  const onThemeChange = React.useCallback((theme: TweetTheme) => update({ theme }), [update]);
  const onShowBackgroundChange = React.useCallback(
    (showBackground: boolean) => update({ showBackground }),
    [update],
  );
  const onBackgroundChange = React.useCallback(
    (background: BackgroundSelection) => update({ background }),
    [update],
  );
  const onPaddingChange = React.useCallback((padding: number) => update({ padding }), [update]);

  const frameTotal = TWEET_WIDTH + state.padding * 2;
  const mobileScale = isMobile && stageWidth > 0 && stageWidth < frameTotal
    ? (stageWidth - 24) / frameTotal
    : 1;

  const controlProps: ControlsProps = {
    theme: state.theme,
    onThemeChange,
    showBackground: state.showBackground,
    onShowBackgroundChange,
    background: state.background,
    onBackgroundChange,
    padding: state.padding,
    onPaddingChange,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#181818]">
      <EditorTopBar
        title="Tweet Images"
        description={ABOUT}
        shortcuts={SHORTCUTS}
        frameExport={frameExport}
      />

      <EditorStage
        stageRef={stageRef}
        scale={mobileScale}
        frameWidth={frameTotal}
        header={
          <PostLinkForm
            value={linkInput}
            onValueChange={onLinkInputChange}
            onLoad={loadTweet}
            loading={loading}
            error={error}
            showingSample={tweet === SAMPLE_TWEET}
          />
        }
      >
        <div
          aria-busy={loading}
          className={`transition-opacity duration-200 motion-reduce:transition-none ${loading ? 'opacity-50' : ''}`}
        >
          <TweetFrame
            ref={frameRef}
            tweet={tweet}
            theme={state.theme}
            showBackground={state.showBackground}
            background={state.background}
            padding={state.padding}
          />
        </div>
      </EditorStage>

      {isMobile ? (
        <>
          <MobileActionBar onCustomize={() => setDrawerOpen(true)} frameExport={frameExport} />
          <MobileControlsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} {...controlProps} />
        </>
      ) : (
        <BottomControls visible={stageVisible} {...controlProps} />
      )}
    </div>
  );
}
