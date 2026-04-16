/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ZoomParallaxDemo, { type DemoImage, type HeroTextAlign } from '@/components/ZoomParallaxDemo';
import {
  DEFAULT_HERO_CREATIVE_STYLE,
  heroCreativeStyleClassName,
  heroCreativeStyleUsesGlassPlateWrapper,
  heroHeadingUsesInlineTextColor,
  parseHeroCreativeStyle,
  type HeroCreativeStyle,
} from '@/lib/hero-style-presets';
import {
  DEFAULT_HERO_TEXT_ENTER_DURATION_SEC,
  DEFAULT_HERO_TEXT_ENTER_EASE,
  DEFAULT_HERO_TEXT_ENTER_PRESET,
  heroTextEnterExportMotionAttrs,
  parseHeroTextEnterEase,
  parseHeroTextEnterPreset,
  type HeroTextEnterEase,
  type HeroTextEnterPreset,
} from '@/lib/hero-text-enter-animation';
import {
  DEFAULT_HERO_SCROLL_FADE_CURVE,
  DEFAULT_HERO_SCROLL_FADE_ENABLED,
  DEFAULT_HERO_SCROLL_FADE_END,
  DEFAULT_HERO_SCROLL_FADE_START,
  parseHeroScrollFadeCurve,
  type HeroScrollFadeCurve,
} from '@/lib/hero-scroll-fade';
import {
  DEFAULT_HERO_ASSET_ALT,
  DEFAULT_HERO_ASSET_ENABLED,
  DEFAULT_HERO_ASSET_ENTER_DURATION_SEC,
  DEFAULT_HERO_ASSET_ENTER_EASE,
  DEFAULT_HERO_ASSET_ENTER_PRESET,
  DEFAULT_HERO_ASSET_EXIT_EASE,
  DEFAULT_HERO_ASSET_EXIT_END,
  DEFAULT_HERO_ASSET_EXIT_PRESET,
  DEFAULT_HERO_ASSET_EXIT_START,
  DEFAULT_HERO_ASSET_OFFSET_X_PX,
  DEFAULT_HERO_ASSET_OFFSET_Y_PX,
  DEFAULT_HERO_ASSET_SCALE,
  DEFAULT_HERO_ASSET_SRC,
  DEFAULT_HERO_ASSET_WIDTH_PX,
  heroAssetEnterMotionState,
  heroAssetExitStyle,
  parseHeroAssetEnterPreset,
  parseHeroAssetExitPreset,
  type HeroAssetEnterPreset,
  type HeroAssetExitPreset,
} from '@/lib/hero-asset-animation';
import {
  DEFAULT_BACKGROUND_COLORS,
  serializeBackgroundForExport,
  type BackgroundColors,
  type BackgroundScope,
  type BackgroundVariant,
} from '@/lib/background-presets';
import {
  DEFAULT_EDGE_FADE_CONFIG,
  edgeFadeOverlayDefs,
  mergeEdgeFadeConfig,
  type EdgeFadeConfig,
} from '@/lib/edge-fade';
import { Layout, Folder, File, ChevronDown, ChevronRight, Square, Box } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const SETTINGS_STORAGE_KEY = 'zoom-parallax-demo-settings-v2';

/** Increment when shipped defaults for intro/pause change; legacy saves migrate once on load. */
const LAYOUT_DEFAULTS_VERSION = 1;

