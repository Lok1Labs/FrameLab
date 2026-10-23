'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PresetConfig } from '@/lib/constants/presets';

const STORAGE_KEY = 'stage-custom-presets';

export interface CustomPreset extends PresetConfig {
  createdAt: number;
}

function loadPresetsFromStorage(): CustomPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomPreset[];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: CustomPreset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // localStorage full or unavailable
  }
}

export function useCustomPresets() {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setCustomPresets(loadPresetsFromStorage());
  }, []);

  const savePreset = useCallback((name: string, config: Omit<PresetConfig, 'id' | 'name' | 'description'>) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPreset: CustomPreset = {
      ...config,
      id,
      name,
      description: 'Custom preset',
      createdAt: Date.now(),
    };
    setCustomPresets((prev) => {
      const updated = [newPreset, ...prev];
      savePresetsToStorage(updated);
      return updated;
    });
  }, []);

  const deletePreset = useCallback((id: string) => {
    setCustomPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePresetsToStorage(updated);
      return updated;
    });
  }, []);

  return { customPresets, savePreset, deletePreset };
}
