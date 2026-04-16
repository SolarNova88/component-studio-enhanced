/**
 * Scroll-driven hero headline fade (intro section vs scroll container).
 */

export const HERO_SCROLL_FADE_CURVES = [
	{ id: 'linear', label: 'Linear' },
	{ id: 'easeOut', label: 'Ease out' },
	{ id: 'easeInOut', label: 'Ease in out' },
] as const;

export type HeroScrollFadeCurve = (typeof HERO_SCROLL_FADE_CURVES)[number]['id'];

export const DEFAULT_HERO_SCROLL_FADE_ENABLED = false;
export const DEFAULT_HERO_SCROLL_FADE_START = 0;
export const DEFAULT_HERO_SCROLL_FADE_END = 0.72;
export const DEFAULT_HERO_SCROLL_FADE_CURVE: HeroScrollFadeCurve = 'easeOut';

const CURVE_IDS = new Set<string>(HERO_SCROLL_FADE_CURVES.map((c) => c.id));

export function parseHeroScrollFadeCurve(raw: unknown): HeroScrollFadeCurve {
	if (typeof raw === 'string' && CURVE_IDS.has(raw)) return raw as HeroScrollFadeCurve;
	return DEFAULT_HERO_SCROLL_FADE_CURVE;
}

function applyScrollFadeEasing(t: number, curve: HeroScrollFadeCurve): number {
	const x = Math.min(1, Math.max(0, t));
	switch (curve) {
		case 'linear':
			return x;
		case 'easeOut':
			return 1 - Math.pow(1 - x, 3);
		case 'easeInOut':
			return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		default:
			return x;
	}
}

/**
 * `scrollThroughIntro` is 0 when the intro top hits the scroll container top, 1 when the intro bottom hits it
 * (same as Framer `useScroll` with offset `['start start','end start']`).
 */
export function heroScrollFadeOpacity(
	scrollThroughIntro: number,
	enabled: boolean,
	reducedMotion: boolean | null,
	start: number,
	end: number,
	curve: HeroScrollFadeCurve,
): number {
	if (!enabled || reducedMotion) return 1;
	let a = Math.min(start, end - 0.02);
	let b = Math.max(end, a + 0.04);
	const p = scrollThroughIntro;
	if (p <= a) return 1;
	if (p >= b) return 0;
	const t = (p - a) / (b - a);
	return 1 - applyScrollFadeEasing(t, curve);
}
