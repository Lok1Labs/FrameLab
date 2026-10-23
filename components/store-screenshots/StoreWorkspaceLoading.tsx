// Modified for FrameLab branding; original FrameLab implementation retained.
import Image from "next/image";
import Link from "next/link";
import { NewTwitterIcon } from "hugeicons-react";
import { GitHubStarButton } from "@/components/ui/github-star-button";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { MobileBanner } from "@/components/editor/MobileBanner";
import { getStoreProfile } from "@/lib/store-screenshots/config";

export type StoreLoadingVariant = "templates" | "editor";

const CARD_TONES = [
  "from-muted/80 via-background to-accent/80",
  "from-background via-muted/70 to-secondary",
  "from-muted/60 via-background to-accent",
  "from-background via-accent/70 to-muted",
] as const;

function LoadingBar({ className }: { className: string }): React.JSX.Element {
  return <div className={`rounded-full bg-foreground/[0.08] ${className}`} />;
}

function LoadingHeader({ variant }: { variant: StoreLoadingVariant }): React.JSX.Element {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-foreground/10 bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo-mark.png" alt="FrameLab" width={32} height={32} className="size-8" priority />
          <span className="hidden text-sm font-semibold tracking-tight text-foreground lg:inline">FrameLab<span className="block text-[10px] font-normal leading-tight text-muted-foreground">by Lok1Labs</span></span>
        </Link>
        <div className="mx-1 hidden h-4 w-px bg-foreground/10 sm:block" />
        <p className="hidden truncate text-xs font-medium text-foreground sm:block">Store screenshots</p>
      </div>

      {variant === "editor" ? (
        <>
          <div className="absolute left-1/2 hidden h-8 w-24 -translate-x-1/2 rounded-md border border-foreground/10 bg-foreground/[0.035] sm:block" />
          <div className="h-8 w-20 rounded-md bg-foreground/10" />
          <LanguageSwitch />
        </>
      ) : (
        <div className="flex items-center gap-1 opacity-55">
          <LanguageSwitch />
          <div className="hidden sm:block">
            <GitHubStarButton compact />
          </div>
          <span className="flex size-9 items-center justify-center text-muted-foreground" aria-hidden="true">
            <NewTwitterIcon className="size-[18px]" />
          </span>
        </div>
      )}
    </header>
  );
}

