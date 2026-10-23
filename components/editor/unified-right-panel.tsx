'use client';

import * as React from 'react';
import {
  Settings02Icon,
  SlidersHorizontalIcon,
  ColorsIcon,
  RotateSquareIcon,
  VideoReplayIcon,
  LayersLogoIcon,
  Image01Icon,
  Globe02Icon,
  SmartPhone01Icon,
} from 'hugeicons-react';
import {
  SettingsSection,
  StyleSection,
  BrowserMockupSection,
  BorderSection,
  ShadowSection,
  BackgroundSection,
  TextSection,
  TransformsGallery,
  AnnotateSection,
  ImageOverlaySection,
  DepthSection,
  ImagePositionSection,
  DeviceFramesSection,
  ImageEnhanceSection,
  BackgroundEffectsSection,
} from './sections';
import { useImageStore } from '@/lib/store';
import { AnimationPresetGallery } from '@/components/timeline/AnimationPresetGallery';
import { SegmentedControl } from '@/components/ui/segmented-control';

type EditorMode = 'screenshot' | 'browser' | 'device';
type TabType = 'settings' | 'edit' | 'background' | 'transforms' | 'animate' | 'depth';

const modeTabs: { id: EditorMode; icon: React.ReactNode; label: string }[] = [
  { id: 'screenshot', icon: <Image01Icon size={14} />, label: 'Image' },
  { id: 'browser', icon: <Globe02Icon size={14} />, label: 'Browser' },
  { id: 'device', icon: <SmartPhone01Icon size={14} />, label: 'Device' },
];

const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
  { id: 'edit', icon: <SlidersHorizontalIcon size={14} />, label: 'Design' },
  { id: 'depth', icon: <LayersLogoIcon size={14} />, label: 'Layers' },
  { id: 'background', icon: <ColorsIcon size={14} />, label: 'BG' },
  { id: 'settings', icon: <Settings02Icon size={14} />, label: 'Adjust' },
  { id: 'transforms', icon: <RotateSquareIcon size={14} />, label: '3D' },
  { id: 'animate', icon: <VideoReplayIcon size={14} />, label: 'Motion' },
];

export function UnifiedRightPanel() {
  const {
    activeRightPanelTab,
    setActiveRightPanelTab,
    editorMode,
    setEditorMode,
  } = useImageStore();
  const activeTab = activeRightPanelTab;
  const setActiveTab = setActiveRightPanelTab;

  const [contentKey, setContentKey] = React.useState(activeTab);
  const [transitioning, setTransitioning] = React.useState(false);

  React.useEffect(() => {
    if (activeTab !== contentKey) {
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setContentKey(activeTab);
        setTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, contentKey]);

  return (
    <div className="relative h-full w-full overflow-y-auto overscroll-contain bg-background">
      <div className="relative z-20 shrink-0 space-y-3 border-b border-foreground/10 px-4 pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <SegmentedControl
              value={editorMode}
              ariaLabel="Editor mode"
              className="h-12"
              onChange={(id) => setEditorMode(id as EditorMode)}
              options={modeTabs.map((tab) => ({
                id: tab.id,
                label: tab.label,
                icon: tab.icon,
                ariaLabel: tab.label,
              }))}
            />
          </div>
        </div>
        <div className="min-w-0 overflow-hidden">
          <div role="group" aria-label="Editing tools" className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-foreground/10 px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted aria-pressed:border-foreground/25 aria-pressed:bg-muted aria-pressed:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {tab.icon}
                {tab.id === 'background' ? 'Background' : tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div
          className="p-4 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(4px)' : 'translateY(0)',
          }}
        >
          {contentKey === 'settings' && (
            <div className="space-y-2">
              <SettingsSection />
            </div>
          )}

          {contentKey === 'edit' && (
            <div className="space-y-2">
              {editorMode === 'device' ? (
                <DeviceFramesSection />
              ) : (
                <>
                  {editorMode === 'browser' ? (
                    <BrowserMockupSection />
                  ) : (
                    <>
                      <StyleSection />
                      <BorderSection />
                      <ImageEnhanceSection />
                    </>
                  )}
                  <ImagePositionSection />
                  <ShadowSection />
                  <ImageOverlaySection />
                  <AnnotateSection />
                  <TextSection />
                </>
              )}
            </div>
          )}

          {contentKey === 'depth' && <DepthSection />}

          {contentKey === 'background' && (
            <div className="space-y-2">
              <BackgroundEffectsSection />
              <BackgroundSection />
            </div>
          )}

          {contentKey === 'transforms' && <TransformsGallery />}

          {contentKey === 'animate' && <AnimationPresetGallery />}
        </div>
      </div>

    </div>
  );
}
