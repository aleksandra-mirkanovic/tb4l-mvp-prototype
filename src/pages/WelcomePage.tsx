import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WelcomeVideoModal } from '../components/WelcomeVideoModal';
import { ORBIT_LAYOUT } from '../config/orbitTextWrap';
import { MOCK_ENTRA_USER } from '../data/entraUser';
import './WelcomePage.css';

const CHAT_CAPABILITIES = [
  'Ask framework-related questions',
  'Get AI-powered guidance',
  'Ground responses using Hub content',
  'Connect trusted data sources',
  'Accelerate decision making',
];

const HUB_CAPABILITIES = [
  'Browse approved content',
  'Search framework documentation',
  'Discover training materials',
  'Select sources for TB4L Chat',
  'Access trusted knowledge assets',
];

type OrbitPillar = {
  id: 'knowledge' | 'conversation' | 'data' | 'decisions';
  title: string;
  items: string[];
  place: 'east' | 'west' | 'north' | 'south';
  /** User journey step (1–4), clockwise from Hub knowledge */
  step: number;
  link?: 'hub' | 'chat';
};

const ORBIT_PILLARS: OrbitPillar[] = [
  {
    id: 'knowledge',
    title: 'Trusted Knowledge',
    items: ['Playbooks', 'Templates', 'Training', 'Glossary'],
    place: 'east',
    step: 1,
    link: 'hub',
  },
  {
    id: 'data',
    title: 'Data & Insights',
    items: ['M360', 'BHT', 'FICO', 'MMM'],
    place: 'south',
    step: 2,
  },
  {
    id: 'conversation',
    title: 'AI Conversation',
    items: ['Ask Questions', 'Explore Ideas', 'Learn Faster'],
    place: 'west',
    step: 3,
    link: 'chat',
  },
  {
    id: 'decisions',
    title: 'Better Decisions',
    items: ['Prioritize', 'Plan', 'Execute', 'Grow'],
    place: 'north',
    step: 4,
  },
];

/** Legend / path order matches the user journey. */
const PATH_ORDER: OrbitPillar['id'][] = [
  'knowledge',
  'data',
  'conversation',
  'decisions',
];

