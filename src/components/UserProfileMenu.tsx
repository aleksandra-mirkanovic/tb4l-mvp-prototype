import { useEffect, useId, useRef, useState } from 'react';
import {
  fetchMockEntraProfile,
  getEntraInitials,
  type EntraUserProfile,
} from '../data/entraUser';
import './UserProfileMenu.css';

export function UserProfileMenu() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<EntraUserProfile | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMockEntraProfile().then((profile) => {
      if (active) setUser(profile);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="user-profile user-profile--loading" aria-hidden="true">
        <span className="user-profile__avatar user-profile__avatar--skeleton" />
        <span className="user-profile__text">
          <span className="user-profile__line user-profile__line--skeleton" />
          <span className="user-profile__line user-profile__line--skeleton user-profile__line--short" />
        </span>
      </div>
    );
  }

  const initials = getEntraInitials(user);
  const showPhoto = Boolean(user.photoUrl) && !photoFailed;

  return (
    <div className="user-profile" ref={rootRef}>
      <button
        type="button"
        className={`user-profile__trigger${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-profile__avatar" aria-hidden="true">
          {showPhoto ? (
            <img
              src={user.photoUrl}
              alt=""
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <span className="user-profile__initials">{initials}</span>
          )}
        </span>
        <span className="user-profile__text">
          <span className="user-profile__name">{user.displayName}</span>
          <span className="user-profile__title">{user.jobTitle}</span>
        </span>
        <svg
          className="user-profile__chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div id={menuId} className="user-profile__menu" role="menu" aria-label="Account menu">
          <div className="user-profile__menu-head">
            <p className="user-profile__menu-name">{user.displayName}</p>
            <p className="user-profile__menu-meta">{user.mail}</p>
            <p className="user-profile__menu-note">Mocked Entra ID profile · no real sign-in</p>
          </div>
          <button type="button" className="user-profile__menu-item" role="menuitem" disabled>
            Account settings
          </button>
          <button type="button" className="user-profile__menu-item" role="menuitem" disabled>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
