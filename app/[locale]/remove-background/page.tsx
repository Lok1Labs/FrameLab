// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { RemoveBackgroundLoader } from '@/components/remove-background/RemoveBackgroundLoader';
import { SectionTitle, ToolFaq, ToolHero } from '@/components/tools/ToolLayout';
import { CARD_CLASS } from '@/components/tools/ui';
import { OG_DEFAULTS, SITE_URL } from '@/lib/seo/metadata';
import { TOOLS_HUB_PATH } from '@/lib/seo/tools';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Remove Background from Image: Free',
  description:
    'Remove an image background in your browser and download a transparent PNG. Runs on your device with WebGPU. Free, no signup, no watermark.',
  keywords: [
    'remove background',
    'remove background from image',
    'background remover',
    'transparent background maker',
    'remove bg free',
    'remove.bg alternative',
    'background eraser online',
    'make background transparent',
    'cut out image',
    'private background remover',
    'background remover no upload',
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: 'Remove Background from Image: Free',
    description:
      'Remove an image background on your device and download a transparent PNG. Free, no signup, no watermark.',
    url: '/remove-background',
  },
  alternates: {
    canonical: '/remove-background',
  },
};

const faqs = [
  {
    question: 'Is my image uploaded anywhere?',
    answer:
      'No. The image is decoded, processed, and turned into a PNG inside your browser tab. The only network request is a one-time download of the AI model from Hugging Face, and that request contains no image data.',
  },
  {
    question: 'Why does the first image take longer?',
    answer:
      'The first time you use it, your browser downloads the BiRefNet-lite model (about 98 MB with WebGPU, 192 MB without). It is cached afterwards, so later images start in a second or two, even offline.',
  },
  {
    question: 'What is the difference between crisp and soft edges?',
    answer:
      'Crisp edges clean up faint haze around the subject, which suits products, logos, and portraits. Soft edges keep the model\'s partial transparency, which is better for hair, fur, and motion blur. Switching between them is instant and does not rerun the model.',
  },
  {
    question: 'Which browsers and images are supported?',
    answer:
      'Recent Chrome, Edge, Firefox, and Safari. Browsers with WebGPU run on the graphics card; others fall back to WebAssembly on the CPU. PNG, JPG, WebP, and AVIF images up to 50 MB are supported.',
  },
  {
    question: 'How does it compare to remove.bg?',
    answer:
      'remove.bg processes images on its servers and caps free downloads at 0.25 megapixel previews, with full-resolution downloads costing credits. This runs on your device and returns full resolution for free. remove.bg\'s server-side models can still resolve fine hair detail better on difficult photos.',
  },
  {
    question: 'What kinds of images work best?',
    answer:
      'Photos with a clear main subject: people, pets, products, cars, and objects. Busy scenes with several overlapping subjects, or subjects that blend into the background, are harder for any background remover.',
  },
  {
    question: 'Is it free, and is there a watermark?',
    answer:
      'It is completely free with no signup, no daily limit, and no watermark. The output keeps the full resolution of your original image.',
  },
];

const highlights = [
  {
    title: 'Your image never leaves your device',
    description:
      'The AI model runs inside your browser tab. Photos of people, products, and documents are processed locally and never sent to a server.',
  },
  {
    title: 'Full resolution, no credits',
    description:
      'The transparent PNG keeps the exact dimensions of your original image. There are no low-resolution previews, credit packs, or watermarks.',
  },
  {
    title: 'WebGPU speed, works offline',
    description:
      'Runs on your graphics card with WebGPU, or on the CPU with WebAssembly. The model is cached after the first image, so it keeps working offline.',
  },
  {
    title: 'Crisp or soft edges',
    description:
      'Sharp cutouts for products and logos, or soft edges that keep hair and fur. Switch instantly and compare with the before and after slider.',
  },
];

const steps = [
  {
    title: 'Select or drop an image',
    description:
      'Choose a PNG, JPG, WebP, or AVIF photo up to 50 MB, or drag it onto the page.',
  },
  {
    title: 'Let the model cut it out',
    description:
      'BiRefNet-lite finds the subject and removes the background on your device. The first run downloads the model once; later runs start right away.',
  },
  {
    title: 'Download a transparent PNG',
    description:
      'Pick crisp or soft edges, check the result with the comparison slider, and download the PNG at full resolution.',
  },
];

const PAGE_URL = `${SITE_URL}/remove-background`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${PAGE_URL}#application`,
      name: 'FrameLab - Remove Background',
      url: PAGE_URL,
      applicationCategory: 'DesignApplication',
      applicationSubCategory: 'Background Remover',
      operatingSystem: 'Any (Web Browser)',
      description:
        'Free background remover that runs on your device and exports a transparent PNG without uploading the image.',
      isAccessibleForFree: true,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'On-device AI background removal with BiRefNet-lite',
        'WebGPU acceleration with WebAssembly fallback',
        'Transparent PNG at original resolution',
        'Before and after comparison slider',
        'No upload, no signup, no watermark',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Image Tools',
          item: `${SITE_URL}${TOOLS_HUB_PATH}`,
        },
        { '@type': 'ListItem', position: 3, name: 'Remove Background', item: PAGE_URL },
      ],
    },
  ],
};

export default function RemoveBackgroundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-24 pt-16 sm:pt-20">
        <ToolHero
          name="Remove Background"
          title="Remove Background from Image"
          intro="Drop in a photo and get a transparent PNG back in seconds. The AI model runs on your own device, so your image is never uploaded. No signup, no watermark."
        />

        <div className="mt-10 sm:mt-12">
          <RemoveBackgroundLoader />
        </div>

        <div className="mx-auto mt-24 flex max-w-3xl flex-col gap-16">
          <section>
            <SectionTitle>How it works</SectionTitle>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className={cn(CARD_CLASS, 'p-5')}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.08] text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionTitle>What you get</SectionTitle>
            <div className={cn(CARD_CLASS, 'mt-5 grid gap-x-10 gap-y-7 p-6 sm:grid-cols-2')}>
              {highlights.map((highlight) => (
                <div key={highlight.title}>
                  <h3 className="text-sm font-semibold text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ToolFaq faqs={faqs} />

          <p className="text-center text-sm text-muted-foreground">
            Coming from remove.bg? See{' '}
            <Link href="/compare/remove-bg" className="text-foreground underline underline-offset-4">
              how it compares
            </Link>
            . Want your cutout on a gradient or in a mockup? Open the{' '}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>
            , or browse{' '}
            <Link href={TOOLS_HUB_PATH} className="text-foreground underline underline-offset-4">
              every image tool
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
