import { NavLink, useLocation } from 'react-router-dom';
import tb4lLogo from '../assets/tb4l-logo-header.png';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileMenu } from './UserProfileMenu';
import './AppHeader.css';

export function AppHeader() {
  const { pathname } = useLocation();
  const assistantOn = pathname === '/ai-assistant' || pathname.startsWith('/ai-assistant/');
  const assistantV2On = pathname === '/ai-assistant-v2' || pathname.startsWith('/ai-assistant-v2/');
  const assistantV3On = pathname === '/ai-assistant-v3' || pathname.startsWith('/ai-assistant-v3/');
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
          Home
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive ? 'main-nav__link main-nav__link--chat is-active' : 'main-nav__link main-nav__link--chat'
          }
        >
          Chat
        </NavLink>
        <NavLink
          to="/knowledge-hub"
          className={({ isActive }) =>
            isActive ? 'main-nav__link main-nav__link--hub is-active' : 'main-nav__link main-nav__link--hub'
          }
        >
          Hub
        </NavLink>
        <NavLink
          to="/ai-assistant/market"
          className={
            assistantOn
              ? 'main-nav__link main-nav__link--assistant is-active'
              : 'main-nav__link main-nav__link--assistant'
          }
        >
          AI Assistant
        </NavLink>
        <NavLink
          to="/ai-assistant-v2/market"
          className={
            assistantV2On
              ? 'main-nav__link main-nav__link--assistant-v2 is-active'
              : 'main-nav__link main-nav__link--assistant-v2'
          }
        >
          AI Assistant v2
        </NavLink>
        <NavLink
          to="/ai-assistant-v3/market"
          className={
            assistantV3On
              ? 'main-nav__link main-nav__link--assistant-v3 is-active'
              : 'main-nav__link main-nav__link--assistant-v3'
          }
        >
          AI Assistant v3
        </NavLink>
      </nav>
    </header>
  );
}
