'use client';
import React from 'react';
import Lenis from '@studio-freight/lenis'
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { cn } from '@/lib/utils';

export type BackgroundVariant =
	| 'solid-dark'
	| 'solid-indigo'
	| 'gradient-sunset'
	| 'gradient-ocean'
	| 'image-forest'
	| 'blob-animated';

interface ZoomParallaxDemoProps {
	scrollLengthMultiplier: number;
	onScrollLengthMultiplierChange: (value: number) => void;
	introHeightVh: number;
	onIntroHeightVhChange: (value: number) => void;
	imageBorderRadiusPx: number;
	onImageBorderRadiusPxChange: (value: number) => void;
	backgroundVariant: BackgroundVariant;
	onBackgroundVariantChange: (value: BackgroundVariant) => void;
}

export default function ZoomParallaxDemo({
	scrollLengthMultiplier,
	onScrollLengthMultiplierChange,
	introHeightVh,
	onIntroHeightVhChange,
	imageBorderRadiusPx,
	onImageBorderRadiusPxChange,
	backgroundVariant,
	onBackgroundVariantChange,
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

	const backgroundConfig = React.useMemo(() => {
		switch (backgroundVariant) {
			case 'solid-indigo':
				return {
					className: 'bg-indigo-950',
					style: undefined,
					layer: null,
				};
			case 'gradient-sunset':
				return {
					className: 'bg-[radial-gradient(circle_at_top,#fb7185_0%,#7c3aed_45%,#020617_100%)]',
					style: undefined,
					layer: null,
				};
			case 'gradient-ocean':
				return {
					className: 'bg-[linear-gradient(135deg,#082f49_0%,#0f766e_40%,#164e63_100%)]',
					style: undefined,
					layer: null,
				};
			case 'image-forest':
				return {
					className: 'bg-cover bg-center',
					style: {
						backgroundImage:
							"url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop&auto=format&q=80')",
					} as React.CSSProperties,
					layer: (
						<div className="absolute inset-0 bg-black/35" />
					),
				};
			case 'blob-animated':
				return {
					className: 'bg-[#070b17]',
					style: undefined,
					layer: (
						<>
							<div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl animate-pulse" />
							<div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl animate-pulse [animation-delay:400ms]" />
							<div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse [animation-delay:800ms]" />
						</>
					),
				};
			case 'solid-dark':
			default:
				return {
					className: 'bg-black',
					style: undefined,
					layer: null,
				};
		}
	}, [backgroundVariant]);

	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsFullscreen(false);
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);


	const images = [
		{
			src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Modern architecture building',
		},
		{
			src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Urban cityscape at sunset',
		},
		{
			src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Abstract geometric pattern',
		},
		{
			src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Mountain landscape',
		},
		{
			src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Minimalist design elements',
		},
		{
			src: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Ocean waves and beach',
		},
		{
			src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Forest trees and sunlight',
		},
	];

	return (
		<div className="grid min-w-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
			{/* Parallax Canvas */}
			<div
				className={cn(
					'relative w-full max-w-full rounded-xl border border-border bg-black shadow-2xl transition-all lg:mx-auto',
					isFullscreen
						? 'fixed inset-5 z-50 aspect-auto rounded-2xl border-white/20'
						: 'aspect-video max-h-[calc(100vh-13rem)]',
				)}
			>
				<div ref={previewScrollRef} className={cn(
					'absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain',
					isFullscreen ? 'rounded-2xl' : 'rounded-xl',
				)}>
					<main className="min-h-screen w-full bg-black text-white">
						<div className="relative flex items-center justify-center px-6" style={introHeightStyle}>
							<div
								aria-hidden="true"
								className={cn(
									'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
									'bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]',
									'blur-[30px]',
								)}
							/>
							<h1 className="relative z-10 text-center text-2xl font-bold md:text-4xl">
								Scroll Down for Zoom Parallax
							</h1>
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
			<div className="min-w-0 flex flex-col gap-5">
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
	);
}
