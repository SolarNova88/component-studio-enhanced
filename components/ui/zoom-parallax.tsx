'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

interface Image {
	src: string;
	alt?: string;
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
	/** Progress where collage phase ends and hero-lock begins */
	collageEndProgress?: number;
	/** Progress where hero-lock phase fully completes */
	lockEndProgress?: number;
	/** Additional scale boost for center image during hero-lock */
	heroFocusBoost?: number;
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
}: ZoomParallaxProps) {
	const container = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
		container: containerRef,
	});
	const safeCollageEndProgress = Math.min(0.95, Math.max(0.3, collageEndProgress));
	const safeLockEndProgress = Math.min(1, Math.max(safeCollageEndProgress + 0.02, lockEndProgress));
	const safeHeroFocusBoost = Math.max(0, heroFocusBoost);

	// Phase 1: full collage motion (0 -> collageEndProgress)
	const collageProgress = useTransform(
		scrollYProgress,
		[0, safeCollageEndProgress],
		[0, 1],
	);
	// Phase 2: lock transition (collageEndProgress -> lockEndProgress)
	const lockProgress = useTransform(
		scrollYProgress,
		[safeCollageEndProgress, safeLockEndProgress],
		[0, 1],
	);

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
	const safeScrollLengthMultiplier = Math.max(1, scrollLengthMultiplier);
	const embeddedViewport = Math.max(320, viewportHeightPx ?? 0);
	const containerStyle = embeddedPreviewMode
		? { height: `${safeScrollLengthMultiplier * embeddedViewport}px` }
		: { height: `${safeScrollLengthMultiplier * 100}vh` };
	const stickyStyle = embeddedPreviewMode ? { height: `${embeddedViewport}px` } : undefined;
	const safeEmbeddedSceneScale = Math.min(1, Math.max(0.2, embeddedSceneScale));
	const safeImageBorderRadiusPx = Math.max(0, imageBorderRadiusPx);
	const sceneStyle =
		embeddedPreviewMode
			? {
					position: 'absolute' as const,
					inset: 0,
					transform: `scale(${safeEmbeddedSceneScale})`,
					transformOrigin: 'center center',
				}
			: undefined;
	const stickyContainerStyle = {
		...(stickyStyle ?? {}),
		...(backgroundStyle ?? {}),
	};

	return (
		<div
			ref={container}
			className="relative w-full"
			style={containerStyle}
		>
			<div
				className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden ${backgroundClassName ?? ''}`}
				style={stickyContainerStyle}
			>
				{backgroundLayer ? (
					<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
						{backgroundLayer}
					</div>
				) : null}
				<div className="relative z-10 h-full w-full" style={sceneStyle}>
					{images.map(({ src, alt }, index) => {
						const scale = scales[index % scales.length];

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
									<img
										src={src || '/placeholder.svg'}
										alt={alt || `Parallax image ${index + 1}`}
										className="h-full w-full object-cover"
										referrerPolicy="no-referrer"
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
