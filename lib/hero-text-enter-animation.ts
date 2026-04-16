/**
 * Hero headline entrance presets for Framer Motion (demo + export).
 */

export const HERO_TEXT_ENTER_PRESETS = [
	{ id: 'none', label: 'None', hint: 'No entrance animation' },
	{ id: 'fade', label: 'Fade in', hint: 'Opacity only' },
	{ id: 'fade-up', label: 'Fade up', hint: 'Fade + rise' },
	{ id: 'fade-down', label: 'Fade down', hint: 'Fade + drop in' },
	{ id: 'blur-in', label: 'Blur in', hint: 'Fade + defocus → sharp' },
	{ id: 'scale-up', label: 'Scale up', hint: 'Fade + slight zoom' },
] as const;

export type HeroTextEnterPreset = (typeof HERO_TEXT_ENTER_PRESETS)[number]['id'];

export const HERO_TEXT_ENTER_EASE_OPTIONS = [
	{ id: 'linear', label: 'Linear' },
	{ id: 'easeIn', label: 'Ease in' },
	{ id: 'easeOut', label: 'Ease out' },
	{ id: 'easeInOut', label: 'Ease in out' },
	{ id: 'circIn', label: 'Circular in' },
	{ id: 'circOut', label: 'Circular out' },
	{ id: 'circInOut', label: 'Circular in out' },
	{ id: 'backOut', label: 'Back out (overshoot)' },
	{ id: 'anticipate', label: 'Anticipate' },
] as const;

export type HeroTextEnterEase = (typeof HERO_TEXT_ENTER_EASE_OPTIONS)[number]['id'];

export const DEFAULT_HERO_TEXT_ENTER_PRESET: HeroTextEnterPreset = 'none';
export const DEFAULT_HERO_TEXT_ENTER_EASE: HeroTextEnterEase = 'easeInOut';
export const DEFAULT_HERO_TEXT_ENTER_DURATION_SEC = 0.85;

const PRESET_IDS = new Set<string>(HERO_TEXT_ENTER_PRESETS.map((p) => p.id));
const EASE_IDS = new Set<string>(HERO_TEXT_ENTER_EASE_OPTIONS.map((e) => e.id));

export function parseHeroTextEnterPreset(raw: unknown): HeroTextEnterPreset {
	if (typeof raw === 'string' && PRESET_IDS.has(raw)) return raw as HeroTextEnterPreset;
	return DEFAULT_HERO_TEXT_ENTER_PRESET;
}

export function parseHeroTextEnterEase(raw: unknown): HeroTextEnterEase {
	if (typeof raw === 'string' && EASE_IDS.has(raw)) return raw as HeroTextEnterEase;
	return DEFAULT_HERO_TEXT_ENTER_EASE;
}

/** Cubic-bezier tuples for Framer Motion `transition.ease`. */
export function heroTextEnterEaseBezier(id: HeroTextEnterEase): [number, number, number, number] {
	switch (id) {
		case 'linear':
			return [0, 0, 1, 1];
		case 'easeIn':
			return [0.42, 0, 1, 1];
		case 'easeOut':
			return [0, 0, 0.58, 1];
		case 'easeInOut':
			return [0.42, 0, 0.58, 1];
		case 'circIn':
			return [0.55, 0, 1, 0.45];
		case 'circOut':
			return [0, 0.55, 0.45, 1];
		case 'circInOut':
			return [0.85, 0, 0.15, 1];
		case 'backOut':
			return [0.175, 0.885, 0.32, 1.275];
		case 'anticipate':
			return [0.36, 0, 0.66, -0.56];
		default:
			return [0.42, 0, 0.58, 1];
	}
}

export interface HeroTextEnterMotionState {
	initial: Record<string, number | string>;
	animate: Record<string, number | string>;
}

export function heroTextEnterMotionState(preset: HeroTextEnterPreset): HeroTextEnterMotionState {
	switch (preset) {
		case 'none':
			return { initial: {}, animate: {} };
		case 'fade':
			return { initial: { opacity: 0 }, animate: { opacity: 1 } };
		case 'fade-up':
			return {
				initial: { opacity: 0, y: 28 },
				animate: { opacity: 1, y: 0 },
			};
		case 'fade-down':
			return {
				initial: { opacity: 0, y: -28 },
				animate: { opacity: 1, y: 0 },
			};
		case 'blur-in':
			return {
				initial: { opacity: 0, filter: 'blur(14px)' },
				animate: { opacity: 1, filter: 'blur(0px)' },
			};
		case 'scale-up':
			return {
				initial: { opacity: 0, scale: 0.94 },
				animate: { opacity: 1, scale: 1 },
			};
		default:
			return { initial: { opacity: 0 }, animate: { opacity: 1 } };
	}
}

function formatMotionObjectLiteral(obj: Record<string, number | string>): string {
	return `{ ${Object.entries(obj)
		.map(([k, v]) =>
			typeof v === 'string' ? `${k}: '${String(v).replace(/'/g, "\\'")}'` : `${k}: ${v}`,
		)
		.join(', ')} }`;
}

/** Snippets for “Copy to project” when entrance animation is enabled. */
export function heroTextEnterExportMotionAttrs(
	preset: HeroTextEnterPreset,
	ease: HeroTextEnterEase,
	durationSec: number,
): { initial: string; animate: string; transition: string } | null {
	if (preset === 'none') return null;
	const { initial, animate } = heroTextEnterMotionState(preset);
	const b = heroTextEnterEaseBezier(ease);
	return {
		initial: formatMotionObjectLiteral(initial as Record<string, number | string>),
		animate: formatMotionObjectLiteral(animate as Record<string, number | string>),
		transition: `{ duration: ${durationSec.toFixed(2)}, ease: [${b.join(', ')}] }`,
	};
}
