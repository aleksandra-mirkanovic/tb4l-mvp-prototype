import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HubSectionNav } from '../components/HubSectionNav';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { DATA_SOURCES, DATA_SOURCE_STATUS_LABEL } from '../data/dataSources';
import { DOCUMENTS, getDocumentById } from '../data/documents';
import { GLOSSARY_TERMS } from '../data/glossary';
import { HUB_SECTIONS, matchesHubCategory, type HubSection } from '../data/sections';
import { TEAM_MEMBERS } from '../data/team';
import type { KnowledgeDocument } from '../types';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';

const SUGGESTED_SEARCHES = [
  'Brand Frames',
  'Must Win Battles',
  'Discover playbook',
  'Workshop template',
  'Road to Billions',
];

const RECENT_SEARCHES = ['Brand Equity', 'Accelerator roadmap', 'TB4L glossary'];

type CategoryMeta = {
  section: HubSection | null;
  id: string;
  title: string;
  description: string;
  to: string;
  accent: HubSection['accent'] | 'coral';
  assetCount: number;
  lastUpdated: string;
  featured: string;
  preview: string;
};

function docsForSection(section: HubSection): KnowledgeDocument[] {
  if (!section.category) return [];
  return DOCUMENTS.filter((d) => matchesHubCategory(d.category, section.category!));
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function buildCategories(): CategoryMeta[] {
  const fromSections: CategoryMeta[] = HUB_SECTIONS.map((section) => {
    if (section.kind === 'glossary') {
      return {
        section,
        id: section.slug,
        title: section.title,
        description: section.description,
        to: `/knowledge-hub/${section.slug}`,
        accent: section.accent,
        assetCount: GLOSSARY_TERMS.length,
        lastUpdated: '2026-02-12',
        featured: GLOSSARY_TERMS[0]?.term ?? 'TB4L terminology',
        preview: GLOSSARY_TERMS.slice(0, 3)
          .map((t) => t.term)
          .join(' · '),
      };
    }
    if (section.kind === 'team') {
      return {
        section,
        id: section.slug,
        title: section.title,
        description: section.description,
        to: `/knowledge-hub/${section.slug}`,
        accent: section.accent,
        assetCount: TEAM_MEMBERS.length,
        lastUpdated: '2026-01-20',
        featured: TEAM_MEMBERS[0]?.name ?? 'TB4L experts',
        preview: TEAM_MEMBERS.slice(0, 3)
          .map((m) => m.name)
          .join(' · '),
      };
    }
    const docs = docsForSection(section);
    const latest = [...docs].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];
    return {
      section,
      id: section.slug,
      title: section.title,
      description: section.description,
      to: `/knowledge-hub/${section.slug}`,
      accent: section.accent,
      assetCount: docs.length,
      lastUpdated: latest?.lastUpdated ?? '2025-12-01',
      featured: latest?.title ?? section.title,
      preview: docs
        .slice(0, 3)
        .map((d) => d.title)
        .join(' · '),
    };
  });

  const outputDocs = DOCUMENTS.filter((d) => d.category === 'Global Best Practices');
  const outputLatest = [...outputDocs].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];

  const outputsCard: CategoryMeta = {
    section: null,
    id: 'outputs',
    title: 'Outputs',
    description: 'Examples of completed deliverables, analyses, and project outcomes.',
    to: '/knowledge-hub/browse',
    accent: 'coral',
    assetCount: outputDocs.length || DOCUMENTS.filter((d) => d.category === 'Brand & Strategy').length,
    lastUpdated: outputLatest?.lastUpdated ?? '2025-11-15',
    featured: outputLatest?.title ?? 'Market deliverable examples',
    preview:
      outputDocs
        .slice(0, 3)
        .map((d) => d.title)
        .join(' · ') || 'Analyses · Case studies · Outcomes',
  };

  // Insert Outputs after Accelerators (accelerator-outputs)
  const accelIdx = fromSections.findIndex((c) => c.id === 'accelerator-outputs');
  const ordered = [...fromSections];
  ordered.splice(accelIdx + 1, 0, outputsCard);
  return ordered;
}