function TemplateLoading({ width, height }: { width: number; height: number }): React.JSX.Element {
  return (
    <main className="flex min-h-0 flex-1 items-center overflow-auto bg-foreground/[0.018] px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-5 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/30 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-foreground/55" />
            </span>
            Loading templates
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-foreground">
            App Store screenshot template
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Preparing the complete screenshot set.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
          {CARD_TONES.map((tone, index) => (
            <div
              key={tone}
              className={`store-loading-card relative overflow-hidden rounded-xl border border-foreground/10 bg-gradient-to-b ${tone} shadow-lg`}
              style={{
                aspectRatio: `${width} / ${height}`,
                animationDelay: `${index * 55}ms`,
              }}
            >
              <div className="absolute inset-x-[17%] top-[7%] space-y-1.5">
                <LoadingBar className="mx-auto h-2.5 w-[78%]" />
                <LoadingBar className="mx-auto h-2.5 w-[58%] opacity-70" />
              </div>
              <div className="absolute inset-x-[10%] bottom-[6%] top-[20%] overflow-hidden rounded-[15%] border-[3px] border-foreground/15 bg-background/90 shadow-xl">
                <div className="absolute left-1/2 top-[2.5%] h-[2.2%] w-[28%] -translate-x-1/2 rounded-full bg-foreground/15" />
                <div className="absolute inset-x-[8%] top-[14%] space-y-[5%]">
                  <LoadingBar className="ml-auto h-2.5 w-[54%] opacity-70" />
                  <LoadingBar className="h-2.5 w-[82%]" />
                  <LoadingBar className="h-2.5 w-[68%] opacity-70" />
                  <div className="mt-[14%] h-[22%] rounded-lg bg-foreground/[0.055]" />
                </div>
                <div className="absolute inset-x-[8%] bottom-[4%] h-[5%] rounded-full bg-foreground/[0.07]" />
                <div className="store-loading-sheen absolute inset-y-0 w-1/2" style={{ animationDelay: `${index * 120}ms` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end" aria-hidden="true">
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <div className="h-9 flex-1 rounded-md bg-foreground/10" />
            <div className="h-9 flex-1 rounded-md border border-foreground/10 bg-background" />
          </div>
        </div>
      </div>
    </main>
  );
}

function PanelLoading({ side }: { side: "left" | "right" }): React.JSX.Element {
  return (
    <aside className={`${side === "left" ? "hidden w-[260px] border-r md:flex" : "hidden w-[292px] border-l xl:flex"} h-full shrink-0 flex-col border-foreground/10 bg-background`} aria-hidden="true">
      <div className="border-b border-foreground/10 p-3">
        <div className="grid h-10 grid-cols-2 gap-1 rounded-md border border-foreground/10 p-1">
          <div className="rounded bg-foreground/[0.08]" />
          <div className="rounded bg-foreground/[0.035]" />
        </div>
      </div>
      <div className="space-y-5 p-4">
        {Array.from({ length: side === "left" ? 3 : 4 }, (_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3 border-b border-foreground/10 pb-5">
            <LoadingBar className="h-2.5 w-20" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-md bg-foreground/[0.055]" />
              <div className="h-10 rounded-md bg-foreground/[0.055]" />
            </div>
            <LoadingBar className="h-2 w-full opacity-70" />
          </div>
        ))}
      </div>
    </aside>
  );
}

function EditorLoading({ width, height }: { width: number; height: number }): React.JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PanelLoading side="left" />
      <main className="flex min-w-0 flex-1 flex-col bg-foreground/[0.018]">
        <div className="flex min-h-0 flex-1 items-center justify-center p-5 sm:p-7">
          <div
            className="relative max-h-full w-[clamp(220px,calc(46.025vh-92px),500px)] max-w-full overflow-hidden rounded-md border border-foreground/10 bg-gradient-to-b from-muted via-background to-accent/70 shadow-2xl"
            style={{ aspectRatio: `${width} / ${height}` }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-[18%] top-[8%] space-y-2">
              <LoadingBar className="mx-auto h-3 w-[82%]" />
              <LoadingBar className="mx-auto h-2 w-[58%] opacity-70" />
            </div>
            <div className="absolute inset-x-[13%] bottom-[8%] top-[24%] overflow-hidden rounded-[15%] border-4 border-foreground/15 bg-background/90 shadow-xl">
              <div className="absolute left-1/2 top-[2.5%] h-[2%] w-[27%] -translate-x-1/2 rounded-full bg-foreground/15" />
              <div className="absolute inset-x-[9%] top-[15%] space-y-3">
                <LoadingBar className="ml-auto h-2.5 w-1/2 opacity-70" />
                <LoadingBar className="h-2.5 w-[86%]" />
                <LoadingBar className="h-2.5 w-[68%] opacity-70" />
                <div className="mt-6 aspect-square w-full rounded-lg bg-foreground/[0.045]" />
              </div>
              <div className="absolute inset-x-[8%] bottom-[4%] h-[5%] rounded-full bg-foreground/[0.07]" />
              <div className="store-loading-sheen absolute inset-y-0 w-1/2" />
            </div>
          </div>
        </div>
        <div className="flex h-20 shrink-0 items-center justify-center border-t border-foreground/10 bg-background" aria-hidden="true">
          <div className="h-14 rounded border border-foreground/15 bg-gradient-to-b from-muted to-accent/70" style={{ aspectRatio: `${width} / ${height}` }} />
        </div>
      </main>
      <PanelLoading side="right" />
    </div>
  );
}

export function StoreWorkspaceLoading({
  variant = "templates",
}: {
  variant?: StoreLoadingVariant;
}): React.JSX.Element {
  const profile = getStoreProfile("app-store");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background" aria-busy="true">
      <MobileBanner />
      <LoadingHeader variant={variant} />
      {variant === "editor"
        ? <EditorLoading width={profile.width} height={profile.height} />
        : <TemplateLoading width={profile.width} height={profile.height} />}
      <p className="sr-only" role="status">
        {variant === "editor" ? "Restoring your screenshot editor." : "Loading screenshot templates."}
      </p>
    </div>
  );
}
