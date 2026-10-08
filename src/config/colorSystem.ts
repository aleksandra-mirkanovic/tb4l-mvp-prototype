/**
 * Older palette previews — kept for easy rollback, but OFF while UI_IMPROVEMENTS is active.
 * Turning these on together with UI_IMPROVEMENTS causes conflicting styles.
 */
export const PREMIUM_TB4L_COLORS = false;

export function initColorSystem() {
  const root = document.documentElement;
  if (PREMIUM_TB4L_COLORS) {
    root.setAttribute('data-color-system', 'premium');
  } else {
    root.removeAttribute('data-color-system');
  }
}
