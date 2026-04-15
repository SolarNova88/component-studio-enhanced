import type { CSSProperties } from 'react';

export type BackgroundVariant =
	| 'solid-dark'
	| 'solid-indigo'
	| 'gradient-sunset'
	| 'gradient-ocean'
	| 'image-forest'
	| 'blob-animated';

/** Per-variant color slots (presets match original Tailwind-based looks). */
export interface BackgroundColors {
	solidDark: string;
	solidIndigo: string;
	sunset: [string, string, string];
	ocean: [string, string, string];
	/** Forest image overlay: tint color + alpha (0–100). */
	forestTint: string;
	forestTintAlpha: number;
	blobBase: string;
	blob1: string;
	blob2: string;
	blob3: string;
}

export const DEFAULT_BACKGROUND_COLORS: BackgroundColors = {
	solidDark: '#000000',
	solidIndigo: '#1e1b4b',
	sunset: ['#fb7185', '#7c3aed', '#020617'],
	ocean: ['#082f49', '#0f766e', '#164e63'],
	forestTint: '#000000',
	forestTintAlpha: 35,
	blobBase: '#070b17',
	blob1: '#d946ef',
	blob2: '#22d3ee',
	blob3: '#34d399',
};

export const BLOB_LAYER_OPACITY = [0.35, 0.3, 0.2] as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const h = hex.replace('#', '');
	if (h.length === 3) {
		return {
			r: parseInt(h[0] + h[0], 16),
			g: parseInt(h[1] + h[1], 16),
			b: parseInt(h[2] + h[2], 16),
		};
	}
	if (h.length !== 6) return { r: 0, g: 0, b: 0 };
	return {
		r: parseInt(h.slice(0, 2), 16),
		g: parseInt(h.slice(2, 4), 16),
		b: parseInt(h.slice(4, 6), 16),
	};
}

export function forestOverlayRgba(colors: BackgroundColors): string {
	const { r, g, b } = hexToRgb(colors.forestTint);
	const a = Math.min(100, Math.max(0, colors.forestTintAlpha)) / 100;
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const FOREST_IMAGE_URL =
	"https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop&auto=format&q=80";

export type ResolvedParallaxBackground = {
	className: string;
	style: CSSProperties | undefined;
	forestOverlayColor: string | null;
	blob: { b1: string; b2: string; b3: string } | null;
};

export function resolveParallaxBackground(
	variant: BackgroundVariant,
	colors: BackgroundColors,
): ResolvedParallaxBackground {
	switch (variant) {
		case 'solid-indigo':
			return {
				className: '',
				style: { backgroundColor: colors.solidIndigo },
				forestOverlayColor: null,
				blob: null,
			};
		case 'gradient-sunset': {
			const [c1, c2, c3] = colors.sunset;
			return {
				className: '',
				style: {
					background: `radial-gradient(circle at top, ${c1} 0%, ${c2} 45%, ${c3} 100%)`,
				},
				forestOverlayColor: null,
				blob: null,
			};
		}
		case 'gradient-ocean': {
			const [c1, c2, c3] = colors.ocean;
			return {
				className: '',
				style: {
					background: `linear-gradient(135deg, ${c1} 0%, ${c2} 40%, ${c3} 100%)`,
				},
				forestOverlayColor: null,
				blob: null,
			};
		}
		case 'image-forest':
			return {
				className: 'bg-cover bg-center',
				style: { backgroundImage: `url('${FOREST_IMAGE_URL}')` },
				forestOverlayColor: forestOverlayRgba(colors),
				blob: null,
			};
		case 'blob-animated':
			return {
				className: '',
				style: { backgroundColor: colors.blobBase },
				forestOverlayColor: null,
				blob: {
					b1: colors.blob1,
					b2: colors.blob2,
					b3: colors.blob3,
				},
			};
		case 'solid-dark':
		default:
			return {
				className: '',
				style: { backgroundColor: colors.solidDark },
				forestOverlayColor: null,
				blob: null,
			};
	}
}

/** Clipboard-friendly literals for the integration bundle. */
export function serializeBackgroundForExport(
	variant: BackgroundVariant,
	colors: BackgroundColors,
): {
	classNameLiteral: string;
	styleLiteral: string;
	layerLiteral: string;
} {
	const r = resolveParallaxBackground(variant, colors);
	const classNameStr = r.className || '';
	const styleStr = r.style ? JSON.stringify(r.style) : 'undefined';

	let layerLiteral = 'undefined';
	if (variant === 'image-forest' && r.forestOverlayColor) {
		const overlay = JSON.stringify(r.forestOverlayColor);
		layerLiteral = `<div className="absolute inset-0" style={{ backgroundColor: ${overlay} }} />`;
	}
	if (variant === 'blob-animated' && r.blob) {
		const { b1, b2, b3 } = r.blob;
		const [o1, o2, o3] = BLOB_LAYER_OPACITY;
		layerLiteral = `<><div className="absolute -top-28 -left-20 h-72 w-72 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: ${JSON.stringify(b1)}, opacity: ${o1} }} /><div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full blur-3xl animate-pulse [animation-delay:400ms]" style={{ backgroundColor: ${JSON.stringify(b2)}, opacity: ${o2} }} /><div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full blur-3xl animate-pulse [animation-delay:800ms]" style={{ backgroundColor: ${JSON.stringify(b3)}, opacity: ${o3} }} /></>`;
	}

	return {
		classNameLiteral: JSON.stringify(classNameStr),
		styleLiteral: styleStr,
		layerLiteral,
	};
}

export function resetColorsForVariant(variant: BackgroundVariant, defaults: BackgroundColors): Partial<BackgroundColors> {
	switch (variant) {
		case 'solid-dark':
			return { solidDark: defaults.solidDark };
		case 'solid-indigo':
			return { solidIndigo: defaults.solidIndigo };
		case 'gradient-sunset':
			return { sunset: [...defaults.sunset] as [string, string, string] };
		case 'gradient-ocean':
			return { ocean: [...defaults.ocean] as [string, string, string] };
		case 'image-forest':
			return {
				forestTint: defaults.forestTint,
				forestTintAlpha: defaults.forestTintAlpha,
			};
		case 'blob-animated':
			return {
				blobBase: defaults.blobBase,
				blob1: defaults.blob1,
				blob2: defaults.blob2,
				blob3: defaults.blob3,
			};
		default:
			return {};
	}
}
