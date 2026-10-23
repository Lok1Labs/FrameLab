'use client';

import { useEffect, useState } from 'react';
import {
  getBackgroundImageUrl,
  type BackgroundConfig,
} from '@/lib/constants/backgrounds';

const imageLoads = new Map<string, Promise<void>>();
const decodedUrls = new Set<string>();

function loadAndDecode(url: string): Promise<void> {
  let load = imageLoads.get(url);
  if (!load) {
    const img = new window.Image();
    img.src = url;
    load = img
      .decode()
      .catch(() => undefined)
      .then(() => {
        decodedUrls.add(url);
      });
    imageLoads.set(url, load);
  }
  return load;
}

/** True once the first image background is fully downloaded and decoded; stays true after. */
export function useBackgroundImageReady(config: BackgroundConfig): boolean {
  const url = getBackgroundImageUrl(config);
  const [ready, setReady] = useState(() => !url || decodedUrls.has(url));

  useEffect(() => {
    if (ready || !url) return;
    let active = true;
    loadAndDecode(url).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [ready, url]);

  return ready || !url;
}
