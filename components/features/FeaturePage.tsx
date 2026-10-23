import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { SectionTitle, ToolFaq, ToolHero } from "@/components/tools/ToolLayout";
import { CARD_CLASS } from "@/components/tools/ui";
import { CLAIMS_CHECKED_LABEL, getComparison } from "@/lib/seo/comparisons";
import { cn } from "@/lib/utils";

export interface FeatureCapability {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface FeatureStep {
  title: string;
  description: string;
}

export interface FeatureLink {
  href: string;
  label: string;
}

export interface FeaturePageProps {
  name: string;
  title: string;
  intro: string;
  ctaHref: string;
  ctaLabel: string;
  previewGradient: string;
  preview: React.ReactNode;
  capabilities: FeatureCapability[];
  steps: FeatureStep[];
  alternativesIntro?: string;
  alternativeSlugs?: string[];
  guideLinks?: FeatureLink[];
  faqs: { question: string; answer: string }[];
  relatedLinks: FeatureLink[];
  closing: React.ReactNode;
  jsonLd: object;
}

const ctaClassName =
  "relative inline-flex items-center justify-center rounded-md border-0 bg-[var(--nav-cta-bg)] px-6 py-2.5 text-base font-medium text-[var(--nav-cta-fg)] shadow-none transition-[transform,box-shadow] duration-150 ease-out [text-shadow:var(--nav-cta-text-shadow)] hover:shadow-[var(--nav-cta-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97]";

const relatedLinkClass = cn(
  CARD_CLASS,
  "group flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground transition-shadow duration-200 hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70",
);

/** Shared shell for every /features/* page: hero, preview well, capability grid, how-it-works, alternatives, FAQ, related links. */
export function FeaturePage({
  name,
  title,
  intro,
  ctaHref,
  ctaLabel,
  previewGradient,
  preview,
  capabilities,
  steps,
  alternativesIntro,
  alternativeSlugs = [],
  guideLinks,
  faqs,
  relatedLinks,
  closing,
  jsonLd,
}: FeaturePageProps) {
  const alternatives = alternativeSlugs
    .map((slug) => getComparison(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-24 pt-16 sm:pt-20">
        <ToolHero name={name} title={title} intro={intro} />

        <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
          <div className={cn(CARD_CLASS, "overflow-hidden")}>
            <div
              aria-hidden="true"
              className="group m-2 mb-0 flex h-56 items-center justify-center overflow-hidden rounded-xl sm:h-64"
              style={{ background: previewGradient }}
            >
              {preview}
            </div>
            <div className="flex justify-center p-5">
              <Link href={ctaHref} className={ctaClassName}>
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-24 flex max-w-3xl flex-col gap-16">
          <section>
            <SectionTitle>What you get</SectionTitle>
            <div
              className={cn(
                CARD_CLASS,
                "mt-5 grid gap-x-10 gap-y-7 p-6 sm:grid-cols-2",
              )}
            >
              {capabilities.map((capability) => (
                <div key={capability.title} className="flex gap-3">
                  <capability.icon
                    className="mt-0.5 size-5 shrink-0 text-foreground"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {capability.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>How it works</SectionTitle>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className={cn(CARD_CLASS, "p-5")}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.08] text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {alternatives.length > 0 ? (
            <section>
              <SectionTitle>How it compares</SectionTitle>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {alternativesIntro}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {alternatives.map((comparison) => {
                  const faq = comparison.faqs[0];
                  return (
                    <div
                      key={comparison.slug}
                      className={cn(CARD_CLASS, "flex flex-col p-5")}
                    >
                      <h3 className="text-sm font-semibold text-foreground">
                        {faq.q}
                      </h3>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                      <Link
                        href={`/compare/${comparison.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4"
                      >
                        Full {comparison.competitorName} comparison
                        <ArrowRight01Icon size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground/70">
                Competitor pricing and features checked on {CLAIMS_CHECKED_LABEL}. See each comparison for
                sourcing, since third-party plans change without notice.
              </p>
              {guideLinks && guideLinks.length > 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Comparing more options?{" "}
                  {guideLinks.map((guide, index) => (
                    <span key={guide.href}>
                      <Link
                        href={guide.href}
                        className="text-foreground underline underline-offset-4"
                      >
                        {guide.label}
                      </Link>
                      {index < guideLinks.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              ) : null}
            </section>
          ) : null}

          <ToolFaq faqs={faqs} />

          {relatedLinks.length > 0 ? (
            <section>
              <SectionTitle>Related features</SectionTitle>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={relatedLinkClass}>
                    {link.label}
                    <ArrowRight01Icon
                      size={16}
                      className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <p className="text-center text-sm text-muted-foreground">{closing}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
