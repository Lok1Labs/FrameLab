// Modified for FrameLab branding and maintainer contacts.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { buildCollectionJsonLd } from "@/lib/seo/json-ld";
import { OG_DEFAULTS } from "@/lib/seo/metadata";

const TITLE = "Who FrameLab Is For";
const DESCRIPTION =
  "How developers, designers, and marketers use FrameLab to turn raw screenshots into polished graphics, mockups, and animated demos.";

const AUDIENCES = [
  {
    href: "/for/developers",
    name: "Developers",
    blurb:
      "Beautify code screenshots, terminal output, and app UIs for README files, changelogs, and release posts.",
  },
  {
    href: "/for/designers",
    name: "Designers",
    blurb:
      "Build app and UI mockups for portfolio shots and client presentations without opening a design tool.",
  },
  {
    href: "/for/marketers",
    name: "Marketers",
    blurb:
      "Produce product screenshots and animated demos for landing pages, social posts, and ad creative.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "screenshot editor for developers",
    "mockup tool for designers",
    "screenshot editor for marketers",
    "product screenshot tool",
    "ui mockup creator",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: `${TITLE} - FrameLab`,
    description: DESCRIPTION,
    url: "/for",
  },
  alternates: {
    canonical: "/for",
  },
};

export default function AudienceHubPage() {
  const jsonLd = buildCollectionJsonLd(
    "/for",
    TITLE,
    DESCRIPTION,
    AUDIENCES.map((audience) => ({
      name: `FrameLab for ${audience.name}`,
      url: audience.href,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="bg-background">
        <section className="px-6 pt-28 pb-12">
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Who FrameLab Is For
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              The same browser-based editor, framed around three jobs people
              actually hire it for. Pick the one closest to yours for the
              workflow, presets, and export settings that suit it.
            </p>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <Link
                  key={audience.href}
                  href={audience.href}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
                >
                  <span className="mb-1.5 flex items-center justify-between gap-2 text-base font-medium text-foreground">
                    For {audience.name}
                    <ArrowRight01Icon
                      size={16}
                      className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {audience.blurb}
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-12 max-w-2xl text-sm text-muted-foreground">
              Whatever the use case, start in the{" "}
              <Link href="/editor" className="underline">
                editor
              </Link>
              , see{" "}
              <Link href="/compare" className="underline">
                how it compares
              </Link>{" "}
              to the alternatives, or grab a quick{" "}
              <Link href="/tools" className="underline">
                image tool
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
