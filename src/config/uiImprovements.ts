/**
 * Active TB4L visual system.
 *
 * Brand anchors:
 *   #10384F Navy · #00607E Teal · #624963 Purple · #286436 Green · #D30F4B Magenta · #D9D9D9 Gray
 *
 * TO REVERT: set `UI_IMPROVEMENTS` to `false`, save, refresh.
 */
export const UI_IMPROVEMENTS = true;

export function initUiImprovements() {
  const root = document.documentElement;
  if (UI_IMPROVEMENTS) {
    root.setAttribute('data-ui', 'improved');
  } else {
    root.removeAttribute('data-ui');
  }
}
