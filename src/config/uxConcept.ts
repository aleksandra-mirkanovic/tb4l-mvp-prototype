/**
 * UX concept pass — Hub as NEW experience, Chat as familiar/improved.
 *
 * Assumptions baked into this concept:
 * - TB4L Chat already exists; this prototype shows an improved Chat
 *   (Hub sources + M360). Do not over-teach basic Chat.
 * - TB4L Hub is new — introduce and lead with it.
 * - Chat colors return toward brand purple (#624963); Hub uses teal (#00607E).
 *
 * TO REVERT (one step):
 *   Set `UX_CONCEPT` to `false` below, save, and refresh.
 */
export const UX_CONCEPT = true;

export function initUxConcept() {
  const root = document.documentElement;
  if (UX_CONCEPT) {
    root.setAttribute('data-ux', 'concept');
  } else {
    root.removeAttribute('data-ux');
  }
}
