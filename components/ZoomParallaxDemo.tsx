'use client';
import React from 'react';
import {
	AnimatePresence,
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Lenis from '@studio-freight/lenis'
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { cn } from '@/lib/utils';
import {
	BLOB_LAYER_OPACITY,
	DEFAULT_BACKGROUND_COLORS,
	resolveParallaxBackground,
	resetColorsForVariant,
	type BackgroundColors,
	type BackgroundScope,
	type BackgroundVariant,
} from '@/lib/background-presets';
import {
	HERO_CREATIVE_STYLE_OPTIONS,
	heroCreativeStyleClassName,
	heroHeadingUsesInlineTextColor,
	heroCreativeStyleUsesGlassPlateWrapper,
	heroStyleShowsEffectIntensity,
	heroStyleShowsEffectSpeed,
	heroStyleShowsSunsetMeshOptions,
	type HeroCreativeStyle,
} from '@/lib/hero-style-presets';
import {
	HERO_TEXT_ENTER_EASE_OPTIONS,
	HERO_TEXT_ENTER_PRESETS,
	heroTextEnterEaseBezier,
	heroTextEnterMotionState,
	type HeroTextEnterEase,
	type HeroTextEnterPreset,
} from '@/lib/hero-text-enter-animation';
import {
	HERO_SCROLL_FADE_CURVES,
	heroScrollFadeOpacity,
	type HeroScrollFadeCurve,
} from '@/lib/hero-scroll-fade';
import { edgeFadeOverlayDefs, type EdgeFadeConfig } from '@/lib/edge-fade';
import {
	DEFAULT_HERO_ASSET_ALT,
	HERO_ASSET_ENTER_PRESETS,
	HERO_ASSET_EXIT_PRESETS,
	heroAssetEnterMotionState,
	heroAssetExitStyle,
	type HeroAssetEnterPreset,
	type HeroAssetExitPreset,
} from '@/lib/hero-asset-animation';

export type { BackgroundColors, BackgroundScope, BackgroundVariant } from '@/lib/background-presets';

export type HeroTextAlign = 'left' | 'center' | 'right';
export type { HeroCreativeStyle } from '@/lib/hero-style-presets';
export type { HeroTextEnterEase, HeroTextEnterPreset } from '@/lib/hero-text-enter-animation';
export type { HeroScrollFadeCurve } from '@/lib/hero-scroll-fade';
export type { HeroAssetEnterPreset, HeroAssetExitPreset } from '@/lib/hero-asset-animation';
export type { EdgeFadeConfig } from '@/lib/edge-fade';

const EDITOR_UI_STORAGE_KEY = 'zoom-parallax-demo-editor-ui-v1';
export interface DemoImage {
	src: string;
	alt?: string;
	/** Optional random candidates used when dynamic image mode is enabled. */
	variants?: string[];
}

function hexInputValue(hex: string): string {
	if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
	if (/^#[0-9A-Fa-f]{3}$/.test(hex)) return hex;
	return '#000000';
}

interface AccordionCardProps {
	title: string;
	id: string;
	isOpen: boolean;
	onToggle: (id: string) => void;
	children: React.ReactNode;
}

function AccordionCard({ title, id, isOpen, onToggle, children }: AccordionCardProps) {
	return (
		<div className="rounded-xl border border-border bg-white/[0.03] p-5">
			<button
				type="button"
				onClick={() => onToggle(id)}
				className="flex w-full items-center justify-between text-left"
			>
				<h3 className="text-sm font-semibold text-primary">{title}</h3>
				<ChevronDown
					className={cn(
						'h-4 w-4 text-muted-foreground transition-transform duration-200',
						isOpen ? 'rotate-180' : 'rotate-0',
					)}
				/>
			</button>
			<AnimatePresence initial={false}>
				{isOpen ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.22, ease: 'easeInOut' }}
						className="overflow-hidden"
					>
						<div className="pt-3">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

interface BackgroundEditorProps {
	title: string;
	variant: BackgroundVariant;
	onVariantChange: (value: BackgroundVariant) => void;
	colors: BackgroundColors;
	onColorsChange: (value: BackgroundColors) => void;
}

function BackgroundEditor({ title, variant, onVariantChange, colors, onColorsChange }: BackgroundEditorProps) {
	return (
		<div className="rounded-xl border border-border bg-white/[0.03] p-5">
			<h3 className="mb-3 text-sm font-semibold text-primary">{title}</h3>
			<select
				value={variant}
				onChange={(event) => onVariantChange(event.target.value as BackgroundVariant)}
				className="mb-3 w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
			>
				<option value="solid-dark">Solid / Dark</option>
				<option value="solid-indigo">Solid / Indigo</option>
				<option value="gradient-sunset">Gradient / Sunset</option>
				<option value="gradient-ocean">Gradient / Ocean</option>
				<option value="image-forest">Image / Forest + Overlay</option>
				<option value="blob-animated">Animated / Blobs</option>
			</select>
			<div className="mb-3 flex items-center justify-between gap-2">
				<button
					type="button"
					onClick={() =>
						onColorsChange({
							...colors,
							...resetColorsForVariant(variant, DEFAULT_BACKGROUND_COLORS),
						})
					}
					className="rounded-md border border-border bg-black/30 px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-black/40"
				>
					Reset active preset colors
				</button>
			</div>
			{variant === 'solid-dark' && (
				<div className="flex items-center gap-2">
					<label className="w-20 shrink-0 text-xs text-muted-foreground">Fill</label>
					<input type="color" value={hexInputValue(colors.solidDark)} onChange={(e) => onColorsChange({ ...colors, solidDark: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
					<input type="text" value={colors.solidDark} onChange={(e) => onColorsChange({ ...colors, solidDark: e.target.value })} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
				</div>
			)}
			{variant === 'solid-indigo' && (
				<div className="flex items-center gap-2">
					<label className="w-20 shrink-0 text-xs text-muted-foreground">Fill</label>
					<input type="color" value={hexInputValue(colors.solidIndigo)} onChange={(e) => onColorsChange({ ...colors, solidIndigo: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
					<input type="text" value={colors.solidIndigo} onChange={(e) => onColorsChange({ ...colors, solidIndigo: e.target.value })} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
				</div>
			)}
			{variant === 'gradient-sunset' && (
				<div className="flex flex-col gap-2">
					{(['Top', 'Mid', 'Bottom'] as const).map((label, i) => (
						<div key={label} className="flex items-center gap-2">
							<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
							<input type="color" value={hexInputValue(colors.sunset[i])} onChange={(e) => { const next = [...colors.sunset] as [string, string, string]; next[i] = e.target.value; onColorsChange({ ...colors, sunset: next }); }} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
							<input type="text" value={colors.sunset[i]} onChange={(e) => { const next = [...colors.sunset] as [string, string, string]; next[i] = e.target.value; onColorsChange({ ...colors, sunset: next }); }} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
						</div>
					))}
				</div>
			)}
			{variant === 'gradient-ocean' && (
				<div className="flex flex-col gap-2">
					{(['Start', 'Mid', 'End'] as const).map((label, i) => (
						<div key={label} className="flex items-center gap-2">
							<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
							<input type="color" value={hexInputValue(colors.ocean[i])} onChange={(e) => { const next = [...colors.ocean] as [string, string, string]; next[i] = e.target.value; onColorsChange({ ...colors, ocean: next }); }} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
							<input type="text" value={colors.ocean[i]} onChange={(e) => { const next = [...colors.ocean] as [string, string, string]; next[i] = e.target.value; onColorsChange({ ...colors, ocean: next }); }} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
						</div>
					))}
				</div>
			)}
			{variant === 'image-forest' && (
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<label className="w-20 shrink-0 text-xs text-muted-foreground">Tint</label>
						<input type="color" value={hexInputValue(colors.forestTint)} onChange={(e) => onColorsChange({ ...colors, forestTint: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
						<input type="text" value={colors.forestTint} onChange={(e) => onColorsChange({ ...colors, forestTint: e.target.value })} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
					</div>
					<div>
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Overlay strength</span>
							<span className="font-mono">{Math.round(colors.forestTintAlpha)}%</span>
						</div>
						<input type="range" min={0} max={100} step={1} value={colors.forestTintAlpha} onChange={(e) => onColorsChange({ ...colors, forestTintAlpha: Number(e.target.value) })} className="w-full accent-primary" />
					</div>
				</div>
			)}
			{variant === 'blob-animated' && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<label className="w-20 shrink-0 text-xs text-muted-foreground">Base</label>
						<input type="color" value={hexInputValue(colors.blobBase)} onChange={(e) => onColorsChange({ ...colors, blobBase: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
						<input type="text" value={colors.blobBase} onChange={(e) => onColorsChange({ ...colors, blobBase: e.target.value })} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
					</div>
					{(['Blob 1', 'Blob 2', 'Blob 3'] as const).map((label, i) => {
						const key = ['blob1', 'blob2', 'blob3'][i] as 'blob1' | 'blob2' | 'blob3';
						const val = colors[key];
						return (
							<div key={label} className="flex items-center gap-2">
								<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
								<input type="color" value={hexInputValue(val)} onChange={(e) => onColorsChange({ ...colors, [key]: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
								<input type="text" value={val} onChange={(e) => onColorsChange({ ...colors, [key]: e.target.value })} className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs" />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

interface ZoomParallaxDemoProps {
	scrollLengthMultiplier: number;
	onScrollLengthMultiplierChange: (value: number) => void;
	/** Extra scroll in vh after collage settles, before hero lock */
	collagePauseVh: number;
	onCollagePauseVhChange: (value: number) => void;
	introHeightVh: number;
	onIntroHeightVhChange: (value: number) => void;
	heroFontFamily: string;
	onHeroFontFamilyChange: (value: string) => void;
	heroHeadingText: string;
	onHeroHeadingTextChange: (value: string) => void;
	heroFontSizePx: number;
	onHeroFontSizePxChange: (value: number) => void;
	heroTextColor: string;
	onHeroTextColorChange: (value: string) => void;
	heroTextAlign: HeroTextAlign;
	onHeroTextAlignChange: (value: HeroTextAlign) => void;
	heroOffsetXPx: number;
	onHeroOffsetXPxChange: (value: number) => void;
	heroOffsetYPx: number;
	onHeroOffsetYPxChange: (value: number) => void;
	heroMaxWidthPercent: number;
	onHeroMaxWidthPercentChange: (value: number) => void;
	heroCreativeStyle: HeroCreativeStyle;
	onHeroCreativeStyleChange: (value: HeroCreativeStyle) => void;
	heroEffectIntensity: number;
	onHeroEffectIntensityChange: (value: number) => void;
	heroEffectSpeedSeconds: number;
	onHeroEffectSpeedSecondsChange: (value: number) => void;
	heroSunsetMeshUseBackground: boolean;
	onHeroSunsetMeshUseBackgroundChange: (value: boolean) => void;
	heroTextEnterPreset: HeroTextEnterPreset;
	onHeroTextEnterPresetChange: (value: HeroTextEnterPreset) => void;
	heroTextEnterEase: HeroTextEnterEase;
	onHeroTextEnterEaseChange: (value: HeroTextEnterEase) => void;
	heroTextEnterDurationSec: number;
	onHeroTextEnterDurationSecChange: (value: number) => void;
	heroScrollFadeEnabled: boolean;
	onHeroScrollFadeEnabledChange: (value: boolean) => void;
	heroScrollFadeStart: number;
	onHeroScrollFadeStartChange: (value: number) => void;
	heroScrollFadeEnd: number;
	onHeroScrollFadeEndChange: (value: number) => void;
	heroScrollFadeCurve: HeroScrollFadeCurve;
	onHeroScrollFadeCurveChange: (value: HeroScrollFadeCurve) => void;
	heroTextZIndex: number;
	onHeroTextZIndexChange: (value: number) => void;
	introEdgeFade: EdgeFadeConfig;
	onIntroEdgeFadeChange: (value: EdgeFadeConfig) => void;
	introEdgeFadeSizePercent: number;
	onIntroEdgeFadeSizePercentChange: (value: number) => void;
	introEdgeFadeZIndex: number;
	onIntroEdgeFadeZIndexChange: (value: number) => void;
	heroAssetEnabled: boolean;
	onHeroAssetEnabledChange: (value: boolean) => void;
	heroAssetSrc: string;
	onHeroAssetSrcChange: (value: string) => void;
	heroAssetAlt: string;
	onHeroAssetAltChange: (value: string) => void;
	heroAssetScale: number;
	onHeroAssetScaleChange: (value: number) => void;
	heroAssetWidthPx: number;
	onHeroAssetWidthPxChange: (value: number) => void;
	heroAssetOffsetXPx: number;
	onHeroAssetOffsetXPxChange: (value: number) => void;
	heroAssetOffsetYPx: number;
	onHeroAssetOffsetYPxChange: (value: number) => void;
	heroAssetZIndex: number;
	onHeroAssetZIndexChange: (value: number) => void;
	parallaxEdgeFade: EdgeFadeConfig;
	onParallaxEdgeFadeChange: (value: EdgeFadeConfig) => void;
	parallaxEdgeFadeSizePercent: number;
	onParallaxEdgeFadeSizePercentChange: (value: number) => void;
	parallaxEdgeFadeZIndex: number;
	onParallaxEdgeFadeZIndexChange: (value: number) => void;
	heroAssetEnterPreset: HeroAssetEnterPreset;
	onHeroAssetEnterPresetChange: (value: HeroAssetEnterPreset) => void;
	heroAssetEnterEase: HeroTextEnterEase;
	onHeroAssetEnterEaseChange: (value: HeroTextEnterEase) => void;
	heroAssetEnterDurationSec: number;
	onHeroAssetEnterDurationSecChange: (value: number) => void;
	heroAssetExitPreset: HeroAssetExitPreset;
	onHeroAssetExitPresetChange: (value: HeroAssetExitPreset) => void;
	heroAssetExitEase: HeroTextEnterEase;
	onHeroAssetExitEaseChange: (value: HeroTextEnterEase) => void;
	heroAssetExitStart: number;
	onHeroAssetExitStartChange: (value: number) => void;
	heroAssetExitEnd: number;
	onHeroAssetExitEndChange: (value: number) => void;
	heroAsset2Enabled: boolean;
	onHeroAsset2EnabledChange: (value: boolean) => void;
	heroAsset2Src: string;
	onHeroAsset2SrcChange: (value: string) => void;
	heroAsset2Alt: string;
	onHeroAsset2AltChange: (value: string) => void;
	heroAsset2Scale: number;
	onHeroAsset2ScaleChange: (value: number) => void;
	heroAsset2WidthPx: number;
	onHeroAsset2WidthPxChange: (value: number) => void;
	heroAsset2OffsetXPx: number;
	onHeroAsset2OffsetXPxChange: (value: number) => void;
	heroAsset2OffsetYPx: number;
	onHeroAsset2OffsetYPxChange: (value: number) => void;
	heroAsset2ZIndex: number;
	onHeroAsset2ZIndexChange: (value: number) => void;
	heroAsset2EnterPreset: HeroAssetEnterPreset;
	onHeroAsset2EnterPresetChange: (value: HeroAssetEnterPreset) => void;
	heroAsset2EnterEase: HeroTextEnterEase;
	onHeroAsset2EnterEaseChange: (value: HeroTextEnterEase) => void;
	heroAsset2EnterDurationSec: number;
	onHeroAsset2EnterDurationSecChange: (value: number) => void;
	heroAsset2ExitPreset: HeroAssetExitPreset;
	onHeroAsset2ExitPresetChange: (value: HeroAssetExitPreset) => void;
	heroAsset2ExitEase: HeroTextEnterEase;
	onHeroAsset2ExitEaseChange: (value: HeroTextEnterEase) => void;
	heroAsset2ExitStart: number;
	onHeroAsset2ExitStartChange: (value: number) => void;
	heroAsset2ExitEnd: number;
	onHeroAsset2ExitEndChange: (value: number) => void;
	images: DemoImage[];
	onImagesChange: (value: DemoImage[]) => void;
	/** Restore bundled CSN primary URLs and dynamic variant pools. */
	onResetImagesToDefaults?: () => void;
	imageBorderRadiusPx: number;
	onImageBorderRadiusPxChange: (value: number) => void;
	backgroundVariant: BackgroundVariant;
	onBackgroundVariantChange: (value: BackgroundVariant) => void;
	backgroundColors: BackgroundColors;
	onBackgroundColorsChange: (value: BackgroundColors) => void;
	heroBackgroundVariant: BackgroundVariant;
	onHeroBackgroundVariantChange: (value: BackgroundVariant) => void;
	heroBackgroundColors: BackgroundColors;
	onHeroBackgroundColorsChange: (value: BackgroundColors) => void;
	linkHeroParallaxBackgrounds: boolean;
	onLinkHeroParallaxBackgroundsChange: (value: boolean) => void;
	backgroundScope: BackgroundScope;
	onBackgroundScopeChange: (value: BackgroundScope) => void;
	dynamicImageMode: boolean;
	onDynamicImageModeChange: (value: boolean) => void;
	centerImageStaticInDynamicMode: boolean;
	onCenterImageStaticInDynamicModeChange: (value: boolean) => void;
	dynamicImageSwitchEveryVh: number;
	onDynamicImageSwitchEveryVhChange: (value: number) => void;
}

export default function ZoomParallaxDemo({
	scrollLengthMultiplier,
	onScrollLengthMultiplierChange,
	collagePauseVh,
	onCollagePauseVhChange,
	introHeightVh,
	onIntroHeightVhChange,
	heroFontFamily,
	onHeroFontFamilyChange,
	heroHeadingText,
	onHeroHeadingTextChange,
	heroFontSizePx,
	onHeroFontSizePxChange,
	heroTextColor,
	onHeroTextColorChange,
	heroTextAlign,
	onHeroTextAlignChange,
	heroOffsetXPx,
	onHeroOffsetXPxChange,
	heroOffsetYPx,
	onHeroOffsetYPxChange,
	heroMaxWidthPercent,
	onHeroMaxWidthPercentChange,
	heroCreativeStyle,
	onHeroCreativeStyleChange,
	heroEffectIntensity,
	onHeroEffectIntensityChange,
	heroEffectSpeedSeconds,
	onHeroEffectSpeedSecondsChange,
	heroSunsetMeshUseBackground,
	onHeroSunsetMeshUseBackgroundChange,
	heroTextEnterPreset,
	onHeroTextEnterPresetChange,
	heroTextEnterEase,
	onHeroTextEnterEaseChange,
	heroTextEnterDurationSec,
	onHeroTextEnterDurationSecChange,
	heroScrollFadeEnabled,
	onHeroScrollFadeEnabledChange,
	heroScrollFadeStart,
	onHeroScrollFadeStartChange,
	heroScrollFadeEnd,
	onHeroScrollFadeEndChange,
	heroScrollFadeCurve,
	onHeroScrollFadeCurveChange,
	heroTextZIndex,
	onHeroTextZIndexChange,
	introEdgeFade,
	onIntroEdgeFadeChange,
	introEdgeFadeSizePercent,
	onIntroEdgeFadeSizePercentChange,
	introEdgeFadeZIndex,
	onIntroEdgeFadeZIndexChange,
	heroAssetEnabled,
	onHeroAssetEnabledChange,
	heroAssetSrc,
	onHeroAssetSrcChange,
	heroAssetAlt,
	onHeroAssetAltChange,
	heroAssetScale,
	onHeroAssetScaleChange,
	heroAssetWidthPx,
	onHeroAssetWidthPxChange,
	heroAssetOffsetXPx,
	onHeroAssetOffsetXPxChange,
	heroAssetOffsetYPx,
	onHeroAssetOffsetYPxChange,
	heroAssetZIndex,
	onHeroAssetZIndexChange,
	parallaxEdgeFade,
	onParallaxEdgeFadeChange,
	parallaxEdgeFadeSizePercent,
	onParallaxEdgeFadeSizePercentChange,
	parallaxEdgeFadeZIndex,
	onParallaxEdgeFadeZIndexChange,
	heroAssetEnterPreset,
	onHeroAssetEnterPresetChange,
	heroAssetEnterEase,
	onHeroAssetEnterEaseChange,
	heroAssetEnterDurationSec,
	onHeroAssetEnterDurationSecChange,
	heroAssetExitPreset,
	onHeroAssetExitPresetChange,
	heroAssetExitEase,
	onHeroAssetExitEaseChange,
	heroAssetExitStart,
	onHeroAssetExitStartChange,
	heroAssetExitEnd,
	onHeroAssetExitEndChange,
	heroAsset2Enabled,
	onHeroAsset2EnabledChange,
	heroAsset2Src,
	onHeroAsset2SrcChange,
	heroAsset2Alt,
	onHeroAsset2AltChange,
	heroAsset2Scale,
	onHeroAsset2ScaleChange,
	heroAsset2WidthPx,
	onHeroAsset2WidthPxChange,
	heroAsset2OffsetXPx,
	onHeroAsset2OffsetXPxChange,
	heroAsset2OffsetYPx,
	onHeroAsset2OffsetYPxChange,
	heroAsset2ZIndex,
	onHeroAsset2ZIndexChange,
	heroAsset2EnterPreset,
	onHeroAsset2EnterPresetChange,
	heroAsset2EnterEase,
	onHeroAsset2EnterEaseChange,
	heroAsset2EnterDurationSec,
	onHeroAsset2EnterDurationSecChange,
	heroAsset2ExitPreset,
	onHeroAsset2ExitPresetChange,
	heroAsset2ExitEase,
	onHeroAsset2ExitEaseChange,
	heroAsset2ExitStart,
	onHeroAsset2ExitStartChange,
	heroAsset2ExitEnd,
	onHeroAsset2ExitEndChange,
	images,
	onImagesChange,
	onResetImagesToDefaults,
	imageBorderRadiusPx,
	onImageBorderRadiusPxChange,
	backgroundVariant,
	onBackgroundVariantChange,
	backgroundColors,
	onBackgroundColorsChange,
	heroBackgroundVariant,
	onHeroBackgroundVariantChange,
	heroBackgroundColors,
	onHeroBackgroundColorsChange,
	linkHeroParallaxBackgrounds,
	onLinkHeroParallaxBackgroundsChange,
	backgroundScope,
	onBackgroundScopeChange,
	dynamicImageMode,
	onDynamicImageModeChange,
	centerImageStaticInDynamicMode,
	onCenterImageStaticInDynamicModeChange,
	dynamicImageSwitchEveryVh,
	onDynamicImageSwitchEveryVhChange,
}: ZoomParallaxDemoProps) {
	const previewScrollRef = React.useRef<HTMLDivElement>(null);
	const introSectionRef = React.useRef<HTMLDivElement>(null);
	const heroAssetFileInputRef = React.useRef<HTMLInputElement>(null);
	const heroAsset2FileInputRef = React.useRef<HTMLInputElement>(null);
	const editorPanelScrollRef = React.useRef<HTMLDivElement>(null);
	const openCardsRef = React.useRef<Record<string, boolean>>({});
	const lenisRef = React.useRef<Lenis | null>(null);
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const [previewViewportHeight, setPreviewViewportHeight] = React.useState(0);
	const [previewViewportWidth, setPreviewViewportWidth] = React.useState(0);

	const [openCards, setOpenCards] = React.useState<Record<string, boolean>>({
		heroTextStyling: false,
		heroAsset: false,
		edgeFade: false,
		heroTextPosition: false,
		backgroundColors: false,
		imageSources: false,
	});
	const [hasRestoredEditorUi, setHasRestoredEditorUi] = React.useState(false);
	openCardsRef.current = openCards;
	const toggleCard = React.useCallback((id: string) => {
		setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

	React.useEffect(() => {
		try {
			const raw = window.localStorage.getItem(EDITOR_UI_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as {
					openCards?: Record<string, boolean>;
					editorPanelScrollTop?: number;
				};
				if (parsed.openCards && typeof parsed.openCards === 'object') {
					setOpenCards((prev) => ({ ...prev, ...parsed.openCards }));
				}
				if (typeof parsed.editorPanelScrollTop === 'number') {
					requestAnimationFrame(() => {
						if (!editorPanelScrollRef.current) return;
						editorPanelScrollRef.current.scrollTop = Math.max(0, parsed.editorPanelScrollTop);
					});
				}
			}
		} catch {
			// Ignore malformed UI state and continue with defaults.
		} finally {
			setHasRestoredEditorUi(true);
		}
	}, []);

	React.useEffect(() => {
		if (!hasRestoredEditorUi) return;
		const panel = editorPanelScrollRef.current;
		if (!panel) return;

		const persist = () => {
			try {
				const raw = window.localStorage.getItem(EDITOR_UI_STORAGE_KEY);
				const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
				window.localStorage.setItem(
					EDITOR_UI_STORAGE_KEY,
					JSON.stringify({
						...prev,
						openCards: openCardsRef.current,
						editorPanelScrollTop: panel.scrollTop,
					}),
				);
			} catch {
				// Storage may be unavailable; non-fatal for demo controls.
			}
		};

		persist();
		panel.addEventListener('scroll', persist, { passive: true });
		return () => panel.removeEventListener('scroll', persist);
	}, [openCards, hasRestoredEditorUi]);

	React.useEffect(() => {
		if (!hasRestoredEditorUi) return;
		const persistBeforeUnload = () => {
			const panel = editorPanelScrollRef.current;
			if (!panel) return;
			try {
				const raw = window.localStorage.getItem(EDITOR_UI_STORAGE_KEY);
				const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
				window.localStorage.setItem(
					EDITOR_UI_STORAGE_KEY,
					JSON.stringify({
						...prev,
						openCards: openCardsRef.current,
						editorPanelScrollTop: panel.scrollTop,
					}),
				);
			} catch {
				// Ignore storage errors during unload.
			}
		};

		window.addEventListener('beforeunload', persistBeforeUnload);
		return () => window.removeEventListener('beforeunload', persistBeforeUnload);
	}, [hasRestoredEditorUi]);

	React.useEffect( () => {
		if (!previewScrollRef.current) return;
		const contentEl = previewScrollRef.current.firstElementChild as HTMLElement | null;
		if (!contentEl) return;

        const lenis = new Lenis({
			wrapper: previewScrollRef.current,
			content: contentEl,
		})
		lenisRef.current = lenis;

		let animationFrameId = 0;
       
        function raf(time: number) {
            lenis.raf(time)
            animationFrameId = requestAnimationFrame(raf)
        }

        animationFrameId = requestAnimationFrame(raf)
        
        return () => {
			cancelAnimationFrame(animationFrameId);
            lenis.destroy();
			lenisRef.current = null;
        }
    }, [])

	React.useEffect(() => {
		const wrapper = previewScrollRef.current;
		if (!wrapper) return;

		const maxScroll = Math.max(0, wrapper.scrollHeight - wrapper.clientHeight);
		if (wrapper.scrollTop > maxScroll) {
			wrapper.scrollTop = maxScroll;
		}
		lenisRef.current?.resize();
	}, [scrollLengthMultiplier, isFullscreen]);

	React.useEffect(() => {
		const wrapper = previewScrollRef.current;
		if (!wrapper) return;

		const updateSize = () => {
			setPreviewViewportHeight(wrapper.clientHeight);
			setPreviewViewportWidth(wrapper.clientWidth);
		};
		updateSize();

		const observer = new ResizeObserver(() => updateSize());
		observer.observe(wrapper);
		return () => observer.disconnect();
	}, [isFullscreen]);

	const embeddedSceneScale =
		!previewViewportWidth || !previewViewportHeight
			? 1
			: Math.min(
					1,
					previewViewportWidth / window.innerWidth,
					previewViewportHeight / window.innerHeight,
				);
	const heroPreviewScaleCompensation = embeddedSceneScale;
	const introHeightStyle = {
		height: `${(introHeightVh / 100) * Math.max(1, previewViewportHeight || window.innerHeight)}px`,
	};
	const introHeadingStyle: React.CSSProperties = {
		fontFamily: heroFontFamily || undefined,
		fontSize: `${heroFontSizePx}px`,
		...(heroHeadingUsesInlineTextColor(heroCreativeStyle) ? { color: heroTextColor } : {}),
		textAlign: heroTextAlign,
		...(heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle)
			? {}
			: { maxWidth: `${heroMaxWidthPercent}%` }),
		['--hero-user-color' as string]: heroTextColor,
		['--hero-effect-intensity' as string]: heroEffectIntensity,
		['--hero-effect-speed' as string]: `${heroEffectSpeedSeconds}s`,
		['--hero-sync-sunset' as string]:
			heroCreativeStyle === 'sunset-mesh' && heroSunsetMeshUseBackground ? 1 : 0,
		['--hero-sunset-1' as string]: backgroundColors.sunset[0],
		['--hero-sunset-2' as string]: backgroundColors.sunset[1],
		['--hero-sunset-3' as string]: backgroundColors.sunset[2],
	};
	const heroGlassPlateWrapStyle: React.CSSProperties | undefined =
		heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle)
			? {
					maxWidth: `${heroMaxWidthPercent}%`,
					['--hero-user-color' as string]: heroTextColor,
					['--hero-effect-intensity' as string]: heroEffectIntensity,
				}
			: undefined;
	const heroAlignClassName = cn(
		heroTextAlign === 'left' ? 'ml-0 mr-auto' : '',
		heroTextAlign === 'center' ? 'mx-auto' : '',
		heroTextAlign === 'right' ? 'ml-auto mr-0' : '',
	);
	const reducedMotion = useReducedMotion();
	const skipHeroEnter = heroTextEnterPreset === 'none' || reducedMotion;
	const heroEnterMotion = React.useMemo(
		() => heroTextEnterMotionState(heroTextEnterPreset),
		[heroTextEnterPreset],
	);
	const heroEnterTransition = React.useMemo(
		() => ({
			duration: Math.min(2.8, Math.max(0.15, heroTextEnterDurationSec)),
			ease: heroTextEnterEaseBezier(heroTextEnterEase),
		}),
		[heroTextEnterDurationSec, heroTextEnterEase],
	);
	const heroEnterMotionKey = `${heroTextEnterPreset}-${heroTextEnterEase}-${heroTextEnterDurationSec}-${heroHeadingText}`;
	const assetEnterMotion = React.useMemo(
		() => heroAssetEnterMotionState(heroAssetEnterPreset),
		[heroAssetEnterPreset],
	);
	const skipAssetEnter = heroAssetEnterPreset === 'none' || reducedMotion;
	const assetEnterTransition = React.useMemo(
		() => ({
			duration: Math.min(2.8, Math.max(0.15, heroAssetEnterDurationSec)),
			ease: heroTextEnterEaseBezier(heroAssetEnterEase),
		}),
		[heroAssetEnterDurationSec, heroAssetEnterEase],
	);
	const assetEnterMotionKey = `${heroAssetEnterPreset}-${heroAssetEnterEase}-${heroAssetEnterDurationSec}-${heroAssetSrc}`;
	const asset2EnterMotion = React.useMemo(
		() => heroAssetEnterMotionState(heroAsset2EnterPreset),
		[heroAsset2EnterPreset],
	);
	const skipAsset2Enter = heroAsset2EnterPreset === 'none' || reducedMotion;
	const asset2EnterTransition = React.useMemo(
		() => ({
			duration: Math.min(2.8, Math.max(0.15, heroAsset2EnterDurationSec)),
			ease: heroTextEnterEaseBezier(heroAsset2EnterEase),
		}),
		[heroAsset2EnterDurationSec, heroAsset2EnterEase],
	);
	const asset2EnterMotionKey = `${heroAsset2EnterPreset}-${heroAsset2EnterEase}-${heroAsset2EnterDurationSec}-${heroAsset2Src}`;
	const { scrollYProgress: introScrollThrough } = useScroll({
		target: introSectionRef,
		container: previewScrollRef,
		offset: ['start start', 'end start'],
	});
	const heroScrollFadeOpacityMv = useTransform(introScrollThrough, (latest) =>
		heroScrollFadeOpacity(
			latest,
			heroScrollFadeEnabled,
			reducedMotion,
			heroScrollFadeStart,
			heroScrollFadeEnd,
			heroScrollFadeCurve,
		),
	);
	const heroAssetExitOpacityMv = useTransform(introScrollThrough, (latest) =>
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAssetExitPreset,
			heroAssetExitEase,
			heroAssetExitStart,
			heroAssetExitEnd,
		).opacity,
	);
	const heroAssetExitYMv = useTransform(introScrollThrough, (latest) =>
		heroAssetOffsetYPx +
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAssetExitPreset,
			heroAssetExitEase,
			heroAssetExitStart,
			heroAssetExitEnd,
		).y,
	);
	const heroAssetExitScaleMv = useTransform(introScrollThrough, (latest) =>
		heroAssetScale *
		heroPreviewScaleCompensation *
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAssetExitPreset,
			heroAssetExitEase,
			heroAssetExitStart,
			heroAssetExitEnd,
		).scale,
	);
	const heroAssetExitRotateMv = useTransform(introScrollThrough, (latest) =>
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAssetExitPreset,
			heroAssetExitEase,
			heroAssetExitStart,
			heroAssetExitEnd,
		).rotate,
	);
	const heroAsset2ExitOpacityMv = useTransform(introScrollThrough, (latest) =>
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAsset2ExitPreset,
			heroAsset2ExitEase,
			heroAsset2ExitStart,
			heroAsset2ExitEnd,
		).opacity,
	);
	const heroAsset2ExitYMv = useTransform(introScrollThrough, (latest) =>
		heroAsset2OffsetYPx +
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAsset2ExitPreset,
			heroAsset2ExitEase,
			heroAsset2ExitStart,
			heroAsset2ExitEnd,
		).y,
	);
	const heroAsset2ExitScaleMv = useTransform(introScrollThrough, (latest) =>
		heroAsset2Scale *
		heroPreviewScaleCompensation *
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAsset2ExitPreset,
			heroAsset2ExitEase,
			heroAsset2ExitStart,
			heroAsset2ExitEnd,
		).scale,
	);
	const heroAsset2ExitRotateMv = useTransform(introScrollThrough, (latest) =>
		heroAssetExitStyle(
			latest,
			reducedMotion,
			heroAsset2ExitPreset,
			heroAsset2ExitEase,
			heroAsset2ExitStart,
			heroAsset2ExitEnd,
		).rotate,
	);
	/** Offsets apply from true center of intro section (mini + fullscreen). */
	const introHeroAnchorStyle: React.CSSProperties = {
		position: 'absolute',
		left: '50%',
		top: '50%',
		width: '100%',
		maxWidth: '100%',
		boxSizing: 'border-box',
		paddingLeft: '1.5rem',
		paddingRight: '1.5rem',
		transform: `translate(calc(-50% + ${heroOffsetXPx}px), calc(-50% + ${heroOffsetYPx}px))`,
	};

	const buildBackgroundConfig = React.useCallback((variant: BackgroundVariant, colors: BackgroundColors) => {
		const resolved = resolveParallaxBackground(variant, colors);
		let layer: React.ReactNode = null;
		if (resolved.forestOverlayColor) {
			layer = (
				<div
					className="absolute inset-0"
					style={{ backgroundColor: resolved.forestOverlayColor }}
				/>
			);
		} else if (resolved.blob) {
			const { b1, b2, b3 } = resolved.blob;
			const [o1, o2, o3] = BLOB_LAYER_OPACITY;
			layer = (
				<>
					<div
						className="absolute -top-28 -left-20 h-72 w-72 rounded-full blur-3xl animate-pulse"
						style={{ backgroundColor: b1, opacity: o1 }}
					/>
					<div
						className="absolute top-1/3 -right-16 h-80 w-80 rounded-full blur-3xl animate-pulse [animation-delay:400ms]"
						style={{ backgroundColor: b2, opacity: o2 }}
					/>
					<div
						className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full blur-3xl animate-pulse [animation-delay:800ms]"
						style={{ backgroundColor: b3, opacity: o3 }}
					/>
				</>
			);
		}
		return {
			className: resolved.className,
			style: resolved.style,
			layer,
		};
	}, []);
	const backgroundConfig = React.useMemo(
		() => buildBackgroundConfig(backgroundVariant, backgroundColors),
		[backgroundVariant, backgroundColors, buildBackgroundConfig],
	);
	const heroBackgroundConfig = React.useMemo(
		() => buildBackgroundConfig(heroBackgroundVariant, heroBackgroundColors),
		[heroBackgroundVariant, heroBackgroundColors, buildBackgroundConfig],
	);
	const introUsesCustomBackground =
		backgroundScope === 'hero-only' ||
		backgroundScope === 'split' ||
		backgroundScope === 'independent' ||
		backgroundScope === 'continuous';
	const introUsesHeroSpecificBackground =
		backgroundScope === 'hero-only' || backgroundScope === 'independent';
	const stageUsesCustomBackground =
		backgroundScope === 'parallax-only' ||
		backgroundScope === 'split' ||
		backgroundScope === 'independent';
	const introBackgroundConfig = introUsesHeroSpecificBackground ? heroBackgroundConfig : backgroundConfig;
	const introEdgeFadeOverlays = React.useMemo(
		() => edgeFadeOverlayDefs(introEdgeFade, introEdgeFadeSizePercent),
		[introEdgeFade, introEdgeFadeSizePercent],
	);

	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsFullscreen(false);
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);


	const updateImageAt = (index: number, patch: Partial<DemoImage>) => {
		const next = [...images];
		const current = next[index] ?? { src: '', alt: '' };
		next[index] = { ...current, ...patch };
		onImagesChange(next);
	};

	const handleImageFileChange = (index: number, file: File | null) => {
		if (!file) return;
		const objectUrl = URL.createObjectURL(file);
		const previous = images[index]?.src;
		if (previous?.startsWith('blob:')) {
			URL.revokeObjectURL(previous);
		}
		updateImageAt(index, {
			src: objectUrl,
			alt: images[index]?.alt || file.name || `Image ${index + 1}`,
		});
	};
	const handleHeroAssetFileChange = (file: File | null) => {
		if (!file) return;
		const objectUrl = URL.createObjectURL(file);
		if (heroAssetSrc?.startsWith('blob:')) {
			URL.revokeObjectURL(heroAssetSrc);
		}
		onHeroAssetSrcChange(objectUrl);
		if (!heroAssetAlt.trim()) {
			onHeroAssetAltChange(file.name || DEFAULT_HERO_ASSET_ALT);
		}
	};
	const handleHeroAsset2FileChange = (file: File | null) => {
		if (!file) return;
		const objectUrl = URL.createObjectURL(file);
		if (heroAsset2Src?.startsWith('blob:')) {
			URL.revokeObjectURL(heroAsset2Src);
		}
		onHeroAsset2SrcChange(objectUrl);
		if (!heroAsset2Alt.trim()) {
			onHeroAsset2AltChange(file.name || DEFAULT_HERO_ASSET_ALT);
		}
	};

	return (
		<div className="grid h-full min-h-0 min-w-0 grid-cols-1 gap-6 overflow-hidden p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
			{/* Parallax Canvas */}
			<div
				className={cn(
					'relative w-full max-w-full rounded-xl border border-border bg-black shadow-2xl transition-all lg:mx-auto',
					isFullscreen
						? 'fixed top-0 left-0 z-50 h-screen w-screen aspect-auto rounded-none border-white/20'
						: 'aspect-video max-h-[calc(100vh-13rem)]',
				)}
			>
				<div ref={previewScrollRef} className={cn(
					'absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain',
					isFullscreen ? 'rounded-2xl' : 'rounded-xl',
				)}>
					<main
						className={cn(
							'relative min-h-screen w-full text-white',
							backgroundScope !== 'continuous' && !introUsesCustomBackground && 'bg-black',
						)}
					>
						{backgroundScope === 'continuous' ? (
							<>
								<div
									aria-hidden
									className={cn(
										'pointer-events-none absolute inset-0 z-0 min-h-full',
										backgroundConfig.className,
									)}
									style={backgroundConfig.style}
								/>
								{backgroundConfig.layer ? (
									<div className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden">
										{backgroundConfig.layer}
									</div>
								) : null}
							</>
						) : null}
						<div
							ref={introSectionRef}
							className="relative overflow-hidden"
							style={introHeightStyle}
						>
							{introUsesCustomBackground && backgroundScope !== 'continuous' ? (
								<>
									<div
										aria-hidden
										className={cn(
											'pointer-events-none absolute inset-0 z-0',
											introBackgroundConfig.className,
										)}
										style={introBackgroundConfig.style}
									/>
									{introBackgroundConfig.layer ? (
										<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
											{introBackgroundConfig.layer}
										</div>
									) : null}
								</>
							) : null}
							{!introUsesCustomBackground ? (
								<div
									aria-hidden="true"
									className={cn(
										'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
										'bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]',
										'blur-[30px]',
									)}
								/>
							) : null}
							{introEdgeFadeOverlays.map((overlay) => (
								<div
									key={overlay.key}
									aria-hidden
									className="pointer-events-none absolute"
									style={{ ...overlay.style, zIndex: introEdgeFadeZIndex }}
								/>
							))}
							{heroAssetEnabled && heroAssetSrc ? (
								<motion.div
									className="pointer-events-none absolute left-1/2 top-1/2"
									style={{
										x: heroAssetOffsetXPx,
										y: heroAssetExitYMv,
										scale: heroAssetExitScaleMv,
										rotate: heroAssetExitRotateMv,
										opacity: heroAssetExitOpacityMv,
										zIndex: heroAssetZIndex,
										transform: 'translate(-50%, -50%)',
									}}
								>
									{skipAssetEnter ? (
										<img
											src={heroAssetSrc}
											alt={heroAssetAlt || DEFAULT_HERO_ASSET_ALT}
											className="block h-auto max-w-none select-none"
											draggable={false}
											style={{ width: `${heroAssetWidthPx}px` }}
										/>
									) : (
										<motion.img
											key={assetEnterMotionKey}
											src={heroAssetSrc}
											alt={heroAssetAlt || DEFAULT_HERO_ASSET_ALT}
											className="block h-auto max-w-none select-none"
											draggable={false}
											style={{ width: `${heroAssetWidthPx}px` }}
											initial={assetEnterMotion.initial}
											animate={assetEnterMotion.animate}
											transition={assetEnterTransition}
										/>
									)}
								</motion.div>
							) : null}
							{heroAsset2Enabled && heroAsset2Src ? (
								<motion.div
									className="pointer-events-none absolute left-1/2 top-1/2"
									style={{
										x: heroAsset2OffsetXPx,
										y: heroAsset2ExitYMv,
										scale: heroAsset2ExitScaleMv,
										rotate: heroAsset2ExitRotateMv,
										opacity: heroAsset2ExitOpacityMv,
										zIndex: heroAsset2ZIndex,
										transform: 'translate(-50%, -50%)',
									}}
								>
									{skipAsset2Enter ? (
										<img
											src={heroAsset2Src}
											alt={heroAsset2Alt || DEFAULT_HERO_ASSET_ALT}
											className="block h-auto max-w-none select-none"
											draggable={false}
											style={{ width: `${heroAsset2WidthPx}px` }}
										/>
									) : (
										<motion.img
											key={asset2EnterMotionKey}
											src={heroAsset2Src}
											alt={heroAsset2Alt || DEFAULT_HERO_ASSET_ALT}
											className="block h-auto max-w-none select-none"
											draggable={false}
											style={{ width: `${heroAsset2WidthPx}px` }}
											initial={asset2EnterMotion.initial}
											animate={asset2EnterMotion.animate}
											transition={asset2EnterTransition}
										/>
									)}
								</motion.div>
							) : null}
							<motion.div
								className="relative"
								style={{ ...introHeroAnchorStyle, opacity: heroScrollFadeOpacityMv, zIndex: heroTextZIndex }}
							>
								{heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle) ? (
									skipHeroEnter ? (
										<div
											className={cn('hero-creative-glass-plate-wrap', heroAlignClassName)}
											style={heroGlassPlateWrapStyle}
										>
											<h1 className="w-full font-bold leading-tight" style={introHeadingStyle}>
												{heroHeadingText}
											</h1>
										</div>
									) : (
										<motion.div
											key={heroEnterMotionKey}
											className={cn('hero-creative-glass-plate-wrap', heroAlignClassName)}
											style={heroGlassPlateWrapStyle}
											initial={heroEnterMotion.initial}
											animate={heroEnterMotion.animate}
											transition={heroEnterTransition}
										>
											<h1 className="w-full font-bold leading-tight" style={introHeadingStyle}>
												{heroHeadingText}
											</h1>
										</motion.div>
									)
								) : skipHeroEnter ? (
									<h1
										className={cn(
											'font-bold leading-tight',
											heroCreativeStyleClassName(heroCreativeStyle),
											heroAlignClassName,
										)}
										style={introHeadingStyle}
										data-text={
											heroCreativeStyle === 'chromatic-split' ||
											heroCreativeStyle === 'back-halo'
												? heroHeadingText
												: undefined
										}
									>
										{heroHeadingText}
									</h1>
								) : (
									<motion.h1
										key={heroEnterMotionKey}
										className={cn(
											'font-bold leading-tight',
											heroCreativeStyleClassName(heroCreativeStyle),
											heroAlignClassName,
										)}
										style={introHeadingStyle}
										data-text={
											heroCreativeStyle === 'chromatic-split' ||
											heroCreativeStyle === 'back-halo'
												? heroHeadingText
												: undefined
										}
										initial={heroEnterMotion.initial}
										animate={heroEnterMotion.animate}
										transition={heroEnterTransition}
									>
										{heroHeadingText}
									</motion.h1>
								)}
							</motion.div>
						</div>
						<ZoomParallax
							images={images}
							containerRef={previewScrollRef as React.RefObject<HTMLElement | null>}
							scrollLengthMultiplier={scrollLengthMultiplier}
							collagePauseVh={collagePauseVh}
							dynamicImageMode={dynamicImageMode}
							centerImageStaticInDynamicMode={centerImageStaticInDynamicMode}
							dynamicImageSwitchEveryVh={dynamicImageSwitchEveryVh}
							embeddedPreviewMode
							viewportHeightPx={previewViewportHeight}
							embeddedSceneScale={embeddedSceneScale}
							imageBorderRadiusPx={imageBorderRadiusPx}
							omitStageBackground={!stageUsesCustomBackground}
							backgroundClassName={backgroundConfig.className}
							backgroundStyle={backgroundConfig.style}
							backgroundLayer={backgroundConfig.layer}
							stageEdgeFade={parallaxEdgeFade}
							stageEdgeFadeSizePercent={parallaxEdgeFadeSizePercent}
							stageEdgeFadeZIndex={parallaxEdgeFadeZIndex}
						/>
					</main>
				</div>
				
				<div className="absolute bottom-5 left-5 z-[1000] rounded-md border border-white/10 bg-black/50 px-4 py-2 text-xs backdrop-blur-md">
					Scroll inside preview
				</div>
				<button
					type="button"
					onClick={() => setIsFullscreen((current) => !current)}
					className="absolute right-5 bottom-5 z-[1000] rounded-md border border-white/15 bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-opacity hover:opacity-90"
				>
					{isFullscreen ? 'Exit Fullscreen (Esc)' : 'Go Fullscreen'}
				</button>
			</div>

			{/* Integration Panel */}
			<div ref={editorPanelScrollRef} className="min-w-0 min-h-0 overflow-y-auto pr-1">
				<div className="flex flex-col gap-5 pb-6">
				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Setup Commands</h3>
					<div className="rounded-md bg-black p-3 font-mono text-xs leading-relaxed text-zinc-400">
						npm install framer-motion lenis
					</div>
				</div>
				
				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Dependencies</h3>
					<div className="flex flex-wrap gap-2">
						{['framer-motion', 'lenis', 'lucide-react'].map((dep) => (
							<span key={dep} className="rounded border border-border bg-[#18181b] px-2 py-1 text-[11px] text-muted-foreground">
								{dep}
							</span>
						))}
					</div>
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Background Layout</h3>
					<label className="mb-1 block text-xs text-muted-foreground">Apply to</label>
					<select
						value={backgroundScope}
						onChange={(event) => onBackgroundScopeChange(event.target.value as BackgroundScope)}
						className="mb-2 w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
					>
						<option value="parallax-only">Parallax only (hero default glow)</option>
						<option value="hero-only">Hero only (parallax default stage)</option>
						<option value="split">Hero + parallax (same preset each)</option>
						<option value="independent">Hero + parallax (independent presets)</option>
						<option value="continuous">One continuous backdrop</option>
					</select>
					<p className="text-xs text-muted-foreground">
						Use `independent` when you want hero and parallax backgrounds edited separately. `continuous` still paints one shared full-scroll layer.
					</p>
					{(backgroundScope === 'hero-only' || backgroundScope === 'independent') ? (
						<label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
							<input
								type="checkbox"
								checked={linkHeroParallaxBackgrounds}
								onChange={(event) => onLinkHeroParallaxBackgroundsChange(event.target.checked)}
								className="h-4 w-4 rounded border-border bg-black/40 accent-primary"
							/>
							<span>Link hero + parallax backgrounds</span>
						</label>
					) : null}
				</div>

				<AccordionCard title="Background colors" id="backgroundColors" isOpen={openCards.backgroundColors} onToggle={toggleCard}>
					<div className="flex flex-col gap-4">
						<BackgroundEditor
							title={backgroundScope === 'continuous' ? 'Unified Background' : 'Parallax Background'}
							variant={backgroundVariant}
							onVariantChange={onBackgroundVariantChange}
							colors={backgroundColors}
							onColorsChange={onBackgroundColorsChange}
						/>
						{(backgroundScope === 'hero-only' || backgroundScope === 'independent') ? (
							<BackgroundEditor
								title="Hero Background"
								variant={linkHeroParallaxBackgrounds ? backgroundVariant : heroBackgroundVariant}
								onVariantChange={onHeroBackgroundVariantChange}
								colors={linkHeroParallaxBackgrounds ? backgroundColors : heroBackgroundColors}
								onColorsChange={onHeroBackgroundColorsChange}
							/>
						) : null}
						<p className="text-xs text-muted-foreground">
							Presets keep your edited colors. Export uses the values shown here.
						</p>
					</div>
				</AccordionCard>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-primary">Sequence Length</h3>
						<span className="font-mono text-xs text-muted-foreground">
							{scrollLengthMultiplier.toFixed(2)}x
						</span>
					</div>
					<input
						type="range"
						min={1.5}
						max={3.5}
						step={0.01}
						value={scrollLengthMultiplier}
						onChange={(event) => onScrollLengthMultiplierChange(Number(event.target.value))}
						className="w-full accent-primary"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Lower ends the full parallax sequence sooner. Higher extends it.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-primary">Pause after collage</h3>
						<span className="font-mono text-xs text-muted-foreground">
							{Math.round(collagePauseVh)}vh
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={120}
						step={5}
						value={collagePauseVh}
						onChange={(event) => onCollagePauseVhChange(Number(event.target.value))}
						className="w-full accent-primary"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Extra scroll right when this block fills the viewport: the collage stays in its starting layout, then the spread runs, then the hero-lock zoom.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-primary">Intro Height</h3>
						<span className="font-mono text-xs text-muted-foreground">
							{Math.round(introHeightVh)}vh
						</span>
					</div>
					<input
						type="range"
						min={20}
						max={120}
						step={1}
						value={introHeightVh}
						onChange={(event) => onIntroHeightVhChange(Number(event.target.value))}
						className="w-full accent-primary"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Larger values delay where parallax starts.
					</p>
				</div>

				<AccordionCard title="Hero Text Styling" id="heroTextStyling" isOpen={openCards.heroTextStyling} onToggle={toggleCard}>

					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Creative style</label>
						<select
							value={heroCreativeStyle}
							onChange={(event) =>
								onHeroCreativeStyleChange(event.target.value as HeroCreativeStyle)
							}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
						>
							{HERO_CREATIVE_STYLE_OPTIONS.map((opt) => (
								<option key={opt.id} value={opt.id} title={opt.hint}>
									{opt.label}
								</option>
							))}
						</select>
						<p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
							Presets use the color picker as accent, stroke, or gradient anchor where noted. Non-default
							presets need the <span className="font-mono">.hero-creative-*</span> rules from{' '}
							<span className="font-mono">src/index.css</span> in your app.
						</p>
					</div>
					{heroStyleShowsEffectIntensity(heroCreativeStyle) ||
					heroStyleShowsEffectSpeed(heroCreativeStyle) ||
					heroStyleShowsSunsetMeshOptions(heroCreativeStyle) ? (
						<div className="mb-3 flex flex-col gap-3 rounded-lg border border-border/80 bg-black/25 px-3 py-3">
							<p className="text-[11px] font-medium text-muted-foreground">
								Options for{' '}
								<span className="text-foreground">
									{HERO_CREATIVE_STYLE_OPTIONS.find((o) => o.id === heroCreativeStyle)?.label ??
										'this preset'}
								</span>
							</p>
							{heroStyleShowsSunsetMeshOptions(heroCreativeStyle) ? (
								<div>
									<label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
										<input
											type="checkbox"
											checked={heroSunsetMeshUseBackground}
											onChange={(event) =>
												onHeroSunsetMeshUseBackgroundChange(event.target.checked)
											}
											className="h-3.5 w-3.5 rounded border-border accent-primary"
										/>
										Match Background sunset colors
									</label>
									<p className="mt-1.5 pl-6 text-[11px] leading-snug text-muted-foreground">
										When on, the mesh uses Top / Mid / Bottom from{' '}
										<span className="font-mono">Background colors</span> (sunset gradient). When off,
										the built-in warm palette is used.
									</p>
								</div>
							) : null}
							{heroStyleShowsEffectIntensity(heroCreativeStyle) ? (
								<div>
									<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
										<span>Effect intensity</span>
										<span className="font-mono">{heroEffectIntensity.toFixed(2)}×</span>
									</div>
									<input
										type="range"
										min={0.6}
										max={2}
										step={0.05}
										value={heroEffectIntensity}
										onChange={(event) => onHeroEffectIntensityChange(Number(event.target.value))}
										className="w-full accent-primary"
									/>
								</div>
							) : null}
							{heroStyleShowsEffectSpeed(heroCreativeStyle) ? (
								<div>
									<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
										<span>Animation speed</span>
										<span className="font-mono">{heroEffectSpeedSeconds.toFixed(1)}s</span>
									</div>
									<input
										type="range"
										min={4}
										max={24}
										step={0.5}
										value={heroEffectSpeedSeconds}
										onChange={(event) =>
											onHeroEffectSpeedSecondsChange(Number(event.target.value))
										}
										className="w-full accent-primary"
									/>
									<p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
										Lower is faster. Respects reduced-motion (animation off).
									</p>
								</div>
							) : null}
						</div>
					) : null}

					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Font Family</label>
						<select
							value={heroFontFamily}
							onChange={(event) => onHeroFontFamilyChange(event.target.value)}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
						>
							<option value="inherit">Default (Current)</option>
							<option value="'Geist Variable', sans-serif">Geist</option>
							<option value="system-ui, sans-serif">System Sans</option>
							<option value="Georgia, serif">Serif</option>
							<option value="'Courier New', monospace">Monospace</option>
						</select>
					</div>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Heading Text</label>
						<input
							type="text"
							value={heroHeadingText}
							onChange={(event) => onHeroHeadingTextChange(event.target.value)}
							placeholder="Type your hero headline"
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Font Size</span>
							<span className="font-mono">{Math.round(heroFontSizePx)}px</span>
						</div>
						<input
							type="range"
							min={18}
							max={96}
							step={1}
							value={heroFontSizePx}
							onChange={(event) => onHeroFontSizePxChange(Number(event.target.value))}
							className="w-full accent-primary"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Text Color</span>
							<span className="font-mono uppercase">{heroTextColor}</span>
						</div>
						<input
							type="color"
							value={heroTextColor}
							onChange={(event) => onHeroTextColorChange(event.target.value)}
							className="h-10 w-full rounded border border-border bg-transparent"
						/>
					</div>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Text Align</label>
						<select
							value={heroTextAlign}
							onChange={(event) => onHeroTextAlignChange(event.target.value as HeroTextAlign)}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
						>
							<option value="left">Left</option>
							<option value="center">Center</option>
							<option value="right">Right</option>
						</select>
					</div>

					<div className="rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Entrance animation</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Preset</label>
							<select
								value={heroTextEnterPreset}
								onChange={(event) =>
									onHeroTextEnterPresetChange(event.target.value as HeroTextEnterPreset)
								}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
							>
								{HERO_TEXT_ENTER_PRESETS.map((opt) => (
									<option key={opt.id} value={opt.id} title={opt.hint}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Easing</label>
							<select
								value={heroTextEnterEase}
								onChange={(event) =>
									onHeroTextEnterEaseChange(event.target.value as HeroTextEnterEase)
								}
								disabled={heroTextEnterPreset === 'none'}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_TEXT_ENTER_EASE_OPTIONS.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Duration</span>
								<span className="font-mono">{heroTextEnterDurationSec.toFixed(2)}s</span>
							</div>
							<input
								type="range"
								min={0.2}
								max={2.5}
								step={0.05}
								value={heroTextEnterDurationSec}
								disabled={heroTextEnterPreset === 'none'}
								onChange={(event) => onHeroTextEnterDurationSecChange(Number(event.target.value))}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
							<p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
								Uses Framer Motion on load. Disabled when preset is None or when the OS requests reduced
								motion.
							</p>
						</div>
					</div>

					<div className="rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Fade on scroll</p>
						<label className="mb-3 flex cursor-pointer items-center gap-2 text-xs text-foreground">
							<input
								type="checkbox"
								checked={heroScrollFadeEnabled}
								onChange={(event) => onHeroScrollFadeEnabledChange(event.target.checked)}
								className="h-3.5 w-3.5 rounded border-border accent-primary"
							/>
							Fade headline while scrolling through intro
						</label>
						<p className="mb-3 text-[11px] leading-snug text-muted-foreground">
							Opacity tracks scroll through the intro height (0% = intro top aligned with preview top, 100%
							= intro bottom aligned). Uses the same scroll container as the parallax preview.
						</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Curve (along scroll)</label>
							<select
								value={heroScrollFadeCurve}
								onChange={(event) =>
									onHeroScrollFadeCurveChange(event.target.value as HeroScrollFadeCurve)
								}
								disabled={!heroScrollFadeEnabled}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_SCROLL_FADE_CURVES.map((c) => (
									<option key={c.id} value={c.id}>
										{c.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Fade starts at</span>
								<span className="font-mono">{(heroScrollFadeStart * 100).toFixed(0)}%</span>
							</div>
							<input
								type="range"
								min={0}
								max={0.92}
								step={0.02}
								value={heroScrollFadeStart}
								disabled={!heroScrollFadeEnabled}
								onChange={(event) => {
									const v = Number(event.target.value);
									onHeroScrollFadeStartChange(Math.min(v, heroScrollFadeEnd - 0.04));
								}}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Fully gone at</span>
								<span className="font-mono">{(heroScrollFadeEnd * 100).toFixed(0)}%</span>
							</div>
							<input
								type="range"
								min={0.08}
								max={1}
								step={0.02}
								value={heroScrollFadeEnd}
								disabled={!heroScrollFadeEnabled}
								onChange={(event) => {
									const v = Number(event.target.value);
									onHeroScrollFadeEndChange(Math.max(v, heroScrollFadeStart + 0.04));
								}}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
						</div>
					</div>

				</AccordionCard>

				<AccordionCard title="Hero Text Position" id="heroTextPosition" isOpen={openCards.heroTextPosition} onToggle={toggleCard}>

					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Horizontal Offset</span>
							<span className="font-mono">{Math.round(heroOffsetXPx)}px</span>
						</div>
						<input
							type="range"
							min={-240}
							max={240}
							step={1}
							value={heroOffsetXPx}
							onChange={(event) => onHeroOffsetXPxChange(Number(event.target.value))}
							className="w-full accent-primary"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Vertical Offset</span>
							<span className="font-mono">{Math.round(heroOffsetYPx)}px</span>
						</div>
						<input
							type="range"
							min={-200}
							max={200}
							step={1}
							value={heroOffsetYPx}
							onChange={(event) => onHeroOffsetYPxChange(Number(event.target.value))}
							className="w-full accent-primary"
						/>
					</div>
					<div>
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Max Width</span>
							<span className="font-mono">{Math.round(heroMaxWidthPercent)}%</span>
						</div>
						<input
							type="range"
							min={35}
							max={100}
							step={1}
							value={heroMaxWidthPercent}
							onChange={(event) => onHeroMaxWidthPercentChange(Number(event.target.value))}
							className="w-full accent-primary"
						/>
					</div>
					<div className="mt-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Text Layer (z-index)</span>
							<span className="font-mono">{heroTextZIndex}</span>
						</div>
						<input
							type="range"
							min={0}
							max={50}
							step={1}
							value={heroTextZIndex}
							onChange={(event) => onHeroTextZIndexChange(Number(event.target.value))}
							className="w-full accent-primary"
						/>
					</div>

				</AccordionCard>

				<AccordionCard title="Edge Fades" id="edgeFade" isOpen={openCards.edgeFade} onToggle={toggleCard}>
					<div className="rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Intro section</p>
						<div className="grid grid-cols-2 gap-2">
							{(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
								<label key={edge} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
									<input
										type="checkbox"
										checked={introEdgeFade[edge]}
										onChange={(event) =>
											onIntroEdgeFadeChange({ ...introEdgeFade, [edge]: event.target.checked })
										}
										className="h-3.5 w-3.5 rounded border-border accent-primary"
									/>
									Fade {edge}
								</label>
							))}
						</div>
						<div className="mt-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Intro fade size</span>
								<span className="font-mono">{Math.round(introEdgeFadeSizePercent)}%</span>
							</div>
							<input
								type="range"
								min={4}
								max={40}
								step={1}
								value={introEdgeFadeSizePercent}
								onChange={(event) => onIntroEdgeFadeSizePercentChange(Number(event.target.value))}
								className="w-full accent-primary"
							/>
						</div>
						<div className="mt-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Intro fade z-index</span>
								<span className="font-mono">{introEdgeFadeZIndex}</span>
							</div>
							<input
								type="range"
								min={0}
								max={50}
								step={1}
								value={introEdgeFadeZIndex}
								onChange={(event) => onIntroEdgeFadeZIndexChange(Number(event.target.value))}
								className="w-full accent-primary"
							/>
						</div>
					</div>
					<div className="mt-3 rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Parallax stage</p>
						<div className="grid grid-cols-2 gap-2">
							{(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
								<label key={edge} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
									<input
										type="checkbox"
										checked={parallaxEdgeFade[edge]}
										onChange={(event) =>
											onParallaxEdgeFadeChange({
												...parallaxEdgeFade,
												[edge]: event.target.checked,
											})
										}
										className="h-3.5 w-3.5 rounded border-border accent-primary"
									/>
									Fade {edge}
								</label>
							))}
						</div>
						<div className="mt-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Parallax fade size</span>
								<span className="font-mono">{Math.round(parallaxEdgeFadeSizePercent)}%</span>
							</div>
							<input
								type="range"
								min={4}
								max={40}
								step={1}
								value={parallaxEdgeFadeSizePercent}
								onChange={(event) =>
									onParallaxEdgeFadeSizePercentChange(Number(event.target.value))
								}
								className="w-full accent-primary"
							/>
						</div>
						<div className="mt-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Parallax fade z-index</span>
								<span className="font-mono">{parallaxEdgeFadeZIndex}</span>
							</div>
							<input
								type="range"
								min={0}
								max={50}
								step={1}
								value={parallaxEdgeFadeZIndex}
								onChange={(event) => onParallaxEdgeFadeZIndexChange(Number(event.target.value))}
								className="w-full accent-primary"
							/>
						</div>
					</div>
					<p className="mt-2 text-[11px] leading-snug text-muted-foreground">
						Each edge uses a soft mask fade. Intro and parallax can be configured independently.
					</p>
				</AccordionCard>

				<AccordionCard title="Hero Asset" id="heroAsset" isOpen={openCards.heroAsset} onToggle={toggleCard}>
					<label className="mb-3 flex cursor-pointer items-center gap-2 text-xs text-foreground">
						<input
							type="checkbox"
							checked={heroAssetEnabled}
							onChange={(event) => onHeroAssetEnabledChange(event.target.checked)}
							className="h-3.5 w-3.5 rounded border-border accent-primary"
						/>
						Show hero asset
					</label>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Asset URL</label>
						<input
							type="text"
							value={heroAssetSrc}
							onChange={(event) => onHeroAssetSrcChange(event.target.value)}
							placeholder="https://.../logo.png"
							disabled={!heroAssetEnabled}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-xs text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
						/>
						<div className="mt-2 flex items-center gap-2">
							<button
								type="button"
								onClick={() => heroAssetFileInputRef.current?.click()}
								disabled={!heroAssetEnabled}
								className="rounded-md border border-border bg-black/30 px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-45"
							>
								Upload asset
							</button>
							<input
								ref={heroAssetFileInputRef}
								type="file"
								accept="image/*"
								onChange={(event) => handleHeroAssetFileChange(event.target.files?.[0] ?? null)}
								className="hidden"
							/>
							<span className="text-[10px] text-muted-foreground">PNG, JPG, WebP, SVG, etc.</span>
						</div>
					</div>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Asset Alt Text</label>
						<input
							type="text"
							value={heroAssetAlt}
							onChange={(event) => onHeroAssetAltChange(event.target.value)}
							placeholder="Hero asset"
							disabled={!heroAssetEnabled}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-xs text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Width</span>
							<span className="font-mono">{Math.round(heroAssetWidthPx)}px</span>
						</div>
						<input
							type="range"
							min={60}
							max={820}
							step={1}
							value={heroAssetWidthPx}
							disabled={!heroAssetEnabled}
							onChange={(event) => onHeroAssetWidthPxChange(Number(event.target.value))}
							className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Scale</span>
							<span className="font-mono">{heroAssetScale.toFixed(2)}x</span>
						</div>
						<input
							type="range"
							min={0.2}
							max={8}
							step={0.01}
							value={heroAssetScale}
							disabled={!heroAssetEnabled}
							onChange={(event) => onHeroAssetScaleChange(Number(event.target.value))}
							className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Horizontal Offset</span>
							<span className="font-mono">{Math.round(heroAssetOffsetXPx)}px</span>
						</div>
						<input
							type="range"
							min={-320}
							max={320}
							step={1}
							value={heroAssetOffsetXPx}
							disabled={!heroAssetEnabled}
							onChange={(event) => onHeroAssetOffsetXPxChange(Number(event.target.value))}
							className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Vertical Offset</span>
							<span className="font-mono">{Math.round(heroAssetOffsetYPx)}px</span>
						</div>
						<input
							type="range"
							min={-320}
							max={320}
							step={1}
							value={heroAssetOffsetYPx}
							disabled={!heroAssetEnabled}
							onChange={(event) => onHeroAssetOffsetYPxChange(Number(event.target.value))}
							className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Asset Layer (z-index)</span>
							<span className="font-mono">{heroAssetZIndex}</span>
						</div>
						<input
							type="range"
							min={0}
							max={50}
							step={1}
							value={heroAssetZIndex}
							disabled={!heroAssetEnabled}
							onChange={(event) => onHeroAssetZIndexChange(Number(event.target.value))}
							className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Entry animation</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Preset</label>
							<select
								value={heroAssetEnterPreset}
								onChange={(event) =>
									onHeroAssetEnterPresetChange(event.target.value as HeroAssetEnterPreset)
								}
								disabled={!heroAssetEnabled}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_ASSET_ENTER_PRESETS.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Easing</label>
							<select
								value={heroAssetEnterEase}
								onChange={(event) =>
									onHeroAssetEnterEaseChange(event.target.value as HeroTextEnterEase)
								}
								disabled={!heroAssetEnabled || heroAssetEnterPreset === 'none'}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_TEXT_ENTER_EASE_OPTIONS.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Duration</span>
								<span className="font-mono">{heroAssetEnterDurationSec.toFixed(2)}s</span>
							</div>
							<input
								type="range"
								min={0.2}
								max={2.5}
								step={0.05}
								value={heroAssetEnterDurationSec}
								disabled={!heroAssetEnabled || heroAssetEnterPreset === 'none'}
								onChange={(event) => onHeroAssetEnterDurationSecChange(Number(event.target.value))}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
						</div>
					</div>
					<div className="mt-3 rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Exit animation</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Preset</label>
							<select
								value={heroAssetExitPreset}
								onChange={(event) =>
									onHeroAssetExitPresetChange(event.target.value as HeroAssetExitPreset)
								}
								disabled={!heroAssetEnabled}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_ASSET_EXIT_PRESETS.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Easing</label>
							<select
								value={heroAssetExitEase}
								onChange={(event) =>
									onHeroAssetExitEaseChange(event.target.value as HeroTextEnterEase)
								}
								disabled={!heroAssetEnabled || heroAssetExitPreset === 'none'}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
							>
								{HERO_TEXT_ENTER_EASE_OPTIONS.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Exit starts at</span>
								<span className="font-mono">{(heroAssetExitStart * 100).toFixed(0)}%</span>
							</div>
							<input
								type="range"
								min={0}
								max={0.92}
								step={0.02}
								value={heroAssetExitStart}
								disabled={!heroAssetEnabled || heroAssetExitPreset === 'none'}
								onChange={(event) => {
									const v = Number(event.target.value);
									onHeroAssetExitStartChange(Math.min(v, heroAssetExitEnd - 0.04));
								}}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Fully exited at</span>
								<span className="font-mono">{(heroAssetExitEnd * 100).toFixed(0)}%</span>
							</div>
							<input
								type="range"
								min={0.08}
								max={1}
								step={0.02}
								value={heroAssetExitEnd}
								disabled={!heroAssetEnabled || heroAssetExitPreset === 'none'}
								onChange={(event) => {
									const v = Number(event.target.value);
									onHeroAssetExitEndChange(Math.max(v, heroAssetExitStart + 0.04));
								}}
								className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45"
							/>
						</div>
					</div>
				</AccordionCard>

				<AccordionCard title="Hero Asset 2" id="heroAsset2" isOpen={!!openCards.heroAsset2} onToggle={toggleCard}>
					<label className="mb-3 flex cursor-pointer items-center gap-2 text-xs text-foreground">
						<input
							type="checkbox"
							checked={heroAsset2Enabled}
							onChange={(event) => onHeroAsset2EnabledChange(event.target.checked)}
							className="h-3.5 w-3.5 rounded border-border accent-primary"
						/>
						Show second hero asset
					</label>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Asset URL</label>
						<input
							type="text"
							value={heroAsset2Src}
							onChange={(event) => onHeroAsset2SrcChange(event.target.value)}
							placeholder="https://.../logo.png"
							disabled={!heroAsset2Enabled}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-xs text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
						/>
						<div className="mt-2 flex items-center gap-2">
							<button
								type="button"
								onClick={() => heroAsset2FileInputRef.current?.click()}
								disabled={!heroAsset2Enabled}
								className="rounded-md border border-border bg-black/30 px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-45"
							>
								Upload asset
							</button>
							<input
								ref={heroAsset2FileInputRef}
								type="file"
								accept="image/*"
								onChange={(event) => handleHeroAsset2FileChange(event.target.files?.[0] ?? null)}
								className="hidden"
							/>
							<span className="text-[10px] text-muted-foreground">PNG, JPG, WebP, SVG, etc.</span>
						</div>
					</div>
					<div className="mb-3">
						<label className="mb-1 block text-xs text-muted-foreground">Asset Alt Text</label>
						<input
							type="text"
							value={heroAsset2Alt}
							onChange={(event) => onHeroAsset2AltChange(event.target.value)}
							placeholder="Hero asset"
							disabled={!heroAsset2Enabled}
							className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-xs text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
						/>
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Width</span>
							<span className="font-mono">{Math.round(heroAsset2WidthPx)}px</span>
						</div>
						<input type="range" min={60} max={820} step={1} value={heroAsset2WidthPx} disabled={!heroAsset2Enabled} onChange={(event) => onHeroAsset2WidthPxChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Scale</span>
							<span className="font-mono">{heroAsset2Scale.toFixed(2)}x</span>
						</div>
						<input type="range" min={0.2} max={8} step={0.01} value={heroAsset2Scale} disabled={!heroAsset2Enabled} onChange={(event) => onHeroAsset2ScaleChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
					</div>
					<div className="mb-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Horizontal Offset</span>
							<span className="font-mono">{Math.round(heroAsset2OffsetXPx)}px</span>
						</div>
						<input type="range" min={-320} max={320} step={1} value={heroAsset2OffsetXPx} disabled={!heroAsset2Enabled} onChange={(event) => onHeroAsset2OffsetXPxChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
					</div>
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Vertical Offset</span>
							<span className="font-mono">{Math.round(heroAsset2OffsetYPx)}px</span>
						</div>
						<input type="range" min={-320} max={320} step={1} value={heroAsset2OffsetYPx} disabled={!heroAsset2Enabled} onChange={(event) => onHeroAsset2OffsetYPxChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
					</div>
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Asset Layer (z-index)</span>
							<span className="font-mono">{heroAsset2ZIndex}</span>
						</div>
						<input type="range" min={0} max={50} step={1} value={heroAsset2ZIndex} disabled={!heroAsset2Enabled} onChange={(event) => onHeroAsset2ZIndexChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
					</div>
					<div className="rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Entry animation</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Preset</label>
							<select value={heroAsset2EnterPreset} onChange={(event) => onHeroAsset2EnterPresetChange(event.target.value as HeroAssetEnterPreset)} disabled={!heroAsset2Enabled} className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45">
								{HERO_ASSET_ENTER_PRESETS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
							</select>
						</div>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Easing</label>
							<select value={heroAsset2EnterEase} onChange={(event) => onHeroAsset2EnterEaseChange(event.target.value as HeroTextEnterEase)} disabled={!heroAsset2Enabled || heroAsset2EnterPreset === 'none'} className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45">
								{HERO_TEXT_ENTER_EASE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
							</select>
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Duration</span>
								<span className="font-mono">{heroAsset2EnterDurationSec.toFixed(2)}s</span>
							</div>
							<input type="range" min={0.2} max={2.5} step={0.05} value={heroAsset2EnterDurationSec} disabled={!heroAsset2Enabled || heroAsset2EnterPreset === 'none'} onChange={(event) => onHeroAsset2EnterDurationSecChange(Number(event.target.value))} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
						</div>
					</div>
					<div className="mt-3 rounded-lg border border-border/80 bg-black/20 px-3 py-3">
						<p className="mb-2 text-[11px] font-medium text-muted-foreground">Exit animation</p>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Preset</label>
							<select value={heroAsset2ExitPreset} onChange={(event) => onHeroAsset2ExitPresetChange(event.target.value as HeroAssetExitPreset)} disabled={!heroAsset2Enabled} className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45">
								{HERO_ASSET_EXIT_PRESETS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
							</select>
						</div>
						<div className="mb-3">
							<label className="mb-1 block text-xs text-muted-foreground">Easing</label>
							<select value={heroAsset2ExitEase} onChange={(event) => onHeroAsset2ExitEaseChange(event.target.value as HeroTextEnterEase)} disabled={!heroAsset2Enabled || heroAsset2ExitPreset === 'none'} className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45">
								{HERO_TEXT_ENTER_EASE_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
							</select>
						</div>
						<div className="mb-3">
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Exit starts at</span>
								<span className="font-mono">{(heroAsset2ExitStart * 100).toFixed(0)}%</span>
							</div>
							<input type="range" min={0} max={0.92} step={0.02} value={heroAsset2ExitStart} disabled={!heroAsset2Enabled || heroAsset2ExitPreset === 'none'} onChange={(event) => { const v = Number(event.target.value); onHeroAsset2ExitStartChange(Math.min(v, heroAsset2ExitEnd - 0.04)); }} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
						</div>
						<div>
							<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
								<span>Fully exited at</span>
								<span className="font-mono">{(heroAsset2ExitEnd * 100).toFixed(0)}%</span>
							</div>
							<input type="range" min={0.08} max={1} step={0.02} value={heroAsset2ExitEnd} disabled={!heroAsset2Enabled || heroAsset2ExitPreset === 'none'} onChange={(event) => { const v = Number(event.target.value); onHeroAsset2ExitEndChange(Math.max(v, heroAsset2ExitStart + 0.04)); }} className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-45" />
						</div>
					</div>
				</AccordionCard>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-primary">Image Border Radius</h3>
						<span className="font-mono text-xs text-muted-foreground">
							{Math.round(imageBorderRadiusPx)}px
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={48}
						step={1}
						value={imageBorderRadiusPx}
						onChange={(event) => onImageBorderRadiusPxChange(Number(event.target.value))}
						className="w-full accent-primary"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Set to 0 for square corners, raise for softer cards.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-primary">Dynamic Image Mode</h3>
						<span className="font-mono text-xs text-muted-foreground">
							{dynamicImageMode ? 'ON' : 'OFF'}
						</span>
					</div>
					<button
						type="button"
						onClick={() => onDynamicImageModeChange(!dynamicImageMode)}
						className={cn(
							'inline-flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs transition',
							dynamicImageMode
								? 'border-primary/70 bg-primary/10 text-primary'
								: 'border-border bg-black/40 text-muted-foreground',
						)}
					>
						<span>Random per-tile swaps during collage</span>
						<span>{dynamicImageMode ? 'Disable' : 'Enable'}</span>
					</button>
					<p className="mt-2 text-xs text-muted-foreground">
						When enabled, tiles swap independently using each image&apos;s variant list and settle back to
						primary images near hero lock.
					</p>
					<div className="mt-2">
						<button
							type="button"
							onClick={() =>
								onCenterImageStaticInDynamicModeChange(!centerImageStaticInDynamicMode)
							}
							className={cn(
								'inline-flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs transition',
								centerImageStaticInDynamicMode
									? 'border-primary/70 bg-primary/10 text-primary'
									: 'border-border bg-black/40 text-muted-foreground',
							)}
						>
							<span>Keep center image fixed</span>
							<span>{centerImageStaticInDynamicMode ? 'ON' : 'OFF'}</span>
						</button>
					</div>
					<p className="mt-2 text-[10px] leading-snug text-muted-foreground">
						Swaps are now driven by scroll progression (deterministic alternation), not timers.
					</p>
					<div className="mt-3 border-t border-border pt-3">
						<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
							<span>Switch every</span>
							<span className="font-mono">{Math.round(dynamicImageSwitchEveryVh)}vh</span>
						</div>
						<input
							type="range"
							min={4}
							max={120}
							step={1}
							value={dynamicImageSwitchEveryVh}
							onChange={(event) =>
								onDynamicImageSwitchEveryVhChange(Number(event.target.value))
							}
							className="w-full accent-primary"
						/>
						<p className="mt-1 text-[10px] leading-snug text-muted-foreground">
							Higher values = fewer swaps per scroll (calmer). Lower values = faster alternation.
						</p>
					</div>
				</div>

				<AccordionCard title="Image Sources" id="imageSources" isOpen={openCards.imageSources} onToggle={toggleCard}>

					{onResetImagesToDefaults ? (
						<div className="mb-3">
							<button
								type="button"
								onClick={onResetImagesToDefaults}
								className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-left text-[11px] font-medium text-foreground transition hover:bg-black/55"
							>
								Reset to bundled defaults
							</button>
							<p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
								Use if previews look wrong: restores defaults from the app bundle (CSN image URLs). In DevTools → Network, filter by Img and look for 403 or (failed).
							</p>
						</div>
					) : null}

					<div className="flex flex-col gap-3">
						{images.map((image, index) => (
							<div key={`image-source-${index}`} className="rounded-md border border-border bg-black/20 p-3">
								<div className="mb-2 text-xs font-semibold text-foreground">Image {index + 1}</div>
								<label className="mb-1 block text-[11px] text-muted-foreground">URL</label>
								<input
									type="text"
									value={image.src}
									onChange={(event) => updateImageAt(index, { src: event.target.value })}
									placeholder="https://example.com/image.jpg"
									className="mb-2 w-full rounded border border-border bg-black/40 px-2 py-1.5 text-xs outline-none ring-primary/50 transition focus:ring-2"
								/>
								<label className="mb-1 block text-[11px] text-muted-foreground">Alt text</label>
								<input
									type="text"
									value={image.alt ?? ''}
									onChange={(event) => updateImageAt(index, { alt: event.target.value })}
									placeholder={`Image ${index + 1}`}
									className="mb-2 w-full rounded border border-border bg-black/40 px-2 py-1.5 text-xs outline-none ring-primary/50 transition focus:ring-2"
								/>
								<label className="mb-1 block text-[11px] text-muted-foreground">Local file</label>
								<input
									type="file"
									accept="image/*"
									onChange={(event) => handleImageFileChange(index, event.target.files?.[0] ?? null)}
									className="w-full text-[11px] text-muted-foreground file:mr-2 file:rounded file:border file:border-border file:bg-black/40 file:px-2 file:py-1 file:text-[11px] file:text-foreground"
								/>
							</div>
						))}
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						Local files use browser object URLs in preview. For export, use hosted URLs.
					</p>

				</AccordionCard>

				<div className="rounded-xl border border-border bg-transparent p-5">
					<h3 className="mb-3 text-sm font-semibold text-foreground">Integration Steps</h3>
					<ul className="flex flex-col gap-2 text-xs text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							Initialize shadcn in project root
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							Verify /components/ui folder exists
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							Configure Tailwind colors
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							Wrap layout with Lenis provider
						</li>
					</ul>
				</div>
				</div>
			</div>
		</div>
	);
}
