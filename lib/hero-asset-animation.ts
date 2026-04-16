import { heroTextEnterEaseBezier, type HeroTextEnterEase } from '@/lib/hero-text-enter-animation';

export const HERO_ASSET_ENTER_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade in' },
  { id: 'fade-up', label: 'Fade up' },
  { id: 'scale-up', label: 'Scale up' },
] as const;

export const HERO_ASSET_EXIT_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade out' },
  { id: 'fade-down', label: 'Fade down' },
  { id: 'scale-down', label: 'Scale down' },
  { id: 'drift-up', label: 'Drift up + fade' },
  { id: 'spin-fade', label: 'Spin + fade' },
] as const;

export type HeroAssetEnterPreset = (typeof HERO_ASSET_ENTER_PRESETS)[number]['id'];
export type HeroAssetExitPreset = (typeof HERO_ASSET_EXIT_PRESETS)[number]['id'];

export const DEFAULT_HERO_ASSET_ENABLED = false;
export const DEFAULT_HERO_ASSET_SRC = '';
export const DEFAULT_HERO_ASSET_ALT = 'Hero asset';
export const DEFAULT_HERO_ASSET_SCALE = 1;
export const DEFAULT_HERO_ASSET_WIDTH_PX = 240;
export const DEFAULT_HERO_ASSET_OFFSET_X_PX = 0;
export const DEFAULT_HERO_ASSET_OFFSET_Y_PX = 0;
export const DEFAULT_HERO_ASSET_ENTER_PRESET: HeroAssetEnterPreset = 'none';
export const DEFAULT_HERO_ASSET_ENTER_EASE: HeroTextEnterEase = 'easeInOut';
export const DEFAULT_HERO_ASSET_ENTER_DURATION_SEC = 0.8;
export const DEFAULT_HERO_ASSET_EXIT_PRESET: HeroAssetExitPreset = 'none';
export const DEFAULT_HERO_ASSET_EXIT_EASE: HeroTextEnterEase = 'easeOut';
export const DEFAULT_HERO_ASSET_EXIT_START = 0.18;
export const DEFAULT_HERO_ASSET_EXIT_END = 0.84;

const ENTER_IDS = new Set<string>(HERO_ASSET_ENTER_PRESETS.map((p) => p.id));
const EXIT_IDS = new Set<string>(HERO_ASSET_EXIT_PRESETS.map((p) => p.id));

export function parseHeroAssetEnterPreset(raw: unknown): HeroAssetEnterPreset {
  if (typeof raw === 'string' && ENTER_IDS.has(raw)) return raw as HeroAssetEnterPreset;
  return DEFAULT_HERO_ASSET_ENTER_PRESET;
}

export function parseHeroAssetExitPreset(raw: unknown): HeroAssetExitPreset {
  if (typeof raw === 'string' && EXIT_IDS.has(raw)) return raw as HeroAssetExitPreset;
  return DEFAULT_HERO_ASSET_EXIT_PRESET;
}

export function heroAssetEnterMotionState(preset: HeroAssetEnterPreset): {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
} {
  switch (preset) {
    case 'none':
      return { initial: {}, animate: {} };
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case 'fade-up':
      return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
    case 'scale-up':
      return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } };
    default:
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
  }
}

function cubicBezierY([x1, y1, x2, y2]: [number, number, number, number], t: number): number {
  const u = 1 - t;
  return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
}

function eased(progress: number, ease: HeroTextEnterEase): number {
  const t = Math.min(1, Math.max(0, progress));
  if (ease === 'linear') return t;
  return Math.min(1, Math.max(0, cubicBezierY(heroTextEnterEaseBezier(ease), t)));
}

export interface HeroAssetExitStyle {
  opacity: number;
  y: number;
  scale: number;
  rotate: number;
}

export function heroAssetExitStyle(
  scrollThroughIntro: number,
  reducedMotion: boolean | null,
  preset: HeroAssetExitPreset,
  ease: HeroTextEnterEase,
  start: number,
  end: number,
): HeroAssetExitStyle {
  if (reducedMotion || preset === 'none') {
    return { opacity: 1, y: 0, scale: 1, rotate: 0 };
  }
  const a = Math.min(start, end - 0.04);
  const b = Math.max(end, a + 0.04);
  const p = scrollThroughIntro;
  if (p <= a) return { opacity: 1, y: 0, scale: 1, rotate: 0 };
  if (p >= b) {
    switch (preset) {
      case 'fade':
        return { opacity: 0, y: 0, scale: 1, rotate: 0 };
      case 'fade-down':
        return { opacity: 0, y: 40, scale: 1, rotate: 0 };
      case 'scale-down':
        return { opacity: 0, y: 0, scale: 0.7, rotate: 0 };
      case 'drift-up':
        return { opacity: 0, y: -54, scale: 0.9, rotate: 0 };
      case 'spin-fade':
        return { opacity: 0, y: 0, scale: 0.88, rotate: -14 };
      default:
        return { opacity: 1, y: 0, scale: 1, rotate: 0 };
    }
  }
  const t = eased((p - a) / (b - a), ease);
  switch (preset) {
    case 'fade':
      return { opacity: 1 - t, y: 0, scale: 1, rotate: 0 };
    case 'fade-down':
      return { opacity: 1 - t, y: 40 * t, scale: 1, rotate: 0 };
    case 'scale-down':
      return { opacity: 1 - t, y: 0, scale: 1 - 0.3 * t, rotate: 0 };
    case 'drift-up':
      return { opacity: 1 - t, y: -54 * t, scale: 1 - 0.1 * t, rotate: 0 };
    case 'spin-fade':
      return { opacity: 1 - t, y: 0, scale: 1 - 0.12 * t, rotate: -14 * t };
    default:
      return { opacity: 1, y: 0, scale: 1, rotate: 0 };
  }
}
