// Modified for FrameLab branding and maintainer contacts.
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { StoreScreenshotWorkspace } from "@/components/store-screenshots/StoreScreenshotWorkspace";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MAX_STORE_SLIDES,
  STORE_BACKGROUND_PRESETS,
  STORE_FONT_OPTIONS,
  STORE_OUTPUT_PROFILES,
  STORE_TEMPLATES,
} from "@/lib/store-screenshots/config";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import { STORE_PROJECT_HINT_COOKIE } from "@/lib/store-screenshots/storage";

const IPHONE_PROFILE = STORE_OUTPUT_PROFILES[0];

export const metadata: Metadata = {
  title: "App Store Screenshot Maker",
  description:
    "Build a coordinated App Store screenshot set in your browser. Six layout templates, editable headings, device frames, and 1320x2868 export. Free, no signup.",
  keywords: [
    "app store screenshot maker",
    "app store screenshot generator",
    "ios screenshot maker",
    "app screenshot template",
    "app store screenshot size",
    "iphone 6.9 screenshot size",
    "app store listing screenshots",
    "app preview screenshots",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "App Store Screenshot Maker - FrameLab",
    description:
      "Build a coordinated App Store screenshot set in your browser. Templates, headings, device frames, and 1320x2868 export. Free, no signup.",
    url: "/store-screenshots",
  },
  alternates: {
    canonical: "/store-screenshots",
  },
};

const faqs = [
  {
    question: "What size should App Store screenshots be?",
    answer: `Apple's current iPhone requirement is ${IPHONE_PROFILE.width} x ${IPHONE_PROFILE.height} pixels, the 6.9-inch portrait size. Every set you export here is rendered at exactly that resolution, so App Store Connect accepts it without resizing.`,
  },
  {
    question: "How many screenshots can I upload to the App Store?",
    answer: `Apple accepts up to ten screenshots per device size, and this editor lets you build a set of up to ${MAX_STORE_SLIDES} slides in one project.`,
  },
  {
    question: "Are my app screenshots uploaded anywhere?",
    answer:
      "No. Your screens are read, composed, and rendered in your browser. Projects are saved to local storage on your own device, so nothing is sent to a server.",
  },
  {
    question: "Can I edit the headline text on each screenshot?",
    answer: `Yes. Every slide has an editable heading and subheading with ${STORE_FONT_OPTIONS.length} font choices, adjustable colors, and ${STORE_BACKGROUND_PRESETS.length} gradient background presets you can override with your own colors.`,
  },
  {
    question: "Do I need to sign up or pay?",
    answer:
      "No. The App Store screenshot maker is free, needs no account, and adds no watermark to your exports.",
  },
];

export default async function StoreScreenshotsPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const hasSavedProject = cookieStore.get(STORE_PROJECT_HINT_COOKIE)?.value === "1";

  return (
    <>
      <StoreScreenshotWorkspace initialHasSavedProject={hasSavedProject} />

      <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          App Store Screenshot Maker
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Turn raw app screens into a coordinated App Store listing set. Pick a
          layout template, drop in your screenshots, write the headline for each
          slide, and export at {IPHONE_PROFILE.width} x {IPHONE_PROFILE.height},
          the size App Store Connect expects for the iPhone 6.9-inch display.
          Everything runs in your browser, so your unreleased app screens never
          leave your device.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">
          Layout templates
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {STORE_TEMPLATES.map((template) => (
            <div key={template.id}>
              <dt className="text-sm font-medium text-foreground">
                {template.name}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {template.description}
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-xl font-semibold text-foreground">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-10 text-sm text-muted-foreground">
          Need something other than a store listing? Open the{" "}
          <Link href="/editor" className="underline underline-offset-4">
            screenshot editor
          </Link>{" "}
          for backgrounds and browser mockups, add{" "}
          <Link href="/features/3d-effects" className="underline underline-offset-4">
            3D effects
          </Link>
          , record an{" "}
          <Link href="/features/animation-maker" className="underline underline-offset-4">
            animated demo
          </Link>
          , or{" "}
          <Link href="/resize-image" className="underline underline-offset-4">
            resize an image
          </Link>{" "}
          to another store spec.
        </p>
      </section>
    </>
  );
}
