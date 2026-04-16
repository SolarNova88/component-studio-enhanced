'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll, useTransform, motion } from 'framer-motion';
import { edgeFadeOverlayDefs, type EdgeFadeConfig } from '@/lib/edge-fade';

interface Image {
	src: string;
	alt?: string;
	variants?: string[];
}

function uniqueGlobalPool(imgs: Image[]): string[] {
	return [
		...new Set(imgs.flatMap((img) => [img.src, ...(img.variants ?? [])].filter(Boolean))),
	];
}

/** One distinct URL per collage slot (prefers each slot's primary). */
function buildUniqueDisplaySources(imgs: Image[]): string[] {
	if (imgs.length === 0) return [];
	const pool = uniqueGlobalPool(imgs);
	const result: string[] = [];
	const used = new Set<string>();
	for (let i = 0; i < imgs.length; i++) {
		let url = imgs[i]?.src?.trim() || '/placeholder.svg';
		if (used.has(url)) {
			const replacement = pool.find((u) => !used.has(u));
			if (replacement) url = replacement;
		}
		used.add(url);
		result.push(url);
	}
	return result;
}

function buildAlternatingSources(
	imgs: Image[],
	previous: string[],
	step: number,
	centerImageStaticInDynamicMode: boolean,
): string[] {
	const globalPool = uniqueGlobalPool(imgs);
	const used = new Set<string>();
	const next: string[] = [];

	for (let i = 0; i < imgs.length; i += 1) {
		const image = imgs[i];
		if (!image) {
			next.push('/placeholder.svg');
			continue;
		}

		const basePool = [...new Set([image.src, ...(image.variants ?? [])].filter(Boolean))];
		const current = previous[i] ?? image.src ?? '/placeholder.svg';
		let picked = '';
		// Deterministic stagger: not all tiles advance on the same step.
		const shouldAdvance = (step + i * 2) % 3 === 0;
		if (centerImageStaticInDynamicMode && i === 0) {
			picked = image.src || '/placeholder.svg';
		}

		if (!picked && shouldAdvance && basePool.length > 0) {
			const start = Math.abs(step * 5 + i * 7) % basePool.length;
			const ordered = [...basePool.slice(start), ...basePool.slice(0, start)];
			picked = ordered.find((src) => src !== current && !used.has(src)) ?? '';
		}

		if (!picked && current && !used.has(current)) {
			picked = current;
		}
		if (!picked) {
			picked = globalPool.find((src) => !used.has(src)) ?? image.src ?? '/placeholder.svg';
		}

		used.add(picked);
		next.push(picked);
	}

	return next;
}

function ZoomParallaxImage({
	src,
	alt,
	className,
}: {
	src: string;
	alt: string;
	className?: string;
}) {
	const [resolvedSrc, setResolvedSrc] = useState(src || '/placeholder.svg');

	useEffect(() => {
		setResolvedSrc(src || '/placeholder.svg');
	}, [src]);

	return (
		<img
			src={resolvedSrc}
			alt={alt}
			className={className}
			onError={() => {
				setResolvedSrc('/placeholder.svg');
			}}
		/>
	);
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
	/** Optional container ref for scroll tracking */
	containerRef?: React.RefObject<HTMLElement | null>;
	/** Total scroll distance for the parallax sequence (1 = 100vh) */
	scrollLengthMultiplier?: number;
	/** Use container-relative sizing for embedded previews */
	embeddedPreviewMode?: boolean;
	/** Embedded preview viewport height in pixels */
	viewportHeightPx?: number;
	/** Scale factor for rendering the full collage scene in mini preview */
	embeddedSceneScale?: number;
	/** Border radius for each image in pixels */
	imageBorderRadiusPx?: number;
	/** Sticky stage background class names */
	backgroundClassName?: string;
	/** Sticky stage background style */
	backgroundStyle?: React.CSSProperties;
	/** Optional background layer rendered behind the collage */
	backgroundLayer?: React.ReactNode;
	/** Scroll progress (0–1) when the collage spread finishes for all images */
	collageEndProgress?: number;
	/** Scroll progress (0–1) when the hero-lock phase finishes */
	lockEndProgress?: number;
	/** Additional scale boost for center image during hero-lock */
	heroFocusBoost?: number;
	/**
	 * Extra scroll in **vh** right as this block fills the viewport: motion stays at the
	 * initial collage (before the spread), then the spread runs, then the hero-lock zoom.
	 */
	collagePauseVh?: number;
	/** When true, sticky stage stays transparent (background lives on a parent for a continuous backdrop). */
	omitStageBackground?: boolean;
	/** Randomizes each tile from its variant pool at staggered intervals during collage phase. */
	dynamicImageMode?: boolean;
	/** If true, center tile remains the primary image while dynamic mode is active. */
	centerImageStaticInDynamicMode?: boolean;
	/** Scroll distance (in vh) per alternation step while dynamic mode is on. */
	dynamicImageSwitchEveryVh?: number;
	/** Independent edge fades for the sticky stage. */
	stageEdgeFade?: EdgeFadeConfig;
	stageEdgeFadeSizePercent?: number;
	stageEdgeFadeZIndex?: number;
}