interface PersistedSettings {
  scrollLengthMultiplier?: number;
  collagePauseVh?: number;
  /** @deprecated migrated once to collagePauseVh */
  collageHoldSpan?: number;
  introHeightVh?: number;
  /** Present on saves after layout default migration. */
  layoutDefaultsVersion?: number;
  heroFontFamily?: string;
  heroHeadingText?: string;
  heroFontSizePx?: number;
  heroTextColor?: string;
  heroTextAlign?: HeroTextAlign;
  heroOffsetXPx?: number;
  heroOffsetYPx?: number;
  heroMaxWidthPercent?: number;
  heroCreativeStyle?: HeroCreativeStyle;
  heroEffectIntensity?: number;
  heroEffectSpeedSeconds?: number;
  heroSunsetMeshUseBackground?: boolean;
  heroTextEnterPreset?: HeroTextEnterPreset;
  heroTextEnterEase?: HeroTextEnterEase;
  heroTextEnterDurationSec?: number;
  heroScrollFadeEnabled?: boolean;
  heroScrollFadeStart?: number;
  heroScrollFadeEnd?: number;
  heroScrollFadeCurve?: HeroScrollFadeCurve;
  heroTextZIndex?: number;
  introEdgeFade?: EdgeFadeConfig;
  introEdgeFadeSizePercent?: number;
  introEdgeFadeZIndex?: number;
  heroAssetEnabled?: boolean;
  heroAssetSrc?: string;
  heroAssetAlt?: string;
  heroAssetScale?: number;
  heroAssetWidthPx?: number;
  heroAssetOffsetXPx?: number;
  heroAssetOffsetYPx?: number;
  heroAssetZIndex?: number;
  parallaxEdgeFade?: EdgeFadeConfig;
  parallaxEdgeFadeSizePercent?: number;
  parallaxEdgeFadeZIndex?: number;
  heroAssetEnterPreset?: HeroAssetEnterPreset;
  heroAssetEnterEase?: HeroTextEnterEase;
  heroAssetEnterDurationSec?: number;
  heroAssetExitPreset?: HeroAssetExitPreset;
  heroAssetExitEase?: HeroTextEnterEase;
  heroAssetExitStart?: number;
  heroAssetExitEnd?: number;
  heroAsset2Enabled?: boolean;
  heroAsset2Src?: string;
  heroAsset2Alt?: string;
  heroAsset2Scale?: number;
  heroAsset2WidthPx?: number;
  heroAsset2OffsetXPx?: number;
  heroAsset2OffsetYPx?: number;
  heroAsset2ZIndex?: number;
  heroAsset2EnterPreset?: HeroAssetEnterPreset;
  heroAsset2EnterEase?: HeroTextEnterEase;
  heroAsset2EnterDurationSec?: number;
  heroAsset2ExitPreset?: HeroAssetExitPreset;
  heroAsset2ExitEase?: HeroTextEnterEase;
  heroAsset2ExitStart?: number;
  heroAsset2ExitEnd?: number;
  imageBorderRadiusPx?: number;
  backgroundVariant?: BackgroundVariant;
  backgroundColors?: BackgroundColors;
  heroBackgroundVariant?: BackgroundVariant;
  heroBackgroundColors?: BackgroundColors;
  linkHeroParallaxBackgrounds?: boolean;
  backgroundScope?: BackgroundScope;
  dynamicImageMode?: boolean;
  centerImageStaticInDynamicMode?: boolean;
  dynamicImageSwitchEveryVh?: number;
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

function edgeFadeOverlayLiteral(config: EdgeFadeConfig, sizePercent: number): string {
  return JSON.stringify(edgeFadeOverlayDefs(config, sizePercent), null, 2);
}

/** Primary collage URLs from the CSN Services Georgia site. */
const CLIENT_PRIMARY_IMAGE_URLS = [
  'https://csnservicesga.com/wp-content/uploads/2026/04/iStock-90201091-cover.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/04/iStock-2154368216-res.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-694068950-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-182172142-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/iStock-1309517103-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-1167235640-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-2097214470-feat.jpg',
] as const;

const DYNAMIC_VARIANT_POOL = [
  'https://csnservicesga.com/wp-content/uploads/2026/04/iStock-90201091-cover.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/04/iStock-2154368216-res.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/04/iStock-2154368216-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-694068950-res1.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-694068950-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-1302189602-cover.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-182172142-res.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/03/iStock-182172142-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/iStock-1309517103-res.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/iStock-1309517103-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/1000054401.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/1000054402.jpg',
  'https://csnservicesga.com/wp-content/uploads/2026/02/1000054403.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-1167235640-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-2097214470-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-2178352632-feat.jpg',
  'https://csnservicesga.com/wp-content/uploads/2025/12/iStock-2155974979-cover.jpg',
] as const;

const DEFAULT_IMAGES: DemoImage[] = CLIENT_PRIMARY_IMAGE_URLS.map((src, i) => ({
  src,
  alt: `Parallax image ${i + 1}`,
  variants: DYNAMIC_VARIANT_POOL.filter((candidate) => candidate !== src),
}));

export default function App() {
  const [scrollLengthMultiplier, setScrollLengthMultiplier] = useState(3);
  const [collagePauseVh, setCollagePauseVh] = useState(20);
  const [introHeightVh, setIntroHeightVh] = useState(100);
  const [heroFontFamily, setHeroFontFamily] = useState('inherit');
  const [heroHeadingText, setHeroHeadingText] = useState('Scroll Down for Zoom Parallax');
  const [heroFontSizePx, setHeroFontSizePx] = useState(48);
  const [heroTextColor, setHeroTextColor] = useState('#ffffff');
  const [heroTextAlign, setHeroTextAlign] = useState<HeroTextAlign>('center');
  const [heroOffsetXPx, setHeroOffsetXPx] = useState(0);
  const [heroOffsetYPx, setHeroOffsetYPx] = useState(0);
  const [heroMaxWidthPercent, setHeroMaxWidthPercent] = useState(100);
  const [heroCreativeStyle, setHeroCreativeStyle] = useState<HeroCreativeStyle>(
    DEFAULT_HERO_CREATIVE_STYLE,
  );
  const [heroEffectIntensity, setHeroEffectIntensity] = useState(1);
  const [heroEffectSpeedSeconds, setHeroEffectSpeedSeconds] = useState(10);
  const [heroSunsetMeshUseBackground, setHeroSunsetMeshUseBackground] = useState(true);
  const [heroTextEnterPreset, setHeroTextEnterPreset] = useState<HeroTextEnterPreset>(
    DEFAULT_HERO_TEXT_ENTER_PRESET,
  );
  const [heroTextEnterEase, setHeroTextEnterEase] = useState<HeroTextEnterEase>(
    DEFAULT_HERO_TEXT_ENTER_EASE,
  );
  const [heroTextEnterDurationSec, setHeroTextEnterDurationSec] = useState(
    DEFAULT_HERO_TEXT_ENTER_DURATION_SEC,
  );
  const [heroScrollFadeEnabled, setHeroScrollFadeEnabled] = useState(
    DEFAULT_HERO_SCROLL_FADE_ENABLED,
  );
  const [heroScrollFadeStart, setHeroScrollFadeStart] = useState(DEFAULT_HERO_SCROLL_FADE_START);
  const [heroScrollFadeEnd, setHeroScrollFadeEnd] = useState(DEFAULT_HERO_SCROLL_FADE_END);
  const [heroScrollFadeCurve, setHeroScrollFadeCurve] = useState<HeroScrollFadeCurve>(
    DEFAULT_HERO_SCROLL_FADE_CURVE,
  );
  const [heroTextZIndex, setHeroTextZIndex] = useState(10);
  const [introEdgeFade, setIntroEdgeFade] = useState<EdgeFadeConfig>(DEFAULT_EDGE_FADE_CONFIG);
  const [introEdgeFadeSizePercent, setIntroEdgeFadeSizePercent] = useState(18);
  const [introEdgeFadeZIndex, setIntroEdgeFadeZIndex] = useState(30);
  const [heroAssetEnabled, setHeroAssetEnabled] = useState(DEFAULT_HERO_ASSET_ENABLED);
  const [heroAssetSrc, setHeroAssetSrc] = useState(DEFAULT_HERO_ASSET_SRC);
  const [heroAssetAlt, setHeroAssetAlt] = useState(DEFAULT_HERO_ASSET_ALT);
  const [heroAssetScale, setHeroAssetScale] = useState(DEFAULT_HERO_ASSET_SCALE);
  const [heroAssetWidthPx, setHeroAssetWidthPx] = useState(DEFAULT_HERO_ASSET_WIDTH_PX);
  const [heroAssetOffsetXPx, setHeroAssetOffsetXPx] = useState(DEFAULT_HERO_ASSET_OFFSET_X_PX);
  const [heroAssetOffsetYPx, setHeroAssetOffsetYPx] = useState(DEFAULT_HERO_ASSET_OFFSET_Y_PX);
  const [heroAssetZIndex, setHeroAssetZIndex] = useState(20);
  const [parallaxEdgeFade, setParallaxEdgeFade] = useState<EdgeFadeConfig>(DEFAULT_EDGE_FADE_CONFIG);
  const [parallaxEdgeFadeSizePercent, setParallaxEdgeFadeSizePercent] = useState(18);
  const [parallaxEdgeFadeZIndex, setParallaxEdgeFadeZIndex] = useState(30);
  const [heroAssetEnterPreset, setHeroAssetEnterPreset] = useState<HeroAssetEnterPreset>(
    DEFAULT_HERO_ASSET_ENTER_PRESET,
  );
  const [heroAssetEnterEase, setHeroAssetEnterEase] = useState<HeroTextEnterEase>(
    DEFAULT_HERO_ASSET_ENTER_EASE,
  );
  const [heroAssetEnterDurationSec, setHeroAssetEnterDurationSec] = useState(
    DEFAULT_HERO_ASSET_ENTER_DURATION_SEC,
  );
  const [heroAssetExitPreset, setHeroAssetExitPreset] = useState<HeroAssetExitPreset>(
    DEFAULT_HERO_ASSET_EXIT_PRESET,
  );
  const [heroAssetExitEase, setHeroAssetExitEase] = useState<HeroTextEnterEase>(
    DEFAULT_HERO_ASSET_EXIT_EASE,
  );
  const [heroAssetExitStart, setHeroAssetExitStart] = useState(DEFAULT_HERO_ASSET_EXIT_START);
  const [heroAssetExitEnd, setHeroAssetExitEnd] = useState(DEFAULT_HERO_ASSET_EXIT_END);
  const [heroAsset2Enabled, setHeroAsset2Enabled] = useState(DEFAULT_HERO_ASSET_ENABLED);
  const [heroAsset2Src, setHeroAsset2Src] = useState(DEFAULT_HERO_ASSET_SRC);
  const [heroAsset2Alt, setHeroAsset2Alt] = useState(DEFAULT_HERO_ASSET_ALT);
  const [heroAsset2Scale, setHeroAsset2Scale] = useState(DEFAULT_HERO_ASSET_SCALE);
  const [heroAsset2WidthPx, setHeroAsset2WidthPx] = useState(DEFAULT_HERO_ASSET_WIDTH_PX);
  const [heroAsset2OffsetXPx, setHeroAsset2OffsetXPx] = useState(DEFAULT_HERO_ASSET_OFFSET_X_PX);
  const [heroAsset2OffsetYPx, setHeroAsset2OffsetYPx] = useState(DEFAULT_HERO_ASSET_OFFSET_Y_PX);
  const [heroAsset2ZIndex, setHeroAsset2ZIndex] = useState(20);
  const [heroAsset2EnterPreset, setHeroAsset2EnterPreset] = useState<HeroAssetEnterPreset>(
    DEFAULT_HERO_ASSET_ENTER_PRESET,
  );
  const [heroAsset2EnterEase, setHeroAsset2EnterEase] = useState<HeroTextEnterEase>(
    DEFAULT_HERO_ASSET_ENTER_EASE,
  );
  const [heroAsset2EnterDurationSec, setHeroAsset2EnterDurationSec] = useState(
    DEFAULT_HERO_ASSET_ENTER_DURATION_SEC,
  );
  const [heroAsset2ExitPreset, setHeroAsset2ExitPreset] = useState<HeroAssetExitPreset>(
    DEFAULT_HERO_ASSET_EXIT_PRESET,
  );
  const [heroAsset2ExitEase, setHeroAsset2ExitEase] = useState<HeroTextEnterEase>(
    DEFAULT_HERO_ASSET_EXIT_EASE,
  );
  const [heroAsset2ExitStart, setHeroAsset2ExitStart] = useState(DEFAULT_HERO_ASSET_EXIT_START);
  const [heroAsset2ExitEnd, setHeroAsset2ExitEnd] = useState(DEFAULT_HERO_ASSET_EXIT_END);
  const [imageBorderRadiusPx, setImageBorderRadiusPx] = useState(8);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>('solid-dark');
  const [backgroundColors, setBackgroundColors] = useState<BackgroundColors>(() => ({
    ...DEFAULT_BACKGROUND_COLORS,
  }));
  const [heroBackgroundVariant, setHeroBackgroundVariant] = useState<BackgroundVariant>('solid-dark');
  const [heroBackgroundColors, setHeroBackgroundColors] = useState<BackgroundColors>(() => ({
    ...DEFAULT_BACKGROUND_COLORS,
  }));
  const [linkHeroParallaxBackgrounds, setLinkHeroParallaxBackgrounds] = useState(false);
  const [backgroundScope, setBackgroundScope] = useState<BackgroundScope>('split');
  const [dynamicImageMode, setDynamicImageMode] = useState(false);
  const [centerImageStaticInDynamicMode, setCenterImageStaticInDynamicMode] = useState(true);
  const [dynamicImageSwitchEveryVh, setDynamicImageSwitchEveryVh] = useState(18);
  const [images, setImages] = useState<DemoImage[]>(() => [...DEFAULT_IMAGES]);
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);

