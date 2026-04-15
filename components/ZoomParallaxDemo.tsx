'use client';
import React from 'react';
import Lenis from '@studio-freight/lenis'
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { cn } from '@/lib/utils';
import {
	BLOB_LAYER_OPACITY,
	DEFAULT_BACKGROUND_COLORS,
	resolveParallaxBackground,
	resetColorsForVariant,
	type BackgroundColors,
	type BackgroundVariant,
} from '@/lib/background-presets';

export type { BackgroundColors, BackgroundVariant } from '@/lib/background-presets';

export type HeroTextAlign = 'left' | 'center' | 'right';
export interface DemoImage {
	src: string;
	alt?: string;
}

function hexInputValue(hex: string): string {
	if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
	if (/^#[0-9A-Fa-f]{3}$/.test(hex)) return hex;
	return '#000000';
}

interface ZoomParallaxDemoProps {
	scrollLengthMultiplier: number;
	onScrollLengthMultiplierChange: (value: number) => void;
	introHeightVh: number;
	onIntroHeightVhChange: (value: number) => void;
	heroFontFamily: string;
	onHeroFontFamilyChange: (value: string) => void;
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
	images: DemoImage[];
	onImagesChange: (value: DemoImage[]) => void;
	imageBorderRadiusPx: number;
	onImageBorderRadiusPxChange: (value: number) => void;
	backgroundVariant: BackgroundVariant;
	onBackgroundVariantChange: (value: BackgroundVariant) => void;
	backgroundColors: BackgroundColors;
	onBackgroundColorsChange: (value: BackgroundColors) => void;
}

export default function ZoomParallaxDemo({
	scrollLengthMultiplier,
	onScrollLengthMultiplierChange,
	introHeightVh,
	onIntroHeightVhChange,
	heroFontFamily,
	onHeroFontFamilyChange,
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
	images,
	onImagesChange,
	imageBorderRadiusPx,
	onImageBorderRadiusPxChange,
	backgroundVariant,
	onBackgroundVariantChange,
	backgroundColors,
	onBackgroundColorsChange,
}: ZoomParallaxDemoProps) {
	const previewScrollRef = React.useRef<HTMLDivElement>(null);
	const lenisRef = React.useRef<Lenis | null>(null);
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const [previewViewportHeight, setPreviewViewportHeight] = React.useState(0);
	const [previewViewportWidth, setPreviewViewportWidth] = React.useState(0);

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
		isFullscreen || !previewViewportWidth || !previewViewportHeight
			? 1
			: Math.min(
					1,
					previewViewportWidth / window.innerWidth,
					previewViewportHeight / window.innerHeight,
				);
	const introHeightStyle = isFullscreen
		? { height: `${introHeightVh}vh` }
		: { height: `${(introHeightVh / 100) * Math.max(1, previewViewportHeight)}px` };
	const introHeadingStyle: React.CSSProperties = {
		fontFamily: heroFontFamily || undefined,
		fontSize: `${heroFontSizePx}px`,
		color: heroTextColor,
		textAlign: heroTextAlign,
		maxWidth: `${heroMaxWidthPercent}%`,
	};
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

	const backgroundConfig = React.useMemo(() => {
		const resolved = resolveParallaxBackground(backgroundVariant, backgroundColors);
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
	}, [backgroundVariant, backgroundColors]);

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
					<main className="min-h-screen w-full bg-black text-white">
						<div className="relative overflow-hidden" style={introHeightStyle}>
							<div
								aria-hidden="true"
								className={cn(
									'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
									'bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]',
									'blur-[30px]',
								)}
							/>
							<div className="relative z-10" style={introHeroAnchorStyle}>
								<h1
									className={cn(
										'font-bold leading-tight',
										heroTextAlign === 'left' ? 'ml-0 mr-auto' : '',
										heroTextAlign === 'center' ? 'mx-auto' : '',
										heroTextAlign === 'right' ? 'ml-auto mr-0' : '',
									)}
									style={introHeadingStyle}
								>
									Scroll Down for Zoom Parallax
								</h1>
							</div>
						</div>
						<ZoomParallax
							images={images}
							containerRef={previewScrollRef as React.RefObject<HTMLElement | null>}
							scrollLengthMultiplier={scrollLengthMultiplier}
							embeddedPreviewMode={!isFullscreen}
							viewportHeightPx={previewViewportHeight}
							embeddedSceneScale={embeddedSceneScale}
							imageBorderRadiusPx={imageBorderRadiusPx}
							backgroundClassName={backgroundConfig.className}
							backgroundStyle={backgroundConfig.style}
							backgroundLayer={backgroundConfig.layer}
						/>
					</main>
				</div>
				
				<div className="absolute bottom-5 left-5 z-20 rounded-md border border-white/10 bg-black/50 px-4 py-2 text-xs backdrop-blur-md">
					Scroll inside preview
				</div>
				<button
					type="button"
					onClick={() => setIsFullscreen((current) => !current)}
					className="absolute right-5 bottom-5 z-20 rounded-md border border-white/15 bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-opacity hover:opacity-90"
				>
					{isFullscreen ? 'Exit Fullscreen (Esc)' : 'Go Fullscreen'}
				</button>
			</div>

			{/* Integration Panel */}
			<div className="min-w-0 min-h-0 overflow-y-auto pr-1">
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

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Hero Text Styling</h3>
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
					<div>
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
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Hero Text Position</h3>
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
				</div>

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
					<h3 className="mb-3 text-sm font-semibold text-primary">Background Variant</h3>
					<select
						value={backgroundVariant}
						onChange={(event) => onBackgroundVariantChange(event.target.value as BackgroundVariant)}
						className="w-full rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2"
					>
						<option value="solid-dark">Solid / Dark</option>
						<option value="solid-indigo">Solid / Indigo</option>
						<option value="gradient-sunset">Gradient / Sunset</option>
						<option value="gradient-ocean">Gradient / Ocean</option>
						<option value="image-forest">Image / Forest + Overlay</option>
						<option value="blob-animated">Animated / Blobs</option>
					</select>
									<p className="mt-2 text-xs text-muted-foreground">
						Copied bundle includes this exact background configuration.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<h3 className="mb-3 text-sm font-semibold text-primary">Image Sources</h3>
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
				</div>

				<div className="rounded-xl border border-border bg-white/[0.03] p-5">
					<div className="mb-3 flex items-center justify-between gap-2">
						<h3 className="text-sm font-semibold text-primary">Background colors</h3>
						<button
							type="button"
							onClick={() =>
								onBackgroundColorsChange({
									...backgroundColors,
									...resetColorsForVariant(backgroundVariant, DEFAULT_BACKGROUND_COLORS),
								})
							}
							className="shrink-0 rounded-md border border-border bg-black/40 px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
						>
							Reset this preset
						</button>
					</div>
					<p className="mb-3 text-xs text-muted-foreground">
						Presets stay the same until you change colors. Export copies your current values.
					</p>

					{backgroundVariant === 'solid-dark' && (
						<div className="flex items-center gap-2">
							<label className="w-20 shrink-0 text-xs text-muted-foreground">Fill</label>
							<input
								type="color"
								value={hexInputValue(backgroundColors.solidDark)}
								onChange={(e) =>
									onBackgroundColorsChange({ ...backgroundColors, solidDark: e.target.value })
								}
								className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
							/>
							<input
								type="text"
								value={backgroundColors.solidDark}
								onChange={(e) =>
									onBackgroundColorsChange({ ...backgroundColors, solidDark: e.target.value })
								}
								className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
							/>
						</div>
					)}

					{backgroundVariant === 'solid-indigo' && (
						<div className="flex items-center gap-2">
							<label className="w-20 shrink-0 text-xs text-muted-foreground">Fill</label>
							<input
								type="color"
								value={hexInputValue(backgroundColors.solidIndigo)}
								onChange={(e) =>
									onBackgroundColorsChange({ ...backgroundColors, solidIndigo: e.target.value })
								}
								className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
							/>
							<input
								type="text"
								value={backgroundColors.solidIndigo}
								onChange={(e) =>
									onBackgroundColorsChange({ ...backgroundColors, solidIndigo: e.target.value })
								}
								className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
							/>
						</div>
					)}

					{backgroundVariant === 'gradient-sunset' && (
						<div className="flex flex-col gap-2">
							{(['Top', 'Mid', 'Bottom'] as const).map((label, i) => (
								<div key={label} className="flex items-center gap-2">
									<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
									<input
										type="color"
										value={hexInputValue(backgroundColors.sunset[i])}
										onChange={(e) => {
											const next = [...backgroundColors.sunset] as [string, string, string];
											next[i] = e.target.value;
											onBackgroundColorsChange({ ...backgroundColors, sunset: next });
										}}
										className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
									/>
									<input
										type="text"
										value={backgroundColors.sunset[i]}
										onChange={(e) => {
											const next = [...backgroundColors.sunset] as [string, string, string];
											next[i] = e.target.value;
											onBackgroundColorsChange({ ...backgroundColors, sunset: next });
										}}
										className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
									/>
								</div>
							))}
						</div>
					)}

					{backgroundVariant === 'gradient-ocean' && (
						<div className="flex flex-col gap-2">
							{(['Start', 'Mid', 'End'] as const).map((label, i) => (
								<div key={label} className="flex items-center gap-2">
									<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
									<input
										type="color"
										value={hexInputValue(backgroundColors.ocean[i])}
										onChange={(e) => {
											const next = [...backgroundColors.ocean] as [string, string, string];
											next[i] = e.target.value;
											onBackgroundColorsChange({ ...backgroundColors, ocean: next });
										}}
										className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
									/>
									<input
										type="text"
										value={backgroundColors.ocean[i]}
										onChange={(e) => {
											const next = [...backgroundColors.ocean] as [string, string, string];
											next[i] = e.target.value;
											onBackgroundColorsChange({ ...backgroundColors, ocean: next });
										}}
										className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
									/>
								</div>
							))}
						</div>
					)}

					{backgroundVariant === 'image-forest' && (
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2">
								<label className="w-20 shrink-0 text-xs text-muted-foreground">Tint</label>
								<input
									type="color"
									value={hexInputValue(backgroundColors.forestTint)}
									onChange={(e) =>
										onBackgroundColorsChange({ ...backgroundColors, forestTint: e.target.value })
									}
									className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
								/>
								<input
									type="text"
									value={backgroundColors.forestTint}
									onChange={(e) =>
										onBackgroundColorsChange({ ...backgroundColors, forestTint: e.target.value })
									}
									className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
								/>
							</div>
							<div>
								<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
									<span>Overlay strength</span>
									<span className="font-mono">{Math.round(backgroundColors.forestTintAlpha)}%</span>
								</div>
								<input
									type="range"
									min={0}
									max={100}
									step={1}
									value={backgroundColors.forestTintAlpha}
									onChange={(e) =>
										onBackgroundColorsChange({
											...backgroundColors,
											forestTintAlpha: Number(e.target.value),
										})
									}
									className="w-full accent-primary"
								/>
							</div>
						</div>
					)}

					{backgroundVariant === 'blob-animated' && (
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<label className="w-20 shrink-0 text-xs text-muted-foreground">Base</label>
								<input
									type="color"
									value={hexInputValue(backgroundColors.blobBase)}
									onChange={(e) =>
										onBackgroundColorsChange({ ...backgroundColors, blobBase: e.target.value })
									}
									className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
								/>
								<input
									type="text"
									value={backgroundColors.blobBase}
									onChange={(e) =>
										onBackgroundColorsChange({ ...backgroundColors, blobBase: e.target.value })
									}
									className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
								/>
							</div>
							{(['Blob 1', 'Blob 2', 'Blob 3'] as const).map((label, i) => {
								const key = ['blob1', 'blob2', 'blob3'][i] as 'blob1' | 'blob2' | 'blob3';
								const val = backgroundColors[key];
								return (
									<div key={label} className="flex items-center gap-2">
										<label className="w-20 shrink-0 text-xs text-muted-foreground">{label}</label>
										<input
											type="color"
											value={hexInputValue(val)}
											onChange={(e) =>
												onBackgroundColorsChange({ ...backgroundColors, [key]: e.target.value })
											}
											className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
										/>
										<input
											type="text"
											value={val}
											onChange={(e) =>
												onBackgroundColorsChange({ ...backgroundColors, [key]: e.target.value })
											}
											className="min-w-0 flex-1 rounded border border-border bg-black/40 px-2 py-1.5 font-mono text-xs"
										/>
									</div>
								);
							})}
							<p className="text-[11px] text-muted-foreground">
								Layer opacity matches the original preset (35% / 30% / 20%).
							</p>
						</div>
					)}
				</div>

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
