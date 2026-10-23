/**
 * Client-side export helper that sends canvas to Sharp API for compression.
 *
 * Pipeline:
 * 1. canvas.toBlob() — source for Sharp (PNG for lossless targets, JPEG q=0.95 for lossy if >4MB)
 * 2. POST to /api/export with FormData (binary, no base64 bloat)
 * 3. Sharp compresses with MozJPEG/libwebp/zlib depending on format
 * 4. Falls back to canvas.toBlob() with quality if API is unavailable
 */

import type { ExportFormat, QualityPreset } from './types';

export interface SharpProcessingResult {
  blob: Blob;
  dataURL: string;
  fileSize: number;
}

// Vercel serverless body size limit (4.5MB). We use 4MB as safe threshold.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// Timeout for the Sharp API call (30 seconds)
const API_TIMEOUT_MS = 30_000;

// Fallback quality values for canvas.toBlob() if Sharp API is unavailable
const FALLBACK_QUALITY: Record<ExportFormat, Record<QualityPreset, number>> = {
  jpeg: { high: 0.85, medium: 0.75, low: 0.60 },
  webp: { high: 0.82, medium: 0.72, low: 0.55 },
  png:  { high: 1, medium: 1, low: 1 },
};

function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    default: return 'image/png';
  }
}

/**
 * Convert canvas to blob using native API
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      mimeType,
      quality
    );
  });
}

/**
 * Get the best source blob to send to Sharp.
 * - For PNG output: always send lossless PNG (Sharp needs full quality)
 * - For JPEG/WebP output: send PNG if <4MB, otherwise JPEG q=0.95 to stay under Vercel's limit
 */
async function getSourceBlob(
  canvas: HTMLCanvasElement,
  targetFormat: ExportFormat
): Promise<Blob> {
  const pngBlob = await canvasToBlob(canvas, 'image/png');

  // PNG output needs lossless source — no choice
  if (targetFormat === 'png') {
    return pngBlob;
  }

  // For lossy targets: if PNG fits under Vercel limit, use it for best quality
  if (pngBlob.size <= MAX_UPLOAD_BYTES) {
    return pngBlob;
  }

  // PNG too large — send as high-quality JPEG instead (visually lossless, much smaller)
  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
  return jpegBlob;
}

/**
 * Process and compress canvas for export via Sharp API.
 * For clipboard copies, pass skipApi=true to avoid the server round-trip.
 */
export async function processWithSharp(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  qualityPreset: QualityPreset,
  options?: { skipApi?: boolean; onProgress?: (percent: number) => void }
): Promise<SharpProcessingResult> {
  const { skipApi = false, onProgress } = options ?? {};

  // Skip API for clipboard or when explicitly requested — just use browser encoding
  if (skipApi) {
    const quality = format !== 'png' ? FALLBACK_QUALITY[format][qualityPreset] : undefined;
    const blob = await canvasToBlob(canvas, getMimeType(format), quality);
    const dataURL = URL.createObjectURL(blob);
    return { blob, dataURL, fileSize: blob.size };
  }

  // Step 1: Get the best source blob for Sharp
  const sourceBlob = await getSourceBlob(canvas, format);
  onProgress?.(65);

  // Step 2: Send to Sharp API with timeout
  let blob: Blob;

  try {
    // Abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // Simulate progress during upload/processing
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    if (onProgress) {
      let fakeProgress = 65;
      progressInterval = setInterval(() => {
        // Slowly increment from 65 → 85 while waiting for API
        fakeProgress = Math.min(fakeProgress + 1.5, 85);
        onProgress(Math.round(fakeProgress));
      }, 300);
    }

    try {
      const formData = new FormData();
      formData.append('image', sourceBlob, 'export.png');
      formData.append('format', format);
      formData.append('qualityPreset', qualityPreset);

      const response = await fetch('/api/export', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Sharp API returned ${response.status}`);
      }

      blob = await response.blob();
    } finally {
      clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
    }

    onProgress?.(90);
  } catch (error) {
    // Fallback: use browser canvas.toBlob() with quality parameter
    const isAbort = error instanceof DOMException && error.name === 'AbortError';
    console.warn(
      isAbort ? 'Sharp API timed out, using browser fallback' : 'Sharp API unavailable, using browser fallback:',
      error
    );
    const quality = format !== 'png' ? FALLBACK_QUALITY[format][qualityPreset] : undefined;
    blob = await canvasToBlob(canvas, getMimeType(format), quality);
    onProgress?.(90);
  }

  // Step 3: Create object URL for download
  const dataURL = URL.createObjectURL(blob);

  return { blob, dataURL, fileSize: blob.size };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