  useEffect(() => {
    try {
      const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!rawSettings) return;
      const parsed = JSON.parse(rawSettings) as PersistedSettings;
      const legacyLayout = (parsed.layoutDefaultsVersion ?? 0) < LAYOUT_DEFAULTS_VERSION;

      if (typeof parsed.scrollLengthMultiplier === 'number') {
        setScrollLengthMultiplier(parsed.scrollLengthMultiplier);
      }
      if (typeof parsed.collagePauseVh === 'number') {
        let pause = Math.min(200, Math.max(0, parsed.collagePauseVh));
        if (legacyLayout && pause === 60) pause = 20;
        setCollagePauseVh(pause);
      } else if (typeof parsed.collageHoldSpan === 'number') {
        const legacy = parsed.collageHoldSpan;
        setCollagePauseVh(Math.min(200, Math.max(0, Math.round(legacy * 280))));
      }
      if (typeof parsed.introHeightVh === 'number') {
        let intro = parsed.introHeightVh;
        if (legacyLayout && intro === 50) intro = 100;
        setIntroHeightVh(intro);
      }
      if (typeof parsed.heroFontFamily === 'string') {
        setHeroFontFamily(parsed.heroFontFamily);
      }
      if (typeof parsed.heroHeadingText === 'string') {
        setHeroHeadingText(parsed.heroHeadingText);
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
      if (parsed.heroCreativeStyle !== undefined) {
        setHeroCreativeStyle(parseHeroCreativeStyle(parsed.heroCreativeStyle));
      }
      if (typeof parsed.heroEffectIntensity === 'number') {
        setHeroEffectIntensity(Math.min(2, Math.max(0.6, parsed.heroEffectIntensity)));
      }
      if (typeof parsed.heroEffectSpeedSeconds === 'number') {
        setHeroEffectSpeedSeconds(Math.min(24, Math.max(4, parsed.heroEffectSpeedSeconds)));
      }
      if (typeof parsed.heroSunsetMeshUseBackground === 'boolean') {
        setHeroSunsetMeshUseBackground(parsed.heroSunsetMeshUseBackground);
      }
      if (parsed.heroTextEnterPreset !== undefined) {
        setHeroTextEnterPreset(parseHeroTextEnterPreset(parsed.heroTextEnterPreset));
      }
      if (parsed.heroTextEnterEase !== undefined) {
        setHeroTextEnterEase(parseHeroTextEnterEase(parsed.heroTextEnterEase));
      }
      if (typeof parsed.heroTextEnterDurationSec === 'number') {
        setHeroTextEnterDurationSec(
          Math.min(2.8, Math.max(0.15, parsed.heroTextEnterDurationSec)),
        );
      }
      if (typeof parsed.heroScrollFadeEnabled === 'boolean') {
        setHeroScrollFadeEnabled(parsed.heroScrollFadeEnabled);
      }
      if (typeof parsed.heroScrollFadeStart === 'number') {
        setHeroScrollFadeStart(Math.min(0.92, Math.max(0, parsed.heroScrollFadeStart)));
      }
      if (typeof parsed.heroScrollFadeEnd === 'number') {
        setHeroScrollFadeEnd(Math.min(1, Math.max(0.08, parsed.heroScrollFadeEnd)));
      }
      if (parsed.heroScrollFadeCurve !== undefined) {
        setHeroScrollFadeCurve(parseHeroScrollFadeCurve(parsed.heroScrollFadeCurve));
      }
      if (typeof parsed.heroTextZIndex === 'number') {
        setHeroTextZIndex(Math.min(50, Math.max(0, Math.round(parsed.heroTextZIndex))));
      }
      if (parsed.introEdgeFade !== undefined) {
        setIntroEdgeFade(mergeEdgeFadeConfig(parsed.introEdgeFade));
      }
      if (typeof parsed.introEdgeFadeSizePercent === 'number') {
        setIntroEdgeFadeSizePercent(Math.min(40, Math.max(4, Math.round(parsed.introEdgeFadeSizePercent))));
      }
      if (typeof parsed.introEdgeFadeZIndex === 'number') {
        setIntroEdgeFadeZIndex(Math.min(50, Math.max(0, Math.round(parsed.introEdgeFadeZIndex))));
      }
      if (typeof parsed.heroAssetEnabled === 'boolean') {
        setHeroAssetEnabled(parsed.heroAssetEnabled);
      }
      if (typeof parsed.heroAssetSrc === 'string') {
        setHeroAssetSrc(parsed.heroAssetSrc);
      }
      if (typeof parsed.heroAssetAlt === 'string') {
        setHeroAssetAlt(parsed.heroAssetAlt);
      }
      if (typeof parsed.heroAssetScale === 'number') {
        setHeroAssetScale(Math.min(8, Math.max(0.2, parsed.heroAssetScale)));
      }
      if (typeof parsed.heroAssetWidthPx === 'number') {
        setHeroAssetWidthPx(Math.min(820, Math.max(60, Math.round(parsed.heroAssetWidthPx))));
      }
      if (typeof parsed.heroAssetOffsetXPx === 'number') {
        setHeroAssetOffsetXPx(Math.min(320, Math.max(-320, Math.round(parsed.heroAssetOffsetXPx))));
      }
      if (typeof parsed.heroAssetOffsetYPx === 'number') {
        setHeroAssetOffsetYPx(Math.min(320, Math.max(-320, Math.round(parsed.heroAssetOffsetYPx))));
      }
      if (typeof parsed.heroAssetZIndex === 'number') {
        setHeroAssetZIndex(Math.min(50, Math.max(0, Math.round(parsed.heroAssetZIndex))));
      }
      if (parsed.parallaxEdgeFade !== undefined) {
        setParallaxEdgeFade(mergeEdgeFadeConfig(parsed.parallaxEdgeFade));
      }
      if (typeof parsed.parallaxEdgeFadeSizePercent === 'number') {
        setParallaxEdgeFadeSizePercent(
          Math.min(40, Math.max(4, Math.round(parsed.parallaxEdgeFadeSizePercent))),
        );
      }
      if (typeof parsed.parallaxEdgeFadeZIndex === 'number') {
        setParallaxEdgeFadeZIndex(
          Math.min(50, Math.max(0, Math.round(parsed.parallaxEdgeFadeZIndex))),
        );
      }
      if (parsed.heroAssetEnterPreset !== undefined) {
        setHeroAssetEnterPreset(parseHeroAssetEnterPreset(parsed.heroAssetEnterPreset));
      }
      if (parsed.heroAssetEnterEase !== undefined) {
        setHeroAssetEnterEase(parseHeroTextEnterEase(parsed.heroAssetEnterEase));
      }
      if (typeof parsed.heroAssetEnterDurationSec === 'number') {
        setHeroAssetEnterDurationSec(Math.min(2.8, Math.max(0.15, parsed.heroAssetEnterDurationSec)));
      }
      if (parsed.heroAssetExitPreset !== undefined) {
        setHeroAssetExitPreset(parseHeroAssetExitPreset(parsed.heroAssetExitPreset));
      }
      if (parsed.heroAssetExitEase !== undefined) {
        setHeroAssetExitEase(parseHeroTextEnterEase(parsed.heroAssetExitEase));
      }
      if (typeof parsed.heroAssetExitStart === 'number') {
        setHeroAssetExitStart(Math.min(0.92, Math.max(0, parsed.heroAssetExitStart)));
      }
      if (typeof parsed.heroAssetExitEnd === 'number') {
        setHeroAssetExitEnd(Math.min(1, Math.max(0.08, parsed.heroAssetExitEnd)));
      }
      if (typeof parsed.heroAsset2Enabled === 'boolean') {
        setHeroAsset2Enabled(parsed.heroAsset2Enabled);
      }
      if (typeof parsed.heroAsset2Src === 'string') {
        setHeroAsset2Src(parsed.heroAsset2Src);
      }
      if (typeof parsed.heroAsset2Alt === 'string') {
        setHeroAsset2Alt(parsed.heroAsset2Alt);
      }
      if (typeof parsed.heroAsset2Scale === 'number') {
        setHeroAsset2Scale(Math.min(8, Math.max(0.2, parsed.heroAsset2Scale)));
      }
      if (typeof parsed.heroAsset2WidthPx === 'number') {
        setHeroAsset2WidthPx(Math.min(820, Math.max(60, Math.round(parsed.heroAsset2WidthPx))));
      }
      if (typeof parsed.heroAsset2OffsetXPx === 'number') {
        setHeroAsset2OffsetXPx(Math.min(320, Math.max(-320, Math.round(parsed.heroAsset2OffsetXPx))));
      }
      if (typeof parsed.heroAsset2OffsetYPx === 'number') {
        setHeroAsset2OffsetYPx(Math.min(320, Math.max(-320, Math.round(parsed.heroAsset2OffsetYPx))));
      }
      if (typeof parsed.heroAsset2ZIndex === 'number') {
        setHeroAsset2ZIndex(Math.min(50, Math.max(0, Math.round(parsed.heroAsset2ZIndex))));
      }
      if (parsed.heroAsset2EnterPreset !== undefined) {
        setHeroAsset2EnterPreset(parseHeroAssetEnterPreset(parsed.heroAsset2EnterPreset));
      }
      if (parsed.heroAsset2EnterEase !== undefined) {
        setHeroAsset2EnterEase(parseHeroTextEnterEase(parsed.heroAsset2EnterEase));
      }
      if (typeof parsed.heroAsset2EnterDurationSec === 'number') {
        setHeroAsset2EnterDurationSec(Math.min(2.8, Math.max(0.15, parsed.heroAsset2EnterDurationSec)));
      }
      if (parsed.heroAsset2ExitPreset !== undefined) {
        setHeroAsset2ExitPreset(parseHeroAssetExitPreset(parsed.heroAsset2ExitPreset));
      }
      if (parsed.heroAsset2ExitEase !== undefined) {
        setHeroAsset2ExitEase(parseHeroTextEnterEase(parsed.heroAsset2ExitEase));
      }
      if (typeof parsed.heroAsset2ExitStart === 'number') {
        setHeroAsset2ExitStart(Math.min(0.92, Math.max(0, parsed.heroAsset2ExitStart)));
      }
      if (typeof parsed.heroAsset2ExitEnd === 'number') {
        setHeroAsset2ExitEnd(Math.min(1, Math.max(0.08, parsed.heroAsset2ExitEnd)));
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
      if (
        parsed.heroBackgroundVariant &&
        ['solid-dark', 'solid-indigo', 'gradient-sunset', 'gradient-ocean', 'image-forest', 'blob-animated'].includes(parsed.heroBackgroundVariant)
      ) {
        setHeroBackgroundVariant(parsed.heroBackgroundVariant);
      }
      if (parsed.heroBackgroundColors) {
        setHeroBackgroundColors(mergeBackgroundColors(parsed.heroBackgroundColors));
      }
      if (typeof parsed.linkHeroParallaxBackgrounds === 'boolean') {
        setLinkHeroParallaxBackgrounds(parsed.linkHeroParallaxBackgrounds);
      }
      if (
        parsed.backgroundScope &&
        ['parallax-only', 'hero-only', 'split', 'independent', 'continuous'].includes(parsed.backgroundScope)
      ) {
        setBackgroundScope(parsed.backgroundScope);
      }
      if (typeof parsed.dynamicImageMode === 'boolean') {
        setDynamicImageMode(parsed.dynamicImageMode);
      }
      if (typeof parsed.centerImageStaticInDynamicMode === 'boolean') {
        setCenterImageStaticInDynamicMode(parsed.centerImageStaticInDynamicMode);
      }
      if (typeof parsed.dynamicImageSwitchEveryVh === 'number') {
        setDynamicImageSwitchEveryVh(
          Math.min(120, Math.max(4, Math.round(parsed.dynamicImageSwitchEveryVh))),
        );
      }
      if (Array.isArray(parsed.images)) {
        const cleaned = parsed.images
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const src = typeof (item as DemoImage).src === 'string' ? (item as DemoImage).src : '';
            const alt = typeof (item as DemoImage).alt === 'string' ? (item as DemoImage).alt : '';
            if (!src) return null;
            const variants = Array.isArray((item as DemoImage).variants)
              ? (item as DemoImage).variants
                  .filter((v): v is string => typeof v === 'string' && !!v.trim())
                  .slice(0, 40)
              : undefined;
            const row: DemoImage = {
              src,
              alt,
              ...(variants?.length ? { variants } : {}),
            };
            return row;
          })
          .filter((item): item is DemoImage => item !== null)
          .slice(0, 7);
        if (cleaned.length > 0) {
          const padded =
            cleaned.length === 7 ? cleaned : [...cleaned, ...DEFAULT_IMAGES.slice(cleaned.length)];
          const withDefaultVariants = padded.map((image, index) => {
            if (image.variants?.length) return image;
            const defaults = DEFAULT_IMAGES[index]?.variants;
            return defaults?.length ? { ...image, variants: defaults } : image;
          });
          setImages(withDefaultVariants);
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
      collagePauseVh,
      introHeightVh,
      layoutDefaultsVersion: LAYOUT_DEFAULTS_VERSION,
      heroFontFamily,
      heroHeadingText,
      heroFontSizePx,
      heroTextColor,
      heroTextAlign,
      heroOffsetXPx,
      heroOffsetYPx,
      heroMaxWidthPercent,
      heroCreativeStyle,
      heroEffectIntensity,
      heroEffectSpeedSeconds,
      heroSunsetMeshUseBackground,
      heroTextEnterPreset,
      heroTextEnterEase,
      heroTextEnterDurationSec,
      heroScrollFadeEnabled,
      heroScrollFadeStart,
      heroScrollFadeEnd,
      heroScrollFadeCurve,
      heroTextZIndex,
      introEdgeFade,
      introEdgeFadeSizePercent,
      introEdgeFadeZIndex,
      heroAssetEnabled,
      heroAssetSrc,
      heroAssetAlt,
      heroAssetScale,
      heroAssetWidthPx,
      heroAssetOffsetXPx,
      heroAssetOffsetYPx,
      heroAssetZIndex,
      parallaxEdgeFade,
      parallaxEdgeFadeSizePercent,
      parallaxEdgeFadeZIndex,
      heroAssetEnterPreset,
      heroAssetEnterEase,
      heroAssetEnterDurationSec,
      heroAssetExitPreset,
      heroAssetExitEase,
      heroAssetExitStart,
      heroAssetExitEnd,
      heroAsset2Enabled,
      heroAsset2Src,
      heroAsset2Alt,
      heroAsset2Scale,
      heroAsset2WidthPx,
      heroAsset2OffsetXPx,
      heroAsset2OffsetYPx,
      heroAsset2ZIndex,
      heroAsset2EnterPreset,
      heroAsset2EnterEase,
      heroAsset2EnterDurationSec,
      heroAsset2ExitPreset,
      heroAsset2ExitEase,
      heroAsset2ExitStart,
      heroAsset2ExitEnd,
      imageBorderRadiusPx,
      backgroundVariant,
      backgroundColors,
      heroBackgroundVariant,
      heroBackgroundColors,
      linkHeroParallaxBackgrounds,
      backgroundScope,
      dynamicImageMode,
      centerImageStaticInDynamicMode,
      dynamicImageSwitchEveryVh,
      images,
    };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToPersist));
  }, [
    hasHydratedSettings,
    scrollLengthMultiplier,
    collagePauseVh,
    introHeightVh,
    heroFontFamily,
    heroHeadingText,
    heroFontSizePx,
    heroTextColor,
    heroTextAlign,
    heroOffsetXPx,
    heroOffsetYPx,
    heroMaxWidthPercent,
    heroCreativeStyle,
    heroEffectIntensity,
    heroEffectSpeedSeconds,
    heroSunsetMeshUseBackground,
    heroTextEnterPreset,
    heroTextEnterEase,
    heroTextEnterDurationSec,
    heroScrollFadeEnabled,
    heroScrollFadeStart,
    heroScrollFadeEnd,
    heroScrollFadeCurve,
    heroTextZIndex,
    introEdgeFade,
    introEdgeFadeSizePercent,
    introEdgeFadeZIndex,
    heroAssetEnabled,
    heroAssetSrc,
    heroAssetAlt,
    heroAssetScale,
    heroAssetWidthPx,
    heroAssetOffsetXPx,
    heroAssetOffsetYPx,
    heroAssetZIndex,
    parallaxEdgeFade,
    parallaxEdgeFadeSizePercent,
    parallaxEdgeFadeZIndex,
    heroAssetEnterPreset,
    heroAssetEnterEase,
    heroAssetEnterDurationSec,
    heroAssetExitPreset,
    heroAssetExitEase,
    heroAssetExitStart,
    heroAssetExitEnd,
    heroAsset2Enabled,
    heroAsset2Src,
    heroAsset2Alt,
    heroAsset2Scale,
    heroAsset2WidthPx,
    heroAsset2OffsetXPx,
    heroAsset2OffsetYPx,
    heroAsset2ZIndex,
    heroAsset2EnterPreset,
    heroAsset2EnterEase,
    heroAsset2EnterDurationSec,
    heroAsset2ExitPreset,
    heroAsset2ExitEase,
    heroAsset2ExitStart,
    heroAsset2ExitEnd,
    imageBorderRadiusPx,
    backgroundVariant,
    backgroundColors,
    heroBackgroundVariant,
    heroBackgroundColors,
    linkHeroParallaxBackgrounds,
    backgroundScope,
    dynamicImageMode,
    centerImageStaticInDynamicMode,
    dynamicImageSwitchEveryVh,
    images,
  ]);

  const handleResetDemoImages = () => {
    setImages([...DEFAULT_IMAGES]);
    toast.success('Images reset', {
      description: 'Restored bundled CSN image URLs. Saves on next change or Save + Refresh.',
    });
  };

  const handleBackgroundVariantChange = (value: BackgroundVariant) => {
    setBackgroundVariant(value);
    if (linkHeroParallaxBackgrounds) setHeroBackgroundVariant(value);
  };

  const handleBackgroundColorsChange = (value: BackgroundColors) => {
    setBackgroundColors(value);
    if (linkHeroParallaxBackgrounds) setHeroBackgroundColors(value);
  };

  const handleHeroBackgroundVariantChange = (value: BackgroundVariant) => {
    setHeroBackgroundVariant(value);
    if (linkHeroParallaxBackgrounds) setBackgroundVariant(value);
  };

  const handleHeroBackgroundColorsChange = (value: BackgroundColors) => {
    setHeroBackgroundColors(value);
    if (linkHeroParallaxBackgrounds) setBackgroundColors(value);
  };

  const handleLinkHeroParallaxBackgroundsChange = (value: boolean) => {
    setLinkHeroParallaxBackgrounds(value);
    if (value) {
      setHeroBackgroundVariant(backgroundVariant);
      setHeroBackgroundColors(backgroundColors);
    }
  };

  const handleSaveAndRefresh = () => {
    const settingsToPersist: PersistedSettings = {
      scrollLengthMultiplier,
      collagePauseVh,
      introHeightVh,
      layoutDefaultsVersion: LAYOUT_DEFAULTS_VERSION,
      heroFontFamily,
      heroHeadingText,
      heroFontSizePx,
      heroTextColor,
      heroTextAlign,
      heroOffsetXPx,
      heroOffsetYPx,
      heroMaxWidthPercent,
      heroCreativeStyle,
      heroEffectIntensity,
      heroEffectSpeedSeconds,
      heroSunsetMeshUseBackground,
      heroTextEnterPreset,
      heroTextEnterEase,
      heroTextEnterDurationSec,
      heroScrollFadeEnabled,
      heroScrollFadeStart,
      heroScrollFadeEnd,
      heroScrollFadeCurve,
      heroTextZIndex,
      introEdgeFade,
      introEdgeFadeSizePercent,
      introEdgeFadeZIndex,
      heroAssetEnabled,
      heroAssetSrc,
      heroAssetAlt,
      heroAssetScale,
      heroAssetWidthPx,
      heroAssetOffsetXPx,
      heroAssetOffsetYPx,
      heroAssetZIndex,
      parallaxEdgeFade,
      parallaxEdgeFadeSizePercent,
      parallaxEdgeFadeZIndex,
      heroAssetEnterPreset,
      heroAssetEnterEase,
      heroAssetEnterDurationSec,
      heroAssetExitPreset,
      heroAssetExitEase,
      heroAssetExitStart,
      heroAssetExitEnd,
      heroAsset2Enabled,
      heroAsset2Src,
      heroAsset2Alt,
      heroAsset2Scale,
      heroAsset2WidthPx,
      heroAsset2OffsetXPx,
      heroAsset2OffsetYPx,
      heroAsset2ZIndex,
      heroAsset2EnterPreset,
      heroAsset2EnterEase,
      heroAsset2EnterDurationSec,
      heroAsset2ExitPreset,
      heroAsset2ExitEase,
      heroAsset2ExitStart,
      heroAsset2ExitEnd,
      imageBorderRadiusPx,
      backgroundVariant,
      backgroundColors,
      heroBackgroundVariant,
      heroBackgroundColors,
      linkHeroParallaxBackgrounds,
      backgroundScope,
      dynamicImageMode,
      centerImageStaticInDynamicMode,
      dynamicImageSwitchEveryVh,
      images,
    };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToPersist));
    window.location.reload();
  };

  const handleCopy = async () => {
    const calibratedScrollLength = Number(scrollLengthMultiplier.toFixed(2));
    const calibratedCollagePauseVh = Math.round(collagePauseVh);
    const calibratedIntroHeight = Math.round(introHeightVh);
    const calibratedHeroFontSize = Math.round(heroFontSizePx);
    const calibratedHeroOffsetX = Math.round(heroOffsetXPx);
    const calibratedHeroOffsetY = Math.round(heroOffsetYPx);
    const calibratedHeroMaxWidth = Math.round(heroMaxWidthPercent);
    const calibratedHeroTextZIndex = Math.round(heroTextZIndex);
    const calibratedHeroAssetWidth = Math.round(heroAssetWidthPx);
    const calibratedHeroAssetOffsetX = Math.round(heroAssetOffsetXPx);
    const calibratedHeroAssetOffsetY = Math.round(heroAssetOffsetYPx);
    const calibratedHeroAssetZIndex = Math.round(heroAssetZIndex);
    const calibratedHeroAsset2Width = Math.round(heroAsset2WidthPx);
    const calibratedHeroAsset2OffsetX = Math.round(heroAsset2OffsetXPx);
    const calibratedHeroAsset2OffsetY = Math.round(heroAsset2OffsetYPx);
    const calibratedHeroAsset2ZIndex = Math.round(heroAsset2ZIndex);
    const calibratedImageRadius = Math.round(imageBorderRadiusPx);
    const introEdgeFadeOverlaysLiteral = edgeFadeOverlayLiteral(
      introEdgeFade,
      introEdgeFadeSizePercent,
    );
    const backgroundSnippet = serializeBackgroundForExport(backgroundVariant, backgroundColors);
    const heroBackgroundSnippet = serializeBackgroundForExport(heroBackgroundVariant, heroBackgroundColors);
    const exportImages = images.map((img, index) => ({
      src: img.src,
      alt: img.alt || `Parallax image ${index + 1}`,
    }));

    const exportHeroAlignClass =
      heroTextAlign === 'left'
        ? 'ml-0 mr-auto'
        : heroTextAlign === 'right'
          ? 'ml-auto mr-0'
          : 'mx-auto';
    const exportHeroH1Class =
      heroCreativeStyle === 'default'
        ? 'mx-auto font-bold leading-tight'
        : heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle)
          ? 'font-bold leading-tight w-full'
          : `mx-auto font-bold leading-tight ${heroCreativeStyleClassName(heroCreativeStyle)}`;
    const exportHeroDataTextAttr =
      heroCreativeStyle === 'chromatic-split' || heroCreativeStyle === 'back-halo'
        ? ` data-text={${JSON.stringify(heroHeadingText)}}`
        : '';
    const exportHeroEnterMotion = heroTextEnterExportMotionAttrs(
      heroTextEnterPreset,
      heroTextEnterEase,
      heroTextEnterDurationSec,
    );
    const exportHeroAssetEnabled = heroAssetEnabled && heroAssetSrc.trim().length > 0;
    const exportHeroAsset2Enabled = heroAsset2Enabled && heroAsset2Src.trim().length > 0;
    const exportHeroAssetEnterMotion =
      heroAssetEnterPreset === 'none' ? null : heroAssetEnterMotionState(heroAssetEnterPreset);
    const exportHeroAsset2EnterMotion =
      heroAsset2EnterPreset === 'none' ? null : heroAssetEnterMotionState(heroAsset2EnterPreset);
    const exportHeroHeadingBlock = (() => {
      const glass = heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle);
      if (!exportHeroEnterMotion) {
        if (glass) {
          return `          <div className="hero-creative-glass-plate-wrap ${exportHeroAlignClass}" style={{ ...heroGlassPlateWrapStyle, zIndex: ${calibratedHeroTextZIndex} }}>
            <h1 className="${exportHeroH1Class}" style={heroTextStyle}>
              ${heroHeadingText}
            </h1>
          </div>`;
        }
        return `          <h1 className="${exportHeroH1Class}" style={{ ...heroTextStyle, position: 'relative', zIndex: ${calibratedHeroTextZIndex} }}${exportHeroDataTextAttr}>
            ${heroHeadingText}
          </h1>`;
      }
      if (glass) {
        return `          <motion.div
            key="hero-enter"
            className="hero-creative-glass-plate-wrap ${exportHeroAlignClass}"
            style={{ ...heroGlassPlateWrapStyle, zIndex: ${calibratedHeroTextZIndex} }}
            initial={${exportHeroEnterMotion.initial}}
            animate={${exportHeroEnterMotion.animate}}
            transition={${exportHeroEnterMotion.transition}}
          >
            <h1 className="${exportHeroH1Class}" style={heroTextStyle}>
              ${heroHeadingText}
            </h1>
          </motion.div>`;
      }
      return `          <motion.h1
            key="hero-enter"
            className="${exportHeroH1Class}"
            style={{ ...heroTextStyle, position: 'relative', zIndex: ${calibratedHeroTextZIndex} }}${exportHeroDataTextAttr}
            initial={${exportHeroEnterMotion.initial}}
            animate={${exportHeroEnterMotion.animate}}
            transition={${exportHeroEnterMotion.transition}}
          >
            ${heroHeadingText}
          </motion.h1>`;
    })();
    const exportIntroEdgeFadeBlock = `        {introEdgeFadeOverlays.map((overlay, index) => (
          <div
            key={overlay.key ?? index}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ ...overlay.style, zIndex: ${introEdgeFadeZIndex} }}
          />
        ))}`;
    const introOuterTagOpen = heroScrollFadeEnabled
      ? `      <div ref={introSectionRef} className="relative overflow-hidden" style={{ height: '${calibratedIntroHeight}vh' }}>`
      : `      <div className="relative overflow-hidden" style={{ height: '${calibratedIntroHeight}vh' }}>`;
    const heroTextOuterOpen = heroScrollFadeEnabled
      ? `        <motion.div className="relative" style={{ ...heroTextContainerStyle, opacity: heroScrollFadeOpacity }}>`
      : `        <div className="relative" style={heroTextContainerStyle}>`;
    const heroTextOuterClose = heroScrollFadeEnabled ? `        </motion.div>` : `        </div>`;
    const exportHeroAssetBlock = exportHeroAssetEnabled
      ? `        <motion.div className="pointer-events-none absolute left-1/2 top-1/2" style={heroAssetOuterStyle}>
          <motion.img
            src={heroAssetSrc}
            alt={heroAssetAlt}
            className="block h-auto max-w-none select-none"
            draggable={false}
            style={{ width: '${calibratedHeroAssetWidth}px' }}
            initial={heroAssetEnterInitial}
            animate={heroAssetEnterAnimate}
            transition={{ duration: ${heroAssetEnterDurationSec.toFixed(2)}, ease: [0.42, 0, 0.58, 1] }}
          />
        </motion.div>`
      : '';
    const exportHeroAsset2Block = exportHeroAsset2Enabled
      ? `        <motion.div className="pointer-events-none absolute left-1/2 top-1/2" style={heroAsset2OuterStyle}>
          <motion.img
            src={heroAsset2Src}
            alt={heroAsset2Alt}
            className="block h-auto max-w-none select-none"
            draggable={false}
            style={{ width: '${calibratedHeroAsset2Width}px' }}
            initial={heroAsset2EnterInitial}
            animate={heroAsset2EnterAnimate}
            transition={{ duration: ${heroAsset2EnterDurationSec.toFixed(2)}, ease: [0.42, 0, 0.58, 1] }}
          />
        </motion.div>`
      : '';
    const heroTextStyleColorLine = heroHeadingUsesInlineTextColor(heroCreativeStyle)
      ? `    color: ${JSON.stringify(heroTextColor)},\n`
      : '';
    const activeHeroBackgroundColors =
      backgroundScope === 'hero-only' || backgroundScope === 'independent'
        ? heroBackgroundColors
        : backgroundColors;
    const heroSunsetVarsLine =
      heroCreativeStyle === 'sunset-mesh' && heroSunsetMeshUseBackground
        ? `    '--hero-sunset-1': ${JSON.stringify(activeHeroBackgroundColors.sunset[0])},\n    '--hero-sunset-2': ${JSON.stringify(activeHeroBackgroundColors.sunset[1])},\n    '--hero-sunset-3': ${JSON.stringify(activeHeroBackgroundColors.sunset[2])},\n`
        : '';

    const heroBlockSplit = `${introOuterTagOpen}
        <div
          aria-hidden
          className={\`pointer-events-none absolute inset-0 z-0 \${backgroundClassName}\`}
          style={backgroundStyle}
        />
        {backgroundLayer ? (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{backgroundLayer}</div>
        ) : null}
${exportHeroAssetBlock}
${exportHeroAsset2Block}
${exportIntroEdgeFadeBlock}
${heroTextOuterOpen}
${exportHeroHeadingBlock}
${heroTextOuterClose}
      </div>`;

    const heroBlockHeroBg = `${introOuterTagOpen}
        <div
          aria-hidden
          className={\`pointer-events-none absolute inset-0 z-0 \${heroBackgroundClassName}\`}
          style={heroBackgroundStyle}
        />
        {heroBackgroundLayer ? (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{heroBackgroundLayer}</div>
        ) : null}
${exportHeroAssetBlock}
${exportHeroAsset2Block}
${exportIntroEdgeFadeBlock}
${heroTextOuterOpen}
${exportHeroHeadingBlock}
${heroTextOuterClose}
      </div>`;

    const heroBlockSimple = `${introOuterTagOpen}
${exportHeroAssetBlock}
${exportHeroAsset2Block}
${exportIntroEdgeFadeBlock}
${heroTextOuterOpen}
${exportHeroHeadingBlock}
${heroTextOuterClose}
      </div>`;

    const zoomParallaxWithBg = `      <ZoomParallax
        images={images}
        containerRef={scrollRef}
        scrollLengthMultiplier={${calibratedScrollLength}}
        collagePauseVh={${calibratedCollagePauseVh}}
        imageBorderRadiusPx={${calibratedImageRadius}}
        backgroundClassName={backgroundClassName}
        backgroundStyle={backgroundStyle}
        backgroundLayer={backgroundLayer}
        stageEdgeFade={parallaxEdgeFade}
        stageEdgeFadeSizePercent={${parallaxEdgeFadeSizePercent}}
        stageEdgeFadeZIndex={${parallaxEdgeFadeZIndex}}
      />`;

    const zoomParallaxOmitBg = `      <ZoomParallax
        images={images}
        containerRef={scrollRef}
        scrollLengthMultiplier={${calibratedScrollLength}}
        collagePauseVh={${calibratedCollagePauseVh}}
        imageBorderRadiusPx={${calibratedImageRadius}}
        omitStageBackground
        stageEdgeFade={parallaxEdgeFade}
        stageEdgeFadeSizePercent={${parallaxEdgeFadeSizePercent}}
        stageEdgeFadeZIndex={${parallaxEdgeFadeZIndex}}
      />`;

    const heroTextStyleMaxWidthLine =
      heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle)
        ? ''
        : `    maxWidth: '${calibratedHeroMaxWidth}%',\n`;
    const heroGlassPlateWrapDecl = heroCreativeStyleUsesGlassPlateWrapper(heroCreativeStyle)
      ? `  const heroGlassPlateWrapStyle = {
    maxWidth: '${calibratedHeroMaxWidth}%',
    '--hero-user-color': ${JSON.stringify(heroTextColor)},
    '--hero-effect-intensity': ${heroEffectIntensity.toFixed(2)},
  } as import('react').CSSProperties;\n`
      : '';

    const exportHeroUsesMotion = exportHeroEnterMotion !== null;
    const exportMotionImportLine =
      heroScrollFadeEnabled || exportHeroAssetEnabled || exportHeroAsset2Enabled
        ? `import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';\n`
        : exportHeroUsesMotion
          ? `import { motion } from 'framer-motion';\n`
          : '';
    const exportHeroScrollFadeLibImport = heroScrollFadeEnabled
      ? `import { heroScrollFadeOpacity as computeHeroScrollFadeOpacity } from '@/lib/hero-scroll-fade';\n`
      : '';
    const exportHeroAssetLibImport = exportHeroAssetEnabled || exportHeroAsset2Enabled
      ? `import { heroAssetExitStyle as computeHeroAssetExitStyle } from '@/lib/hero-asset-animation';\n`
      : '';
    const exportScrollFadeSetup = heroScrollFadeEnabled
      ? `  const introSectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress: introScrollThrough } = useScroll({
    target: introSectionRef,
    container: scrollRef,
    offset: ['start start', 'end start'],
  });
  const heroScrollFadeOpacity = useTransform(introScrollThrough, (latest) =>
    computeHeroScrollFadeOpacity(
      latest,
      true,
      reducedMotion,
      ${heroScrollFadeStart},
      ${heroScrollFadeEnd},
      ${JSON.stringify(heroScrollFadeCurve)},
    ),
  );
`
      : '';
    const exportHeroAssetSetup = exportHeroAssetEnabled
      ? `  const heroAssetSrc = ${JSON.stringify(heroAssetSrc)};
  const heroAssetAlt = ${JSON.stringify(heroAssetAlt || DEFAULT_HERO_ASSET_ALT)};
  const heroAssetEnterInitial = ${JSON.stringify(exportHeroAssetEnterMotion?.initial ?? {})};
  const heroAssetEnterAnimate = ${JSON.stringify(exportHeroAssetEnterMotion?.animate ?? {})};
  const heroAssetOuterStyle = {
    x: ${calibratedHeroAssetOffsetX},
    y: useTransform(introScrollThrough, (latest) =>
      ${calibratedHeroAssetOffsetY} + computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAssetExitPreset)}, ${JSON.stringify(heroAssetExitEase)}, ${heroAssetExitStart}, ${heroAssetExitEnd}).y,
    ),
    scale: useTransform(introScrollThrough, (latest) =>
      ${heroAssetScale} * computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAssetExitPreset)}, ${JSON.stringify(heroAssetExitEase)}, ${heroAssetExitStart}, ${heroAssetExitEnd}).scale,
    ),
    rotate: useTransform(introScrollThrough, (latest) =>
      computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAssetExitPreset)}, ${JSON.stringify(heroAssetExitEase)}, ${heroAssetExitStart}, ${heroAssetExitEnd}).rotate,
    ),
    opacity: useTransform(introScrollThrough, (latest) =>
      computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAssetExitPreset)}, ${JSON.stringify(heroAssetExitEase)}, ${heroAssetExitStart}, ${heroAssetExitEnd}).opacity,
    ),
    zIndex: ${calibratedHeroAssetZIndex},
    transform: 'translate(-50%, -50%)',
  } as const;
`
      : '';

    const usageExampleCommonHeader = `import { useRef } from 'react';
${exportMotionImportLine}${exportHeroScrollFadeLibImport}${exportHeroAssetLibImport}import { ZoomParallax } from '@/components/ui/zoom-parallax';

export default function Page() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const backgroundClassName = ${backgroundSnippet.classNameLiteral};
  const backgroundStyle: import('react').CSSProperties | undefined = ${backgroundSnippet.styleLiteral};
  const backgroundLayer = ${backgroundSnippet.layerLiteral};
  const heroBackgroundClassName = ${heroBackgroundSnippet.classNameLiteral};
  const heroBackgroundStyle: import('react').CSSProperties | undefined = ${heroBackgroundSnippet.styleLiteral};
  const heroBackgroundLayer = ${heroBackgroundSnippet.layerLiteral};
  const heroTextStyle = {
    fontFamily: ${JSON.stringify(heroFontFamily)},
    fontSize: '${calibratedHeroFontSize}px',
${heroTextStyleColorLine}${heroTextStyleMaxWidthLine}    textAlign: ${JSON.stringify(heroTextAlign)} as const,
    '--hero-user-color': ${JSON.stringify(heroTextColor)},
    '--hero-effect-intensity': ${heroEffectIntensity.toFixed(2)},
    '--hero-effect-speed': '${heroEffectSpeedSeconds.toFixed(1)}s',
${heroSunsetVarsLine}    '--hero-sync-sunset': ${heroCreativeStyle === 'sunset-mesh' && heroSunsetMeshUseBackground ? 1 : 0},
  } as import('react').CSSProperties;
${heroGlassPlateWrapDecl}  const heroTextContainerStyle = {
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
  const introEdgeFadeOverlays = ${introEdgeFadeOverlaysLiteral};
  const parallaxEdgeFade = ${JSON.stringify(parallaxEdgeFade, null, 2)};
${exportScrollFadeSetup}${exportHeroAssetSetup}${
  exportHeroAsset2Enabled
    ? `  const heroAsset2Src = ${JSON.stringify(heroAsset2Src)};
  const heroAsset2Alt = ${JSON.stringify(heroAsset2Alt || DEFAULT_HERO_ASSET_ALT)};
  const heroAsset2EnterInitial = ${JSON.stringify(exportHeroAsset2EnterMotion?.initial ?? {})};
  const heroAsset2EnterAnimate = ${JSON.stringify(exportHeroAsset2EnterMotion?.animate ?? {})};
  const heroAsset2OuterStyle = {
    x: ${calibratedHeroAsset2OffsetX},
    y: useTransform(introScrollThrough, (latest) =>
      ${calibratedHeroAsset2OffsetY} + computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAsset2ExitPreset)}, ${JSON.stringify(heroAsset2ExitEase)}, ${heroAsset2ExitStart}, ${heroAsset2ExitEnd}).y,
    ),
    scale: useTransform(introScrollThrough, (latest) =>
      ${heroAsset2Scale} * computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAsset2ExitPreset)}, ${JSON.stringify(heroAsset2ExitEase)}, ${heroAsset2ExitStart}, ${heroAsset2ExitEnd}).scale,
    ),
    rotate: useTransform(introScrollThrough, (latest) =>
      computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAsset2ExitPreset)}, ${JSON.stringify(heroAsset2ExitEase)}, ${heroAsset2ExitStart}, ${heroAsset2ExitEnd}).rotate,
    ),
    opacity: useTransform(introScrollThrough, (latest) =>
      computeHeroAssetExitStyle(latest, reducedMotion, ${JSON.stringify(heroAsset2ExitPreset)}, ${JSON.stringify(heroAsset2ExitEase)}, ${heroAsset2ExitStart}, ${heroAsset2ExitEnd}).opacity,
    ),
    zIndex: ${calibratedHeroAsset2ZIndex},
    transform: 'translate(-50%, -50%)',
  } as const;
