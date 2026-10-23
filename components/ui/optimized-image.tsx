"use client";

import Image from 'next/image';
import { getR2ImageUrl } from '@/lib/r2';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number | 'auto';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'center' | 'face';
  [key: string]: any;
}

/**
 * OptimizedImage component that uses R2 for all images.
 * All images must be R2 paths.
 * Requires NEXT_PUBLIC_R2_PUBLIC_URL to be set.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
  quality = 'auto',
  crop,
  gravity = 'auto',
  ...props
}: OptimizedImageProps) {
  // Get R2 URL for the image
  const imageUrl = getR2ImageUrl({ src });

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      sizes={sizes}
      {...props}
    />
  );
}
