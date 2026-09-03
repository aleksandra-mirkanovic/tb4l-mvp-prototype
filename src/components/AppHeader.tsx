import { NavLink } from 'react-router-dom';
import tb4lLogo from '../assets/tb4l-logo-header.png';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileMenu } from './UserProfileMenu';
import './AppHeader.css';

export function AppHeader() {
  return (
    <header className="app-header" role="banner">
      <div className="app-header__inner">
        <NavLink to="/" className="app-header__brand" end aria-label="TB4L Home">
          <img
            className="app-header__logo"
            src={tb4lLogo}
            alt=""
            width={160}
            height={40}
            decoding="async"
          />
          <span className="app-header__brand-text">Trusted Brands for Life</span>
        </NavLink>
        <div className="app-header__tools">
          <p className="app-header__prototype" aria-label="Prototype label">
            MVP Prototype · Mocked data
          </p>
          <ThemeToggle />
          <UserProfileMenu />
        </div>
      </div>
      <nav className="main-nav" aria-label="Primary">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'main-nav__link main-nav__link--home is-active' : 'main-nav__link main-nav__link--home'
          }
        >
          TB4L Home
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
      </nav>
    </header>
  );
}