`
    : ''
}  const images = ${JSON.stringify(exportImages, null, 2)};

  return (`;

    const usageExampleFooter = `  );
}`;

    let usageExampleBody = '';
    if (backgroundScope === 'continuous') {
      usageExampleBody = `${usageExampleCommonHeader}
    <div ref={scrollRef} className="h-screen overflow-y-auto">
      <main className="relative min-h-full text-white">
        <div
          aria-hidden
          className={\`pointer-events-none absolute inset-0 z-0 min-h-full \${backgroundClassName}\`}
          style={backgroundStyle}
        />
        {backgroundLayer ? (
          <div className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden">
            {backgroundLayer}
          </div>
        ) : null}
${heroBlockSimple}
${zoomParallaxOmitBg}
      </main>
    </div>
${usageExampleFooter}`;
    } else if (backgroundScope === 'split') {
      usageExampleBody = `${usageExampleCommonHeader}
    <div ref={scrollRef} className="h-screen overflow-y-auto">
${heroBlockSplit}
${zoomParallaxWithBg}
    </div>
${usageExampleFooter}`;
    } else if (backgroundScope === 'independent') {
      usageExampleBody = `${usageExampleCommonHeader}
    <div ref={scrollRef} className="h-screen overflow-y-auto">
${heroBlockHeroBg}
${zoomParallaxWithBg}
    </div>
${usageExampleFooter}`;
    } else if (backgroundScope === 'hero-only') {
      usageExampleBody = `${usageExampleCommonHeader}
    <div ref={scrollRef} className="h-screen overflow-y-auto">
${heroBlockHeroBg}
${zoomParallaxOmitBg}
    </div>
${usageExampleFooter}`;
    } else {
      usageExampleBody = `${usageExampleCommonHeader}
    <div ref={scrollRef} className="h-screen overflow-y-auto">
${heroBlockSimple}
${zoomParallaxWithBg}
    </div>
${usageExampleFooter}`;
    }

    const integrationBundle = `# Zoom Parallax Integration Bundle

## 1) Install dependencies
npm install framer-motion @studio-freight/lenis

## 2) Create file: components/ui/zoom-parallax.tsx
\`\`\`tsx
'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';

interface Image {
  src: string;
  alt?: string;
}

interface EdgeFadeConfig {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

function edgeFadeOverlays(config?: EdgeFadeConfig): CSSProperties[] {
  if (!config || (!config.top && !config.right && !config.bottom && !config.left)) return [];
  const size = '18%';
  const color = 'rgba(0, 0, 0, 0.95)';
  const overlays: CSSProperties[] = [];
  if (config.top) overlays.push({ top: 0, left: 0, right: 0, height: size, background: \`linear-gradient(to bottom, \${color} 0%, transparent 100%)\` });
  if (config.right) overlays.push({ top: 0, right: 0, bottom: 0, width: size, background: \`linear-gradient(to left, \${color} 0%, transparent 100%)\` });
  if (config.bottom) overlays.push({ left: 0, right: 0, bottom: 0, height: size, background: \`linear-gradient(to top, \${color} 0%, transparent 100%)\` });
  if (config.left) overlays.push({ top: 0, left: 0, bottom: 0, width: size, background: \`linear-gradient(to right, \${color} 0%, transparent 100%)\` });
  return overlays;
}

interface ZoomParallaxProps {
  images: Image[];
  containerRef?: RefObject<HTMLElement | null>;
  scrollLengthMultiplier?: number;
  imageBorderRadiusPx?: number;
  backgroundClassName?: string;
  backgroundStyle?: CSSProperties;
  backgroundLayer?: ReactNode;
  stageEdgeFade?: EdgeFadeConfig;
  stageEdgeFadeZIndex?: number;
}

export function ZoomParallax({
  images,
  containerRef,
  scrollLengthMultiplier = ${calibratedScrollLength},
  imageBorderRadiusPx = ${calibratedImageRadius},
  backgroundClassName,
  backgroundStyle,
  backgroundLayer,
  stageEdgeFade,
  stageEdgeFadeZIndex = 30,
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
  const stageEdgeFadeOverlays = edgeFadeOverlays(stageEdgeFade);

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
        {stageEdgeFadeOverlays.map((overlay, index) => (
          <div
            key={index}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ ...overlay, zIndex: stageEdgeFadeZIndex }}
          />
        ))}
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
                <img src={src || '/placeholder.svg'} alt={alt ?? \`Parallax image \${index + 1}\`} className="h-full w-full object-cover" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
\`\`\`

## 3) Usage example (background: **${backgroundScope}**)
\`\`\`tsx
${usageExampleBody}
\`\`\`

Other modes: \`split\` repeats the same resolved background on the hero wrapper and on \`ZoomParallax\`. \`independent\` uses a hero-specific background plus a separate parallax background. \`hero-only\` customizes the hero while leaving the parallax stage on its default styling. \`parallax-only\` keeps a simple hero and paints only the sticky stage. \`continuous\` uses one full-scroll layer on \`main\` and \`omitStageBackground\` on \`ZoomParallax\`.

## Hero creative preset CSS
Your copied usage uses **${heroCreativeStyle}** for the headline. Non-\`default\` presets require the \`.hero-creative-*\` rules from the demo file \`src/index.css\` (and the \`@keyframes hero-creative-aurora-shift\` block) in your global stylesheet.

## Hero entrance animation
${exportHeroUsesMotion ? `This bundle uses **${heroTextEnterPreset}** with easing **${heroTextEnterEase}** (~${heroTextEnterDurationSec.toFixed(2)}s). Optional: wrap the same \`motion\` props with \`useReducedMotion()\` from Framer Motion to skip the entrance when users prefer reduced motion.` : `Entrance is off (\`none\`). Enable a preset in the demo to include \`motion\` in the copied example.`}

