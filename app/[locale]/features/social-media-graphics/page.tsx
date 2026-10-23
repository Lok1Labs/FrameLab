// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from "next";
import Link from "next/link";
import { InstagramIcon, Linkedin01Icon, NewTwitterIcon, Share08Icon } from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";
import { PRODUCT_FACTS } from "@/lib/seo/product-facts";
import { gradientColors } from "@/lib/constants/gradient-colors";

const PAGE_URL = `${SITE_URL}/features/social-media-graphics`;

export const metadata: Metadata = {
  title: "Free Social Media Graphics Maker",
  description:
    "Create social media graphics for Twitter, LinkedIn, and Instagram. Turn screenshots into shareable posts with perfect dimensions. Free, no signup.",
  keywords: [
    "social media graphics maker",
    "twitter card generator",
    "linkedin post maker",
    "instagram post creator",
    "social media image editor",
    "free graphics maker",
    "twitter post image maker",
    "og image generator free",
    "social media screenshot tool",
    "product hunt screenshot maker",
    "social media mockup generator",
    "shots.so alternative",
    "pika.style alternative",
    "free shots.so alternative",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Social Media Graphics Maker - Create Stunning Posts",
    description:
      "Create professional social media graphics. Perfect dimensions for every platform. Free, no signup.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/social-media-graphics",
  },
};

const capabilities = [
  {
    icon: NewTwitterIcon,
    title: "Twitter / X (1200 x 675)",
    description: "Eye-catching Twitter cards and post images that drive engagement.",
  },
  {
    icon: Linkedin01Icon,
    title: "LinkedIn (1200 x 627)",
    description: "Professional graphics for LinkedIn posts that establish authority.",
  },
  {
    icon: InstagramIcon,
    title: "Instagram (1080 x 1080)",
    description: "Square posts and stories that stand out in crowded feeds.",
  },
  {
    icon: Share08Icon,
    title: "Any platform, custom size",
    description: `Export at any dimension for blogs, presentations, or documentation, up to ${PRODUCT_FACTS.maxExportScale}x resolution.`,
  },
];

const steps = [
  {
    title: "Add your screenshot",
    description:
      "Drag and drop any image or paste from clipboard. Supports PNG, JPG, and WebP.",
  },
  {
    title: "Pick a platform size",
    description:
      "Choose a Twitter, LinkedIn, or Instagram preset, or set a custom width and height.",
  },
  {
    title: "Style and export",
    description: `Add a background, shadow, and frame, then export up to ${PRODUCT_FACTS.maxExportScale}x resolution with no watermark.`,
  },
];

const faqs = [
  {
    question: "Is the social media graphics maker free?",
    answer:
      "Yes. Every platform preset, background, and export is free, with no signup and no watermark.",
  },
  {
    question: "What sizes are available for Twitter, LinkedIn, and Instagram?",
    answer:
      "Twitter/X cards are 1200x675, LinkedIn posts are 1200x627, and Instagram posts are 1080x1080. A custom size option covers any other platform.",
  },
  {
    question: "Can I use a custom size for a platform that isn't listed?",
    answer:
      "Yes. Set any width and height you need for blogs, presentations, or documentation, then export the same way.",
  },
  {
    question: "Do I need design skills to make a graphic?",
    answer:
      "No. Drop in a screenshot, pick a background and platform size, and export. No design software or experience required.",
  },
  {
    question: "Can I match my brand's colors?",
    answer:
      "Yes. Choose a solid color, gradient, or upload your own background image to match your brand across every graphic.",
  },
];

const relatedLinks = [
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/animation-maker", label: "Animation maker" },
  { href: "/features/3d-effects", label: "3D effects" },
  { href: "/features/code-snippets", label: "Code images" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "FrameLab - Social Media Graphics Maker",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      description:
        "Free online tool to create social media graphics for Twitter, LinkedIn, and Instagram from screenshots.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Twitter/X card size (1200x675)",
        "LinkedIn post size (1200x627)",
        "Instagram post size (1080x1080)",
        "Custom dimensions for any platform",
        `Export up to ${PRODUCT_FACTS.maxExportScale}x resolution`,
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
        {
          "@type": "ListItem",
          position: 3,
          name: "Social Media Graphics",
          item: PAGE_URL,
        },
      ],
    },
  ],
};

function SocialPreview() {
  return (
    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`size-16 rounded-lg bg-neutral-900 transition-transform ${MOTION} group-hover:-translate-y-1 ${PREVIEW_SHADOW}`}
          style={{ transitionDelay: `${i * 60}ms` }}
        >
          <div className="flex h-full flex-col justify-center gap-1.5 p-3">
            <div className="h-1.5 w-8 rounded-full bg-white/30" />
            <div className="h-1.5 w-5 rounded-full bg-white/15" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SocialMediaGraphicsPage() {
  return (
    <FeaturePage
      name="Social Media Graphics"
      title="Free Social Media Graphics Maker"
      intro="Create stunning graphics for Twitter, LinkedIn, and Instagram in seconds. Turn screenshots into shareable content with the right dimensions for every platform, free with no signup."
      ctaHref="/editor"
      ctaLabel="Create Graphics Free"
      previewGradient={gradientColors.pink_purple_blue}
      preview={<SocialPreview />}
      capabilities={capabilities}
      steps={steps}
      alternativesIntro="Shots.so and Pika Style both make shareable social graphics from screenshots. FrameLab covers the same platform sizes and backgrounds for free, with an animation timeline and 3D tilt on top."
      alternativeSlugs={["shots-so", "pika-style"]}
      guideLinks={[
        { href: "/guides/best-free-shots-so-alternatives", label: "Best free Shots.so alternatives" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          Compare options in the{" "}
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