function CategoryIcon({ id }: { id: string }) {
  const common = {
    width: 20,
    height: 20,
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
  const selectedCategories = useMemo(() => {
    const set = new Set(selectedDocs.map((d) => d.category));
    return Array.from(set);
  }, [selectedDocs]);
  const latestSelected = useMemo(() => {
    if (selectedDocs.length === 0) return null;
    return [...selectedDocs].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];
  }, [selectedDocs]);

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

  const selectAllDocuments = () => {
    DOCUMENTS.forEach((d) => selectDocument(d.id));
  };

  const addToChatContext = () => {
    setActiveSourcesFromSelection();
  };

  const askInChat = () => {
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  const contextActive = selectedDocumentIds.length > 0;

  return (
    <div className="hub-page hub-page--workspace hub-page--ecosystem section-page section-page--purple">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub' },
        ]}
      />

      <HubSectionNav />

      <header className="hub-eco-hero">
        <p className="hub-eco-hero__eyebrow">TB4L Knowledge Hub</p>
        <h1 className="hub-eco-hero__title">Trusted knowledge for better brand decisions</h1>
        <p className="hub-eco-hero__lede">
          Discover approved TB4L content, control what Chat can use, and see which live data sources
          are connected—one AI-powered knowledge ecosystem.
        </p>
      </header>

      {/* 1. Global Search */}
      <section className="hub-eco-search" aria-labelledby="hub-search-heading">
        <h2 id="hub-search-heading" className="visually-hidden">
          Search knowledge
        </h2>
        <form className="hub-eco-search__form" onSubmit={onSearchSubmit}>
          <label className="visually-hidden" htmlFor="hub-global-search">
            Search playbooks, templates, training, frameworks, glossaries
          </label>
          <input
            id="hub-global-search"
            className="hub-eco-search__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search playbooks, templates, training, frameworks, glossaries..."
            autoComplete="off"
          />
          <button type="submit" className="btn hub-eco-search__submit">
            Search
          </button>
        </form>
        <div className="hub-eco-search__hints">
          <div className="hub-eco-search__hint-group">
            <span className="hub-eco-search__hint-label">Suggested</span>
            <ul className="hub-eco-search__chips">
              {SUGGESTED_SEARCHES.map((term) => (
                <li key={term}>
                  <button type="button" className="hub-eco-chip" onClick={() => runSearch(term)}>
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="hub-eco-search__hint-group">
            <span className="hub-eco-search__hint-label">Recent</span>
            <ul className="hub-eco-search__chips">
              {recent.map((term) => (
                <li key={term}>
                  <button type="button" className="hub-eco-chip hub-eco-chip--muted" onClick={() => runSearch(term)}>
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Knowledge Categories */}
      <section className="hub-eco-section" aria-labelledby="hub-categories-heading">
        <header className="hub-eco-section__head">
          <p className="hub-eco-section__badge">Knowledge categories</p>
          <h2 id="hub-categories-heading">Browse trusted content areas</h2>
          <p>Each area shows what it contains, how fresh it is, and a featured asset to start with.</p>
        </header>

        <ul className="hub-eco-categories">
          {categories.map((cat) => (
            <li key={cat.id} className={`hub-eco-cat hub-eco-cat--${cat.accent}`}>
              <div className="hub-eco-cat__top">
                <span className="hub-eco-cat__icon" aria-hidden="true">
                  <CategoryIcon id={cat.id} />
                </span>
                <div className="hub-eco-cat__meta">
                  <span className="hub-eco-cat__count">
                    {cat.assetCount} {cat.assetCount === 1 ? 'asset' : 'assets'}
                  </span>
                  <span className="hub-eco-cat__updated">Updated {formatDate(cat.lastUpdated)}</span>
                </div>
              </div>
              <h3 className="hub-eco-cat__title">{cat.title}</h3>
              <p className="hub-eco-cat__desc">{cat.description}</p>
              <div className="hub-eco-cat__featured">
                <span className="hub-eco-cat__featured-label">Featured</span>
                <p className="hub-eco-cat__featured-title">{cat.featured}</p>
                {cat.preview ? <p className="hub-eco-cat__preview">{cat.preview}</p> : null}
              </div>
              <Link className="hub-eco-cat__open" to={cat.to}>
                Open {cat.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Selected for TB4L Chat */}
      <section className="hub-eco-section hub-eco-context" aria-labelledby="hub-context-heading">
        <header className="hub-eco-section__head">
          <p className="hub-eco-section__badge hub-eco-section__badge--chat">Chat context</p>
          <h2 id="hub-context-heading">Selected for TB4L Chat</h2>
          <p>
            Control exactly which knowledge assets TB4L Chat can use. Status is always visible—no
            guessing what the AI can see.
          </p>
        </header>

        <div className="hub-eco-context__panel">
          <div className="hub-eco-context__summary">
            <div className="hub-eco-context__stat">
              <span className="hub-eco-context__stat-value">{selectedDocs.length}</span>
              <span className="hub-eco-context__stat-label">Documents</span>
            </div>
            <div className="hub-eco-context__stat">
              <span className="hub-eco-context__stat-value">{selectedCategories.length}</span>
              <span className="hub-eco-context__stat-label">Categories</span>
            </div>
            <div className="hub-eco-context__stat">
              <span className="hub-eco-context__stat-value">
                {latestSelected ? formatDate(latestSelected.lastUpdated) : '—'}
              </span>
              <span className="hub-eco-context__stat-label">Last update</span>
            </div>
            <div className="hub-eco-context__stat">
              <span
                className={`hub-eco-context__status ${contextActive ? 'is-active' : 'is-idle'}`}
              >
                {contextActive ? 'Active' : 'Inactive'}
              </span>
              <span className="hub-eco-context__stat-label">Context status</span>
            </div>
          </div>

          <div className="hub-eco-context__actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllDocuments}>
              Select All
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearDocumentSelection}
              disabled={selectedDocs.length === 0}
            >
              Clear Selection
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addToChatContext}
              disabled={selectedDocs.length === 0}
            >
              Add to Chat Context
            </button>
            <button
              type="button"
              className="btn hub-eco-btn-chat btn-sm"
              onClick={askInChat}
              disabled={selectedDocs.length === 0}
            >
              Open in TB4L Chat
            </button>
          </div>

          {selectedCategories.length > 0 ? (
            <p className="hub-eco-context__cats">
              <strong>Selected categories:</strong> {selectedCategories.join(' · ')}
            </p>
          ) : null}

          <ul className="hub-eco-context__files">
            {[
              ...selectedDocs,
              ...DOCUMENTS.filter((d) => !selectedDocumentIds.includes(d.id)),
            ]
              .slice(0, 8)
              .map((doc) => {
              const inContext = selectedDocumentIds.includes(doc.id);
              return (
                <li key={doc.id} className={`hub-eco-file ${inContext ? 'is-on' : 'is-off'}`}>
                  <button
                    type="button"
                    className="hub-eco-file__toggle"
                    onClick={() => toggleDocumentSelection(doc.id)}
                    aria-pressed={inContext}
                  >
                    <span className="hub-eco-file__mark" aria-hidden="true">
                      {inContext ? '✅' : '⚪'}
                    </span>
                    <span className="hub-eco-file__body">
                      <span className="hub-eco-file__title">{doc.title}</span>
                      <span className="hub-eco-file__meta">
                        {doc.category} · {formatDate(doc.lastUpdated)}
                      </span>
                      <span className={`hub-eco-file__state ${inContext ? 'is-on' : 'is-off'}`}>
                        {inContext
                          ? 'Available to TB4L Chat'
                          : 'Not Currently Used by TB4L Chat'}
                      </span>
                    </span>
                  </button>
                  {inContext ? (
                    <button
                      type="button"
                      className="hub-eco-file__remove"
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hub-eco-file__add"
                      onClick={() => selectDocument(doc.id)}
                    >
                      Add
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="hub-eco-context__more">
            Showing sample assets.{' '}
            <Link to="/knowledge-hub/browse">Browse the full library</Link> to select more.
          </p>
        </div>
      </section>

      {/* 4. Connected Data Sources */}
      <section className="hub-eco-section" aria-labelledby="hub-data-heading">
        <header className="hub-eco-section__head">
          <p className="hub-eco-section__badge hub-eco-section__badge--data">Live enterprise data</p>
          <h2 id="hub-data-heading">Connected Data Sources</h2>
          <p>
            Knowledge files and live data are separate. Chat can use both—when you connect them
            deliberately.
          </p>
        </header>

        <ul className="hub-eco-sources">
          {DATA_SOURCES.map((source) => (
            <li
              key={source.id}
              className={`hub-eco-source hub-eco-source--${source.status}`}
            >
              <div className="hub-eco-source__top">
                <h3 className="hub-eco-source__name">{source.name}</h3>
                <span className={`hub-eco-source__badge hub-eco-source__badge--${source.status}`}>
                  {DATA_SOURCE_STATUS_LABEL[source.status]}
                </span>
              </div>
              <p className="hub-eco-source__desc">{source.description}</p>
              <dl className="hub-eco-source__facts">
                <div>
                  <dt>Availability</dt>
                  <dd>{source.availability ?? DATA_SOURCE_STATUS_LABEL[source.status]}</dd>
                </div>
                <div>
                  <dt>Last refresh</dt>
                  <dd>{source.lastRefresh ? formatDate(source.lastRefresh) : '—'}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Knowledge + Data Integration */}
      <section className="hub-eco-section hub-eco-flow" aria-labelledby="hub-flow-heading">
        <header className="hub-eco-section__head hub-eco-section__head--center">
          <p className="hub-eco-section__badge">How it works together</p>
          <h2 id="hub-flow-heading">Knowledge Hub ↔ TB4L Chat ↔ Connected Data</h2>
          <p>One system: curated knowledge and live data power grounded answers in Chat.</p>
        </header>

        <ol className="hub-eco-flow__track">
          <li className="hub-eco-flow__node hub-eco-flow__node--hub">
            <span className="hub-eco-flow__label">Knowledge Hub</span>
            <p>Browse and select trusted documents</p>
          </li>
          <li className="hub-eco-flow__arrow" aria-hidden="true">
            →
          </li>
          <li className="hub-eco-flow__node hub-eco-flow__node--chat">
            <span className="hub-eco-flow__label">TB4L Chat</span>
            <p>Uses your selected Hub content as context</p>
          </li>
          <li className="hub-eco-flow__arrow" aria-hidden="true">
            ←
          </li>
          <li className="hub-eco-flow__node hub-eco-flow__node--data">
            <span className="hub-eco-flow__label">Connected Data</span>
            <p>Live sources you connect explicitly in Chat</p>
          </li>
        </ol>

        <ul className="hub-eco-flow__points">
          <li>TB4L Chat can use selected Hub content.</li>
          <li>TB4L Chat can access connected enterprise data sources.</li>
          <li>Knowledge assets and live data stay separate—and work together when you choose.</li>
        </ul>

        <div className="hub-eco-flow__cta">
          <Link className="btn hub-eco-btn-chat" to="/chat">
            Open TB4L Chat
          </Link>
          <Link className="btn btn-secondary" to="/knowledge-hub/browse">
            Browse all knowledge
          </Link>
        </div>
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
