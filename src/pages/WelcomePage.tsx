import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GENERAL_SUGGESTIONS } from '../data/chatResponses';
import './WelcomePage.css';

const CAPABILITIES = [
  {
    id: 'chat',
    title: 'TB4L Chat',
    description: 'Ask questions grounded in the TB4L framework',
    to: '/chat',
    status: 'live' as const,
    accent: 'chat' as const,
  },
  {
    id: 'hub',
    title: 'TB4L Hub',
    description: 'Browse trusted playbooks, templates, and training',
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
          <div className="welcome-hero__intro">
            <p className="welcome-hero__greeting welcome-hero__anim">Welcome back, Aleksandra</p>
            <h1 id="welcome-heading" className="welcome-hero__tagline welcome-hero__anim">
              Build stronger brands with trusted knowledge and AI guidance
            </h1>
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
          <p className="welcome-ask__lede">
            Start with a question—Chat is your day-to-day guide for Trusted Brands for Life.
          </p>
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

      <section className="welcome-hub-spotlight" aria-labelledby="hub-spotlight-heading">
        <div className="welcome-hub-spotlight__inner">
          <div className="welcome-hub-spotlight__copy">
            <p className="welcome-hub-spotlight__eyebrow">TB4L Hub</p>
            <h2 id="hub-spotlight-heading" className="welcome-hub-spotlight__title">
              Curated content for brand managers
            </h2>
            <p className="welcome-hub-spotlight__text">
              Browse Playbooks, Templates, Training, and Accelerator Outputs—plus Glossary, Brand
              Frames, and Teams. Select documents, then use them in TB4L Chat for grounded answers.
            </p>
          </div>
          <Link className="btn btn-primary welcome-hub-spotlight__cta" to="/knowledge-hub">
            Open TB4L Hub
          </Link>
        </div>
      </section>

      <section className="welcome-guide" aria-labelledby="welcome-guide-heading">
        <div className="welcome-guide__inner">
          <div className="welcome-guide__intro">
            <p className="welcome-guide__eyebrow">Hub + Chat</p>
            <h2 id="welcome-guide-heading" className="welcome-guide__title">
              Ground your questions in trusted TB4L content
            </h2>
            <p className="welcome-guide__lede">
              Hub holds curated documents. Chat answers from those sources—so replies stay aligned
              to approved playbooks, templates, and training.
            </p>
          </div>

          <ol className="welcome-guide__steps">
            <li className="welcome-guide__step">
              <span className="welcome-guide__num" aria-hidden="true">
                1
              </span>
              <div className="welcome-guide__step-body">
                <h3 className="welcome-guide__step-title">Browse the Hub</h3>
                <p className="welcome-guide__step-text">
                  Open Playbooks, Templates, Training, or Brand Frames and find the documents you
                  need.
                </p>
                <Link className="welcome-guide__step-link" to="/knowledge-hub">
                  Open TB4L Hub
                </Link>
              </div>
            </li>
            <li className="welcome-guide__step">
              <span className="welcome-guide__num" aria-hidden="true">
                2
              </span>
              <div className="welcome-guide__step-body">
                <h3 className="welcome-guide__step-title">Select your sources</h3>
                <p className="welcome-guide__step-text">
                  Check one or more documents. Review AI summaries first if you want a quick read.
                </p>
                <Link className="welcome-guide__step-link" to="/knowledge-hub/playbooks">
                  Start with Playbooks
                </Link>
              </div>
            </li>
            <li className="welcome-guide__step">
              <span className="welcome-guide__num" aria-hidden="true">
                3
              </span>
              <div className="welcome-guide__step-body">
                <h3 className="welcome-guide__step-title">Ask in Chat</h3>
                <p className="welcome-guide__step-text">
                  Tap <strong>Use in Chat</strong>, then ask about recommendations, comparisons, or
                  what a Brand Manager should focus on.
                </p>
                <Link className="welcome-guide__step-link" to="/chat">
                  Go to TB4L Chat
                </Link>
              </div>
            </li>
          </ol>

          <p className="welcome-guide__example">
            Example: select the Brand Planning Playbook, then ask
            <button
              type="button"
              className="welcome-guide__example-ask"
              onClick={() => goToChat('Summarize key recommendations from my selected documents.')}
            >
              “Summarize key recommendations from my selected documents.”
            </button>
          </p>
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
