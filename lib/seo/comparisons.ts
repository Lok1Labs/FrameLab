// Modified for FrameLab branding and maintainer contacts.
import { PRODUCT_FACTS, atLeast } from "@/lib/seo/product-facts";

/** The date every competitor pricing and feature claim on /compare/* was last verified. */
export const CLAIMS_CHECKED = "2026-09-20";

export const CLAIMS_CHECKED_LABEL = new Date(CLAIMS_CHECKED).toLocaleDateString(
  "en-US",
  { year: "numeric", month: "long", day: "numeric" },
);

export interface ComparisonData {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  competitorPricing: string;
  competitorLimitations: string[];
  studioAdvantages: string[];
  features: {
    name: string;
    studio: string;
    competitor: string;
  }[];
  verdict: string;
  faqs: { q: string; a: string }[];
  /**
   * Set where the competitor does a job this product does not, so the page says
   * so up front instead of implying a like-for-like swap.
   */
  scopeNote?: string;
  /**
   * Where the page's calls to action point. Defaults to the editor; a
   * comparison against a single-purpose tool links to our matching tool.
   */
  cta?: { href: string; label: string };
}

export const comparisons: ComparisonData[] = [
  {
    slug: "pika-style",
    competitorName: "Pika Style",
    competitorUrl: "https://pika.style",
    tagline:
      "FrameLab includes 3D tilt, animations, and video export for free, where Pika Style puts tilt and background images on its Pro plan.",
    metaTitle: "FrameLab vs Pika Style: Free Alternative",
    metaDescription:
      `Compare FrameLab vs Pika Style. Both beautify screenshots; FrameLab includes 3D tilt, animations, video export, and ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds for free. No signup needed.`,
    keywords: [
      "pika style alternative",
      "pika style vs FrameLab",
      "FrameLab vs pika",
      "pika style free alternative",
      "pika screenshot editor alternative",
      "better than pika style",
      "pika style competitor",
    ],
    competitorPricing: "Free plan; Pro $13/mo or $150/yr; Lifetime $299",
    competitorLimitations: [
      "Tilt is a Pro feature",
      "Background images are Pro-only",
      "Some mockup templates need a paid plan",
      "Animation and video export not listed",
    ],
    studioAdvantages: [
      `${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds included free`,
      `Full animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets`,
      "3D perspective transforms, free",
      "Video export (MP4, WebM, GIF)",
      "No watermarks ever",
      "No signup required",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free plan, Pro $13/mo" },
      { name: "Backgrounds", studio: `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, solids, images`, competitor: "Gradients free, images on Pro" },
      { name: "Device Frames", studio: "iPhone, MacBook, Apple Watch, Safari, Chrome, Arc", competitor: "iPhone, iPad, Pixel, MacBook, browser" },
      { name: "3D Effects", studio: "Full perspective transforms", competitor: "Tilt on Pro" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframe editor`, competitor: "Not listed" },
      { name: "Video Export", studio: "MP4, WebM, GIF", competitor: "Not listed" },
      { name: "Export Resolution", studio: "Up to 5x scale", competitor: "Up to 4K on Pro" },
      { name: "Signup Required", studio: "No", competitor: "For paid features" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "Pika Style has a larger template library and more device models, including iPad and Pixel. FrameLab is the stronger choice if you want 3D tilt, animation, and video export without paying, since Pika Style puts tilt and background images on its $13/mo Pro plan.",
    faqs: [
      {
        q: "Is FrameLab a good Pika Style alternative?",
        a: `Yes. FrameLab covers Pika Style's core features (backgrounds, shadows, device and browser frames) and includes 3D tilt, an animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets, and video export in MP4, WebM, or GIF for free, with no signup. Pika Style offers more templates and device models, with tilt and background images on its Pro plan.`,
      },
      {
        q: "Does Pika Style offer animation or video export?",
        a: `Pika Style's site does not list animation or video export. FrameLab includes a keyframe animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} motion presets and exports MP4, WebM, and GIF.`,
      },
      {
        q: "Which tool has more backgrounds?",
        a: `FrameLab includes ${atLeast(PRODUCT_FACTS.backgrounds)} gradient, solid, mesh, and image backgrounds for free. Pika Style includes gradients on the free plan and puts background images on Pro.`,
      },
    ],
  },
  {
    slug: "shots-so",
    competitorName: "Shots.so",
    competitorUrl: "https://shots.so",
    tagline:
      "Shots.so is a polished mockup and animation tool with free and paid plans. FrameLab does the same core jobs with every feature free, no account, and open source code.",
    metaTitle: "FrameLab vs Shots.so: Free Alternative",
    metaDescription:
      `Compare FrameLab vs Shots.so. Both make device mockups, 3D shots, and animations; FrameLab is free with no tiers, open source, and adds a code image editor and ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds. No signup.`,
    keywords: [
      "shots.so alternative",
      "shots so alternative free",
      "FrameLab vs shots so",
      "shots.so vs FrameLab",
      "better than shots.so",
      "shots.so free alternative",
      "shots so competitor",
    ],
    competitorPricing: "Free, Basic, and Pro plans",
    competitorLimitations: [
      "Some features and assets reserved for Basic and Pro plans",
      "Closed source",
      "No dedicated code to image editor",
    ],
    studioAdvantages: [
      "Every feature free, no tiers",
      "No account needed",
      "Open source (Apache 2.0)",
      `Animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets and keyframes`,
      "Video export in MP4, WebM, GIF",
      "Built-in code to image editor",
      "Blur tool for redacting sensitive details",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free, Basic, and Pro plans" },
      { name: "Device Frames", studio: "iPhone, MacBook, Apple Watch, Safari, Chrome, Arc", competitor: "iPhone, Android, iPad, desktop, and more" },
      { name: "3D Effects", studio: "Perspective tilt & rotation", competitor: "3D shapes and shadow overlays" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframes`, competitor: "Animation presets" },
      { name: "Video Export", studio: "MP4, WebM, GIF", competitor: "Animated video export" },
      { name: "Code Snippets", studio: "Code to image editor", competitor: "Not available" },
      { name: "Export Resolution", studio: "Up to 5x scale", competitor: "Varies by plan" },
      { name: "Signup Required", studio: "No", competitor: "For paid plans" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "Shots.so is a polished mockup and animation tool with a wider range of device models, including Android and iPad. FrameLab covers the same core jobs with every feature free, no account, and open source code, and adds a code image editor and a blur tool for redaction.",
    faqs: [
      {
        q: "Is FrameLab better than Shots.so?",
        a: `It depends on what you need. Shots.so has more device models, including Android phones and iPads. FrameLab gives you everything for free with no account: iPhone, MacBook, and Apple Watch mockups, 3D perspective, an animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets, video export in MP4, WebM, or GIF, a code to image editor, and blur for redacting. It is also open source.`,
      },
      {
        q: "Does Shots.so have animation features?",
        a: `Yes. Shots.so has animation presets for short product videos. FrameLab also animates screenshots, with a keyframe timeline and ${atLeast(PRODUCT_FACTS.animationPresets)} presets, and exports MP4, WebM, or GIF for free.`,
      },
      {
        q: "Can I switch from Shots.so to FrameLab?",
        a: "Yes, the switch is instant. FrameLab requires no account or installation. Just open the editor, drag in your screenshot, and start editing with all features available immediately.",
      },
    ],
  },
  {
    slug: "snagit",
    scopeNote:
      "Snagit captures your screen and records it. FrameLab does not: it starts from an image you already have. Take the shot with your operating system shortcut (Cmd+Shift+4 on macOS, Win+Shift+S on Windows) or with Snagit itself, then bring the file here for backgrounds, mockups, 3D, and animation. If screen capture and recording are what you need, Snagit is the right tool.",
    competitorName: "Snagit",
    competitorUrl: "https://www.techsmith.com/snagit",
    tagline:
      "A free, browser-based alternative to Snagit for screenshot beautification and sharing.",
    metaTitle: "FrameLab vs Snagit: Free In-Browser",
    metaDescription:
      "Compare FrameLab vs Snagit. FrameLab is free and runs in your browser with gradient backgrounds, 3D effects, animations, and video export. No download required.",
    keywords: [
      "snagit alternative free",
      "snagit alternative",
      "FrameLab vs snagit",
      "free snagit alternative",
      "snagit free alternative online",
      "browser based snagit alternative",
      "snagit competitor free",
    ],
    competitorPricing: "One-time purchase ~$63",
    competitorLimitations: [
      "Requires desktop installation",
      "Paid software (no free version)",
      "Windows/Mac only",
      "No animation timeline or motion presets",
      "No gradient backgrounds or mockup styling",
      "Heavy application (200MB+)",
    ],
    studioAdvantages: [
      "Free, runs in any browser",
      "No installation needed",
      `${atLeast(PRODUCT_FACTS.backgrounds)} styled backgrounds`,
      "3D perspective effects",
      `Animation with ${atLeast(PRODUCT_FACTS.animationPresets)} presets`,
      "Video export (MP4, WebM, GIF)",
      "Works on any OS including Chromebook",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "~$63 one-time" },
      { name: "Platform", studio: "Any browser (web app)", competitor: "Windows, Mac desktop" },
      { name: "Installation", studio: "None required", competitor: "Desktop app download" },
      { name: "Screen Capture", studio: "Via browser or OS tools", competitor: "Built-in capture" },
      { name: "Backgrounds", studio: `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, solids`, competitor: "Solid colors only" },
      { name: "Device Frames", studio: "iPhone, MacBook, Apple Watch, Safari, Chrome, Arc", competitor: "Not available" },
      { name: "3D Effects", studio: "Perspective transforms", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframes`, competitor: "Basic GIF recording" },
      { name: "Video Export", studio: "MP4, WebM, GIF from timeline", competitor: "Screen recording only" },
      { name: "Annotations", studio: "Text, arrows, overlays", competitor: "Text, arrows, shapes" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "Snagit excels at screen capture and annotation for enterprise teams. FrameLab is the better pick for beautifying screenshots with backgrounds, 3D effects, and animations, and it costs nothing.",
    faqs: [
      {
        q: "Can FrameLab replace Snagit?",
        a: "For screenshot beautification, yes. FrameLab offers gradient backgrounds, 3D effects, device frames, and animation that Snagit does not. Snagit has built-in screen capture and enterprise features like scrolling capture, which FrameLab handles through browser/OS screenshot tools instead.",
      },
      {
        q: "Is FrameLab really free compared to Snagit's price?",
        a: "Yes. FrameLab is 100% free with no hidden costs, subscriptions, or feature locks. Snagit costs approximately $63 as a one-time purchase plus upgrade fees for major versions.",
      },
      {
        q: "Does FrameLab work on Chromebooks?",
        a: "Yes. FrameLab runs in any modern browser, including Chrome on Chromebooks, Linux, and mobile devices. Snagit only runs on Windows and macOS desktops.",
      },
    ],
  },
  {
    slug: "cleanshot-x",
    scopeNote:
      "CleanShot X is a macOS capture app: screen recording, scrolling capture, pinned overlays, and a capture hotkey. FrameLab does none of that. It picks up after the capture, turning an existing image into a presentable graphic in any browser on any operating system. If you want the capture workflow itself, and you are on a Mac, CleanShot X is the right tool.",
    competitorName: "CleanShot X",
    competitorUrl: "https://cleanshot.com",
    tagline:
      "A free, cross-platform alternative to CleanShot X that runs in your browser.",
    metaTitle:
      "FrameLab vs CleanShot X: Free Alternative",
    metaDescription:
      "Compare FrameLab vs CleanShot X. FrameLab is free, cross-platform, and adds gradient backgrounds, 3D effects, animations, and video export. No macOS required.",
    keywords: [
      "cleanshot x alternative",
      "cleanshot alternative free",
      "cleanshot x free alternative",
      "FrameLab vs cleanshot",
      "cleanshot x vs FrameLab",
      "cleanshot alternative windows",
      "cleanshot competitor",
    ],
    competitorPricing: "$29 one-time or $8/mo (Cloud)",
    competitorLimitations: [
      "macOS only",
      "Paid software",
      "No web-based editor",
      "No animation timeline",
      "Limited background styling",
      "No 3D perspective transforms",
    ],
    studioAdvantages: [
      "Free, works on any OS",
      "Runs in browser (no install)",
      `${atLeast(PRODUCT_FACTS.backgrounds)} gradient backgrounds`,
      "3D perspective effects",
      "Full animation timeline",
      "Video export (MP4, WebM, GIF)",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "$29+ one-time" },
      { name: "Platform", studio: "Any browser", competitor: "macOS only" },
      { name: "Screen Capture", studio: "Via browser/OS tools", competitor: "Built-in (excellent)" },
      { name: "Background Styling", studio: `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, images`, competitor: "Basic solid backgrounds" },
      { name: "Device Frames", studio: "iPhone, MacBook, Apple Watch, Safari, Chrome, Arc", competitor: "Not available" },
      { name: "3D Effects", studio: "Full perspective transforms", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframes`, competitor: "Not available" },
      { name: "Video Export", studio: "MP4, WebM, GIF", competitor: "Screen recording" },
      { name: "Cloud Storage", studio: "Local (privacy-first)", competitor: "CleanShot Cloud" },
      { name: "Annotations", studio: "Text, arrows, overlays", competitor: "Text, arrows, shapes, blur" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "CleanShot X is the best macOS screen capture tool. FrameLab is the better choice for screenshot beautification with backgrounds, 3D effects, and animations, and works on any platform for free.",
    faqs: [
      {
        q: "Is FrameLab a good CleanShot X alternative?",
        a: "For screenshot beautification, yes. FrameLab offers gradient backgrounds, 3D perspective, animations, and video export that CleanShot X lacks. CleanShot X has superior built-in screen capture, scrolling capture, and macOS integration.",
      },
      {
        q: "Can I use FrameLab on Windows or Linux?",
        a: "Yes. FrameLab runs in any modern browser on Windows, macOS, Linux, and Chromebooks. CleanShot X is macOS-only.",
      },
      {
        q: "Does CleanShot X have animation features?",
        a: `No. CleanShot X focuses on screen capture and basic annotation. FrameLab provides a full animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets and exports animations as MP4, WebM, or GIF.`,
      },
    ],
  },
  {
    slug: "screely",
    competitorName: "Screely",
    competitorUrl: "https://screely.app",
    tagline:
      "More backgrounds, effects, and export options than Screely, all free.",
    metaTitle: "FrameLab vs Screely: More Features, Free",
    metaDescription:
      `Compare FrameLab vs Screely. Both are free screenshot editors, but FrameLab adds 3D effects, animations, video export, device frames, and ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds.`,
    keywords: [
      "screely alternative",
      "screely vs FrameLab",
      "FrameLab vs screely",
      "better than screely",
      "screely alternative with more features",
      "screely competitor",
    ],
    competitorPricing: "Free",
    competitorLimitations: [
      "Limited background options",
      "macOS and Windows window frames only, no device mockups",
      "No 3D effects",
      "No animation timeline (tab recording via Chrome extension only)",
      "No text overlays",
      "Basic shadow options only",
    ],
    studioAdvantages: [
      `${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds (gradients, images, mesh)`,
      "iPhone, MacBook, and Apple Watch mockups plus window frames",
      "3D perspective transforms",
      `Animation timeline with ${atLeast(PRODUCT_FACTS.animationPresets)} presets`,
      "Video export (MP4, WebM, GIF)",
      "Text and image overlay layers",
      "High-res export up to 5x",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free" },
      { name: "Backgrounds", studio: `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, solids, images`, competitor: "Solid colors" },
      { name: "Device Frames", studio: "iPhone, MacBook, Apple Watch, Safari, Chrome, Arc", competitor: "macOS and Windows windows" },
      { name: "Shadows", studio: "Blur, spread, offset, color", competitor: "Basic drop shadow" },
      { name: "3D Effects", studio: "Perspective tilt & rotation", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframes`, competitor: "Not available" },
      { name: "Video Export", studio: "MP4, WebM, GIF", competitor: "Tab recording (Chrome extension)" },
      { name: "Text Overlays", studio: `${atLeast(PRODUCT_FACTS.fonts)} fonts, shadows`, competitor: "Not available" },
      { name: "Export", studio: "PNG, JPEG, WebP up to 5x", competitor: "High-resolution PNG or PDF" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      `Screely is a simple tool for adding a window frame to screenshots. FrameLab does everything Screely does and much more: ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds, 3D effects, animations, video export, and device frames.`,
    faqs: [
      {
        q: "How does FrameLab compare to Screely?",
        a: `FrameLab covers Screely's screenshot styling and adds much more: ${atLeast(PRODUCT_FACTS.backgrounds)} gradient backgrounds, multiple device frames (macOS, Windows, Arc), 3D perspective transforms, animation timeline, video export, text overlays, and high-res export up to 5x.`,
      },
      {
        q: "Is Screely or FrameLab better for developers?",
        a: "FrameLab is the better choice for most developer visuals. It offers a code to image editor, 3D perspective mockups for portfolio images, and animated MP4, WebM, or GIF exports. Screely is simpler and its Chrome extension records tab demos, which FrameLab does not.",
      },
    ],
  },
  {
    slug: "carbon",
    competitorName: "Carbon",
    competitorUrl: "https://carbon.now.sh",
    tagline:
      "Carbon has more syntax themes and SVG export. FrameLab adds gradient and pattern backgrounds, transparent PNGs, and a full screenshot and mockup editor for everything else.",
    metaTitle: "FrameLab vs Carbon: Free Code to Image",
    metaDescription:
      "Compare FrameLab vs Carbon for code screenshots. Carbon has more themes and SVG export; FrameLab adds gradient backgrounds, then browser mockups, 3D effects, and video in its main editor. Free, no signup.",
    keywords: [
      "carbon alternative",
      "carbon.now.sh alternative",
      "carbon code screenshot alternative",
      "code to image tool",
      "code snippet screenshot generator",
      "FrameLab vs carbon",
      "beautiful code screenshots",
    ],
    competitorPricing: "Free",
    competitorLimitations: [
      "Code only, no screenshot or mockup editing",
      "No gradient background presets",
      "No 3D perspective or animations",
      "PNG and SVG export only",
      "No browser or device frames",
    ],
    studioAdvantages: [
      "Gradient, image, and pattern backgrounds, or a transparent PNG",
      "Code images plus screenshot and mockup editing in one tool",
      "Shareable links that reopen your exact design",
      "Open the PNG in the main editor for browser frames, 3D, and animation",
      "Video export (MP4, WebM, GIF) from the main editor",
      "No signup, no watermarks",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free" },
      { name: "Syntax Themes", studio: `${PRODUCT_FACTS.codeThemes}`, competitor: "29" },
      { name: "Backgrounds", studio: "Theme gradients, gradient presets, images, patterns", competitor: "Any color or your own image" },
      { name: "Screenshot Editing", studio: "Full editor", competitor: "Not available" },
      { name: "Device Frames", studio: "macOS title bar; Safari, Chrome, Arc in the main editor", competitor: "macOS-style window only" },
      { name: "3D Effects", studio: "In the main editor", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets in the main editor`, competitor: "Not available" },
      { name: "Video Export", studio: "MP4, WebM, GIF from the main editor", competitor: "Not available" },
      { name: "Image Export", studio: "PNG at 2x or 4x", competitor: "PNG, SVG" },
      { name: "Signup Required", studio: "No", competitor: "No" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "Yes (MIT)" },
    ],
    verdict:
      "Carbon is the more established single-purpose code image tool, with more themes (29) and SVG export. Pick FrameLab if you want gradient or image backgrounds and a main editor that frames, tilts, and animates the result.",
    faqs: [
      {
        q: "Is FrameLab a good Carbon alternative?",
        a: `Yes, for most uses. FrameLab makes code images with ${PRODUCT_FACTS.codeThemes} syntax themes, line numbers, a macOS title bar, gradient and image backgrounds, and transparent export. Carbon has more themes (29) and SVG export. FrameLab's main editor adds browser mockups, 3D transforms, animations, and video export. Both are free with no signup.`,
      },
      {
        q: "Can I export code images as video?",
        a: "Yes. Export the code image as a PNG, open it in the FrameLab editor, add an animation preset, and export MP4, WebM, or GIF. Carbon exports static PNG and SVG only.",
      },
    ],
  },
  {
    slug: "ray-so",
    competitorName: "Ray.so",
    competitorUrl: "https://ray.so",
    tagline:
      "Ray.so has more themes. FrameLab adds image and pattern backgrounds plus a full screenshot and mockup editor for frames, 3D, and video.",
    metaTitle: "FrameLab vs Ray.so: Free Code Images",
    metaDescription:
      "Compare FrameLab vs Ray.so for code screenshots. Ray.so has more themes; FrameLab adds image and pattern backgrounds, then browser mockups, 3D effects, animations, and video in its main editor. Free, no signup.",
    keywords: [
      "ray.so alternative",
      "ray so alternative",
      "ray.so vs FrameLab",
      "code screenshot tool",
      "code to image generator",
      "raycast code image alternative",
      "code snippet to image",
    ],
    competitorPricing: "Free",
    competitorLimitations: [
      "Code only, no screenshot editing",
      "Fixed set of gradient themes",
      "No browser or device frames",
      "No 3D effects or animations",
      "Static image export only",
    ],
    studioAdvantages: [
      "Gradient, image, and pattern backgrounds",
      "Screenshot and mockup editor in the same tool",
      "Browser frames and device mockups in the main editor",
      "3D perspective transforms and animations in the main editor",
      "Video export (MP4, WebM, GIF)",
      "No signup, no watermarks",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free" },
      { name: "Syntax Themes", studio: `${PRODUCT_FACTS.codeThemes}`, competitor: "About 20" },
      { name: "Backgrounds", studio: "Theme gradients, gradient presets, images, patterns", competitor: "Theme gradients" },
      { name: "Screenshot Editing", studio: "Full editor", competitor: "Not available" },
      { name: "Device Frames", studio: "macOS title bar; Safari, Chrome, Arc in the main editor", competitor: "Not available" },
      { name: "3D Effects", studio: "In the main editor", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets in the main editor`, competitor: "Not available" },
      { name: "Video Export", studio: "MP4, WebM, GIF from the main editor", competitor: "Not available" },
      { name: "Image Export", studio: "PNG at 2x or 4x", competitor: "PNG, SVG" },
      { name: "Signup Required", studio: "No", competitor: "No" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "Yes (MIT)" },
    ],
    verdict:
      "Ray.so is fast and pretty for a quick code snippet and has more themes. FrameLab covers the same job and, through its main editor, adds frames, 3D effects, animations, and video export, all free.",
    faqs: [
      {
        q: "Is FrameLab a good Ray.so alternative?",
        a: `Yes. FrameLab produces clean code images with ${PRODUCT_FACTS.codeThemes} themes, gradient, image, and pattern backgrounds, and transparent export, and its main editor adds browser mockups, 3D perspective, animations, and video export. It is free, open source, and needs no signup.`,
      },
      {
        q: "Does Ray.so support browser mockups or animations?",
        a: "No. Ray.so exports static code images only. With FrameLab you can open the code PNG in the main editor, put it in a Safari, Chrome, or macOS frame, tilt it in 3D, animate it, and export as MP4, WebM, or GIF.",
      },
    ],
  },
  {
    slug: "xnapper",
    scopeNote:
      "Xnapper captures the screen and cleans the result up, including automatic text redaction. FrameLab starts from an image you already have: it has no capture step and no automatic redaction, only a manual blur tool. Use your operating system capture shortcut first, then bring the file here for backgrounds, mockups, 3D, and animation.",
    competitorName: "Xnapper",
    competitorUrl: "https://xnapper.com",
    tagline:
      "FrameLab gives you Xnapper-style beautified screenshots in the browser, on any OS, with 3D effects, animations, and video export at no cost.",
    metaTitle: "FrameLab vs Xnapper: Free Online",
    metaDescription:
      `Compare FrameLab vs Xnapper. Xnapper is a paid macOS app; FrameLab runs free in any browser with ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds, browser mockups, 3D effects, animations, and video export.`,
    keywords: [
      "xnapper alternative",
      "xnapper free alternative",
      "xnapper for windows",
      "xnapper vs FrameLab",
      "screenshot beautifier app alternative",
      "xnapper online alternative",
      "beautiful screenshots mac windows",
    ],
    competitorPricing: "One-time purchase from $29.99, macOS only",
    competitorLimitations: [
      "macOS only, requires install",
      "Paid license required",
      "No 3D perspective effects",
      "No animations or video export",
      "Limited device frame options",
    ],
    studioAdvantages: [
      "Runs in any browser on macOS, Windows, and Linux",
      "Free forever, no license",
      `${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds and browser mockups`,
      "3D perspective transforms",
      "Animation timeline and video export",
      "No signup, no watermarks",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "$29.99+ one-time" },
      { name: "Platform", studio: "Any browser", competitor: "macOS app" },
      { name: "Backgrounds", studio: `${atLeast(PRODUCT_FACTS.backgrounds)} gradients, solids, images`, competitor: "Gradients and wallpapers" },
      { name: "Device Frames", studio: "Safari, Chrome, Arc, Polaroid, macOS window", competitor: "macOS window" },
      { name: "Screen Capture", studio: "Upload or paste", competitor: "Built-in capture" },
      { name: "3D Effects", studio: "Full perspective transforms", competitor: "Not available" },
      { name: "Animations", studio: `${atLeast(PRODUCT_FACTS.animationPresets)} presets, keyframe editor`, competitor: "Not available" },
      { name: "Video Export", studio: "MP4, WebM, GIF", competitor: "Not available" },
      { name: "Export Resolution", studio: "Up to 5x scale", competitor: "Retina" },
      { name: "Signup Required", studio: "No", competitor: "License key" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "Xnapper is a good native macOS capture tool if you want to pay for it. FrameLab delivers the same beautified result for free in the browser, on any OS, and adds 3D, animation, and video export.",
    faqs: [
      {
        q: "Is there a free alternative to Xnapper?",
        a: "Yes. FrameLab is a free, open-source alternative to Xnapper that runs in your browser. It adds backgrounds, shadows, browser mockups, 3D effects, and animations to any screenshot with no signup and no watermark.",
      },
      {
        q: "Does Xnapper work on Windows?",
        a: "No. Xnapper is macOS only. FrameLab works in any modern browser on Windows, macOS, Linux, and ChromeOS, so you get the same beautified screenshots without installing anything.",
      },
    ],
  },
  {
    slug: "remove-bg",
    competitorName: "remove.bg",
    competitorUrl: "https://www.remove.bg",
    tagline:
      "FrameLab removes backgrounds on your own device and gives you the full-resolution PNG for free, with no upload and no credits.",
    metaTitle: "FrameLab vs remove.bg: Free, No Upload",
    metaDescription:
      "FrameLab vs remove.bg: remove backgrounds on your device and download full-resolution transparent PNGs free. No upload, no credits, no signup.",
    keywords: [
      "remove.bg alternative",
      "remove bg alternative free",
      "remove.bg free alternative",
      "FrameLab vs remove.bg",
      "remove.bg alternative no upload",
      "remove.bg full resolution free",
      "remove.bg moving to canva alternative",
      "private background remover",
    ],
    competitorPricing: "Free previews up to 0.25 MP; 1 credit per high-resolution image",
    competitorLimitations: [
      "Free downloads are previews of up to 0.25 megapixels",
      "Each high-resolution download uses a paid credit",
      "Images are processed on remote servers",
      "Standalone site is being migrated into Canva",
    ],
    studioAdvantages: [
      "Full-resolution transparent PNG for free",
      "Runs on your device, the image is never uploaded",
      "Works offline once the model is cached",
      "No credits, signup, or watermark",
      "Crisp and soft edge styles with a comparison slider",
      "Open source",
    ],
    features: [
      { name: "Price", studio: "Free forever", competitor: "Free previews, credits for HD" },
      { name: "Free Output Resolution", studio: "Original resolution", competitor: "Up to 0.25 MP preview" },
      { name: "Maximum Resolution", studio: "Original image, up to 50 MB file", competitor: "Up to 50 MP with credits" },
      { name: "Where Processing Happens", studio: "On your device", competitor: "remove.bg servers" },
      { name: "Image Upload", studio: "Never", competitor: "Required" },
      { name: "Works Offline", studio: "Yes, after first load", competitor: "Not available" },
      { name: "API and Apps", studio: "Not available", competitor: "Yes, credit based" },
      { name: "Screenshot and Mockup Editor", studio: "Included", competitor: "Not available" },
      { name: "Open Source", studio: "Yes (Apache 2.0)", competitor: "No" },
    ],
    verdict:
      "remove.bg is a mature service with apps, an API, and server-side models that handle difficult hair detail well, but free downloads are low-resolution previews. FrameLab is the better fit when you want full-resolution cutouts for free, or when a photo should never leave your device.",
    faqs: [
      {
        q: "Is FrameLab a good remove.bg alternative?",
        a: "Yes, for everyday cutouts. FrameLab removes backgrounds with an AI model that runs in your browser and returns a transparent PNG at the original resolution for free. remove.bg's free downloads are previews of up to 0.25 megapixels, and high-resolution downloads use credits.",
      },
      {
        q: "Does FrameLab upload my image?",
        a: "No. The image is processed on your device. The only network request is a one-time download of the model weights from Hugging Face, which contains no image data. remove.bg processes images on its own servers.",
      },
      {
        q: "When should I still use remove.bg?",
        a: "When you need an API or its apps, or the best possible detail on hard cases like fine hair against a busy background. Its server-side models are not limited by what a browser can run.",
      },
    ],
    cta: { href: "/remove-background", label: "Remove a Background Free" },
  },
];

export function getComparison(slug: string): ComparisonData | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug);
}

/** Sourcing line shown under every competitor claim, so no price is asserted unattributed. */
export function claimsNote(comparison: ComparisonData): string {
  return `${comparison.competitorName} pricing and feature details checked on ${CLAIMS_CHECKED_LABEL} against ${comparison.competitorUrl}. Third-party plans change without notice, so confirm current pricing on their site before deciding.`;
}

/** SERP title: the brand already opens the `vs` construction, so no suffix, and the year is never hardcoded. */
export function getComparisonTitle(comparison: ComparisonData): string {
  return `${comparison.metaTitle} (${new Date().getFullYear()})`;
}
