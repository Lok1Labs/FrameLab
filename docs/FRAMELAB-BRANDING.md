# FrameLab branding and Telegram validation

Implemented on 2026-10-20, branch feat/framelab-branding-telegram. This change implements the additional branding/Telegram request, not the complete feature roadmap in the attached specification.

## Delivered

- Owner-provided logo in existing navigation/editor headers. Original preserved at public/branding/original.png; SHA-256: 5CC6D37BE8E71C9B987D43B4A06688F3BDA5CA45F33540D9CECE14E6EC76DB30.
- Optimized PNG/WebP derivatives, ICO/SVG/PNG favicons, Apple icon, 192/512 PWA icons, and 1200x630 Open Graph image. No generative changes or cropping.
- FrameLab navigation, metadata and manifests. Set NEXT_PUBLIC_SITE_URL to the actual origin before deployment; local fallback is http://localhost:3000.
- Telegram navigation including mobile menu, one neutral updates card in Footer, channel/contact links, GitHub and X links.
- Optional channel link in the existing successful image export notification, once per application load. No automatic navigation, subscription requirement, repeated banner or invented counts.
- Original canvas, stores, export engine, responsive layout and design tokens retained. Apache-2.0 LICENSE unchanged; attribution added to README/Footer and modification comments added to changed source files.

## Verification

- npm run build: passed (DATABASE_URL=postgresql://localhost:5432/screenshot_studio; NODE_OPTIONS=--max-old-space-size=8192). Existing bundler warnings for background-removal and circular chunks remain.
- npm run lint: 0 errors, 90 warnings.
- npm test: 166/167 pass. Same pre-existing FFmpeg worker/package mismatch as baseline (166/167); FFmpeg implementation and test were not changed.
- Headless Microsoft Edge against production server: logo decoded and no page overflow at 360, 390, 768, 1024, 1440 px. Mobile menu has channel and separate Contact Developer links.
- Favicon ICO/SVG, PWA 192/512 icons and OG image: HTTP 200. Original copy hash matches source.
- Social hrefs verified against supplied URLs; external account availability was not asserted.
- Actual image upload and JPEG download on desktop; PNG download at 390 px. Export invitation rendered. No pageerror event observed in desktop export run.
- Screenshots and command logs: branding-validation/. The mobile editor screenshot uses a small logo derivative as test input, so its enlarged canvas preview is intentionally low resolution.

## Scope and limitations

The initial branding change did not implement the separate product-roadmap features such as Launch Kit, Showcase Builder, and Personal Style Kit. The subsequent complete rebrand updates public pages, localization, API documentation, metadata, and export file names to FrameLab. No claim of offline PWA support is made.

Nothing was published. For local startup in PowerShell:

```powershell
cd E:\FrameLab\screenshot-studio
$env:DATABASE_URL='postgresql://localhost:5432/screenshot_studio'
npm run dev
```

Vercel publication still requires configuration of the real site origin and optional service environment variables, plus resolution/review of the pre-existing FFmpeg test failure.

## Modified tracked files

```text
.gitignore
README.md
app/[locale]/changelog/page.tsx
app/[locale]/compare/[slug]/page.tsx
app/[locale]/compare/page.tsx
app/[locale]/contact/page.tsx
app/[locale]/developers/page.tsx
app/[locale]/docs/authentication/page.tsx
app/[locale]/docs/page.tsx
app/[locale]/editor/page.tsx
app/[locale]/for/designers/page.tsx
app/[locale]/for/developers/page.tsx
app/[locale]/for/marketers/page.tsx
app/[locale]/guides/[slug]/page.tsx
app/[locale]/guides/page.tsx
app/[locale]/landing/page.tsx
app/[locale]/mockup-generator/page.tsx
app/[locale]/page.tsx
app/[locale]/privacy-policy/page.tsx
app/[locale]/terms/page.tsx
app/layout.tsx
components/code-image/EditorShell.tsx
components/editor/EditorHeader.tsx
components/landing/Footer.tsx
components/landing/LandingPage.tsx
components/landing/Navigation.tsx
components/store-screenshots/StoreScreenshotWorkspace.tsx
components/store-screenshots/StoreWorkspaceLoading.tsx
hooks/useExport.ts
lib/seo/metadata.ts
public/apple-touch-icon.png
public/favicon-16x16.png
public/favicon-32x32.png
public/favicon-96x96.png
public/favicon.ico
public/favicon.svg
public/icon-192.png
public/icon-512.png
public/logo-mark.png
public/manifest.json
public/og.jpg
public/site.webmanifest
public/web-app-manifest-192x192.png
public/web-app-manifest-512x512.png
tests/agent-readiness.test.ts
```

New files additionally include components/branding/TelegramUpdates.tsx, scripts/prepare-framelab-brand.mjs, public/branding/* and this validation directory.
