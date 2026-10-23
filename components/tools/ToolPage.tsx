import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { buildToolJsonLd } from "@/lib/seo/tool-metadata";
import { getRelatedTools, type ToolDefinition } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";
import { ToolWorkspace } from "./ToolWorkspace";
import { SectionTitle, ToolFaq, ToolHero } from "./ToolLayout";
import { CARD_CLASS } from "./ui";

const CropWorkspace = dynamic(() =>
  import("./CropWorkspace").then((mod) => mod.CropWorkspace),
);

interface ToolPageProps {
  tool: ToolDefinition;
}

/** Server-rendered shell for every image tool page; only the workspace is a client island. */
export function ToolPage({ tool }: ToolPageProps) {
  const related = getRelatedTools(tool);
  const jsonLd = buildToolJsonLd(tool);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-24 pt-16 sm:pt-20">
        <ToolHero name={tool.name} title={tool.h1} intro={tool.intro} />

        <div className="mt-10 sm:mt-12">
          {tool.engine === "crop" ? (
            <CropWorkspace tool={tool} />
          ) : (
            <ToolWorkspace tool={tool} />
          )}
        </div>

        <div className="mx-auto mt-24 flex max-w-3xl flex-col gap-16">
          <section>
            <SectionTitle>What this tool does</SectionTitle>
            <ul className={cn(CARD_CLASS, "mt-5 grid gap-x-8 gap-y-3.5 p-6 sm:grid-cols-2")}>
              {tool.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckmarkCircle02Icon
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {tool.sections?.length ? (
            <div className="flex flex-col gap-10">
              {tool.sections.map((section) => (
                <section key={section.heading}>
                  <SectionTitle>{section.heading}</SectionTitle>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          ) : null}

          <ToolFaq faqs={tool.faqs} />

          {related.length > 0 ? (
            <section>
              <SectionTitle>Related tools</SectionTitle>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.slug}
                    className={cn(
                      CARD_CLASS,
                      "group flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground transition-shadow duration-200 hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70",
                    )}
                  >
                    {item.name}
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

          <p className="text-center text-sm text-muted-foreground">
            Need more than a quick fix? The{" "}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>{" "}
            adds backgrounds, frames, and shadows. You can also{" "}
            <Link
              href="/remove-background"
              className="text-foreground underline underline-offset-4"
            >
              remove an image background
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
