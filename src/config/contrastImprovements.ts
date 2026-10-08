/**
 * Contrast overlay — OFF while UI_IMPROVEMENTS owns tokens (avoids stacked overrides).
 * Set to true only if UI_IMPROVEMENTS is false.
 */
export const CONTRAST_IMPROVEMENTS = false;

export function initContrastImprovements() {
  const root = document.documentElement;
  if (CONTRAST_IMPROVEMENTS) {
    root.setAttribute('data-contrast', 'improved');
  } else {
    root.removeAttribute('data-contrast');
  }
}
