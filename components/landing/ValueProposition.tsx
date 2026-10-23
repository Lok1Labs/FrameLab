"use client";

import { motion } from "motion/react";
import { PRODUCT_FACTS, atLeast } from "@/lib/seo/product-facts";

interface ValuePropositionProps {
  eyebrow?: string;
  headline?: string;
}

const features = [
  {
    title: "Beautiful Backgrounds",
    description:
      `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, solid colors, images, blur, and noise effects. Make any screenshot look stunning.`,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="16" height="16" rx="3" />
        <path d="M2 13l5-5 3 3 4-4 4 4" />
        <circle cx="14" cy="6" r="1.5" />
      </svg>
    ),
  },
  {
    title: "Device Frames",
    description:
      "macOS, Windows, Arc browser frames and Polaroid borders with customizable width and opacity.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="16" height="13" rx="2" />
        <path d="M2 7h16" />
        <circle cx="4.5" cy="5" r="0.75" fill="currentColor" />
        <circle cx="7" cy="5" r="0.75" fill="currentColor" />
        <circle cx="9.5" cy="5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "3D Transforms",
    description:
      "30+ perspective presets. Add depth and dimension with realistic rotation and tilt.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 14l7 4 7-4" />
        <path d="M3 10l7 4 7-4" />
        <path d="M3 6l7 4 7-4L10 2 3 6z" />
      </svg>
    ),
  },
  {
    title: "Draw & Markup",
    description:
      "Arrows, shapes, blur regions, and text overlays. Annotate and highlight what matters.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.535.707.707-3.536 8.793-8.792z" />
      </svg>
    ),
  },
  {
    title: "Animations & Video",
    description:
      "20+ animation presets with timeline editor. Export as MP4, WebM, or GIF.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="6,3 18,10 6,17" />
      </svg>
    ),
  },
  {
    title: "Tweet & Code Snippets",
    description:
      `Import tweets by URL. Generate beautiful code snippet images with ${PRODUCT_FACTS.codeThemes} themes.`,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 7l-4 3 4 3" />
        <path d="M13 7l4 3-4 3" />
        <path d="M11 4l-2 12" />
      </svg>
    ),
  },
  {
    title: "High-Res Export",
    description:
      "PNG or JPG up to 5x resolution. Fully in-browser, no server processing.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 3v10m0 0l-3-3m3 3l3-3" />
        <path d="M3 15v2h14v-2" />
      </svg>
    ),
  },
  {
    title: "Custom Presets",
    description:
      "Save and reuse your own canvas configurations. One-click to apply any saved style.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="11" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
];

export function ValueProposition({
  eyebrow = "Features",
}: ValuePropositionProps) {
  return (
    <section className="py-20 sm:py-28 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">
            {eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            Everything you need.
            <br />
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 rounded-xl overflow-hidden border border-border/40">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className="bg-card p-6 hover:bg-accent/50 transition-colors"
            >
              <div className="text-primary mb-3">{feature.icon}</div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