function PillarIcon({ id }: { id: OrbitPillar['id'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (id) {
    case 'knowledge':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'conversation':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'data':
      return (
        <svg {...common}>
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      );
    case 'decisions':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      );
    default:
      return null;
  }
}

export function WelcomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const legendItems = PATH_ORDER.map((id) => ORBIT_PILLARS.find((p) => p.id === id)!);

  return (
    <div className="tb4l-home">
      <section className="tb4l-home-hero" aria-labelledby="tb4l-home-heading">
        <div className="tb4l-home-hero__canvas" aria-hidden="true" />
        <div className="tb4l-home-hero__inner">
          <div className="tb4l-home-hero__copy">
            <p className="tb4l-home-hero__greeting">Welcome, {MOCK_ENTRA_USER.givenName}</p>
            <h1 id="tb4l-home-heading" className="tb4l-home-hero__title">
              Trusted Brands for Life AI Workspace
            </h1>
            <p className="tb4l-home-hero__lede">
              Access trusted TB4L knowledge through curated content and AI-powered assistance.
            </p>
          </div>
          <button
            type="button"
            className="tb4l-home-cta tb4l-home-cta--intro"
            onClick={() => setShowIntro(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch TB4L Intro
          </button>
        </div>
      </section>

      <section className="tb4l-home-parts" aria-labelledby="tb4l-parts-heading">
        <div className="tb4l-home-parts__inner">
          <header className="tb4l-home-parts__intro">
            <h2 id="tb4l-parts-heading">Two parts of TB4L</h2>
            <p>
              TB4L combines trusted knowledge with AI-powered guidance. Browse curated content in
              the Hub or ask questions directly in TB4L Chat.
            </p>
          </header>

          <div
            className={[
              'tb4l-home-bridge',
              ORBIT_LAYOUT === 'wrap' ? 'tb4l-home-bridge--wrap' : '',
              ORBIT_LAYOUT === 'safe-zone' ||
              ORBIT_LAYOUT === 'safe-suck' ||
              ORBIT_LAYOUT === 'dock'
                ? 'tb4l-home-bridge--safe'
                : '',
              ORBIT_LAYOUT === 'safe-suck' ? 'tb4l-home-bridge--safe-suck' : '',
              ORBIT_LAYOUT === 'dock' ? 'tb4l-home-bridge--dock' : '',
              ORBIT_LAYOUT === 'gap' ? 'tb4l-home-bridge--gap' : '',
              ORBIT_LAYOUT === 'exclusion' ? 'tb4l-home-bridge--exclusion' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <article className="tb4l-home-card tb4l-home-card--chat">
              <div className="tb4l-home-card__body">
                {ORBIT_LAYOUT === 'wrap' ? (
                  <span className="tb4l-home-card__wrap" aria-hidden="true" />
                ) : null}
                <p className="tb4l-home-card__badge">TB4L CHAT</p>
                <h3 className="tb4l-home-card__title">Ask questions and get trusted answers</h3>
                <p className="tb4l-home-card__desc">
                  TB4L Chat helps Brand Managers and teams navigate the TB4L framework faster. Ask
                  questions about frameworks, delivery stages, brand planning, Must Win Battles,
                  sustainability, or connected data sources.
                </p>
                <ul className="tb4l-home-card__list">
                  {CHAT_CAPABILITIES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <Link className="tb4l-home-cta tb4l-home-cta--chat" to="/chat">
                Open TB4L Chat
              </Link>
            </article>

            <aside className="tb4l-home-orbit" aria-labelledby="tb4l-orbit-heading">
              <div className="tb4l-home-orbit__stage">
                <div className="tb4l-home-orbit__rings" aria-hidden="true">
                  <span className="tb4l-home-orbit__ring tb4l-home-orbit__ring--outer" />
                  <span className="tb4l-home-orbit__ring tb4l-home-orbit__ring--mid" />
                  <span className="tb4l-home-orbit__ring tb4l-home-orbit__ring--inner" />
                </div>

                {/* Highlighted user path: Knowledge → Data → Chat → Decisions */}
                <svg
                  className="tb4l-home-orbit__path"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="orbitPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#624963" />
                      <stop offset="33%" stopColor="#286436" />
                      <stop offset="66%" stopColor="#d30f4b" />
                      <stop offset="100%" stopColor="#00607e" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="tb4l-home-orbit__path-track"
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                  />
                  <circle
                    className="tb4l-home-orbit__path-glow"
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="url(#orbitPathGrad)"
                  />
                  <circle
                    className="tb4l-home-orbit__path-flow"
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="url(#orbitPathGrad)"
                  />
                </svg>

                <div className="tb4l-home-orbit__core">
                  <p id="tb4l-orbit-heading" className="tb4l-home-orbit__eq">
                    Your path to better decisions
                  </p>
                </div>

                {ORBIT_PILLARS.map((pillar) => (
                  <div
                    key={pillar.id}
                    className={`tb4l-home-orbit__node tb4l-home-orbit__node--${pillar.place} tb4l-home-orbit__node--${pillar.id}`}
                    title={`${pillar.step}. ${pillar.title}`}
                  >
                    <span className="tb4l-home-orbit__step" aria-hidden="true">
                      {pillar.step}
                    </span>
                    <span className="tb4l-home-orbit__bubble">
                      <PillarIcon id={pillar.id} />
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            <article className="tb4l-home-card tb4l-home-card--hub">
              <div className="tb4l-home-card__body">
                {ORBIT_LAYOUT === 'wrap' ? (
                  <span className="tb4l-home-card__wrap" aria-hidden="true" />
                ) : null}
                <p className="tb4l-home-card__badge">TB4L HUB</p>
                <h3 className="tb4l-home-card__title">Discover trusted knowledge</h3>
                <p className="tb4l-home-card__desc">
                  TB4L Hub is the central knowledge repository containing approved playbooks,
                  templates, training materials, accelerator outputs, brand frames, glossaries, and
                  other trusted resources.
                </p>
                <ul className="tb4l-home-card__list">
                  {HUB_CAPABILITIES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <Link className="tb4l-home-cta tb4l-home-cta--hub" to="/knowledge-hub">
                Open TB4L Hub
              </Link>
            </article>
          </div>

          <div className="tb4l-home-orbit-legend">
            <p className="tb4l-home-orbit-legend__promise">
              Your path: Hub knowledge → data → Chat → better brand decisions
            </p>
            <ul className="tb4l-home-orbit-legend__grid">
              {legendItems.map((pillar) => (
                <li
                  key={`legend-${pillar.id}`}
                  className={`tb4l-home-orbit-legend__item tb4l-home-orbit-legend__item--${pillar.id}`}
                >
                  <span className="tb4l-home-orbit-legend__step" aria-hidden="true">
                    {pillar.step}
                  </span>
                  <span className="tb4l-home-orbit-legend__icon" aria-hidden="true">
                    <PillarIcon id={pillar.id} />
                  </span>
                  <div className="tb4l-home-orbit-legend__copy">
                    <p className="tb4l-home-orbit-legend__title">
                      {pillar.title}
                    </p>
                    <p className="tb4l-home-orbit-legend__items">{pillar.items.join(' · ')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {showIntro ? (
        <WelcomeVideoModal forceOpen onForceClose={() => setShowIntro(false)} />
      ) : null}
    </div>
  );
}
