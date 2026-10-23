import { Button } from "@/components/ui/button";

export function TelegramUpdates() {
  return (
    <aside aria-label="FrameLab updates" className="mt-6 rounded-xl border border-border bg-background/50 p-4">
      <h2 className="text-sm font-semibold text-foreground">Follow FrameLab Updates</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Get new templates, developer tools and open-source updates on Telegram.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <a href="https://t.me/ErrorEater" target="_blank" rel="noopener noreferrer">Join Telegram →</a>
      </Button>
    </aside>
  );
}
