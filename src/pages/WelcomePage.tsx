import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoadToBillionsMotif } from '../components/RoadToBillionsMotif';
import { GENERAL_SUGGESTIONS } from '../data/chatResponses';
import '../components/RoadToBillionsMotif.css';
import './WelcomePage.css';

const CAPABILITIES = [
  {
    id: 'chat',
    title: 'TB4L Chat',
    description: 'Your guide to the TB4L Framework',
    to: '/chat',
    status: 'live' as const,
    accent: 'chat' as const,
  },
  {
    id: 'hub',
    title: 'TB4L Hub',
    description: 'Discover trusted TB4L content',
    to: '/knowledge-hub',
    status: 'live' as const,
    accent: 'hub' as const,
  },
  {
    id: 'aissistant',
    title: 'AIssistant',
    description: 'AI support is coming soon',
    status: 'soon' as const,
    accent: 'm360' as const,
  },
  {
    id: 'future',
    title: 'Future releases',
    description: 'New capabilities on the horizon',
    status: 'soon' as const,
    accent: 'future' as const,
  },
];

export function WelcomePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');

  const goToChat = (question?: string) => {
    const trimmed = (question ?? draft).trim();
    if (trimmed) {
      sessionStorage.setItem(
        'tb4l-pending-ask',
        JSON.stringify({ q: trimmed, t: Date.now() }),
      );
      navigate('/chat');
      return;
    }
    navigate('/chat');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToChat();
  };

  return (
    <div className="welcome-page">
      <section className="welcome-hero" aria-labelledby="welcome-heading">
        <div className="welcome-hero__atmosphere" aria-hidden="true" />
        <div className="welcome-hero__shell">
          <div className="welcome-hero__layout">
            <div className="welcome-hero__copy">
              <p className="welcome-hero__greeting welcome-hero__anim">Welcome back, Deniz</p>
              <h1 id="welcome-heading" className="welcome-hero__brand welcome-hero__anim">
                TB4L Platform
              </h1>
              <p className="welcome-hero__support welcome-hero__anim">
                AI-powered capabilities supporting the Trusted Brands for Life framework.
              </p>
              <div className="welcome-hero__actions welcome-hero__anim">
                <Link className="btn welcome-hero__cta welcome-hero__cta--chat" to="/chat">
                  TB4L Chat
                </Link>
                <Link className="btn welcome-hero__cta welcome-hero__cta--hub" to="/knowledge-hub">
                  TB4L Hub
                </Link>
              </div>
            </div>
            <div className="welcome-hero__visual welcome-hero__anim">
              <RoadToBillionsMotif />
            </div>
          </div>
        </div>
      </section>

      <section className="welcome-ask-section" aria-labelledby="ask-heading">
        <div className="welcome-ask welcome-ask--panel">
          <p className="welcome-ask__eyebrow">
            <span className="badge badge-chat">TB4L Chat</span>
          </p>
          <h2 id="ask-heading" className="welcome-ask__title">
            How can I support your brand-building today?
          </h2>
          <div className="welcome-ask__suggestions">
            {GENERAL_SUGGESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="welcome-ask__chip"
                onClick={() => goToChat(question)}
              >
                {question}
              </button>
            ))}
          </div>
          <form className="welcome-ask__composer" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="welcome-ask-input">
              Ask TB4L Chat
            </label>
            <input
              id="welcome-ask-input"
              type="text"
              value={draft}
              placeholder="Ask about Trusted Brands for Life…"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="welcome-ask__send"
              aria-label="Start chat"
              disabled={!draft.trim()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      <nav className="welcome-capabilities" aria-label="Platform capabilities">
        <div className="welcome-capabilities__inner">
          <p className="welcome-capabilities__label">Platform capabilities</p>
          <ul className="welcome-capabilities__list">
            {CAPABILITIES.map((item) => {
              const body = (
                <>
                  <span
                    className={`welcome-capabilities__node welcome-capabilities__node--${item.accent}`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  {item.status === 'soon' ? (
                    <em className="welcome-capabilities__badge">Soon</em>
                  ) : null}
                </>
              );

              return (
                <li key={item.id}>
                  {item.status === 'live' && item.to ? (
                    <Link
                      className={`welcome-capabilities__link welcome-capabilities__link--${item.accent}`}
                      to={item.to}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      className={`welcome-capabilities__link welcome-capabilities__link--${item.accent} is-disabled`}
                      aria-disabled="true"
                    >
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
