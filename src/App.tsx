/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ZoomParallaxDemo, { type DemoImage, type HeroTextAlign } from '@/components/ZoomParallaxDemo';
import {
  DEFAULT_BACKGROUND_COLORS,
  serializeBackgroundForExport,
  type BackgroundColors,
  type BackgroundVariant,
} from '@/lib/background-presets';
import { Layout, Folder, File, ChevronDown, ChevronRight, Square, Box } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const SETTINGS_STORAGE_KEY = 'zoom-parallax-demo-settings-v2';

interface PersistedSettings {
  scrollLengthMultiplier?: number;
  introHeightVh?: number;
  heroFontFamily?: string;
  heroFontSizePx?: number;
  heroTextColor?: string;
  heroTextAlign?: HeroTextAlign;
  heroOffsetXPx?: number;
  heroOffsetYPx?: number;
  heroMaxWidthPercent?: number;
  imageBorderRadiusPx?: number;
  backgroundVariant?: BackgroundVariant;
  backgroundColors?: BackgroundColors;
  images?: DemoImage[];
}

function mergeBackgroundColors(raw: unknown): BackgroundColors {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_BACKGROUND_COLORS };
  const p = raw as Partial<BackgroundColors>;
  const sunset =
    Array.isArray(p.sunset) && p.sunset.length === 3
      ? ([p.sunset[0], p.sunset[1], p.sunset[2]] as [string, string, string])
      : DEFAULT_BACKGROUND_COLORS.sunset;
  const ocean =
    Array.isArray(p.ocean) && p.ocean.length === 3
      ? ([p.ocean[0], p.ocean[1], p.ocean[2]] as [string, string, string])
      : DEFAULT_BACKGROUND_COLORS.ocean;
  return {
    ...DEFAULT_BACKGROUND_COLORS,
    ...p,
    sunset,
    ocean,
    forestTintAlpha:
      typeof p.forestTintAlpha === 'number'
        ? Math.min(100, Math.max(0, p.forestTintAlpha))
        : DEFAULT_BACKGROUND_COLORS.forestTintAlpha,
  };
}

