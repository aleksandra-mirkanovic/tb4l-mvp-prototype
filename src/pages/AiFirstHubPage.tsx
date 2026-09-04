import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { useApp } from '../context/AppContext';
import { DOCUMENTS, getDocumentById } from '../data/documents';
import { GLOSSARY_TERMS } from '../data/glossary';
import { matchesHubCategory } from '../data/sections';
import { TEAM_MEMBERS } from '../data/team';
import type { KnowledgeDocument } from '../types';
import './AiFirstHubPage.css';

type BrowseFilter =
  | 'all'
  | 'playbooks'
  | 'templates'
  | 'training'
  | 'accelerator'
  | 'glossary'
  | 'brand-frames'
  | 'teams';

const BROWSE_FILTERS: { id: BrowseFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'templates', label: 'Templates' },
  { id: 'training', label: 'Training' },
  { id: 'accelerator', label: 'Accelerator Outputs' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'brand-frames', label: 'Brand Frames' },
  { id: 'teams', label: 'Teams' },
];

const STARTER_IDS = ['doc-2', 'doc-1', 'doc-7'] as const;

const STARTER_HINT: Record<string, string> = {
  'doc-2': 'Best starting point for brand planning questions',
  'doc-1': 'Use when you need the overall TB4L framework',
  'doc-7': 'Use for Brand Frame / brand DNA questions',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function docsByFilter(filter: BrowseFilter): KnowledgeDocument[] {
  switch (filter) {
    case 'playbooks':
      return DOCUMENTS.filter((d) => matchesHubCategory(d.category, 'Playbooks'));
    case 'templates':
      return DOCUMENTS.filter((d) => matchesHubCategory(d.category, 'Templates'));
    case 'training':
      return DOCUMENTS.filter((d) => matchesHubCategory(d.category, 'Training'));
    case 'accelerator':
      return DOCUMENTS.filter((d) => matchesHubCategory(d.category, 'Accelerator Outputs'));
    case 'brand-frames':
      return DOCUMENTS.filter((d) => matchesHubCategory(d.category, 'Brand Frames'));
    default:
      return DOCUMENTS;
  }
}

export function AiFirstHubPage() {
  const navigate = useNavigate();
  const {
    selectedDocumentIds,
    selectDocument,
    toggleDocumentSelection,
    clearDocumentSelection,
    setActiveSourcesFromSelection,
    addSources,
    removeSource,
    clearSources,
    genieEnabled,
    setGenieEnabled,
  } = useApp();

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all');
  const [extraTeams, setExtraTeams] = useState<string[]>([]);
  const [extraGlossary, setExtraGlossary] = useState<string[]>([]);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  };

  const starters = useMemo(() => {
    return STARTER_IDS.map((id) => getDocumentById(id)).filter(Boolean) as KnowledgeDocument[];
  }, []);

  const browseDocs = useMemo(() => {
    if (browseFilter === 'glossary' || browseFilter === 'teams') return [];
    if (browseFilter === 'all') {
      return [...DOCUMENTS].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    }
    return docsByFilter(browseFilter);
  }, [browseFilter]);

  const contextDocs = selectedDocumentIds
    .map((id) => getDocumentById(id))
    .filter(Boolean) as KnowledgeDocument[];
  const contextTeams = TEAM_MEMBERS.filter((t) => extraTeams.includes(t.id));
  const contextGlossary = GLOSSARY_TERMS.filter((t) => extraGlossary.includes(t.id));
  const knowledgeCount = contextDocs.length + contextGlossary.length;
  const contextCount = knowledgeCount + (genieEnabled ? 1 : 0) + contextTeams.length;
  const readyToChat = knowledgeCount > 0 || genieEnabled;

  const nextStep = !knowledgeCount
    ? {
        n: 1,
        title: 'Add at least one knowledge source',
        detail: 'Pick a starter below. AI will use it to ground answers.',
      }
    : {
        n: 3,
        title: 'Start AI Chat',
        detail: genieEnabled
          ? 'Knowledge + M360 are ready. Open Chat and ask.'
          : 'You can add M360 (optional) or start Chat now with your knowledge.',
      };

  const addDoc = (id: string) => {
    selectDocument(id);
    addSources([id]);
    showToast('Added to your context');
  };

  const removeDoc = (id: string) => {
    if (selectedDocumentIds.includes(id)) toggleDocumentSelection(id);
    removeSource(id);
  };

  const clearContext = () => {
    clearDocumentSelection();
    clearSources();
    setGenieEnabled(false);
    setExtraTeams([]);
    setExtraGlossary([]);
  };

  const startChat = () => {
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  const summaryDoc = summaryId ? getDocumentById(summaryId) ?? null : null;

  return (
    <div className="ctx-hub">
      <header className="ctx-hub__intro">
        <p className="ctx-hub__eyebrow">TB4L Hub</p>
        <h1>Tell AI what to use</h1>
        <p className="ctx-hub__lede">
          Build a short context list, then open Chat. Answers stay grounded in what you add here.
        </p>
      </header>

      <ol className="ctx-howto" aria-label="How to use Hub">
        <li className={!knowledgeCount ? 'is-current' : 'is-done'}>
          <span className="ctx-howto__n" aria-hidden="true">
            1
          </span>
          <span>
            <strong>Add knowledge</strong>
            <em>Required</em>
          </span>
        </li>
        <li className={genieEnabled ? 'is-done' : knowledgeCount ? 'is-optional' : ''}>
          <span className="ctx-howto__n" aria-hidden="true">
            2
          </span>
          <span>
            <strong>Connect data</strong>
            <em>Optional</em>
          </span>
        </li>
        <li className={readyToChat ? 'is-current' : ''}>
          <span className="ctx-howto__n" aria-hidden="true">
            3
          </span>
          <span>
            <strong>Start AI Chat</strong>
            <em>{readyToChat ? 'Ready now' : 'After step 1'}</em>
          </span>
        </li>
      </ol>

      <section className="ctx-builder" aria-labelledby="ctx-builder-title">
        <div className="ctx-builder__top">
          <div>
            <h2 id="ctx-builder-title">Your context for AI</h2>
            <p className="ctx-builder__count">
              {contextCount === 0
                ? 'Empty — add something below to begin'
                : `${contextCount} item${contextCount === 1 ? '' : 's'} selected`}
            </p>
          </div>
          <div className="ctx-builder__actions">
            <button
              type="button"
              className="btn ctx-btn ctx-btn--chat"
              onClick={startChat}
              disabled={!readyToChat}
            >
              {readyToChat ? 'Start AI Chat' : 'Add context first'}
            </button>
            {contextCount > 0 ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearContext}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="ctx-builder__next" role="status">
          <span className="ctx-builder__next-label">Next step</span>
          <p>
            <strong>
              {nextStep.n}. {nextStep.title}
            </strong>
            <span>{nextStep.detail}</span>
          </p>
        </div>

        {contextCount > 0 ? (
          <ul className="ctx-builder__chips" aria-label="Selected context">
            {contextDocs.map((doc) => (
              <li key={doc.id}>
                <span>Knowledge · {doc.title}</span>
                <button type="button" aria-label={`Remove ${doc.title}`} onClick={() => removeDoc(doc.id)}>
                  ×
                </button>
              </li>
            ))}
            {contextGlossary.map((term) => (
              <li key={term.id}>
                <span>Glossary · {term.term}</span>
                <button
                  type="button"
                  aria-label={`Remove ${term.term}`}
                  onClick={() => setExtraGlossary((p) => p.filter((x) => x !== term.id))}
                >
                  ×
                </button>
              </li>
            ))}
            {genieEnabled ? (
              <li className="is-data">
                <span>Data · M360</span>
                <button type="button" aria-label="Disconnect M360" onClick={() => setGenieEnabled(false)}>
                  ×
                </button>
              </li>
            ) : null}
            {contextTeams.map((member) => (
              <li key={member.id}>
                <span>Team · {member.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${member.name}`}
                  onClick={() => setExtraTeams((p) => p.filter((x) => x !== member.id))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="ctx-step" aria-labelledby="ctx-step1-title">
        <div className="ctx-step__head">
          <span className="ctx-step__badge">Step 1</span>
          <h2 id="ctx-step1-title">Add knowledge</h2>
          <p>Choose one starter. You can add more later.</p>
        </div>

        <div className="ctx-step__cards">
          {starters.map((doc) => {
            const inContext = selectedDocumentIds.includes(doc.id);
            return (
              <article key={doc.id} className={`ctx-card${inContext ? ' is-in' : ''}`}>
                <h3>{doc.title}</h3>
                <p>{STARTER_HINT[doc.id] ?? doc.description}</p>
                <p className="ctx-card__date">Updated {formatDate(doc.lastUpdated)}</p>
                <div className="ctx-card__actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSummaryId(doc.id)}>
                    Preview
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${inContext ? 'ctx-btn--in' : 'ctx-btn ctx-btn--add'}`}
                    onClick={() => (inContext ? removeDoc(doc.id) : addDoc(doc.id))}
                  >
                    {inContext ? 'Added' : 'Add to context'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ctx-step ctx-step--data" aria-labelledby="ctx-step2-title">
        <div className="ctx-step__head">
          <span className="ctx-step__badge ctx-step__badge--data">Step 2 · Optional</span>
          <h2 id="ctx-step2-title">Connect live data</h2>
          <p>Only needed for market or performance questions.</p>
        </div>

        <article className={`ctx-data-card${genieEnabled ? ' is-on' : ''}`}>
          <div>
            <h3>M360</h3>
            <p>Market intelligence and brand performance data.</p>
          </div>
          {genieEnabled ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGenieEnabled(false)}>
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="btn ctx-btn ctx-btn--data btn-sm"
              onClick={() => {
                setGenieEnabled(true);
                showToast('M360 added to your context');
              }}
            >
              Add M360
            </button>
          )}
        </article>
      </section>

      <section className="ctx-step ctx-step--go" aria-labelledby="ctx-step3-title">
        <div className="ctx-step__head">
          <span className="ctx-step__badge ctx-step__badge--chat">Step 3</span>
          <h2 id="ctx-step3-title">Start AI Chat</h2>
          <p>
            {readyToChat
              ? 'Open Chat with everything listed in Your context.'
              : 'Add knowledge in Step 1 first—then this unlocks.'}
          </p>
        </div>
        <button
          type="button"
          className="btn ctx-btn ctx-btn--chat ctx-btn--wide"
          onClick={startChat}
          disabled={!readyToChat}
        >
          {readyToChat ? 'Start AI Chat with this context' : 'Waiting for context…'}
        </button>
      </section>

      <section className="ctx-more">
        <button
          type="button"
          className="ctx-more__toggle"
          aria-expanded={browseOpen}
          onClick={() => setBrowseOpen((v) => !v)}
        >
          <span>{browseOpen ? 'Hide' : 'Need something else?'} Browse full library</span>
          <span aria-hidden="true">{browseOpen ? '−' : '+'}</span>
        </button>

        {browseOpen ? (
          <div className="ctx-more__panel">
            <div className="ctx-browse__filters" role="tablist" aria-label="Browse filters">
              {BROWSE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={browseFilter === f.id}
                  className={`ctx-browse__chip${browseFilter === f.id ? ' is-active' : ''}`}
                  onClick={() => setBrowseFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {browseFilter === 'glossary' ? (
              <div className="ctx-browse__list">
                {GLOSSARY_TERMS.map((term) => {
                  const inContext = extraGlossary.includes(term.id);
                  return (
                    <article key={term.id} className={`ctx-browse__row${inContext ? ' is-in' : ''}`}>
                      <div>
                        <h3>{term.term}</h3>
                        <p>{term.definition}</p>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${inContext ? 'ctx-btn--in' : 'ctx-btn ctx-btn--add'}`}
                        onClick={() => {
                          if (inContext) {
                            setExtraGlossary((p) => p.filter((x) => x !== term.id));
                          } else {
                            setExtraGlossary((p) => [...p, term.id]);
                            showToast('Added to your context');
                          }
                        }}
                      >
                        {inContext ? 'Added' : 'Add to context'}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {browseFilter === 'teams' ? (
              <div className="ctx-browse__list">
                {TEAM_MEMBERS.map((member) => {
                  const inContext = extraTeams.includes(member.id);
                  return (
                    <article key={member.id} className={`ctx-browse__row${inContext ? ' is-in' : ''}`}>
                      <div>
                        <h3>{member.name}</h3>
                        <p>
                          {member.role} · {member.focus}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${inContext ? 'ctx-btn--in' : 'ctx-btn ctx-btn--add'}`}
                        onClick={() => {
                          if (inContext) {
                            setExtraTeams((p) => p.filter((x) => x !== member.id));
                          } else {
                            setExtraTeams((p) => [...p, member.id]);
                            showToast('Added to your context');
                          }
                        }}
                      >
                        {inContext ? 'Added' : 'Add to context'}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {browseFilter !== 'glossary' && browseFilter !== 'teams' ? (
              <div className="ctx-browse__list">
                {browseDocs.map((doc) => {
                  const inContext = selectedDocumentIds.includes(doc.id);
                  return (
                    <article key={doc.id} className={`ctx-browse__row${inContext ? ' is-in' : ''}`}>
                      <div>
                        <p className="ctx-browse__type">
                          {doc.category} · {formatDate(doc.lastUpdated)}
                        </p>
                        <h3>{doc.title}</h3>
                        <p>{doc.description}</p>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${inContext ? 'ctx-btn--in' : 'ctx-btn ctx-btn--add'}`}
                        onClick={() => (inContext ? removeDoc(doc.id) : addDoc(doc.id))}
                      >
                        {inContext ? 'Added' : 'Add to context'}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {toast ? (
        <div className="ctx-toast" role="status">
          {toast}
        </div>
      ) : null}

      {summaryDoc ? (
        <DocumentSummaryPanel
          document={summaryDoc}
          selected={selectedDocumentIds.includes(summaryDoc.id)}
          onClose={() => setSummaryId(null)}
          onSelectForChat={() => {
            addDoc(summaryDoc.id);
            setSummaryId(null);
          }}
          onOpenInChat={() => {
            selectDocument(summaryDoc.id);
            addSources([summaryDoc.id]);
            setSummaryId(null);
            navigate('/chat');
          }}
          onOpenRelated={(id) => setSummaryId(id)}
          onAskQuestion={(question) => {
            selectDocument(summaryDoc.id);
            addSources([summaryDoc.id]);
            setSummaryId(null);
            navigate(`/chat?ask=${encodeURIComponent(question)}`);
          }}
        />
      ) : null}
    </div>
  );
}
