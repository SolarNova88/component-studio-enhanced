import type { CSSProperties } from 'react';

export interface EdgeFadeConfig {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export const DEFAULT_EDGE_FADE_CONFIG: EdgeFadeConfig = {
  top: false,
  right: false,
  bottom: false,
  left: false,
};

export function mergeEdgeFadeConfig(raw: unknown): EdgeFadeConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_EDGE_FADE_CONFIG };
  const value = raw as Partial<EdgeFadeConfig>;
  return {
    top: !!value.top,
    right: !!value.right,
    bottom: !!value.bottom,
    left: !!value.left,
  };
}

export function edgeFadeMaskStyle(
  config: EdgeFadeConfig,
  insetPercent = 14,
): CSSProperties | undefined {
  if (!config.top && !config.right && !config.bottom && !config.left) return undefined;
  const inset = `${Math.max(0, Math.min(40, insetPercent))}%`;
  const layers = [
    config.top
      ? `linear-gradient(to bottom, transparent 0, black ${inset}, black 100%)`
      : 'linear-gradient(to bottom, black 0, black 100%)',
    config.right
      ? `linear-gradient(to left, transparent 0, black ${inset}, black 100%)`
      : 'linear-gradient(to left, black 0, black 100%)',
    config.bottom
      ? `linear-gradient(to top, transparent 0, black ${inset}, black 100%)`
      : 'linear-gradient(to top, black 0, black 100%)',
    config.left
      ? `linear-gradient(to right, transparent 0, black ${inset}, black 100%)`
      : 'linear-gradient(to right, black 0, black 100%)',
  ];

  return {
    WebkitMaskImage: layers.join(', '),
    maskImage: layers.join(', '),
    WebkitMaskComposite: 'source-in, source-in, source-in',
    maskComposite: 'intersect, intersect, intersect',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  };
}

export function hasEdgeFade(config: EdgeFadeConfig): boolean {
  return !!(config.top || config.right || config.bottom || config.left);
}

export interface EdgeFadeOverlayDef {
  key: 'top' | 'right' | 'bottom' | 'left';
  style: CSSProperties;
}

export function edgeFadeOverlayDefs(
  config: EdgeFadeConfig,
  sizePercent = 18,
  color = 'rgba(0, 0, 0, 0.95)',
): EdgeFadeOverlayDef[] {
  const size = `${Math.max(4, Math.min(40, sizePercent))}%`;
  const defs: EdgeFadeOverlayDef[] = [];
  if (config.top) {
    defs.push({
      key: 'top',
      style: {
        top: 0,
        left: 0,
        right: 0,
        height: size,
        background: `linear-gradient(to bottom, ${color} 0%, transparent 100%)`,
      },
    });
  }
  if (config.right) {
    defs.push({
      key: 'right',
      style: {
        top: 0,
        right: 0,
        bottom: 0,
        width: size,
        background: `linear-gradient(to left, ${color} 0%, transparent 100%)`,
      },
    });
  }
  if (config.bottom) {
    defs.push({
      key: 'bottom',
      style: {
        left: 0,
        right: 0,
        bottom: 0,
        height: size,
        background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
      },
    });
  }
  if (config.left) {
    defs.push({
      key: 'left',
      style: {
        top: 0,
        left: 0,
        bottom: 0,
        width: size,
        background: `linear-gradient(to right, ${color} 0%, transparent 100%)`,
      },
    });
  }
  return defs;
}
