import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HubSectionNav } from '../components/HubSectionNav';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { HUB_UX_FIXES } from '../config/hubUxFixes';
import { useApp } from '../context/AppContext';
import { DATA_SOURCES, type DataSourceStatus } from '../data/dataSources';
import { DOCUMENTS, getDocumentById } from '../data/documents';
import { GLOSSARY_TERMS } from '../data/glossary';
import { HUB_SECTIONS, matchesHubCategory, type HubSection } from '../data/sections';
import { TEAM_MEMBERS } from '../data/team';
import type { KnowledgeDocument } from '../types';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';
import './hub-ux-fixes.css';

const POPULAR_SEARCHES = [
  'Brand Frames',
  'Must Win Battles',
  'Discover playbook',
  'Workshop template',
  'Road to Billions',
];

const RECENT_SEARCHES = ['Brand Equity', 'Accelerator roadmap', 'TB4L glossary'];

const QUICK_CATEGORIES = HUB_SECTIONS.filter((s) => s.kind !== 'team').map((s) => ({
  id: s.slug,
  title: s.title,
  to: `/knowledge-hub/${s.slug}`,
}));

const STARTER_DOC_IDS = ['doc-2', 'doc-11', 'doc-6'];

const STATUS_LABEL: Record<DataSourceStatus, string> = {
  connected: 'Connected',
  coming_soon: 'Available soon',
  planned: 'Planned',
  unavailable: 'Unavailable',
};

type CategoryMeta = {
  id: string;
  title: string;
  description: string;
  to: string;
  assetCount: number;
  countNoun: string;
};

function docsForSection(section: HubSection): KnowledgeDocument[] {
  if (!section.category) return [];
  return DOCUMENTS.filter((d) => matchesHubCategory(d.category, section.category!));
}

function countLabel(count: number, noun: string) {
  const singular = noun.endsWith('s') ? noun.slice(0, -1) : noun;
  const word = count === 1 ? singular : noun;
  return `${count} ${word}`;
}

function buildCategories(): CategoryMeta[] {
  const fromSections: CategoryMeta[] = HUB_SECTIONS.map((section) => {
    if (section.kind === 'glossary') {
      return {
        id: section.slug,
        title: section.title,
        description: section.tagline,
        to: `/knowledge-hub/${section.slug}`,
        assetCount: GLOSSARY_TERMS.length,
        countNoun: 'Terms',
      };
    }
    if (section.kind === 'team') {
      return {
        id: section.slug,
        title: section.title,
        description: section.tagline,
        to: `/knowledge-hub/${section.slug}`,
        assetCount: TEAM_MEMBERS.length,
        countNoun: 'Contacts',
      };
    }
    const docs = docsForSection(section);
    return {
      id: section.slug,
      title: section.title,
      description: section.tagline,
      to: `/knowledge-hub/${section.slug}`,
      assetCount: docs.length,
      countNoun: 'Assets',
    };
  });

  const outputDocs = DOCUMENTS.filter((d) => d.category === 'Global Best Practices');
  const outputsCard: CategoryMeta = {
    id: 'outputs',
    title: 'Outputs',
    description: 'Completed deliverables, analyses, and project outcomes.',
    to: '/knowledge-hub/browse',
    assetCount: outputDocs.length || DOCUMENTS.filter((d) => d.category === 'Brand & Strategy').length,
    countNoun: 'Examples',
  };

  const accelIdx = fromSections.findIndex((c) => c.id === 'accelerator-outputs');
  const ordered = [...fromSections];
  ordered.splice(accelIdx + 1, 0, outputsCard);
  return ordered;
}

