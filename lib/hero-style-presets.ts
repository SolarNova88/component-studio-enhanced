/**
 * Selectable “creative” hero headline treatments. CSS lives in src/index.css (`.hero-creative-*`).
 */

export const HERO_CREATIVE_STYLE_OPTIONS = [
	{ id: 'default', label: 'Default', hint: 'Solid color from picker' },
	{ id: 'aurora', label: 'Aurora', hint: 'Animated gradient fill' },
	{ id: 'sunset-mesh', label: 'Sunset mesh', hint: 'Warm static gradient' },
	{ id: 'outline-neon', label: 'Outline neon', hint: 'Hollow stroke + glow' },
	{ id: 'soft-glow', label: 'Soft glow', hint: 'Diffuse shadow from your color' },
	{ id: 'editorial-tight', label: 'Editorial tight', hint: 'Tight tracking, display rhythm' },
	{ id: 'chromatic-split', label: 'Chromatic split', hint: 'Offset duplicate layer' },
	{ id: 'noir-fade', label: 'Noir fade', hint: 'Fades from your color to clear' },
	{ id: 'back-halo', label: 'Back halo', hint: 'Blurred glow layer behind the type' },
	{ id: 'noise-grain', label: 'Noise grain', hint: 'Film grain over the headline' },
	{ id: 'glass-plate', label: 'Glass plate', hint: 'Frosted panel behind the headline' },
] as const;

export type HeroCreativeStyle = (typeof HERO_CREATIVE_STYLE_OPTIONS)[number]['id'];

export const DEFAULT_HERO_CREATIVE_STYLE: HeroCreativeStyle = 'default';

const STYLE_IDS = new Set<string>(HERO_CREATIVE_STYLE_OPTIONS.map((o) => o.id));

export function parseHeroCreativeStyle(raw: unknown): HeroCreativeStyle {
	if (typeof raw === 'string' && STYLE_IDS.has(raw)) {
		return raw as HeroCreativeStyle;
	}
	return DEFAULT_HERO_CREATIVE_STYLE;
}

/** Class applied to `<h1>` (empty for default). */
export function heroCreativeStyleClassName(id: HeroCreativeStyle): string {
	if (id === 'default') return '';
	return `hero-creative-${id}`;
}

/**
 * Inline `color` beats classes — omit it when the preset drives fill via gradient / clip / stroke.
 */
export function heroHeadingUsesInlineTextColor(id: HeroCreativeStyle): boolean {
	switch (id) {
		case 'default':
		case 'soft-glow':
		case 'editorial-tight':
		case 'chromatic-split':
		case 'back-halo':
		case 'noise-grain':
		case 'glass-plate':
			return true;
		default:
			return false;
	}
}

/** Aurora is the only preset with a timed animation today. */
export function heroStyleShowsEffectSpeed(id: HeroCreativeStyle): boolean {
	return id === 'aurora';
}

/**
 * Presets whose CSS scales glow, stroke, offset, or saturation via `--hero-effect-intensity`.
 */
export function heroStyleShowsEffectIntensity(id: HeroCreativeStyle): boolean {
	switch (id) {
		case 'aurora':
		case 'sunset-mesh':
		case 'outline-neon':
		case 'soft-glow':
		case 'chromatic-split':
		case 'back-halo':
		case 'noise-grain':
		case 'glass-plate':
			return true;
		default:
			return false;
	}
}

export function heroStyleShowsSunsetMeshOptions(id: HeroCreativeStyle): boolean {
	return id === 'sunset-mesh';
}

/** Preset applies creative class on a wrapper `<div>`, not on `<h1>`. */
export function heroCreativeStyleUsesGlassPlateWrapper(id: HeroCreativeStyle): boolean {
	return id === 'glass-plate';
}