const DEFAULT_IMAGES: DemoImage[] = [
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

export default function App() {
  const [scrollLengthMultiplier, setScrollLengthMultiplier] = useState(3);
  const [introHeightVh, setIntroHeightVh] = useState(50);
  const [heroFontFamily, setHeroFontFamily] = useState('inherit');
  const [heroFontSizePx, setHeroFontSizePx] = useState(48);
  const [heroTextColor, setHeroTextColor] = useState('#ffffff');
  const [heroTextAlign, setHeroTextAlign] = useState<HeroTextAlign>('center');
  const [heroOffsetXPx, setHeroOffsetXPx] = useState(0);
  const [heroOffsetYPx, setHeroOffsetYPx] = useState(0);
  const [heroMaxWidthPercent, setHeroMaxWidthPercent] = useState(100);
  const [imageBorderRadiusPx, setImageBorderRadiusPx] = useState(8);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>('solid-dark');
  const [backgroundColors, setBackgroundColors] = useState<BackgroundColors>(() => ({
    ...DEFAULT_BACKGROUND_COLORS,
  }));
  const [images, setImages] = useState<DemoImage[]>(() => [...DEFAULT_IMAGES]);
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);

  useEffect(() => {
    try {
      const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!rawSettings) return;
      const parsed = JSON.parse(rawSettings) as PersistedSettings;

      if (typeof parsed.scrollLengthMultiplier === 'number') {
        setScrollLengthMultiplier(parsed.scrollLengthMultiplier);
      }
      if (typeof parsed.introHeightVh === 'number') {
        setIntroHeightVh(parsed.introHeightVh);
      }
      if (typeof parsed.heroFontFamily === 'string') {
        setHeroFontFamily(parsed.heroFontFamily);
      }
      if (typeof parsed.heroFontSizePx === 'number') {
        setHeroFontSizePx(parsed.heroFontSizePx);
      }
      if (typeof parsed.heroTextColor === 'string') {
        setHeroTextColor(parsed.heroTextColor);
      }
      if (
        parsed.heroTextAlign &&
        ['left', 'center', 'right'].includes(parsed.heroTextAlign)
      ) {
        setHeroTextAlign(parsed.heroTextAlign);
      }
      if (typeof parsed.heroOffsetXPx === 'number') {
        setHeroOffsetXPx(parsed.heroOffsetXPx);
      }
      if (typeof parsed.heroOffsetYPx === 'number') {
        setHeroOffsetYPx(parsed.heroOffsetYPx);
      }
      if (typeof parsed.heroMaxWidthPercent === 'number') {
        setHeroMaxWidthPercent(parsed.heroMaxWidthPercent);
      }
      if (typeof parsed.imageBorderRadiusPx === 'number') {
        setImageBorderRadiusPx(parsed.imageBorderRadiusPx);
      }
      if (
        parsed.backgroundVariant &&
        ['solid-dark', 'solid-indigo', 'gradient-sunset', 'gradient-ocean', 'image-forest', 'blob-animated'].includes(parsed.backgroundVariant)
      ) {
        setBackgroundVariant(parsed.backgroundVariant);
      }
      if (parsed.backgroundColors) {
        setBackgroundColors(mergeBackgroundColors(parsed.backgroundColors));
      }
      if (Array.isArray(parsed.images)) {
        const cleaned = parsed.images
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const src = typeof (item as DemoImage).src === 'string' ? (item as DemoImage).src : '';
            const alt = typeof (item as DemoImage).alt === 'string' ? (item as DemoImage).alt : '';
            return src ? { src, alt } : null;
          })
          .filter((item): item is { src: string; alt: string } => item !== null)
          .slice(0, 7);
        if (cleaned.length > 0) {
          setImages(cleaned.length === 7 ? cleaned : [...cleaned, ...DEFAULT_IMAGES.slice(cleaned.length)]);
        }
      }
    } catch {
      // Ignore invalid localStorage payloads and continue with defaults.
    } finally {
      setHasHydratedSettings(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedSettings) return;
    const settingsToPersist: PersistedSettings = {
      scrollLengthMultiplier,
      introHeightVh,
      heroFontFamily,
      heroFontSizePx,
      heroTextColor,
      heroTextAlign,
      heroOffsetXPx,
      heroOffsetYPx,
      heroMaxWidthPercent,
      imageBorderRadiusPx,
      backgroundVariant,
      backgroundColors,
      images,
    };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToPersist));
  }, [
    hasHydratedSettings,
    scrollLengthMultiplier,
    introHeightVh,
    heroFontFamily,
    heroFontSizePx,
    heroTextColor,
    heroTextAlign,
    heroOffsetXPx,
    heroOffsetYPx,
    heroMaxWidthPercent,
    imageBorderRadiusPx,
    backgroundVariant,
    backgroundColors,
    images,
  ]);

  const handleSaveAndRefresh = () => {
    const settingsToPersist: PersistedSettings = {
      scrollLengthMultiplier,
      introHeightVh,
      heroFontFamily,
      heroFontSizePx,
      heroTextColor,
      heroTextAlign,
      heroOffsetXPx,
      heroOffsetYPx,
      heroMaxWidthPercent,
      imageBorderRadiusPx,
      backgroundVariant,
      backgroundColors,
      images,
    };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToPersist));
    window.location.reload();
  };

  const handleCopy = async () => {
    const calibratedScrollLength = Number(scrollLengthMultiplier.toFixed(2));
    const calibratedIntroHeight = Math.round(introHeightVh);
    const calibratedHeroFontSize = Math.round(heroFontSizePx);
    const calibratedHeroOffsetX = Math.round(heroOffsetXPx);
    const calibratedHeroOffsetY = Math.round(heroOffsetYPx);
    const calibratedHeroMaxWidth = Math.round(heroMaxWidthPercent);
    const calibratedImageRadius = Math.round(imageBorderRadiusPx);
    const backgroundSnippet = serializeBackgroundForExport(backgroundVariant, backgroundColors);
    const exportImages = images.map((img, index) => ({
      src: img.src,
      alt: img.alt || `Parallax image ${index + 1}`,
    }));
    const integrationBundle = `# Zoom Parallax Integration Bundle

## 1) Install dependencies
npm install framer-motion @studio-freight/lenis

## 2) Create file: components/ui/zoom-parallax.tsx
\`\`\`tsx
'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  images: Image[];
  containerRef?: RefObject<HTMLElement | null>;
  scrollLengthMultiplier?: number;
  imageBorderRadiusPx?: number;
  backgroundClassName?: string;
  backgroundStyle?: CSSProperties;
  backgroundLayer?: ReactNode;
}

export function ZoomParallax({
  images,
  containerRef,
  scrollLengthMultiplier = ${calibratedScrollLength},
  imageBorderRadiusPx = ${calibratedImageRadius},
  backgroundClassName,
  backgroundStyle,
  backgroundLayer,
}: ZoomParallaxProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
    container: containerRef,
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
  const safeScrollLengthMultiplier = Math.max(1, scrollLengthMultiplier);
  const safeImageBorderRadiusPx = Math.max(0, imageBorderRadiusPx);

  return (
    <div
      ref={container}
      className="relative w-full"
      style={{ height: \`\${safeScrollLengthMultiplier * 100}vh\` }}
    >
      <div
        className={\`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden \${backgroundClassName ?? ''}\`}
        style={backgroundStyle}
      >
        {backgroundLayer ? (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {backgroundLayer}
          </div>
        ) : null}
        {images.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];
          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={\`absolute flex h-full w-full items-center justify-center \${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} \${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} \${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} \${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} \${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} \${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''}\`}
            >
              <div
                className="relative h-[25vh] w-[25vw] overflow-hidden shadow-2xl"
                style={{ borderRadius: \`\${safeImageBorderRadiusPx}px\` }}
              >
                <img src={src} alt={alt ?? \`Parallax image \${index + 1}\`} className="h-full w-full object-cover" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
\`\`\`

## 3) Usage example
\`\`\`tsx
import { useRef } from 'react';
import { ZoomParallax } from '@/components/ui/zoom-parallax';

export default function Page() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const backgroundClassName = ${backgroundSnippet.classNameLiteral};
  const backgroundStyle: import('react').CSSProperties | undefined = ${backgroundSnippet.styleLiteral};
  const backgroundLayer = ${backgroundSnippet.layerLiteral};
  const heroTextStyle = {
    fontFamily: ${JSON.stringify(heroFontFamily)},
    fontSize: '${calibratedHeroFontSize}px',
    color: ${JSON.stringify(heroTextColor)},
    textAlign: ${JSON.stringify(heroTextAlign)} as const,
    maxWidth: '${calibratedHeroMaxWidth}%',
  };
  const heroTextContainerStyle = {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    transform: 'translate(calc(-50% + ${calibratedHeroOffsetX}px), calc(-50% + ${calibratedHeroOffsetY}px))',
  };
  const images = ${JSON.stringify(exportImages, null, 2)};

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto">
      <div className="relative overflow-hidden" style={{ height: '${calibratedIntroHeight}vh' }}>
        <div className="relative z-10" style={heroTextContainerStyle}>
          <h1
            className="mx-auto font-bold leading-tight"
            style={heroTextStyle}
          >
            Scroll Down for Zoom Parallax
          </h1>
        </div>
      </div>
      <ZoomParallax
        images={images}
        containerRef={scrollRef}
        scrollLengthMultiplier={${calibratedScrollLength}}
        imageBorderRadiusPx={${calibratedImageRadius}}
        backgroundClassName={backgroundClassName}
        backgroundStyle={backgroundStyle}
        backgroundLayer={backgroundLayer}
      />
    </div>
  );
}
\`\`\`
`;

    try {
      await navigator.clipboard.writeText(integrationBundle);
      toast.success('Integration bundle copied!', {
        description: 'Paste into your project docs or files to reuse.',
      });
    } catch {
      toast.error('Clipboard copy failed', {
        description: 'Your browser blocked clipboard access. Try again.',
      });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground antialiased">
      <Toaster position="top-right" theme="dark" />
      {/* Sidebar */}
      <aside className="flex w-[260px] flex-col border-r border-border bg-sidebar p-6">
        <div className="mb-8 flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <Square className="h-5 w-5" />
          SHADCN PROJECT
        </div>
        
        <div className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          <div className="flex items-center gap-2 py-1.5">
            <ChevronDown className="h-3.5 w-3.5" />
            <Folder className="h-3.5 w-3.5" />
            app
          </div>
          <div className="ml-4 flex flex-col gap-1 border-l border-border/50 pl-4">
            <div className="flex items-center gap-2 py-1.5">
              <ChevronDown className="h-3.5 w-3.5" />
              <Folder className="h-3.5 w-3.5" />
              components
            </div>
            <div className="ml-4 flex flex-col gap-1 border-l border-border/50 pl-4">
              <div className="flex items-center gap-2 py-1.5">
                <ChevronDown className="h-3.5 w-3.5" />
                <Folder className="h-3.5 w-3.5" />
                ui
              </div>
              <div className="ml-4 flex items-center gap-2 rounded-md bg-white/5 py-1.5 pl-4 text-foreground">
                <File className="h-3.5 w-3.5 text-primary" />
                zoom-parallax.tsx
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            <Folder className="h-3.5 w-3.5" />
            lib
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            <Folder className="h-3.5 w-3.5" />
            styles
          </div>
          <div className="mt-2 flex items-center gap-2 py-1.5 pl-5.5">
            tailwind.config.ts
          </div>
          <div className="flex items-center gap-2 py-1.5 pl-5.5">
            package.json
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleSaveAndRefresh}
            className="mb-2 flex w-full cursor-pointer items-center justify-center rounded-lg border border-border bg-white/[0.04] py-3 text-[13px] font-medium text-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Save + Refresh
          </button>
          <button 
            onClick={handleCopy}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary py-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Copy to Project
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Atmosphere Glow */}
        <div className="pointer-events-none absolute -top-[200px] -right-[100px] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        
        <header className="z-10 flex h-16 items-center justify-between border-b border-border px-8">
          <div className="flex flex-col">
            <span className="text-base font-semibold">ZoomParallax / Demo</span>
            <span className="text-[11px] text-muted-foreground">src/components/ui/zoom-parallax.tsx</span>
          </div>
          <div className="rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-green-400">
            Live Environment
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ZoomParallaxDemo
            scrollLengthMultiplier={scrollLengthMultiplier}
            onScrollLengthMultiplierChange={setScrollLengthMultiplier}
            introHeightVh={introHeightVh}
            onIntroHeightVhChange={setIntroHeightVh}
            heroFontFamily={heroFontFamily}
            onHeroFontFamilyChange={setHeroFontFamily}
            heroFontSizePx={heroFontSizePx}
            onHeroFontSizePxChange={setHeroFontSizePx}
            heroTextColor={heroTextColor}
            onHeroTextColorChange={setHeroTextColor}
            heroTextAlign={heroTextAlign}
            onHeroTextAlignChange={setHeroTextAlign}
            heroOffsetXPx={heroOffsetXPx}
            onHeroOffsetXPxChange={setHeroOffsetXPx}
            heroOffsetYPx={heroOffsetYPx}
            onHeroOffsetYPxChange={setHeroOffsetYPx}
            heroMaxWidthPercent={heroMaxWidthPercent}
            onHeroMaxWidthPercentChange={setHeroMaxWidthPercent}
            imageBorderRadiusPx={imageBorderRadiusPx}
            onImageBorderRadiusPxChange={setImageBorderRadiusPx}
            backgroundVariant={backgroundVariant}
            onBackgroundVariantChange={setBackgroundVariant}
            backgroundColors={backgroundColors}
            onBackgroundColorsChange={setBackgroundColors}
            images={images}
            onImagesChange={setImages}
          />
        </div>
      </main>
    </div>
  );
}