export function ZoomParallax({
	images,
	containerRef,
	scrollLengthMultiplier = 3,
	embeddedPreviewMode = false,
	viewportHeightPx,
	embeddedSceneScale = 1,
	imageBorderRadiusPx = 8,
	backgroundClassName,
	backgroundStyle,
	backgroundLayer,
	collageEndProgress = 0.72,
	lockEndProgress = 0.9,
	heroFocusBoost = 0.06,
	collagePauseVh = 0,
	omitStageBackground = false,
	dynamicImageMode = false,
	centerImageStaticInDynamicMode = true,
	dynamicImageSwitchEveryVh = 18,
	stageEdgeFade,
	stageEdgeFadeSizePercent = 18,
	stageEdgeFadeZIndex = 30,
}: ZoomParallaxProps) {
	const container = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
		container: containerRef,
	});
	const safeCollageEnd = Math.min(0.95, Math.max(0.3, collageEndProgress));
	const safeLockEnd = Math.min(1, Math.max(safeCollageEnd + 0.02, lockEndProgress));
	const safeHeroFocusBoost = Math.max(0, heroFocusBoost);
	const pauseVh = Math.min(200, Math.max(0, collagePauseVh));
	const safeSwitchEveryVh = Math.min(120, Math.max(4, dynamicImageSwitchEveryVh));

	const safeScrollLengthMultiplier = Math.max(1, scrollLengthMultiplier);
	const embeddedViewport = Math.max(320, viewportHeightPx ?? 0);

	/** Fullscreen track height is M*100 vh; preview uses M * viewportHeight px */
	const trackVhNum = safeScrollLengthMultiplier * 100;
	const totalVhNum = trackVhNum + pauseVh;
	const trackPx = safeScrollLengthMultiplier * embeddedViewport;
	const pausePx = (pauseVh / 100) * embeddedViewport;
	const totalPx = trackPx + pausePx;

	/** End of entry pause (collage still at t=0) */
	const pPauseEnd = embeddedPreviewMode ? pausePx / totalPx : pauseVh / totalVhNum;
	/** Collage spread completes */
	const pCollageEnd = embeddedPreviewMode
		? (pausePx + safeCollageEnd * trackPx) / totalPx
		: (pauseVh + safeCollageEnd * trackVhNum) / totalVhNum;
	/** Hero lock completes */
	const pLockEnd = embeddedPreviewMode
		? (pausePx + safeLockEnd * trackPx) / totalPx
		: (pauseVh + safeLockEnd * trackVhNum) / totalVhNum;

	const collageProgress = useTransform(scrollYProgress, (p) => {
		if (p <= pPauseEnd) return 0;
		const span = pCollageEnd - pPauseEnd;
		if (span <= 1e-9) return 1;
		if (p >= pCollageEnd) return 1;
		return (p - pPauseEnd) / span;
	});
	const lockProgress = useTransform(scrollYProgress, (p) => {
		if (p <= pCollageEnd) return 0;
		const span = pLockEnd - pCollageEnd;
		if (span <= 1e-9) return 1;
		if (p >= pLockEnd) return 1;
		return (p - pCollageEnd) / span;
	});
	const lockProgressRef = useRef(0);
	const collageStepRef = useRef(-1);
	const [displaySources, setDisplaySources] = useState<string[]>(() =>
		buildUniqueDisplaySources(images),
	);
	useMotionValueEvent(lockProgress, 'change', (value) => {
		lockProgressRef.current = value;
	});

	useEffect(() => {
		setDisplaySources(buildUniqueDisplaySources(images));
		collageStepRef.current = -1;
	}, [images]);

	useEffect(() => {
		if (!dynamicImageMode) {
			setDisplaySources(buildUniqueDisplaySources(images));
			collageStepRef.current = -1;
		}
	}, [dynamicImageMode, images]);

	useMotionValueEvent(collageProgress, 'change', (value) => {
		if (!dynamicImageMode) return;

		// Keep the final zoom reveal deterministic.
		if (lockProgressRef.current >= 0.82) {
			if (collageStepRef.current !== -1) {
				setDisplaySources(buildUniqueDisplaySources(images));
				collageStepRef.current = -1;
			}
			return;
		}

		const collageSpanVh = Math.max(1, safeCollageEnd * trackVhNum);
		const stepCount = Math.max(1, Math.floor(collageSpanVh / safeSwitchEveryVh));
		const step = Math.floor(Math.max(0, Math.min(1, value)) * stepCount);
		if (step === collageStepRef.current) return;
		collageStepRef.current = step;
		setDisplaySources((prev) =>
			buildAlternatingSources(images, prev, step, centerImageStaticInDynamicMode),
		);
	});

	const scale4 = useTransform(collageProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(collageProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(collageProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(collageProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(collageProgress, [0, 1], [1, 9]);
	const centerLockBoost = useTransform(lockProgress, [0, 1], [1, 1 + safeHeroFocusBoost]);
	const centerScale = useTransform([scale4, centerLockBoost], (values) => {
		const baseScale = Number(values[0]);
		const boost = Number(values[1]);
		return baseScale * boost;
	});
	const peripheralOpacity = useTransform(lockProgress, [0, 0.6, 1], [1, 0.45, 0]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
	const containerStyle = embeddedPreviewMode
		? { height: `${totalPx}px` }
		: { height: `${totalVhNum}vh` };
	const stickyStyle = embeddedPreviewMode ? { height: `${embeddedViewport}px` } : undefined;
	const safeEmbeddedSceneScale = Math.min(1, Math.max(0.2, embeddedSceneScale));
	const safeImageBorderRadiusPx = Math.max(0, imageBorderRadiusPx);
	const stageEdgeFadeOverlays = edgeFadeOverlayDefs(
		stageEdgeFade ?? { top: false, right: false, bottom: false, left: false },
		stageEdgeFadeSizePercent,
	);
	const sceneStyle =
		embeddedPreviewMode
			? {
					position: 'absolute' as const,
					inset: 0,
					transform: `scale(${safeEmbeddedSceneScale})`,
					transformOrigin: 'center center',
				}
			: undefined;
	const stickyContainerStyle = omitStageBackground
		? { ...(stickyStyle ?? {}) }
		: { ...(stickyStyle ?? {}), ...(backgroundStyle ?? {}) };

	return (
		<div
			ref={container}
			className="relative w-full"
			style={containerStyle}
		>
			<div
				className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden ${
					omitStageBackground ? 'bg-transparent' : (backgroundClassName ?? '')
				}`}
				style={stickyContainerStyle}
			>
				{!omitStageBackground && backgroundLayer ? (
					<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
						{backgroundLayer}
					</div>
				) : null}
				{stageEdgeFadeOverlays.map((overlay) => (
					<div
						key={overlay.key}
						aria-hidden
						className="pointer-events-none absolute"
						style={{ ...overlay.style, zIndex: stageEdgeFadeZIndex }}
					/>
				))}
				<div className="relative z-10 h-full w-full" style={sceneStyle}>
					{images.map(({ src, alt }, index) => {
						const scale = scales[index % scales.length];
						const displaySrc = displaySources[index] ?? src;

						return (
							<motion.div
								key={index}
							style={
								index === 0
									? { scale: centerScale, opacity: 1, zIndex: 20 }
									: { scale, opacity: peripheralOpacity, zIndex: 10 }
							}
								className={`absolute flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
							>
								<div
									className="relative h-[25vh] w-[25vw] overflow-hidden shadow-2xl"
									style={{ borderRadius: `${safeImageBorderRadiusPx}px` }}
								>
									<ZoomParallaxImage
										src={displaySrc}
										alt={alt || `Parallax image ${index + 1}`}
										className="h-full w-full object-cover"
									/>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
