import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HubSectionNav } from '../components/HubSectionNav';
import { HubSourcesPanel } from '../components/HubSourcesPanel';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { getDocumentById } from '../data/documents';
import type { KnowledgeDocument } from '../types';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';

const OVERVIEW_STEPS = [
  {
    title: 'Browse the Hub',
    detail: 'Open Playbooks, Templates, Training, and other sections to find trusted TB4L content.',
  },
  {
    title: 'Select for Chat',
    detail: 'Pick the documents (or connect M360) you want Chat to use as context.',
  },
  {
    title: 'Ask in TB4L Chat',
    detail: 'Your selections become active sources—answers stay grounded in what you chose.',
  },
];

const POPULAR_DOC_IDS = ['doc-4', 'doc-5', 'doc-7'] as const;

const POPULAR_DOCS: KnowledgeDocument[] = POPULAR_DOC_IDS.map((id) => getDocumentById(id)).filter(
  (doc): doc is KnowledgeDocument => Boolean(doc),
);

export function KnowledgeHubClassicPage() {
  const navigate = useNavigate();
  const {
    selectedDocumentIds,
    m360Selected,
    toggleDocumentSelection,
    clearDocumentSelection,
    toggleM360Selection,
    setActiveSourcesFromSelection,
    clearSources,
    setGenieEnabled,
  } = useApp();

  const askInChat = () => {
    if (m360Selected) {
      clearSources();
      setGenieEnabled(true);
      clearDocumentSelection();
      navigate('/chat');
      return;
    }
    setGenieEnabled(false);
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  return (
    <div className="hub-page hub-page--workspace hub-page--overview section-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub' },
        ]}
      />

      <HubSectionNav mode="full" />

      <header className="hub-ov-hero">
        <p className="hub-ov-hero__eyebrow">Overview</p>
        <h1 className="hub-ov-hero__title">TB4L Hub</h1>
        <p className="hub-ov-hero__lede">
          Hub is where you find trusted TB4L knowledge; Chat is where you ask questions. Select
          documents here (or connect a live source like M360), then open Chat—those choices become
          the context for grounded answers.
        </p>

        <ol className="hub-ov-steps">
          {OVERVIEW_STEPS.map((step, index) => (
            <li key={step.title} className="hub-ov-steps__item">
              <span className="hub-ov-steps__num" aria-hidden="true">
                {index + 1}
              </span>
              <div className="hub-ov-steps__copy">
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </header>

      <section className="hub-ov-popular" aria-labelledby="hub-popular-heading">
        <header className="hub-ov-section-head">
          <h2 id="hub-popular-heading">Popular files</h2>
          <p>Select files to use as Chat sources—same as picking them from any Hub section.</p>
        </header>
        <ul className="hub-ov-popular__grid">
          {POPULAR_DOCS.map((doc) => {
            const selected = selectedDocumentIds.includes(doc.id);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  className={`hub-ov-popular__card${selected ? ' is-selected' : ''}`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                  aria-pressed={selected}
                  aria-label={`${selected ? 'Deselect' : 'Select'} ${doc.title}`}
                >
                  <span className="hub-ov-popular__check" aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                  <span className="hub-ov-popular__title">{doc.title}</span>
                  <span className="hub-ov-popular__meta">
                    <span>{doc.brand}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.market}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <HubSourcesPanel />

      <SelectedDocumentsBar
        selectedIds={selectedDocumentIds}
        m360Selected={m360Selected}
        onClear={clearDocumentSelection}
        onRemove={(id) => toggleDocumentSelection(id)}
        onRemoveM360={toggleM360Selection}
        onAskInChat={askInChat}
      />
    </div>
  );
}
