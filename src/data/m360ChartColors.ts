/**
 * Market story chart color encoding — single source of truth.
 *
 * Mode switch: `src/config/m360ChartColors.ts` → `M360_CHART_COLOR_MODE`
 *   'balanced' | 'legacy'  (legacy = easy revert)
 *
 * Three jobs on V3 (keep them separate):
 * 1. LEVEL / SIZE — soft slate bars; Bayer one step richer (same family), not neon “good”
 * 2. CHANGE — green up / amber down / muted flat
 * 3. STATUS — action card tokens (not bar fills)
 *
 * Need-state palette kept for legacy / Classic report only — V3 uses labels, not hue.
 */

import { M360_CHART_COLOR_MODE, type M360ChartColorMode } from '../config/m360ChartColors';

type ChartTokens = {
  levelBar: string;
  levelBarBayer: string;
  /** Dual-series charts when a second slate tone is useful */
  seriesA: string;
  seriesB: string;
  /** Category / set total in multi-series charts */
  category: string;
  gain: string;
  loss: string;
  flat: string;
  gainText: string;
  lossText: string;
  bayerAccent: string;
  bayerDeep: string;
  statusGood: string;
  statusWatch: string;
  statusBad: string;
  /** Legacy / Classic only — not used on Market V3 */
  segmentPalette: readonly [string, string, string, string];
};

const BALANCED: ChartTokens = {
  /** Soft blue-slate — readable on dark, not gray mush */
  levelBar: '#5c7d90',
  /** Same family, one step richer — ownership, not performance */
  levelBarBayer: '#3a8aa3',
  seriesA: '#5c7d90',
  seriesB: '#8aa4b3',
  category: '#5c7d90',
  gain: '#6fd48a',
  loss: '#f0a15c',
  flat: '#8b9aab',
  gainText: '#3d9a5c',
  lossText: '#c47a3a',
  bayerAccent: '#4ec3e0',
  bayerDeep: '#00607e',
  statusGood: '#286436',
  statusWatch: '#c45c26',
  statusBad: '#d30f4b',
  segmentPalette: ['#5eb8d4', '#b895d4', '#6bc48a', '#e09a5c'],
};

const LEGACY: ChartTokens = {
  levelBar: 'color-mix(in srgb, var(--text-muted) 38%, transparent)',
  levelBarBayer: 'color-mix(in srgb, var(--text-muted) 38%, transparent)',
  seriesA: '#00607e',
  seriesB: '#4ec3e0',
  category: '#00607e',
  gain: '#6fd48a',
  loss: '#f0a15c',
  flat: '#8b9aab',
  gainText: '#3d9a5c',
  lossText: '#c47a3a',
  bayerAccent: '#4ec3e0',
  bayerDeep: '#00607e',
  statusGood: '#286436',
  statusWatch: '#c45c26',
  statusBad: '#d30f4b',
  segmentPalette: ['#4ec3e0', '#c9a0e8', '#6fd48a', '#f0a15c'],
};

const BY_MODE: Record<M360ChartColorMode, ChartTokens> = {
  balanced: BALANCED,
  legacy: LEGACY,
};

export const M360_CHART = BY_MODE[M360_CHART_COLOR_MODE];

export const M360_SEGMENT_PALETTE = M360_CHART.segmentPalette;

export function m360SegmentColor(segmentIndex: number): string {
  const i = segmentIndex >= 0 ? segmentIndex % M360_SEGMENT_PALETTE.length : 0;
  return M360_SEGMENT_PALETTE[i];
}

/** Tooltip / accent for a change value (not ownership). */
export function m360ChangeColor(delta: number | null | undefined, pivot = 0): string {
  if (delta == null || !Number.isFinite(delta)) return M360_CHART.flat;
  if (delta > pivot) return M360_CHART.gain;
  if (delta < pivot) return M360_CHART.loss;
  return M360_CHART.flat;
}

/** CSS data-attribute value for story root — pairs with M360Report.css. */
export function m360ChartColorModeAttr(): M360ChartColorMode {
  return M360_CHART_COLOR_MODE;
}