## Hero scroll fade
${heroScrollFadeEnabled ? `Headline opacity is driven by scroll over the intro block (**${heroScrollFadeCurve}**, ${(heroScrollFadeStart * 100).toFixed(0)}%→${(heroScrollFadeEnd * 100).toFixed(0)}% of intro travel). Copy \`introSectionRef\`, \`useScroll\`, and \`useTransform\` from the usage example; \`container\` must be the same element as \`ZoomParallax\`’s scroll root (\`scrollRef\` here). \`useReducedMotion()\` keeps the headline fully visible when the user prefers reduced motion.` : `Off in this bundle. Turn on **Fade on scroll** in the demo to include \`@/lib/hero-scroll-fade\` and the scroll-linked opacity in the copied example.`}

## Hero asset
${exportHeroAssetEnabled ? `Asset layer is included (width ${calibratedHeroAssetWidth}px, scale ${heroAssetScale.toFixed(2)}x, offset ${calibratedHeroAssetOffsetX}px/${calibratedHeroAssetOffsetY}px, z-index ${calibratedHeroAssetZIndex}). Entry uses **${heroAssetEnterPreset}** and exit uses **${heroAssetExitPreset}**; reduced motion keeps it static. If you used Upload asset in the demo, replace the blob URL in the copied example with a project file path or hosted URL. Text z-index is ${calibratedHeroTextZIndex}.` : `Asset is off or missing a source. Enable **Show hero asset** and set or upload an asset to include it in the copied example.`}

