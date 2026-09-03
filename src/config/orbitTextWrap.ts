/**
 * Home orbit layout between Chat and Hub cards.
 *
 * Modes:
 *   'default'    — original side padding only
 *   'wrap'       — text wraps around the circle (shape-outside)
 *   'safe-zone'  — earlier symmetric inset experiment
 *   'safe-suck'  — funnel experiment
 *   'dock'       — dock ports experiment
 *   'gap'        — gap-sized circle experiment
 *   'exclusion'  — recommended: overlapping circle + left-aligned mirrored
 *                  panels with fixed keep-out (circle does not reshape text)
 *
 * Circle stays in front of the cards. Change the mode, save, refresh to switch.
 * TO REVERT: set `ORBIT_LAYOUT` back to `'default'`.
 */
export type OrbitLayout =
  | 'default'
  | 'wrap'
  | 'safe-zone'
  | 'safe-suck'
  | 'dock'
  | 'gap'
  | 'exclusion';

/** Recommended — left-aligned mirrored panels with overlapping orbit. */
export const ORBIT_LAYOUT: OrbitLayout = 'exclusion';

/** @deprecated Use ORBIT_LAYOUT === 'wrap' */
export const ORBIT_TEXT_WRAP = ORBIT_LAYOUT === 'wrap';
