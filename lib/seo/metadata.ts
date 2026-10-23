// Modified for FrameLab branding; original FrameLab implementation retained.
import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const OG_IMAGE = {
  url: `${SITE_URL}/og.jpg`,
  width: 1200,
  height: 630,
  alt: "FrameLab - Transform Screenshots into Professional Graphics",
};

export const OG_DEFAULTS = {
  type: "website",
  locale: "en_US",
  siteName: "FrameLab",
  images: [OG_IMAGE],
} satisfies Metadata["openGraph"];
