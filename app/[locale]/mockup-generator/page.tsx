import { SITE_URL } from "@/lib/seo/metadata";
// Modified for FrameLab branding; original FrameLab implementation retained.
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import {
  DEVICE_LAYOUTS,
  MAX_DEVICE_MOCKUPS,
  MOCKUP_DEFINITIONS,
} from "@/lib/constants/mockups";
import type { DeviceFamily } from "@/types/mockup";

export const metadata: Metadata = {
  title: "Free Online Mockup Generator for Screenshots",
  description:
    "Free online mockup generator: put a screenshot in an iPhone 17 Pro, MacBook Pro, Apple Watch, or Safari and Chrome frame, arrange up to 6 devices, and export a PNG. No signup, no watermark.",
  keywords: [
    "free online mockup generator",
    "free mockup generator no watermark",
    "screenshot mockup generator",
    "device mockup generator",
    "iphone mockup generator",
    "macbook mockup generator",
    "apple watch mockup",
    "app screenshot mockup",
    "mockup generator online",
    "multi device mockup",
    "browser mockup generator",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Online Mockup Generator for Screenshots",
    description:
      "Put screenshots in iPhone, MacBook, Apple Watch, and browser mockups. Free, no signup, no watermark.",
    url: "/mockup-generator",
  },
  alternates: {
    canonical: "/mockup-generator",
  },
};

const INTER = 'Inter, "Inter Fallback", Arial, Helvetica, sans-serif';

const ctaClassName =
  "relative inline-flex items-center justify-center rounded-md border-0 bg-[var(--nav-cta-bg)] px-6 py-2.5 text-base font-medium text-[var(--nav-cta-fg)] shadow-none transition-[transform,box-shadow] duration-150 ease-out [text-shadow:var(--nav-cta-text-shadow)] hover:shadow-[var(--nav-cta-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97]";

const cardSurface =
  "rounded-2xl bg-card ring-1 ring-border shadow-[var(--card-edge-shadow)]";

const chipLinkClassName =
  "group flex items-center justify-between rounded-md bg-foreground/[0.04] px-4 py-3 text-sm font-medium text-foreground/90 ring-1 ring-border transition-colors hover:bg-foreground/[0.08] hover:text-foreground";

const FAMILY_LABELS: Partial<Record<DeviceFamily, string>> = {
  phone: "iPhone",
  laptop: "MacBook",
  watch: "Apple Watch",
};

const deviceGroups = Object.entries(FAMILY_LABELS).map(([family, label]) => ({
  label,
  devices: MOCKUP_DEFINITIONS.filter((d) => d.family === family).map((d) =>
    d.perspective === "front" ? d.name : `${d.name} (3D angle)`,
  ),
}));

const frameGroups = [
  { label: "Browser", devices: ["Safari (light and dark)", "Chrome (light and dark)"] },
  { label: "Window", devices: ["macOS", "Windows", "Arc"] },
  { label: "Image", devices: ["Polaroid", "Glass", "Outline", "Border"] },
];

const howToSteps = [
  {
    title: "Open the editor and add your screenshot",
    description:
      "Drag in a PNG, JPG, or WebP, or paste from your clipboard. Nothing to install and no account.",
  },
  {
    title: "Pick a device",
    description:
      "Open Mockups and choose an iPhone, MacBook, or Apple Watch. Your screenshot fills the screen automatically, and you can adjust fit, scale, and position.",
  },
  {
    title: "Choose a layout",
    description: `Use Center Stage for one device, or Duo Split, Trio Fan, or Product Suite to place up to ${MAX_DEVICE_MOCKUPS} devices in one scene.`,
  },
  {
    title: "Style the scene",
    description:
      "Add a gradient or image background, shadows, text, and 3D tilt. Browser and window frames work the same way for web app screenshots.",
  },
  {
    title: "Export",
    description:
      "Download PNG, JPEG, or WebP at up to 5x, or animate it and export MP4, WebM, or GIF. No watermark.",
  },
];

