// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from 'next';
import Link from 'next/link';
import { CodeImageEditorLoader } from '@/components/code-image/CodeImageEditorLoader';
import { SectionTitle, ToolFaq } from '@/components/tools/ToolLayout';
import { CARD_CLASS, INTER } from '@/components/tools/ui';
import { OG_DEFAULTS } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';
import { PRODUCT_FACTS } from "@/lib/seo/product-facts";

export const metadata: Metadata = {
  title: 'Beautiful Code Screenshots for READMEs',
  description:
    `Turn code into a crisp PNG for your GitHub README, docs, or social posts. ${PRODUCT_FACTS.codeThemes} themes, gradient backgrounds, transparent export at 2x or 4x. Free, no signup, no watermark.`,
  keywords: [
    'code to image',
    'code screenshots for readme',
    'beautiful code screenshots for readme',
    'github readme code image',
    'code snippet screenshot',
    'code screenshot generator',
    'ray.so alternative',
    'carbon alternative',
    'carbon.now.sh alternative',
    'code to png',
    'syntax highlighting screenshot',
    'beautiful code screenshots',
    'code image generator free',
    'share code as image',
    'code snippet generator',
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: 'Code to Image: Beautiful Screenshots',
    description:
      `Turn code into beautiful, shareable images. ${PRODUCT_FACTS.codeThemes} themes, gradients, images, and window frames. Free, no signup.`,
    url: '/code',
  },
  alternates: {
    canonical: '/code',
  },
};

const readmeSteps = [
  'Paste your snippet and pick a theme. Line numbers and a macOS title bar are optional.',
  'Turn the Background switch off for a transparent PNG that sits cleanly on both GitHub light and dark mode, or keep a gradient for a hero image.',
  'Export at 2x so the image stays sharp on high-density screens, then save it in your repository, for example docs/code-example.png.',
  'Reference it from README.md with a relative path and descriptive alt text.',
];

const readmeMarkdown = `![fetchUser returns a typed User from the API](./docs/code-example.png)`;

const readmePicture = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/code-dark.png">
  <img alt="fetchUser returns a typed User from the API" src="./docs/code-light.png" width="720">
</picture>`;

const faqs = [
  {
    question: 'How do I make a beautiful code screenshot for a README?',
    answer:
      'Paste the snippet into FrameLab, pick a syntax theme, turn the background off for a transparent PNG or keep a gradient, export at 2x, commit the file to your repository, and embed it in README.md with a relative image path and alt text.',
  },
  {
    question: 'Should I use a code image or a fenced code block in my README?',
    answer:
      'Use a fenced code block for anything readers need to copy or search, and an image for a hero example or a visual comparison. Many READMEs use both: the image to catch the eye, the code block right below it.',
  },
  {
    question: 'How do I show a different code image in GitHub dark mode?',
    answer:
      'Export one image with a light theme and one with a dark theme, then wrap them in a picture element with a prefers-color-scheme source. GitHub shows the matching image for each reader.',
  },
  {
    question: 'Is this code to image tool free?',
    answer:
      'Yes. Every theme, background, and export option is free, with no signup and no watermark.',
  },
  {
    question: 'How many syntax themes are included?',
    answer:
      '14 color themes (Midnight, Candy, Sunset, and more), each pairable with its own gradient, one of FrameLab\'s gradient and image backgrounds, or a simple pattern.',
  },
  {
    question: 'Can I export a transparent background?',
    answer:
      'Yes. Turn the Background switch off before exporting and the PNG keeps a transparent backdrop.',
  },
  {
    question: 'What kind of backgrounds can I use?',
    answer:
      'Pick the theme\'s own gradient, one of dozens of gradient presets, a real image background, or a simple grid, dot, or line pattern, all from the Background picker.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'FrameLab - Code to Image',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web Browser',
      description:
        'Free tool that turns code into a beautiful, shareable image with syntax themes, gradient backgrounds, and window styles.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        '14 syntax highlighting themes',
        'Gradient, image, and pattern backgrounds',
        'Resizable window frame with macOS or no title bar',
        'Transparent background export',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function CodeImagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <CodeImageEditorLoader />
      <section className="bg-background px-6 pb-48 pt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          <header className="text-center">
            <h1
              className="text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl"
              style={{ fontFamily: INTER }}
            >
              Code to Image Generator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Paste a snippet, pick a theme and background, and export a crisp
              PNG in seconds. No signup, no watermark, everything runs in your
              browser.
            </p>
          </header>

          <section>
            <SectionTitle>Code Screenshots for Your GitHub README</SectionTitle>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {readmeSteps.map((step, index) => (
                <li key={step} className={cn(CARD_CLASS, 'p-5')}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.08] text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted-foreground">Embed it in README.md:</p>
            <pre className={cn(CARD_CLASS, 'mt-2 overflow-x-auto p-4 text-sm text-foreground')}>
              <code>{readmeMarkdown}</code>
            </pre>
            <p className="mt-6 text-sm text-muted-foreground">
              Or show a separate image in GitHub dark mode:
            </p>
            <pre className={cn(CARD_CLASS, 'mt-2 overflow-x-auto p-4 text-sm text-foreground')}>
              <code>{readmePicture}</code>
            </pre>
          </section>

          <ToolFaq faqs={faqs} />

          <p className="text-center text-sm text-muted-foreground">
            Coming from another tool? See how it compares to{' '}
            <Link href="/compare/carbon" className="text-foreground underline underline-offset-4">
              Carbon
            </Link>
            {' '}and{' '}
            <Link href="/compare/ray-so" className="text-foreground underline underline-offset-4">
              Ray.so
            </Link>
            , or explore the{' '}
            <Link href="/features/code-snippets" className="text-foreground underline underline-offset-4">
              code snippet feature
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
