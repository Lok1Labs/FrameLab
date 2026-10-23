import { SITE_URL } from "@/lib/seo/metadata";
// Modified for FrameLab branding; original FrameLab implementation retained.
import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import { CHANGELOG as changelog } from "@/lib/seo/changelog";

export const metadata: Metadata = {
  title: "Changelog - Latest Updates & Features",
  description:
    "See what's new in FrameLab. Latest updates including animation timeline, video export, 3D effects, and more.",
  keywords: [
    "FrameLab changelog",
    "FrameLab updates",
    "screenshot editor new features",
    "image editor release notes",
    "animation maker updates",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Changelog - FrameLab",
    description:
      "See what's new in FrameLab. Latest updates including animation timeline, video export, and more.",
    url: "/changelog",
  },
  alternates: {
    canonical: "/changelog",
  },
};


const typeBadge = {
  added: "text-foreground",
  improved: "text-muted-foreground",
  fixed: "text-muted-foreground/70",
} as const;

const typeDot = {
  added: "bg-primary",
  improved: "bg-muted-foreground",
  fixed: "bg-muted-foreground/70",
} as const;

const ctaClassName =
  "relative inline-flex items-center justify-center rounded-md border-0 bg-[var(--nav-cta-bg)] px-6 py-2.5 text-sm font-medium text-[var(--nav-cta-fg)] shadow-none transition-[transform,box-shadow] duration-150 ease-out [text-shadow:var(--nav-cta-text-shadow)] hover:shadow-[var(--nav-cta-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97]";

const INTER =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export default function ChangelogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Changelog",
            item: `${SITE_URL}/changelog`,
          },
        ],
      },
      {
        "@type": "WebPage",
        name: "FrameLab Changelog",
        description:
          "Latest updates, new features, and improvements to FrameLab.",
        url: `${SITE_URL}/changelog`,
        mainEntity: {
          "@type": "ItemList",
          name: "FrameLab Release History",
          itemListElement: changelog.map((entry, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `v${entry.version} - ${entry.title}`,
            description: entry.description,
          })),
        },
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-20 pt-28">
        <div className="mx-auto max-w-2xl">
          <header className="mb-16">
            <h1
              className="mb-2 text-3xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Changelog
            </h1>
            <p className="text-sm text-muted-foreground">
              New features, improvements, and fixes.
            </p>
          </header>

          <div className="space-y-0">
            {changelog.map((entry, entryIndex) => (
              <article
                key={entry.version}
                className={
                  entryIndex !== changelog.length - 1
                    ? "mb-12 border-b border-border pb-12"
                    : "pb-12"
                }
              >
                <div className="mb-4 flex items-baseline gap-3">
                  <time className="font-mono text-xs text-muted-foreground">
                    {entry.date}
                  </time>
                  <span className="font-mono text-xs text-muted-foreground">
                    v{entry.version}
                  </span>
                </div>

                <h2
                  className="mb-1.5 text-lg font-semibold tracking-[-0.02em] text-foreground"
                  style={{ fontFamily: INTER }}
                >
                  {entry.title}
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>

                {(["added", "improved", "fixed"] as const).map((type) => {
                  const items = entry.changes.filter((c) => c.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className="mb-4 last:mb-0">
                      <h3
                        className={`mb-2 text-xs font-medium uppercase tracking-wider ${typeBadge[type]}`}
                      >
                        {type}
                      </h3>
                      <ul className="space-y-1.5">
                        {items.map((change, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80"
                          >
                            <span
                              className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${typeDot[type]}`}
                            />
                            {change.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </article>
            ))}
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              All features are free. No signup required.
            </p>
            <Link href="/" className={ctaClassName}>
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <Footer brandName="FrameLab" />
    </div>
  );
}
