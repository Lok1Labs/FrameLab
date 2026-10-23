// Modified for FrameLab branding and maintainer contacts.
import { SITE_URL } from "@/lib/seo/metadata";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight01Icon,
  BlurIcon,
  ColorsIcon,
  Download04Icon,
  Layers01Icon,
  TextFontIcon,
} from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { CARD_CLASS, INTER } from "@/components/tools/ui";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import { PRODUCT_FACTS, atLeast } from "@/lib/seo/product-facts";

const DESCRIPTION =
  "Edit screenshots online for free. Add text, annotate with arrows, blur details, and download PNG, JPG, or WebP. No app install, signup, or watermark.";

export const metadata: Metadata = {
  title: "Free Screenshot Editor Online",
  description: DESCRIPTION,
  keywords: [
    "screenshot editor",
    "screenshot editor online free",
    "free screenshot editor",
    "online screenshot editor",
    "edit screenshot online free",
    "screenshot editor without watermark",
    "screenshot text editor",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Screenshot Editor Online - FrameLab",
    description: DESCRIPTION,
    url: "/free-screenshot-editor",
  },
  alternates: {
    canonical: "/free-screenshot-editor",
  },
};

const ctaClassName =
  "relative inline-flex items-center justify-center rounded-md border-0 bg-[var(--nav-cta-bg)] px-6 py-2.5 text-base font-medium text-[var(--nav-cta-fg)] shadow-none transition-[transform,box-shadow] duration-150 ease-out [text-shadow:var(--nav-cta-text-shadow)] hover:shadow-[var(--nav-cta-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97]";

const secondaryCtaClassName =
  "inline-flex items-center justify-center rounded-md px-6 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground active:scale-[0.99]";

const capabilities = [
  {
    icon: TextFontIcon,
    title: "Add text to a screenshot",
    description:
      `Add a caption or label, choose from ${atLeast(PRODUCT_FACTS.fonts)} fonts, and adjust its size and color. Move each text layer to the part of the screenshot it explains.`,
  },
  {
    icon: ArrowRight01Icon,
    title: "Annotate with arrows and shapes",
    description:
      "Point to a button with an arrow, draw a box around an error, or circle a detail. Choose a color and line width for each annotation.",
  },
  {
    icon: BlurIcon,
    title: "Blur or pixelate details",
    description:
      "Draw a blur region over a name, email address, or other detail. Switch between blur and mosaic and adjust the strength before exporting.",
  },
  {
    icon: ColorsIcon,
    title: "Change the background",
    description:
      `Choose from ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds or use your own image. Adjust padding, rounded corners, and shadows, or export with a transparent background.`,
  },
  {
    icon: Layers01Icon,
    title: "Add a browser or device frame",
    description:
      "Put screenshots in iPhone, MacBook, and Apple Watch mockups, or Safari, Chrome, macOS, Windows, and Arc frames.",
  },
  {
    icon: Download04Icon,
    title: "Download without a watermark",
    description:
      `Save as PNG, JPEG, or WebP at up to ${PRODUCT_FACTS.maxExportScale}x resolution. PNG keeps text sharp and supports transparency. Every export is free, with no watermark.`,
  },
] as const;

const howItWorks = [
  {
    step: "1",
    title: "Open the editor and add an image",
    desc: "Choose a PNG, JPG, or WebP screenshot from your device. On a computer, you can also drag it onto the editor or paste it with Ctrl+V or Cmd+V.",
  },
  {
    step: "2",
    title: "Add text, arrows, or blur",
    desc: "In Image mode, open Design. Use Add Text for labels and Draw & Markup for arrows, shapes, or blur. On a phone, tap Edit design to find these controls.",
  },
  {
    step: "3",
    title: "Save your edited screenshot",
    desc: "Open Save in the top bar, choose PNG, JPEG, or WebP and your resolution, then export. Your original file stays unchanged; the download is a separate image.",
  },
];

const faqs = [
  {
    q: "Is this screenshot editor free without a watermark?",
    a: "Yes. Text, annotations, blur, backgrounds, and image exports are free. There is no signup, paid tier, or watermark on your downloaded screenshot.",
  },
  {
    q: "How do I add text to a screenshot?",
    a: `Open your screenshot in Image mode and choose Design, then Add Text. Type a caption or label, choose from ${atLeast(PRODUCT_FACTS.fonts)} fonts, set its size and color, and drag it into place. You can add multiple text layers and edit them separately.`,
  },
  {
    q: "Can I edit text that is already in a screenshot?",
    a: "Existing screenshot text is part of the image, not an editable text layer. FrameLab lets you add new text and edit those labels, but it does not recognize or automatically replace the original words. To correct text in the source, change it in the original app and take another screenshot.",
  },
  {
    q: "Can I edit a screenshot on my phone?",
    a: "Yes. Open the editor in your mobile browser and tap to upload an image from Photos or Files. Tap Edit design, choose Image mode and Design, then use Add Text or Draw & Markup. Close the panel to work on the canvas and tap Save to download. A larger screen gives you more room for precise edits.",
  },
  {
    q: "How do I blur part of a screenshot?",
    a: "In Design, open Draw & Markup, choose Blur, and drag over the area you want to obscure. Choose blur or mosaic and adjust its strength. Check the exported image before sharing. For secrets such as passwords or API keys, remove the area with the crop tool instead: light blur on short text can sometimes be guessed.",
  },
  {
    q: "Do I need to download an app or create an account?",
    a: "No. The editor runs in your browser on Windows, Mac, Linux, Chromebook, and mobile devices. Open it, add a screenshot, and start editing without installing software or creating an account.",
  },
  {
    q: "What image formats can I open and save?",
    a: "Open PNG, JPG, or WebP screenshots and export PNG, JPEG, or WebP. Choose PNG for screenshots with small text or a transparent background, and JPEG or WebP when file size matters more. Exporting creates a new file and leaves your original unchanged.",
  },
  {
    q: "Is my screenshot uploaded for editing?",
    a: "Imported images are edited in your browser, and drafts are stored in your browser on this device. Export compression sends the finished image to the server without storing it. Capturing a website from a URL also needs the server. The privacy policy explains these requests.",
  },
];

