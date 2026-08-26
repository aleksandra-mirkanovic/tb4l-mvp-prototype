import { NavLink } from 'react-router-dom';
import './AppHeader.css';

export function AppHeader() {
  return (
    <header className="app-header" role="banner">
      <div className="app-header__inner">
        <NavLink to="/" className="app-header__brand" end>
          <span className="app-header__mark" aria-hidden="true">
            TB
          </span>
          <div>
            <div className="app-header__title">TB4L</div>
            <div className="app-header__subtitle">Trusted Brands for Life</div>
          </div>
        </NavLink>
        <p className="app-header__prototype" aria-label="Prototype label">
          MVP Prototype · Mocked data
        </p>
      </div>
      <nav className="main-nav" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'main-nav__link is-active' : 'main-nav__link')}>
          Welcome
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive ? 'main-nav__link main-nav__link--chat is-active' : 'main-nav__link main-nav__link--chat'
          }
        >
          TB4L Chat
        </NavLink>
        <NavLink
          to="/knowledge-hub"
          className={({ isActive }) =>
            isActive ? 'main-nav__link main-nav__link--hub is-active' : 'main-nav__link main-nav__link--hub'
          }
        >
          TB4L Hub
        </NavLink>
        <span
          className="main-nav__link main-nav__link--soon main-nav__link--m360"
          aria-disabled="true"
          title="Coming soon"
        >
          AIssistant
          <span className="main-nav__soon-badge">Coming soon</span>
        </span>
      </nav>
    </header>
  );
}
