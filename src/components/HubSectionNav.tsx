import { NavLink } from 'react-router-dom';
import { HUB_SECTIONS } from '../data/sections';
import './HubSectionNav.css';

/** Knowledge / Chat context sections only — Teams lives outside this nav. */
const NAV_SECTIONS = HUB_SECTIONS.filter((s) => s.kind !== 'team');

export type HubSectionNavMode = 'full' | 'minimal';

type HubSectionNavProps = {
  /**
   * `full` — Overview + every knowledge category + Browse all (default; section/browse pages).
   * `minimal` — Overview + Browse all only (Hub Overview when HUB_UX_FIXES).
   * Revert slim Overview nav: set HUB_UX_FIXES = false or pass mode="full".
   */
  mode?: HubSectionNavMode;
};

export function HubSectionNav({ mode = 'full' }: HubSectionNavProps) {
  const minimal = mode === 'minimal';

  return (
    <nav
      className={['hub-section-nav', minimal ? 'hub-section-nav--minimal' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="TB4L Hub sections"
    >
      <NavLink
        to="/knowledge-hub"
        end
        className={({ isActive }) =>
          isActive ? 'hub-section-nav__link is-active' : 'hub-section-nav__link'
        }
      >
        Overview
      </NavLink>
      {!minimal
        ? NAV_SECTIONS.map((section) => (
            <NavLink
              key={section.slug}
              to={`/knowledge-hub/${section.slug}`}
              className={({ isActive }) =>
                isActive ? 'hub-section-nav__link is-active' : 'hub-section-nav__link'
              }
            >
              {section.title}
            </NavLink>
          ))
        : null}
      <NavLink
        to="/knowledge-hub/browse"
        className={({ isActive }) =>
          isActive ? 'hub-section-nav__link is-active' : 'hub-section-nav__link'
        }
      >
        Browse all
      </NavLink>
    </nav>
  );
}
