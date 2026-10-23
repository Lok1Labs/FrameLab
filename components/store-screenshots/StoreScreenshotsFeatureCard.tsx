import Link from "next/link";
import { ArrowRight01Icon, SmartPhone01Icon } from "hugeicons-react";
import { STORE_SHORTCUT_HEIGHT } from "@/lib/store-screenshots/config";
import { cn } from "@/lib/utils";

type StoreScreenshotsShortcutProps = {
  className?: string;
  compact?: boolean;
};

export function StoreScreenshotsShortcut({
  className,
  compact = false,
}: StoreScreenshotsShortcutProps): React.JSX.Element {
  return (
    <Link
      href="/store-screenshots"
      style={{ height: STORE_SHORTCUT_HEIGHT }}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground/[0.035] px-2.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-[color,background-color,border-color,transform] hover:border-foreground/20 hover:bg-foreground/[0.065] hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25",
        className,
      )}
    >
      <SmartPhone01Icon size={13} className="shrink-0" />
      <span>{compact ? "App Store screenshots" : "Create App Store screenshots"}</span>
      {!compact ? (
        <span className="rounded-sm bg-foreground px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-background">
          New
        </span>
      ) : null}
      <ArrowRight01Icon
        size={12}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export function StoreScreenshotsFeatureCard(): React.JSX.Element {
  return (
    <Link
      href="/store-screenshots"
      className="group mb-3 block overflow-hidden rounded-md border border-foreground/15 bg-foreground/[0.045] p-3 transition-[border-color,background-color] hover:border-foreground/25 hover:bg-foreground/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background shadow-sm">
          <SmartPhone01Icon size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-foreground">
            App Store screenshots
          </span>
          <span className="mt-1 block whitespace-nowrap text-[9px] leading-snug text-muted-foreground">
            Ready for App Store Connect.
          </span>
        </span>
      </div>
    </Link>
  );
}
