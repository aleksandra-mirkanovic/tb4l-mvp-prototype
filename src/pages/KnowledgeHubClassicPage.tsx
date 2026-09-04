import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { HubSectionNav } from '../components/HubSectionNav';
import { HubSourcesPanel } from '../components/HubSourcesPanel';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { DOCUMENTS, getDocumentById } from '../data/documents';
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
    selectDocument,
    clearDocumentSelection,
    toggleM360Selection,
    setActiveSourcesFromSelection,
    clearSources,
    setGenieEnabled,
    addSources,
  } = useApp();
  const [summaryId, setSummaryId] = useState<string | null>(null);

  const summaryDoc = summaryId ? DOCUMENTS.find((d) => d.id === summaryId) ?? null : null;

  const openInChat = (id: string) => {
    selectDocument(id);
    addSources([id]);
    setSummaryId(null);
    navigate('/chat');
  };

  const askQuestionFromSummary = (question: string) => {
    if (!summaryDoc) return;
    selectDocument(summaryDoc.id);
    addSources([summaryDoc.id]);
    setGenieEnabled(false);
    setSummaryId(null);
    navigate(`/chat?ask=${encodeURIComponent(question)}`);
  };

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
        <ul className="section-docs-grid hub-ov-popular__grid">
          {POPULAR_DOCS.map((doc) => (
            <li key={doc.id}>
              <DocumentCard
                document={doc}
                selected={selectedDocumentIds.includes(doc.id)}
                onToggle={() => toggleDocumentSelection(doc.id)}
                onViewSummary={() => setSummaryId(doc.id)}
                tile
              />
            </li>
          ))}
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

      {summaryDoc ? (
        <DocumentSummaryPanel
          document={summaryDoc}
          selected={selectedDocumentIds.includes(summaryDoc.id)}
          onClose={() => setSummaryId(null)}
          onSelectForChat={() => selectDocument(summaryDoc.id)}
          onOpenInChat={() => openInChat(summaryDoc.id)}
          onOpenRelated={(id) => setSummaryId(id)}
          onAskQuestion={askQuestionFromSummary}
        />
      ) : null}
    </div>
  );
}
