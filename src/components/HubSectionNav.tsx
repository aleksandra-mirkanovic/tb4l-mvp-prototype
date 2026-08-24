import { NavLink } from 'react-router-dom';
import { HUB_SECTIONS } from '../data/sections';
import './HubSectionNav.css';

export function HubSectionNav() {
  return (
    <nav className="hub-section-nav" aria-label="TB4L Hub sections">
      <NavLink
        to="/knowledge-hub"
        end
        className={({ isActive }) =>
          isActive ? 'hub-section-nav__link is-active' : 'hub-section-nav__link'
        }
      >
        Overview
      </NavLink>
      {HUB_SECTIONS.map((section) => (
        <NavLink
          key={section.slug}
          to={`/knowledge-hub/${section.slug}`}
          className={({ isActive }) =>
            isActive ? 'hub-section-nav__link is-active' : 'hub-section-nav__link'
          }
        >
          {section.title}
        </NavLink>
      ))}
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
