// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from 'next';
import Link from 'next/link';
import { TweetImageEditorLoader } from '@/components/tweet-image/TweetImageEditorLoader';
import { SectionTitle, ToolFaq } from '@/components/tools/ToolLayout';
import { CARD_CLASS, INTER } from '@/components/tools/ui';
import { OG_DEFAULTS } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Tweet to Image: Turn Posts on X into Images',
  description:
    'Paste a link to a post on X and download it as a clean PNG. Light or dark card, gradient or transparent background, export at 2x or 4x. Free, no signup, no watermark.',
  keywords: [
    'tweet to image',
    'tweet screenshot',
    'tweet screenshot generator',
    'x post to image',
    'twitter post screenshot',
    'tweet to png',
    'save tweet as image',
    'tweet image generator free',
    'share tweet as image',
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: 'Tweet to Image: Clean Screenshots of Posts on X',
    description:
      'Paste a post link from X, pick light or dark, add a background, and export a PNG. Free, no signup.',
    url: '/tweet',
  },
  alternates: {
    canonical: '/tweet',
  },
};

const steps = [
  'Copy the link to a post on X, for example x.com/user/status/123, and paste it into the box above the card.',
  'Pick a light or dark card to match where the image will go.',
  'Keep a gradient background for social posts and slides, or turn Background off for a transparent PNG.',
  'Export at 2x or 4x, or copy the image straight to your clipboard.',
];

const faqs = [
  {
    question: 'How do I turn a tweet into an image?',
    answer:
      'Copy the post link from X, paste it into FrameLab, choose a light or dark card and a background, then export a PNG or copy the image to your clipboard.',
  },
  {
    question: 'Does it work with x.com and twitter.com links?',
    answer:
      'Yes. Links from x.com, twitter.com, and mobile.twitter.com all work, and so does a bare post ID.',
  },
  {
    question: 'Why does a post fail to load?',
    answer:
      'Only public posts can be loaded. Posts that were deleted, belong to a protected account, or come from a suspended account are not available.',
  },
  {
    question: 'Are photos in the post included?',
    answer:
      'Yes. Up to four photos from the post are shown in the card. Videos and GIFs are left out, so the image stays a still snapshot of the text.',
  },
  {
    question: 'Can I export with a transparent background?',
    answer:
      'Yes. Turn the Background switch off before exporting and the PNG keeps only the card, with rounded corners and a transparent backdrop.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. Every card style, background, and export size is free, with no signup and no watermark.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'FrameLab - Tweet to Image',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web Browser',
      description:
        'Free tool that turns a post on X into a clean, shareable image with light or dark cards and gradient backgrounds.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Load any public post from an x.com or twitter.com link',
        'Light and dark card styles',
        'Gradient, image, and pattern backgrounds',
        'Transparent background export at 2x or 4x',
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

export default function TweetImagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TweetImageEditorLoader />
      <section className="bg-background px-6 pb-48 pt-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          <header className="text-center">
            <h1
              className="text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl"
              style={{ fontFamily: INTER }}
            >
              Tweet to Image Generator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Paste a link to any public post on X and get a clean image of it,
              ready for slides, docs, newsletters, or another thread. No signup,
              no watermark.
            </p>
          </header>

          <section>
            <SectionTitle>How to Save a Post from X as an Image</SectionTitle>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {steps.map((step, index) => (
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
          </section>

          <ToolFaq faqs={faqs} />

          <p className="text-center text-sm text-muted-foreground">
            Want the post inside a device mockup or next to a screenshot? Open the{' '}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>
            , or turn a snippet into an image with{' '}
            <Link href="/code" className="text-foreground underline underline-offset-4">
              code to image
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