function CategoryIcon({ id }: { id: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (id) {
    case 'playbooks':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'templates':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'tb4l-training':
      return (
        <svg {...common}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case 'accelerator-outputs':
      return (
        <svg {...common}>
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'outputs':
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case 'brand-frames':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'tb4l-glossary':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      );
    case 'team':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
  }
}

function resolveStarterDocs(): KnowledgeDocument[] {
  const byId = STARTER_DOC_IDS.map((id) => getDocumentById(id)).filter(
    (d): d is KnowledgeDocument => Boolean(d),
  );
  if (byId.length >= 2) return byId.slice(0, 3);

  const preferred = ['Brand Planning Playbook', 'TB4L Training Module', 'Brand Frames Quality Checklist'];
  const found = preferred
    .map((title) => DOCUMENTS.find((d) => d.title === title))
    .filter((d): d is KnowledgeDocument => Boolean(d));
  if (found.length) return found.slice(0, 3);
  return DOCUMENTS.slice(0, 3);
}

export function KnowledgeHubClassicPage() {
  const navigate = useNavigate();
  const {
    selectedDocumentIds,
    toggleDocumentSelection,
    selectDocument,
    clearDocumentSelection,
    setActiveSourcesFromSelection,
  } = useApp();

  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(RECENT_SEARCHES);

  const categories = useMemo(() => buildCategories(), []);
  const selectedDocs = useMemo(
    () =>
      selectedDocumentIds
        .map((id) => getDocumentById(id))
        .filter((d): d is KnowledgeDocument => Boolean(d)),
    [selectedDocumentIds],
  );
  const starterDocs = useMemo(() => resolveStarterDocs(), []);

  const runSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setRecent((prev) => [q, ...prev.filter((r) => r !== q)].slice(0, 5));
    navigate(`/knowledge-hub/browse?q=${encodeURIComponent(q)}`);
  };

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const askInChat = () => {
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  const addStarterSet = () => {
    starterDocs.forEach((d) => selectDocument(d.id));
  };

  return (
    <div
      className={[
        'hub-page',
        'hub-page--workspace',
        'hub-page--ecosystem',
        'section-page',
        'section-page--purple',
        HUB_UX_FIXES ? 'hub-page--ux-fixes' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!HUB_UX_FIXES ? (
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'TB4L Hub' },
          ]}
        />
      ) : null}

      {/* Full strip when fixes off; Overview drops nav entirely (Library link near categories) */}
      {!HUB_UX_FIXES ? <HubSectionNav mode="full" /> : null}

      {/* SECTION 1 — Compact discovery (workspace, not landing) */}
      <header className="hub-ws-hero">
        {HUB_UX_FIXES ? (
          <h1 className="visually-hidden">TB4L Hub</h1>
        ) : (
          <div className="hub-ws-hero__intro">
            <h1 className="hub-ws-hero__title">Find trusted TB4L knowledge</h1>
            <p className="hub-ws-hero__lede">
              Select sources for Chat, then combine with connected enterprise data.
            </p>
          </div>
        )}

        <div className="hub-ws-discover">
          <form className="hub-ws-search" onSubmit={onSearchSubmit} role="search">
            <label className="visually-hidden" htmlFor="hub-global-search">
              Search trusted TB4L knowledge
            </label>
            <input
              id="hub-global-search"
              className="hub-ws-search__input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                HUB_UX_FIXES
                  ? 'Search trusted TB4L knowledge…'
                  : 'Search playbooks, templates, training, glossaries…'
              }
              autoComplete="off"
            />
            <button type="submit" className="btn hub-ws-search__submit">
              Search
            </button>
          </form>

          <div className="hub-ws-hints">
            <div className="hub-ws-hints__row">
              <span className="hub-ws-hints__label">Popular</span>
              <ul className="hub-ws-hints__chips">
                {POPULAR_SEARCHES.map((term) => (
                  <li key={term}>
                    <button type="button" className="hub-ws-chip" onClick={() => runSearch(term)}>
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {!HUB_UX_FIXES ? (
              <div className="hub-ws-hints__row">
                <span className="hub-ws-hints__label">Recent</span>
                <ul className="hub-ws-hints__chips">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="hub-ws-chip hub-ws-chip--muted"
                        onClick={() => runSearch(term)}
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!HUB_UX_FIXES ? (
              <div className="hub-ws-hints__row">
                <span className="hub-ws-hints__label">Quick categories</span>
                <ul className="hub-ws-hints__chips">
                  {QUICK_CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <Link className="hub-ws-chip hub-ws-chip--link" to={cat.to}>
                        {cat.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* SECTION 2 — Knowledge Categories */}
      <section className="hub-ws-section hub-ws-section--categories" aria-labelledby="hub-categories-heading">
        <header className="hub-ws-section__head hub-ws-section__head--compact hub-ws-section__head--cats">
          <h2 id="hub-categories-heading">Knowledge categories</h2>
          {HUB_UX_FIXES ? (
            <Link className="hub-ws-library-link" to="/knowledge-hub/browse">
              Browse all
            </Link>
          ) : null}
        </header>

        <ul className="hub-ws-categories">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link className={`hub-ws-cat hub-ws-cat--${cat.id}`} to={cat.to}>
                <span className="hub-ws-cat__icon" aria-hidden="true">
                  <CategoryIcon id={cat.id} />
                </span>
                <span className="hub-ws-cat__body">
                  <span className="hub-ws-cat__title-row">
                    <span className="hub-ws-cat__title">{cat.title}</span>
                    <span className="hub-ws-cat__count">
                      {HUB_UX_FIXES
                        ? countLabel(cat.assetCount, cat.countNoun)
                        : `${cat.assetCount} ${cat.assetCount === 1 ? 'Asset' : 'Assets'}`}
                    </span>
                  </span>
                  <span className="hub-ws-cat__desc">{cat.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {!HUB_UX_FIXES ? (
          <p className="hub-ws-bridge" aria-hidden="true">
            Browse knowledge <span>↓</span> Select sources <span>↓</span> Open in Chat
          </p>
        ) : null}
      </section>

      {/* SECTION 3 — Selected for Chat */}
      <section
        className={[
          'hub-ws-section',
          'hub-ws-selected',
          selectedDocs.length ? 'has-selection' : 'is-empty',
          HUB_UX_FIXES && selectedDocs.length === 0 ? 'hub-ws-selected--compact' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-labelledby="hub-selected-heading"
      >
        <header className="hub-ws-section__head">
          <p className="hub-ws-section__step hub-ws-section__step--chat">
            {HUB_UX_FIXES ? 'Step 2 · Select for Chat' : 'Step 2 · Select'}
          </p>
          <h2 id="hub-selected-heading">
            Selected for TB4L Chat
            <span className="hub-ws-selected__count">
              {selectedDocs.length} {selectedDocs.length === 1 ? 'source' : 'sources'}
            </span>
          </h2>
          {!(HUB_UX_FIXES && selectedDocs.length === 0) ? (
            <p>Selected assets become context in TB4L Chat.</p>
          ) : null}
        </header>

        {selectedDocs.length === 0 ? (
          HUB_UX_FIXES ? (
            <div className="hub-ws-selected__compact-empty">
              <p>No sources yet — open a category, or add a starter set.</p>
              <div className="hub-ws-selected__actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={addStarterSet}>
                  Add starter set
                </button>
                <Link className="btn btn-secondary btn-sm" to="/knowledge-hub/browse">
                  Browse library
                </Link>
              </div>
            </div>
          ) : (
            <div className="hub-ws-selected__empty">
              <p>No sources selected yet. Browse a category, or start with these:</p>
              <ul className="hub-ws-selected__list">
                {starterDocs.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      className="hub-ws-selected__item"
                      onClick={() => selectDocument(doc.id)}
                    >
                      <span className="hub-ws-selected__item-title">{doc.title}</span>
                      <span className="hub-ws-selected__item-action">Add</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="hub-ws-selected__actions">
                <button type="button" className="btn btn-secondary" onClick={addStarterSet}>
                  Add starter set
                </button>
                <Link className="btn btn-secondary" to="/knowledge-hub/browse">
                  Browse library
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="hub-ws-selected__panel">
            <ul className="hub-ws-selected__list">
              {selectedDocs.map((doc) => (
                <li key={doc.id}>
                  <div className="hub-ws-selected__item is-on">
                    <span className="hub-ws-selected__item-title">{doc.title}</span>
                    <button
                      type="button"
                      className="hub-ws-selected__item-action"
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hub-ws-selected__actions">
              <button type="button" className="btn btn-secondary" onClick={clearDocumentSelection}>
                Clear
              </button>
              <button type="button" className="btn hub-ws-btn-chat" onClick={askInChat}>
                Open in TB4L Chat
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4 — Connected Data */}
      <section className="hub-ws-section" aria-labelledby="hub-data-heading">
        <header className="hub-ws-section__head">
          <p className="hub-ws-section__step">
            {HUB_UX_FIXES ? 'Step 3 · Connected data' : 'Step 4 · Enhance'}
          </p>
          <h2 id="hub-data-heading">Connected data sources</h2>
          <p>Enterprise data you can combine with Hub knowledge in Chat.</p>
        </header>

        <ul className="hub-ws-sources">
          {DATA_SOURCES.map((source) => (
            <li
              key={source.id}
              className={`hub-ws-source hub-ws-source--${source.status}`}
            >
              <div className="hub-ws-source__top">
                <h3 className="hub-ws-source__name">{source.name}</h3>
                <span className={`hub-ws-source__status hub-ws-source__status--${source.status}`}>
                  {STATUS_LABEL[source.status]}
                </span>
              </div>
              <p className="hub-ws-source__desc">{source.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 5 — How it works */}
      <section className="hub-ws-section hub-ws-how" aria-labelledby="hub-how-heading">
        <header className="hub-ws-section__head hub-ws-section__head--center">
          <p className="hub-ws-section__step">How it works</p>
          <h2 id="hub-how-heading">From knowledge to better answers</h2>
        </header>

        <ol className="hub-ws-how__steps">
          <li className="hub-ws-how__step hub-ws-how__step--hub">
            <span className="hub-ws-how__num">1</span>
            <div>
              <strong>Knowledge Hub</strong>
              <p>Find and select trusted documents</p>
            </div>
          </li>
          <li className="hub-ws-how__arrow" aria-hidden="true">
            ↓
          </li>
          <li className="hub-ws-how__step hub-ws-how__step--chat">
            <span className="hub-ws-how__num">2</span>
            <div>
              <strong>TB4L Chat</strong>
              <p>Ask questions grounded in your sources</p>
            </div>
          </li>
          <li className="hub-ws-how__arrow" aria-hidden="true">
            ↓
          </li>
          <li className="hub-ws-how__step hub-ws-how__step--data">
            <span className="hub-ws-how__num">3</span>
            <div>
              <strong>Connected Data</strong>
              <p>Enhance answers with enterprise data</p>
            </div>
          </li>
        </ol>
      </section>

      <SelectedDocumentsBar
        selectedIds={selectedDocumentIds}
        onClear={clearDocumentSelection}
        onRemove={(id) => toggleDocumentSelection(id)}
        onAskInChat={askInChat}
      />
    </div>
  );
}
