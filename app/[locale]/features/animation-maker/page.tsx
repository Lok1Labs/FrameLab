// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from "next";
import Link from "next/link";
import { MagicWand01Icon, PlayIcon, SparklesIcon, Video01Icon } from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";
import { PRODUCT_FACTS, VIDEO_FORMATS_SENTENCE, atLeast } from "@/lib/seo/product-facts";
import { gradientColors } from "@/lib/constants/gradient-colors";

const PAGE_URL = `${SITE_URL}/features/animation-maker`;

export const metadata: Metadata = {
  title: "Free Screenshot Animation Maker",
  description:
    "Create stunning animations from screenshots. Build slideshows with zoom, pan, and fade effects. Export to video or GIF. Free browser-based animation tool.",
  keywords: [
    "animation maker",
    "screenshot animation",
    "slideshow maker",
    "animated slideshow",
    "screenshot to video",
    "zoom animation",
    "pan animation",
    "ken burns effect",
    "free animation tool",
    "animated screenshot maker",
    "product demo animation",
    "screenshot gif maker",
    "app preview video maker",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Animation Maker - Create Animated Screenshots & Slideshows",
    description:
      "Create stunning animations from screenshots. Zoom, pan, and fade effects with video export.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/animation-maker",
  },
};

const capabilities = [
  {
    icon: MagicWand01Icon,
    title: `${atLeast(PRODUCT_FACTS.animationPresets)} animation presets`,
    description:
      "One-click animations including zoom, pan, tilt, rotate, and Ken Burns effects.",
  },
  {
    icon: PlayIcon,
    title: "Timeline editor",
    description:
      "Fine-tune timing with a visual timeline. Adjust duration, easing, and keyframes.",
  },
  {
    icon: Video01Icon,
    title: "Video export",
    description: `Export as ${VIDEO_FORMATS_SENTENCE}. Perfect for social media and presentations.`,
  },
  {
    icon: SparklesIcon,
    title: "Slideshow builder",
    description:
      "Combine multiple screenshots into animated slideshows with transitions.",
  },
];

const steps = [
  {
    title: "Upload your screenshots",
    description:
      "Add one or more screenshots to create a slideshow, or animate a single image.",
  },
  {
    title: "Choose an animation preset",
    description: `Select from ${atLeast(PRODUCT_FACTS.animationPresets)} presets like zoom, pan, and Ken Burns, or build a custom animation on the timeline.`,
  },
  {
    title: "Export as video",
    description: `Download as ${VIDEO_FORMATS_SENTENCE}. Share directly to social media or embed anywhere.`,
  },
];

const faqs = [
  {
    question: "Is the screenshot animation maker free?",
    answer:
      "Yes. Every animation preset, the timeline editor, and video export are free, with no signup and no watermark.",
  },
  {
    question: "What video formats can I export?",
    answer: `You can export animations as ${VIDEO_FORMATS_SENTENCE}. GIF works well for chat and docs, MP4 and WebM for social media and presentations.`,
  },
  {
    question: "Can I combine multiple screenshots into one animated slideshow?",
    answer:
      "Yes. Add several screenshots and the slideshow builder sequences them with transitions, so you can build a product walkthrough or tutorial in one export.",
  },
  {
    question: "Do I need video editing experience?",
    answer:
      "No. One-click presets handle the timing and easing for you. The timeline editor is there if you want to fine-tune keyframes yourself.",
  },
  {
    question: "How many animation presets are included?",
    answer: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, covering zoom, pan, tilt, rotate, and Ken Burns effects, plus a keyframe timeline for fully custom motion.`,
  },
];

const relatedLinks = [
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/social-media-graphics", label: "Social media graphics" },
  { href: "/features/3d-effects", label: "3D effects" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "FrameLab - Animation Maker",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      description:
        "Free online tool to create animated screenshots and slideshows with zoom, pan, and fade effects.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        `${atLeast(PRODUCT_FACTS.animationPresets)} animation presets`,
        "Keyframe timeline editor",
        "Slideshow builder with transitions",
        `Video export: ${VIDEO_FORMATS_SENTENCE}`,
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
        { "@type": "ListItem", position: 3, name: "Animation Maker", item: PAGE_URL },
      ],
    },
  ],
};

function AnimationPreview() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-48 rounded-lg bg-neutral-900 transition-transform ${MOTION} group-hover:scale-105 ${PREVIEW_SHADOW}`}
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="h-2.5 w-14 rounded-full bg-white/25" />
          <div className="h-2 w-24 rounded-full bg-white/10" />
          <div className="mt-1 h-12 rounded-md bg-white/10" />
        </div>
      </div>
      <span className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]">
        <Video01Icon size={16} aria-hidden="true" />
      </span>
    </div>
  );
}

export default function AnimationMakerPage() {
  return (
    <FeaturePage
      name="Animation Maker"
      title="Free Screenshot Animation Maker"
      intro="Bring your screenshots to life with zoom, pan, and fade animations, or build a slideshow from several screenshots. Export to video or GIF, free with no signup."
      ctaHref="/editor"
      ctaLabel="Create Animation Free"
      previewGradient={gradientColors.cyan_blue_purple}
      preview={<AnimationPreview />}
      capabilities={capabilities}
      steps={steps}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          Compare animation features in the{" "}
          <Link href="/compare/shots-so" className="text-foreground underline underline-offset-4">
            Shots.so comparison
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
