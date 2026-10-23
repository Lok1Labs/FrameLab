// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from "next";
import Link from "next/link";
import { ColorsIcon, Download04Icon, Link01Icon, SourceCodeIcon } from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION, WindowDots } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";
import { PRODUCT_FACTS } from "@/lib/seo/product-facts";
import { gradientColors } from "@/lib/constants/gradient-colors";

const PAGE_URL = `${SITE_URL}/features/code-snippets`;

export const metadata: Metadata = {
  title: "Code to Image Generator: Free",
  description:
    "Free code to image tool for READMEs, docs, and social posts: pick a syntax theme, gradient or transparent background, line numbers, and window frame, then export a crisp PNG. No signup.",
  keywords: [
    "code to image",
    "code screenshots for readme",
    "code snippet screenshot",
    "code screenshot generator",
    "code to png",
    "ray.so alternative",
    "carbon alternative",
    "carbon.now.sh alternative",
    "free carbon alternative",
    "free ray.so alternative",
    "syntax highlighting screenshot",
    "beautiful code screenshots",
    "code image generator free",
    "share code as image",
    "code snippet to image",
    "programming screenshot tool",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Code to Image Generator - FrameLab",
    description:
      "Turn code into beautiful, shareable images. Themes, gradients, line numbers, and window frames. Free, no signup.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/code-snippets",
  },
};

const capabilities = [
  {
    icon: SourceCodeIcon,
    title: `${PRODUCT_FACTS.codeThemes} syntax themes`,
    description: `Midnight, Sunset, Candy, and more. Auto-detects your language or pick from ${PRODUCT_FACTS.codeLanguages} languages manually.`,
  },
  {
    icon: ColorsIcon,
    title: "Gradients, images & patterns",
    description:
      "Every theme ships its own gradient, or pick from dozens of gradients, image backgrounds, and patterns, or turn the background off for a transparent PNG.",
  },
  {
    icon: Download04Icon,
    title: "Line numbers & window frame",
    description:
      "Toggle line numbers, a macOS-style title bar or none at all, and resize the frame to fit your code.",
  },
  {
    icon: Link01Icon,
    title: "Shareable links & 2x/4x export",
    description:
      "Every setting is saved to the URL, so you can share a link or export a 2x or 4x PNG.",
  },
];

const steps = [
  {
    title: "Paste or type your code",
    description:
      "Drop in a snippet or start typing directly in the code card. Formatting and indentation are preserved.",
  },
  {
    title: "Pick a theme and background",
    description:
      "Choose a syntax theme, a gradient, padding, and whether to show line numbers or a window frame.",
  },
  {
    title: "Export or share",
    description:
      "Download a 2x PNG, copy the image to your clipboard, or copy a link that reopens your exact design.",
  },
];

const faqs = [
  {
    question: "Is the code to image generator free?",
    answer:
      "Yes. It is completely free, with no signup, no watermark, and no paid tier.",
  },
  {
    question: "How is this different from Ray.so or Carbon?",
    answer:
      "It covers the same core workflow, themes, gradients, line numbers, and a window frame, built into FrameLab's own editor, with shareable links and no account required.",
  },
  {
    question: "How do I add a code screenshot to a GitHub README?",
    answer:
      "Export the image at 2x, commit it to your repository (for example docs/code-example.png), and reference it in README.md with a relative path: ![What the code does](./docs/code-example.png). Keep copyable code in a fenced code block as well.",
  },
  {
    question: "Can I export a transparent background?",
    answer:
      "Yes. Turn the Background switch off before exporting and the PNG will have no backdrop, so it sits cleanly on GitHub light and dark mode.",
  },
  {
    question: "Which languages are supported?",
    answer: `Auto-detect picks up most popular languages automatically, or you can choose from ${PRODUCT_FACTS.codeLanguages} languages manually, including TypeScript, Python, Rust, Go, and SQL.`,
  },
  {
    question: "Is my code uploaded anywhere?",
    answer:
      "The code card is rendered and exported entirely in your browser, so your code is not sent to a server to create the image.",
  },
];

const relatedLinks = [
  { href: "/code", label: "Open the code image editor" },
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/browser-mockups", label: "Browser mockups" },
  { href: "/features/social-media-graphics", label: "Social media graphics" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "FrameLab - Code to Image",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      description:
        "Free online tool that turns code into beautiful, shareable images with syntax themes, gradient backgrounds, and a window frame.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        `${PRODUCT_FACTS.codeThemes} syntax highlighting themes`,
        "Gradient, image, and pattern backgrounds plus transparent export",
        "Line numbers and macOS window frame",
        "Shareable links and 2x or 4x PNG export",
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
        { "@type": "ListItem", position: 3, name: "Code Images", item: PAGE_URL },
      ],
    },
  ],
};

function CodePreview() {
  return (
    <div
      className={`w-64 overflow-hidden rounded-lg bg-neutral-900 transition-transform ${MOTION} group-hover:-translate-y-1 ${PREVIEW_SHADOW}`}
    >
      <div className="flex items-center gap-1.5 bg-neutral-800 px-3 py-2">
        <WindowDots />
      </div>
      <div className="flex flex-col gap-1.5 p-4 font-mono text-[11px] leading-relaxed">
        <div>
          <span className="text-fuchsia-400">const</span>{" "}
          <span className="text-sky-300">studio</span>{" "}
          <span className="text-white/50">=</span>{" "}
          <span className="text-amber-300">&quot;free&quot;</span>
        </div>
        <div className="text-emerald-300">{"// export to PNG"}</div>
        <div className="text-white/60">render(studio)</div>
      </div>
    </div>
  );
}

export default function CodeSnippetsFeaturePage() {
  return (
    <FeaturePage
      name="Code Images"
      title="Turn Code Into Beautiful Images"
      intro="Pick a theme, a gradient background, line numbers, and a window frame, then export a crisp PNG or share a link. A free Ray.so and Carbon alternative."
      ctaHref="/code"
      ctaLabel="Create a Code Image"
      previewGradient={gradientColors.store_graphite}
      preview={<CodePreview />}
      capabilities={capabilities}
      steps={steps}
      alternativesIntro="Carbon and Ray.so are established code screenshot tools with more syntax themes. FrameLab matches the core workflow for free and adds gradient backgrounds, a transparent export, and a full screenshot and mockup editor for everything else."
      alternativeSlugs={["carbon", "ray-so"]}
      guideLinks={[
        { href: "/guides/best-code-to-image-tools", label: "Best code to image tools" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          Compare details in the{" "}
          <Link href="/compare/carbon" className="text-foreground underline underline-offset-4">
            Carbon comparison
          </Link>{" "}
          or the{" "}
          <Link href="/compare/ray-so" className="text-foreground underline underline-offset-4">
            Ray.so comparison
          </Link>
          , try the{" "}
          <Link href="/code" className="text-foreground underline underline-offset-4">
            code editor
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
