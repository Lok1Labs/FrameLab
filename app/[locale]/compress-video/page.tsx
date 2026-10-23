// Modified for FrameLab branding and maintainer contacts.
import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { CompressVideoLoader } from '@/components/compress-video/CompressVideoLoader';
import { SectionTitle, ToolFaq, ToolHero } from '@/components/tools/ToolLayout';
import { CARD_CLASS } from '@/components/tools/ui';
import { OG_DEFAULTS, SITE_URL } from '@/lib/seo/metadata';
import { TOOLS_HUB_PATH } from '@/lib/seo/tools';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Compress Video Online: Free, No Upload',
  description:
    'Reduce video file size in your browser. Pick a quality level or a target size in MB, and download an MP4. Free, no signup, no watermark, no upload.',
  keywords: [
    'compress video',
    'video compressor',
    'compress video online',
    'reduce video file size',
    'compress mp4',
    'compress video for discord',
    'compress video for email',
    'compress video to 25mb',
    'video size reducer',
    'shrink video file',
    'compress video without losing quality',
    'video compressor no upload',
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: 'Compress Video Online: Free, No Upload',
    description:
      'Make videos smaller on your device, by quality level or to a target size in MB. Free, no signup, no watermark.',
    url: '/compress-video',
  },
  alternates: {
    canonical: '/compress-video',
  },
};

const faqs = [
  {
    question: 'Is my video uploaded anywhere?',
    answer:
      'No. The video is read from your disk and compressed inside your browser tab with FFmpeg compiled to WebAssembly. The only network request is a one-time download of the compression engine (about 30 MB) from a public CDN, and that request contains no video data.',
  },
  {
    question: 'How do I compress a video to a specific size, like 25 MB?',
    answer:
      'Choose Target size, type the size in megabytes or pick a preset, and press Compress. The tool works out the bitrate that fits your video\'s length and aims slightly under it. If the target is too small for a long video, it tells you the smallest size that still looks watchable.',
  },
  {
    question: 'Which compression level should I pick?',
    answer:
      'Balanced suits most videos: a large saving with little visible difference. Light keeps the picture indistinguishable from the original. Strong and Extreme make much smaller files and soften fine detail. Lowering the resolution to 1080p or 720p saves the most on 4K phone footage.',
  },
  {
    question: 'Why does it take a while?',
    answer:
      'Re-encoding video is heavy work, and in a browser it runs slower than a desktop app. A one-minute 1080p clip usually takes one to a few minutes, depending on your device. Lower resolutions finish much faster. You can keep using other tabs while it runs.',
  },
  {
    question: 'Which formats are supported?',
    answer:
      'MP4, MOV, WebM, MKV, AVI, and most other common formats up to 1 GB. The result is always an MP4 with H.264 video and AAC audio, which plays on every phone, browser, and chat app.',
  },
  {
    question: 'Why did my video get bigger?',
    answer:
      'Some videos are already compressed very efficiently, such as clips exported from editing apps at low bitrates. Re-encoding them cannot save much. The tool shows the before and after sizes, so you can keep your original if it is smaller.',
  },
  {
    question: 'Is it free, and is there a watermark?',
    answer:
      'It is completely free with no signup, no daily limit, and no watermark. FrameLab is open source under the Apache 2.0 licence.',
  },
];

const highlights = [
  {
    title: 'Your video stays on your device',
    description:
      'Compression runs inside your browser tab. Private recordings, client work, and screen captures are never sent to a server.',
  },
  {
    title: 'Hit an exact size limit',
    description:
      'Type a target like 10 MB or 25 MB and the bitrate is worked out for you, so the file fits email, chat, and upload limits.',
  },
  {
    title: 'Resolution and audio controls',
    description:
      'Scale 4K footage down to 1080p, 720p, or 480p, shrink the audio, or remove it entirely for silent screen recordings.',
  },
  {
    title: 'An MP4 that plays everywhere',
    description:
      'The result is H.264 and AAC in an MP4 that starts playing before it finishes loading. Preview it before you download.',
  },
];

const steps = [
  {
    title: 'Select or drop a video',
    description: 'Choose an MP4, MOV, WebM, or MKV file up to 1 GB, or drag it onto the page.',
  },
  {
    title: 'Pick how small',
    description:
      'Choose a quality level or a target size in MB, and optionally a lower resolution or smaller audio.',
  },
  {
    title: 'Download the MP4',
    description: 'Watch the result, compare the before and after sizes, and download it.',
  },
];

const PAGE_URL = `${SITE_URL}/compress-video`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${PAGE_URL}#application`,
      name: 'FrameLab: Compress Video',
      url: PAGE_URL,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Video Compressor',
      operatingSystem: 'Any (Web Browser)',
      description:
        'Free video compressor that runs in the browser with FFmpeg WebAssembly. Compress by quality level or to a target size in MB without uploading the video.',
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
        'In-browser compression with FFmpeg WebAssembly',
        'Four quality levels or a target size in MB',
        'Downscale to 1080p, 720p, or 480p',
        'Keep, shrink, or remove the audio',
        'MP4 output with H.264 and AAC',
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
          name: 'Tools',
          item: `${SITE_URL}${TOOLS_HUB_PATH}`,
        },
        { '@type': 'ListItem', position: 3, name: 'Compress Video', item: PAGE_URL },
      ],
    },
  ],
};

export default function CompressVideoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-24 pt-16 sm:pt-20">
        <ToolHero
          name="Compress Video"
          title="Compress Video"
          intro="Make a video smaller without sending it anywhere. Pick a quality level or type the size you need, like 25 MB, and download an MP4 that plays everywhere. No signup, no watermark."
          parent={{ href: TOOLS_HUB_PATH, label: 'Tools' }}
        />

        <div className="mt-10 sm:mt-12">
          <CompressVideoLoader />
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
            Shrinking images instead? Use the{' '}
            <Link href="/compress-image" className="text-foreground underline underline-offset-4">
              image compressor
            </Link>
            . Want to turn a screenshot into an animated video? Open the{' '}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>
            , or browse{' '}
            <Link href={TOOLS_HUB_PATH} className="text-foreground underline underline-offset-4">
              every tool
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