const featureLinks = [
  {
    href: "/guides/how-to-edit-screenshot-online",
    label: "How to edit a screenshot",
  },
  {
    href: "/guides/how-to-add-text-to-screenshot",
    label: "Add text to a screenshot",
  },
  {
    href: "/guides/how-to-annotate-screenshot",
    label: "Annotate with arrows and shapes",
  },
  {
    href: "/guides/how-to-blur-screenshot",
    label: "Blur part of a screenshot",
  },
  {
    href: "/crop-image",
    label: "Crop a screenshot",
  },
  {
    href: "/resize-image",
    label: "Resize a screenshot",
  },
] as const;

export default function FreeScreenshotEditorPage() {
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
            name: "Free Screenshot Editor",
            item: `${SITE_URL}/free-screenshot-editor`,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "FrameLab - Free Screenshot Editor Online",
        description: DESCRIPTION,
        url: `${SITE_URL}/free-screenshot-editor`,
        applicationCategory: "DesignApplication",
        applicationSubCategory: "Screenshot Editor",
        operatingSystem: "Any (Web Browser)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Add and edit text overlays",
          "Annotate with arrows, lines, and shapes",
          "Blur or pixelate selected regions",
          `${atLeast(PRODUCT_FACTS.backgrounds)} gradient backgrounds`,
          "Custom shadow effects",
          "3D perspective transforms",
          "iPhone, MacBook, and Apple Watch mockups",
          "Browser and window frames (Safari, Chrome, macOS, Windows, Arc)",
          "Text and image overlays",
          `${atLeast(PRODUCT_FACTS.animationPresets)} animation presets`,
          "Video export (MP4, WebM, GIF)",
          `High-res export up to ${PRODUCT_FACTS.maxExportScale}x`,
          "No signup required",
          "No watermarks",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navigation />

      <main className="flex-1">
        <section className="px-6 pb-12 pt-24 sm:pb-20 sm:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>100% Free</span>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span>No Signup</span>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span>No Watermarks</span>
            </span>
            <h1
              className="mb-6 text-4xl font-semibold tracking-[-0.03em] text-foreground md:text-6xl"
              style={{ fontFamily: INTER }}
            >
              Free Screenshot Editor Online
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Edit a screenshot online for free: add text, draw arrows and
              boxes, or blur details before sharing. Choose a background
              and download a PNG, JPG, or WebP with no watermark.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/editor" className={ctaClassName}>
                Edit a screenshot
              </Link>
              <Link href="#how-to-edit" className={secondaryCtaClassName}>
                How to edit a screenshot
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-border px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2
                className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl"
                style={{ fontFamily: INTER }}
              >
                Text, annotations, and backgrounds in one editor
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Start with a screenshot you already have. Add the context
                someone needs to understand it, then save a separate copy.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className={`flex gap-4 p-6 ${CARD_CLASS}`}
                >
                  <cap.icon
                    className="size-6 shrink-0 text-foreground"
                    aria-hidden
                  />
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-foreground">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-to-edit" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2
                className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl"
                style={{ fontFamily: INTER }}
              >
                How to edit a screenshot online
              </h2>
              <p className="text-muted-foreground">
                Three steps, from the image on your device to a finished download.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {howItWorks.map((item) => (
                <li key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <h2
                className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl"
                style={{ fontFamily: INTER }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about our free screenshot editor.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="border-b border-border pb-6 last:border-b-0"
                >
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2
              className="mb-8 text-center text-2xl font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: INTER }}
            >
              Guides for your next screenshot edit
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between rounded-md bg-foreground/[0.04] px-4 py-3 text-sm font-medium text-foreground/90 ring-1 ring-border transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
                >
                  <span>{link.label}</span>
                  <ArrowRight01Icon
                    className="size-3.5 text-muted-foreground/70 transition-colors group-hover:text-foreground"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              For presentation effects, try the{" "}
              <Link href="/mockup-generator" className="underline underline-offset-4">mockup generator</Link>
              {" "}or{" "}
              <Link href="/features/animation-maker" className="underline underline-offset-4">screenshot animation maker</Link>.
            </p>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl"
              style={{ fontFamily: INTER }}
            >
              Start Editing Screenshots for Free
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              No signup. No downloads. No watermarks. Just open the editor and
              create.
            </p>
            <Link href="/editor" className={ctaClassName}>
              Open Free Screenshot Editor
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
