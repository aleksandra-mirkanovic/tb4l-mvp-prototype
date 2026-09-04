import { NavLink } from 'react-router-dom';
import { HUB_SECTIONS } from '../data/sections';
import './HubSectionNav.css';

/** Knowledge sections for Hub nav — Sources & Team are dedicated nav items. */
const NAV_SECTIONS = HUB_SECTIONS;

export type HubSectionNavMode = 'full' | 'minimal';

type HubSectionNavProps = {
  /**
   * `full` — Overview + knowledge categories + Browse all + Sources + TB4L Team (default).
   * `minimal` — Overview + Browse all only.
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
      <span className="hub-section-nav__divider" aria-hidden="true" />
      <NavLink
        to="/knowledge-hub/sources"
        className={({ isActive }) =>
          [
            'hub-section-nav__link',
            'hub-section-nav__link--sources',
            isActive ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        Sources
      </NavLink>
      <span className="hub-section-nav__divider" aria-hidden="true" />
      <NavLink
        to="/knowledge-hub/team"
        className={({ isActive }) =>
          [
            'hub-section-nav__link',
            'hub-section-nav__link--team',
            isActive ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        TB4L Team
      </NavLink>
    </nav>
  );
}
