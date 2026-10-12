/**
 * Market story chart color mode.
 *
 * `balanced` (default): three rules — slate size, Bayer step, green/amber change.
 * `legacy`: previous washed-gray level bars + louder need-state accents.
 *
 * TO REVERT (one step):
 *   Set `M360_CHART_COLOR_MODE` to `'legacy'` below, save, and refresh.
 *
 * Charts covered (V3) — no per–need-state rainbow:
 *   Top 10, Who holds, Classic vs Advance size  → level (+ Bayer step)
 *   Attractiveness size / Channel drivers (+)    → level
 *   Channel movers, share-change, EVI, growth %  → change (green/amber)
 *   Attractiveness growth pace                   → change vs category
 *   Dual measures (value/packs, price/volume)    → labels + opacity; amber if neg
 */
export type M360ChartColorMode = 'balanced' | 'legacy';

export const M360_CHART_COLOR_MODE: M360ChartColorMode = 'balanced';
