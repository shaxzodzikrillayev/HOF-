import { loadSettings, saveSettings } from '@/services/db';
import type { Settings } from '@/types';

export function getSettings(): Settings {
  return loadSettings();
}

export function persistSettings(values: Settings): Settings {
  const next: Settings = { ...values };
  saveSettings(next);
  return next;
}
