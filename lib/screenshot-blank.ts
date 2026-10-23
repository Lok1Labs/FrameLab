import sharp from "sharp";

/** Below this per-channel standard deviation an image is one flat colour. */
const BLANK_STDEV = 1;

/**
 * True when a captured screenshot is a single flat colour. Sites with an
 * intro or fade-in animation are still fully black (or white) at the moment
 * the capture service takes its shot, so the editor would show an empty frame.
 * Undecodable input counts as not blank, so this never rejects a real capture.
 */
export async function isBlankImage(image: Buffer): Promise<boolean> {
  try {
    const { channels } = await sharp(image).stats();
    return channels.every((channel) => channel.stdev < BLANK_STDEV);
  } catch {
    return false;
  }
}
