// Modified for FrameLab branding; original FrameLab implementation retained.
import { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { PRODUCT_FACTS, atLeast } from "@/lib/seo/product-facts";

export const metadata: Metadata = {
  title: "Screenshot Mockup Maker",
  description:
    `Make screenshot mockups in seconds. Browser frames, device mockups, ${atLeast(PRODUCT_FACTS.backgrounds)} gradient backgrounds, 3D effects, animations, and video export. Free, no signup.`,
  keywords: [
    "screenshot beautifier",
    "screenshot mockup maker",
    "beautify screenshots online",
    "screenshot background editor",
    "image presentation tool",
    "pika style alternative",
    "shots.so alternative",
    "browser window mockup",
    "safari browser mockup generator",
    "chrome browser frame generator",
    "screenshot wrapper online",
    "tweet to screenshot",
    "code snippet to image",
  ],
  openGraph: {
    title: "FrameLab - Screenshot Mockup Maker",
    description:
      `Transform screenshots into professional graphics. ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds, browser mockups, 3D effects, animations, and video export. No signup required.`,
    url: "/landing",
  },
  alternates: {
    canonical: "/landing",
  },
};

// How It Works - 3 steps
const howItWorks = [
  {
    step: 1,
    title: "Drop Your Image",
    description: "Drag any screenshot or photo into the editor to get started.",
  },
  {
    step: 2,
    title: "Style It",
    description: "Add backgrounds, shadows, frames, and text in a few clicks.",
  },
  {
    step: 3,
    title: "Export",
    description: "Download a polished image ready to share in seconds.",
  },
];

// Video testimonials
const videoTestimonials = [
  {
    videoId: "NAS4BEP2KtA",
    startTime: 3562,
    endTime: 3768,
  },
  {
    videoId: "29S4pv64Tbg",
    startTime: 222,
  },
];

export default function LandingPageRoute() {
  return (
    <LandingPage
      heroTitle="Beautiful images. Zero effort."
      heroSubtitle="Screenshots, ready to ship."
      heroDescription="The free browser editor that makes your screenshots, tweets, and code look professional. Browser mockups, 3D effects, and more."
      ctaLabel="Get Started"
      ctaHref="/"
      howItWorks={howItWorks}
      videoTestimonials={videoTestimonials}
      videoTestimonialsTitle="Creators Love FrameLab"
      brandName="FrameLab"
    />
  );
}
