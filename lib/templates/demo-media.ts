export const TEMPLATE_DEMO_IMAGE_URL = '/demo/notion-showcase.webp';
export const TEMPLATE_DEMO_IMAGE_NAME = 'template-demo.webp';

export function isTemplateDemoMedia(
  src: string | null | undefined,
  name: string | null | undefined,
): boolean {
  return src === TEMPLATE_DEMO_IMAGE_URL && name === TEMPLATE_DEMO_IMAGE_NAME;
}

export function hasTemplateDemoMedia(
  media: ReadonlyArray<{ src?: string | null; name?: string | null }>,
): boolean {
  return media.some(({ src, name }) => isTemplateDemoMedia(src, name));
}