## Hero asset 2
${exportHeroAsset2Enabled ? `Second asset layer is included (width ${calibratedHeroAsset2Width}px, scale ${heroAsset2Scale.toFixed(2)}x, offset ${calibratedHeroAsset2OffsetX}px/${calibratedHeroAsset2OffsetY}px, z-index ${calibratedHeroAsset2ZIndex}). Entry uses **${heroAsset2EnterPreset}** and exit uses **${heroAsset2ExitPreset}**. If you used Upload asset in the demo, replace the blob URL in the copied example with a project file path or hosted URL.` : `Second asset is off or missing a source. Enable **Hero Asset 2** and set or upload an asset to include it in the copied example.`}

## Edge fades
Intro fade size is ${Math.round(introEdgeFadeSizePercent)}% with z-index ${introEdgeFadeZIndex}. Parallax fade size is ${Math.round(parallaxEdgeFadeSizePercent)}% with z-index ${parallaxEdgeFadeZIndex}.
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
            collagePauseVh={collagePauseVh}
            onCollagePauseVhChange={setCollagePauseVh}
            introHeightVh={introHeightVh}
            onIntroHeightVhChange={setIntroHeightVh}
            heroFontFamily={heroFontFamily}
            onHeroFontFamilyChange={setHeroFontFamily}
            heroHeadingText={heroHeadingText}
            onHeroHeadingTextChange={setHeroHeadingText}
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
            heroCreativeStyle={heroCreativeStyle}
            onHeroCreativeStyleChange={setHeroCreativeStyle}
            heroEffectIntensity={heroEffectIntensity}
            onHeroEffectIntensityChange={setHeroEffectIntensity}
            heroEffectSpeedSeconds={heroEffectSpeedSeconds}
            onHeroEffectSpeedSecondsChange={setHeroEffectSpeedSeconds}
            heroSunsetMeshUseBackground={heroSunsetMeshUseBackground}
            onHeroSunsetMeshUseBackgroundChange={setHeroSunsetMeshUseBackground}
            heroTextEnterPreset={heroTextEnterPreset}
            onHeroTextEnterPresetChange={setHeroTextEnterPreset}
            heroTextEnterEase={heroTextEnterEase}
            onHeroTextEnterEaseChange={setHeroTextEnterEase}
            heroTextEnterDurationSec={heroTextEnterDurationSec}
            onHeroTextEnterDurationSecChange={setHeroTextEnterDurationSec}
            heroScrollFadeEnabled={heroScrollFadeEnabled}
            onHeroScrollFadeEnabledChange={setHeroScrollFadeEnabled}
            heroScrollFadeStart={heroScrollFadeStart}
            onHeroScrollFadeStartChange={setHeroScrollFadeStart}
            heroScrollFadeEnd={heroScrollFadeEnd}
            onHeroScrollFadeEndChange={setHeroScrollFadeEnd}
            heroScrollFadeCurve={heroScrollFadeCurve}
            onHeroScrollFadeCurveChange={setHeroScrollFadeCurve}
            heroTextZIndex={heroTextZIndex}
            onHeroTextZIndexChange={setHeroTextZIndex}
            introEdgeFade={introEdgeFade}
            onIntroEdgeFadeChange={setIntroEdgeFade}
            introEdgeFadeSizePercent={introEdgeFadeSizePercent}
            onIntroEdgeFadeSizePercentChange={setIntroEdgeFadeSizePercent}
            introEdgeFadeZIndex={introEdgeFadeZIndex}
            onIntroEdgeFadeZIndexChange={setIntroEdgeFadeZIndex}
            heroAssetEnabled={heroAssetEnabled}
            onHeroAssetEnabledChange={setHeroAssetEnabled}
            heroAssetSrc={heroAssetSrc}
            onHeroAssetSrcChange={setHeroAssetSrc}
            heroAssetAlt={heroAssetAlt}
            onHeroAssetAltChange={setHeroAssetAlt}
            heroAssetScale={heroAssetScale}
            onHeroAssetScaleChange={setHeroAssetScale}
            heroAssetWidthPx={heroAssetWidthPx}
            onHeroAssetWidthPxChange={setHeroAssetWidthPx}
            heroAssetOffsetXPx={heroAssetOffsetXPx}
            onHeroAssetOffsetXPxChange={setHeroAssetOffsetXPx}
            heroAssetOffsetYPx={heroAssetOffsetYPx}
            onHeroAssetOffsetYPxChange={setHeroAssetOffsetYPx}
            heroAssetZIndex={heroAssetZIndex}
            onHeroAssetZIndexChange={setHeroAssetZIndex}
            parallaxEdgeFade={parallaxEdgeFade}
            onParallaxEdgeFadeChange={setParallaxEdgeFade}
            parallaxEdgeFadeSizePercent={parallaxEdgeFadeSizePercent}
            onParallaxEdgeFadeSizePercentChange={setParallaxEdgeFadeSizePercent}
            parallaxEdgeFadeZIndex={parallaxEdgeFadeZIndex}
            onParallaxEdgeFadeZIndexChange={setParallaxEdgeFadeZIndex}
            heroAssetEnterPreset={heroAssetEnterPreset}
            onHeroAssetEnterPresetChange={setHeroAssetEnterPreset}
            heroAssetEnterEase={heroAssetEnterEase}
            onHeroAssetEnterEaseChange={setHeroAssetEnterEase}
            heroAssetEnterDurationSec={heroAssetEnterDurationSec}
            onHeroAssetEnterDurationSecChange={setHeroAssetEnterDurationSec}
            heroAssetExitPreset={heroAssetExitPreset}
            onHeroAssetExitPresetChange={setHeroAssetExitPreset}
            heroAssetExitEase={heroAssetExitEase}
            onHeroAssetExitEaseChange={setHeroAssetExitEase}
            heroAssetExitStart={heroAssetExitStart}
            onHeroAssetExitStartChange={setHeroAssetExitStart}
            heroAssetExitEnd={heroAssetExitEnd}
            onHeroAssetExitEndChange={setHeroAssetExitEnd}
            heroAsset2Enabled={heroAsset2Enabled}
            onHeroAsset2EnabledChange={setHeroAsset2Enabled}
            heroAsset2Src={heroAsset2Src}
            onHeroAsset2SrcChange={setHeroAsset2Src}
            heroAsset2Alt={heroAsset2Alt}
            onHeroAsset2AltChange={setHeroAsset2Alt}
            heroAsset2Scale={heroAsset2Scale}
            onHeroAsset2ScaleChange={setHeroAsset2Scale}
            heroAsset2WidthPx={heroAsset2WidthPx}
            onHeroAsset2WidthPxChange={setHeroAsset2WidthPx}
            heroAsset2OffsetXPx={heroAsset2OffsetXPx}
            onHeroAsset2OffsetXPxChange={setHeroAsset2OffsetXPx}
            heroAsset2OffsetYPx={heroAsset2OffsetYPx}
            onHeroAsset2OffsetYPxChange={setHeroAsset2OffsetYPx}
            heroAsset2ZIndex={heroAsset2ZIndex}
            onHeroAsset2ZIndexChange={setHeroAsset2ZIndex}
            heroAsset2EnterPreset={heroAsset2EnterPreset}
            onHeroAsset2EnterPresetChange={setHeroAsset2EnterPreset}
            heroAsset2EnterEase={heroAsset2EnterEase}
            onHeroAsset2EnterEaseChange={setHeroAsset2EnterEase}
            heroAsset2EnterDurationSec={heroAsset2EnterDurationSec}
            onHeroAsset2EnterDurationSecChange={setHeroAsset2EnterDurationSec}
            heroAsset2ExitPreset={heroAsset2ExitPreset}
            onHeroAsset2ExitPresetChange={setHeroAsset2ExitPreset}
            heroAsset2ExitEase={heroAsset2ExitEase}
            onHeroAsset2ExitEaseChange={setHeroAsset2ExitEase}
            heroAsset2ExitStart={heroAsset2ExitStart}
            onHeroAsset2ExitStartChange={setHeroAsset2ExitStart}
            heroAsset2ExitEnd={heroAsset2ExitEnd}
            onHeroAsset2ExitEndChange={setHeroAsset2ExitEnd}
            imageBorderRadiusPx={imageBorderRadiusPx}
            onImageBorderRadiusPxChange={setImageBorderRadiusPx}
            backgroundVariant={backgroundVariant}
            onBackgroundVariantChange={handleBackgroundVariantChange}
            backgroundColors={backgroundColors}
            onBackgroundColorsChange={handleBackgroundColorsChange}
            heroBackgroundVariant={heroBackgroundVariant}
            onHeroBackgroundVariantChange={handleHeroBackgroundVariantChange}
            heroBackgroundColors={heroBackgroundColors}
            onHeroBackgroundColorsChange={handleHeroBackgroundColorsChange}
            linkHeroParallaxBackgrounds={linkHeroParallaxBackgrounds}
            onLinkHeroParallaxBackgroundsChange={handleLinkHeroParallaxBackgroundsChange}
            backgroundScope={backgroundScope}
            onBackgroundScopeChange={setBackgroundScope}
            dynamicImageMode={dynamicImageMode}
            onDynamicImageModeChange={setDynamicImageMode}
            centerImageStaticInDynamicMode={centerImageStaticInDynamicMode}
            onCenterImageStaticInDynamicModeChange={setCenterImageStaticInDynamicMode}
            dynamicImageSwitchEveryVh={dynamicImageSwitchEveryVh}
            onDynamicImageSwitchEveryVhChange={setDynamicImageSwitchEveryVh}
            images={images}
            onImagesChange={setImages}
            onResetImagesToDefaults={handleResetDemoImages}
          />
        </div>
      </main>
    </div>
  );
}
