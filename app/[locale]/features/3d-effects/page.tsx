// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from "next";
import Link from "next/link";
import { CubeIcon, IdeaIcon, Layers01Icon, RotateClockwiseIcon } from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";
import { PRODUCT_FACTS } from "@/lib/seo/product-facts";
import { gradientColors } from "@/lib/constants/gradient-colors";

const PAGE_URL = `${SITE_URL}/features/3d-effects`;

export const metadata: Metadata = {
  title: "Make 3D Perspective Screenshots Online, Free",
  description:
    "Make a 3D perspective screenshot online: upload an image, pick one of 40 tilt presets or set X, Y, and Z rotation, then export a PNG. Free, no signup, no watermark.",
  keywords: [
    "3d perspective screenshot online",
    "how to make 3d perspective screenshots",
    "3d screenshot maker",
    "tilt screenshot online",
    "free online 3d mockup generator",
    "3d screenshot effects",
    "perspective screenshot",
    "screenshot tilt effect",
    "3d rotation effect",
    "free 3d effects",
    "isometric screenshot maker",
    "hero image 3d effect",
    "pika style alternative",
    "shots.so alternative",
    "screely alternative",
    "free pika.style alternative",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Make 3D Perspective Screenshots Online, Free",
    description:
      "Tilt any screenshot into 3D perspective in your browser. 40 presets, X, Y, and Z rotation, depth shadows. Free, no signup.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/3d-effects",
  },
};

const capabilities = [
  {
    icon: CubeIcon,
    title: "40 3D transform presets",
    description:
      "Choose from Popular, Dramatic, Perspective, Zoom, and Float categories, or dial in a custom angle.",
  },
  {
    icon: RotateClockwiseIcon,
    title: "Rotation & tilt",
    description:
      "Rotate on X, Y, and Z axes with live sliders. The preview updates in real time as you adjust.",
  },
  {
    icon: Layers01Icon,
    title: "Depth shadows",
    description:
      "Realistic shadows that follow your 3D transform, with adjustable blur and distance.",
  },
  {
    icon: IdeaIcon,
    title: "Lighting effects",
    description:
      "Simulated lighting that responds to your perspective for a more realistic result.",
  },
];

const steps = [
  {
    title: "Add your screenshot",
    description:
      "Drag in a PNG, JPG, or WebP, or paste from your clipboard. Nothing to install, no account needed.",
  },
  {
    title: "Pick a 3D preset",
    description:
      "Open the Transforms panel and choose from 40 presets, such as SaaS Hero, Isometric, or Lay Flat, or set the angle yourself.",
  },
  {
    title: "Add depth and export",
    description: `Turn on a shadow, choose a background, then export PNG, JPEG, or WebP up to ${PRODUCT_FACTS.maxExportScale}x, or animate the tilt and export video.`,
  },
];

const faqs = [
  {
    question: "How do I make a 3D perspective screenshot online?",
    answer:
      "Open FrameLab in your browser, add your screenshot, pick a 3D preset in the Transforms panel, adjust the X, Y, and Z rotation if you want a different angle, then export a PNG. It takes under a minute and needs no signup.",
  },
  {
    question: "Is the 3D screenshot tool free?",
    answer: `Yes. Every 3D preset and control is free, with unlimited exports at up to ${PRODUCT_FACTS.maxExportScale}x resolution and no watermark.`,
  },
  {
    question: "Can I put a tilted screenshot inside an iPhone or MacBook mockup?",
    answer:
      "Yes. The editor includes iPhone, MacBook, and Apple Watch device mockups, and several of them are already shot at a 3D angle.",
  },
  {
    question: "Can I animate the 3D effect?",
    answer:
      "Yes. 3D animation presets like Showcase Tilt, Orbit, Turntable, and Slide In 3D move the screenshot between angles, and you can export the result as MP4, WebM, or GIF.",
  },
  {
    question: "Do I need Photoshop or 3D software?",
    answer:
      "No. FrameLab applies perspective transforms in the browser, so you get a tilted product shot without Photoshop, Blender, or a desktop app.",
  },
];

const relatedLinks = [
  { href: "/mockup-generator", label: "Mockup generator" },
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/animation-maker", label: "Animation maker" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "FrameLab - 3D Effects",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      description:
        "Free online tool to add 3D perspective, rotation, and depth effects to screenshots.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "40 3D transform presets",
        "Perspective and X, Y, Z rotation",
        "Depth shadows",
        "3D animation presets with MP4, WebM, and GIF export",
        "Real-time preview",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to make a 3D perspective screenshot online",
      totalTime: "PT1M",
      tool: { "@type": "HowToTool", name: "FrameLab (web browser)" },
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
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
        { "@type": "ListItem", position: 3, name: "3D Effects", item: PAGE_URL },
      ],
    },
  ],
};

function TiltPreview() {
  return (
    <div
      className={`w-56 rounded-lg bg-neutral-900 transition-transform ${MOTION} group-hover:-translate-y-1 ${PREVIEW_SHADOW}`}
      style={{
        transform: "perspective(1000px) rotateX(10deg) rotateY(-14deg)",
      }}
    >
      <div className="flex flex-col gap-2 p-5">
        <div className="h-2.5 w-16 rounded-full bg-white/25" />
        <div className="h-2 w-28 rounded-full bg-white/10" />
        <div className="mt-1 h-14 rounded-md bg-white/10" />
      </div>
    </div>
  );
}

export default function ThreeDEffectsPage() {
  return (
    <FeaturePage
      name="3D Effects"
      title="Free 3D Perspective Screenshot Maker"
      intro="Open FrameLab, add your image, pick from 40 3D tilt presets across Popular, Dramatic, Perspective, Zoom, and Float, or set your own X, Y, and Z rotation, then export a PNG. Free, in your browser, no watermark."
      ctaHref="/editor"
      ctaLabel="Add 3D Effects Free"
      previewGradient={gradientColors.store_midnight}
      preview={<TiltPreview />}
      capabilities={capabilities}
      steps={steps}
      alternativesIntro="Pika Style puts tilt behind its Pro plan and Screely has no 3D effects at all. FrameLab includes the full perspective transform library for free."
      alternativeSlugs={["pika-style", "shots-so", "screely"]}
      guideLinks={[
        {
          href: "/guides/best-free-screenshot-mockup-generators",
          label: "Best free screenshot mockup generators",
        },
        { href: "/guides/best-free-shots-so-alternatives", label: "Best free Shots.so alternatives" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          Compare 3D tilt options in the{" "}
          <Link href="/compare/pika-style" className="text-foreground underline underline-offset-4">
            Pika Style comparison
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
