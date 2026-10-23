// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from "next";
import Link from "next/link";
import { BrowserIcon, ComputerIcon, Settings01Icon, Sun01Icon } from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION, WindowDots } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";
import { gradientColors } from "@/lib/constants/gradient-colors";

const PAGE_URL = `${SITE_URL}/features/browser-mockups`;

export const metadata: Metadata = {
  title: "Free Browser Mockup Generator",
  description:
    "Free browser mockup generator. Add Safari and Chrome frames to screenshots with light and dark modes, custom URL bar, and 3D perspective. No signup required.",
  keywords: [
    "browser mockup generator",
    "safari browser mockup",
    "chrome browser mockup",
    "browser frame screenshot",
    "free browser mockup tool",
    "safari window mockup",
    "chrome window mockup",
    "browser mockup online free",
    "screenshot browser frame",
    "mac browser mockup",
    "website mockup generator",
    "add browser frame to screenshot",
    "safari dark mode mockup",
    "chrome dark mode mockup",
    "screely alternative",
    "shots.so alternative",
    "pika.style alternative",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Browser Mockup Generator - Safari & Chrome Frames",
    description:
      "Add realistic Safari and Chrome browser frames to screenshots. Light and dark modes, custom URL. Free, no signup.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/browser-mockups",
  },
};

const capabilities = [
  {
    icon: BrowserIcon,
    title: "Safari browser frame",
    description:
      "Realistic macOS Safari toolbar with traffic lights, back/forward navigation, and a centered address bar.",
  },
  {
    icon: ComputerIcon,
    title: "Chrome browser frame",
    description:
      "Authentic Chrome toolbar with tab bar, active tab, and an omnibox address bar.",
  },
  {
    icon: Sun01Icon,
    title: "Light & dark modes",
    description:
      "Every browser frame comes in light and dark variants to match your screenshot or brand.",
  },
  {
    icon: Settings01Icon,
    title: "Custom URL & header size",
    description:
      "Set a custom URL in the address bar and adjust the toolbar height to your liking.",
  },
];

const steps = [
  {
    title: "Upload your screenshot",
    description:
      "Drag and drop any image or paste from clipboard. Supports PNG, JPG, and WebP.",
  },
  {
    title: "Choose a browser frame",
    description:
      "Select Safari or Chrome in light or dark mode. Set a custom URL and adjust the header size.",
  },
  {
    title: "Export",
    description:
      "Download as PNG or JPG at up to 5x resolution. Add 3D perspective for even more depth.",
  },
];

const faqs = [
  {
    question: "Is the browser mockup generator free?",
    answer:
      "Yes. Safari and Chrome frames, both light and dark, are free with no signup and no watermark.",
  },
  {
    question: "Which browsers can I add a frame for?",
    answer:
      "Safari and Chrome, each in light and dark mode. Pick whichever matches your screenshot's platform or your brand style.",
  },
  {
    question: "Can I set a custom URL in the address bar?",
    answer:
      "Yes. Type any URL into the address bar field and it renders in the frame, useful for showing a real-looking domain in marketing screenshots.",
  },
  {
    question: "Can I combine a browser frame with a 3D tilt?",
    answer:
      "Yes. Add a browser frame first, then apply a 3D perspective preset for an angled, product-shot look.",
  },
  {
    question: "What resolution can I export at?",
    answer:
      "Export PNG or JPG at up to 5x resolution, sharp enough for retina displays and print.",
  },
];

const relatedLinks = [
  { href: "/mockup-generator", label: "Device mockup generator" },
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/3d-effects", label: "3D effects" },
  { href: "/features/social-media-graphics", label: "Social media graphics" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "FrameLab - Browser Mockup Generator",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      description:
        "Free online tool to add Safari and Chrome browser frames to screenshots with light/dark modes and custom URL.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Safari browser frame (light & dark)",
        "Chrome browser frame (light & dark)",
        "Custom URL display",
        "Adjustable header size",
        "3D perspective support",
        "No signup required",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Features",
          item: `${SITE_URL}/features`,
        },
        { "@type": "ListItem", position: 3, name: "Browser Mockups", item: PAGE_URL },
      ],
    },
  ],
};

function BrowserPreview() {
  return (
    <div
      className={`w-64 overflow-hidden rounded-lg bg-white/95 transition-transform ${MOTION} group-hover:-translate-y-1 ${PREVIEW_SHADOW}`}
    >
      <div className="flex items-center gap-3 border-b border-black/10 bg-neutral-100 px-3 py-2">
        <WindowDots />
        <div className="h-4 flex-1 rounded-full bg-black/5" />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="h-2.5 w-16 rounded-full bg-black/15" />
        <div className="h-2 w-28 rounded-full bg-black/10" />
        <div className="mt-1 h-14 rounded-md bg-black/5" />
      </div>
    </div>
  );
}

export default function BrowserMockupsPage() {
  return (
    <FeaturePage
      name="Browser Mockups"
      title="Free Browser Mockup Generator"
      intro="Add realistic Safari and Chrome browser frames to your screenshots. Light and dark modes, custom URL, adjustable header size, free with no signup."
      ctaHref="/editor"
      ctaLabel="Add Browser Frame"
      previewGradient={gradientColors.store_ocean}
      preview={<BrowserPreview />}
      capabilities={capabilities}
      steps={steps}
      alternativesIntro="Screely only adds a macOS or Windows window frame, with no device mockups or 3D effects. FrameLab adds Safari and Chrome browser frames alongside device mockups, 3D tilt, and animation, all free."
      alternativeSlugs={["screely", "shots-so", "pika-style"]}
      guideLinks={[
        {
          href: "/guides/best-free-screenshot-mockup-generators",
          label: "Best free screenshot mockup generators",
        },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          See the full{" "}
          <Link href="/compare/screely" className="text-foreground underline underline-offset-4">
            Screely comparison
          </Link>
          , try the{" "}
          <Link href="/editor" className="text-foreground underline underline-offset-4">
            editor
          </Link>
          , or browse{" "}
          <Link href="/tools" className="text-foreground underline underline-offset-4">
            every image tool
          </Link>
          .
        </>
      }
      jsonLd={jsonLd}
    />
  );
}