const faqs = [
  {
    question: "Is this mockup generator really free?",
    answer:
      "Yes. Every device, frame, background, and export size is free. There is no signup, no watermark, and no paid tier.",
  },
  {
    question: "Which devices can I put my screenshot in?",
    answer:
      "iPhone 17 Pro, iPhone 17, iPhone 14 Pro, and iPhone 15 and 13 at a 3D angle; MacBook Pro, MacBook Pro 14-inch and 16-inch, MacBook Neo, and MacBook Air 15-inch at a 3D angle; and seven Apple Watch styles including Apple Watch Ultra. Safari and Chrome browser frames and macOS, Windows, and Arc window frames are also included.",
  },
  {
    question: "Can I show several devices in one mockup?",
    answer: `Yes. You can place up to ${MAX_DEVICE_MOCKUPS} devices on one canvas. Layouts such as Duo Split, Trio Fan, and Product Suite (laptop, phone, and watch together) arrange them for you, and each device can show a different screenshot.`,
  },
  {
    question: "Does it add a watermark to my mockup?",
    answer:
      "No. Exports are clean at every size, including 5x PNG and video.",
  },
  {
    question: "Is my screenshot uploaded to a server?",
    answer:
      "No. Editing runs in your browser and imported images are not uploaded to edit them. Only export compression sends the finished image to the server, which recompresses it in memory and returns it without storing it.",
  },
  {
    question: "Is there an iPad or Android mockup?",
    answer:
      "Not yet. The device mockups today are iPhone, MacBook, and Apple Watch, plus browser and window frames. For App Store and Play Store listings, the store screenshots tool covers the required sizes.",
  },
];

const relatedLinks = [
  { href: "/features/browser-mockups", label: "Browser Mockups" },
  { href: "/features/3d-effects", label: "3D Effects" },
  { href: "/store-screenshots", label: "Store Screenshots" },
  { href: "/free-screenshot-editor", label: "Free Screenshot Editor" },
] as const;

export default function MockupGeneratorPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
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
        name: "Mockup Generator",
        item: `${SITE_URL}/mockup-generator`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "FrameLab - Mockup Generator",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web Browser",
        url: `${SITE_URL}/mockup-generator`,
        description:
          "Free online mockup generator that places screenshots in iPhone, MacBook, Apple Watch, and browser frames. No signup, no watermark.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          `${MOCKUP_DEFINITIONS.length} iPhone, MacBook, and Apple Watch mockups`,
          "Safari and Chrome browser frames in light and dark",
          `Up to ${MAX_DEVICE_MOCKUPS} devices per scene`,
          `${DEVICE_LAYOUTS.length} layout presets`,
          "PNG, JPEG, and WebP export up to 5x",
          "No signup and no watermark",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to make a device mockup from a screenshot",
        totalTime: "PT1M",
        tool: { "@type": "HowToTool", name: "FrameLab" },
        step: howToSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.description,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation brandName="FrameLab" />

      <main className="flex-1">
        <section className="px-6 pb-20 pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1
              className="mb-6 text-4xl font-semibold tracking-[-0.03em] text-foreground md:text-6xl"
              style={{ fontFamily: INTER }}
            >
              Free Online Mockup Generator for Screenshots
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              FrameLab is a free online mockup generator. Drop a
              screenshot into an iPhone 17 Pro, MacBook Pro, Apple Watch, or a
              Safari or Chrome frame, arrange up to {MAX_DEVICE_MOCKUPS} devices
              in one scene, and export a PNG at up to 5x. It runs in your
              browser, with no signup and no watermark.
            </p>
            <div className="flex flex-col items-center">
              <Link href="/editor" className={ctaClassName}>
                Make a Mockup
              </Link>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground/70">
                <span>100% Free</span>
                <span className="h-3 w-px bg-border" aria-hidden />
                <span>No Signup</span>
                <span className="h-3 w-px bg-border" aria-hidden />
                <span>No Watermark</span>
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-4 text-center text-3xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Device Mockups and Frames Included
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              {MOCKUP_DEFINITIONS.length} device mockups plus browser, window,
              and image frames. Devices marked 3D angle are photographed in
              perspective.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...deviceGroups, ...frameGroups].map((group) => (
                <div key={group.label} className={`p-6 ${cardSurface}`}>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    {group.label}
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {group.devices.map((device) => (
                      <li key={device}>{device}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-4 text-center text-3xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Multi-Device Layouts
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
              Start from a layout, then move, resize, or rotate any device.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DEVICE_LAYOUTS.map((layout) => (
                <div key={layout.id} className={`p-6 ${cardSurface}`}>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {layout.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {layout.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2
              className="mb-12 text-center text-3xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              How to Make a Mockup From a Screenshot
            </h2>
            <ol className="space-y-8">
              {howToSteps.map((item, index) => (
                <li key={item.title} className="flex items-start gap-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2
              className="mb-12 text-center text-3xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className={`p-6 ${cardSurface}`}>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Comparing tools? See the{" "}
              <Link
                href="/guides/best-free-screenshot-mockup-generators"
                className="underline"
              >
                best free screenshot mockup generators
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2
              className="mb-8 text-center text-2xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Explore More Features
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={chipLinkClassName}
                >
                  <span>{link.label}</span>
                  <ArrowRight01Icon
                    className="size-3.5 text-muted-foreground/70 transition-colors group-hover:text-foreground"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer brandName="FrameLab" />
    </div>
  );
}
