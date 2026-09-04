import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { EmptyState } from '../components/EmptyState';
import { HubSectionNav } from '../components/HubSectionNav';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { DOCUMENTS } from '../data/documents';
import { GLOSSARY_FILE } from '../data/glossary';
import { getHubSectionBySlug, matchesHubCategory } from '../data/sections';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';

export function KnowledgeHubSectionPage() {
  const { slug = '' } = useParams();
  const section = getHubSectionBySlug(slug);
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

  const docs = useMemo(() => {
    if (!section?.category) return [];
    return DOCUMENTS.filter((d) => matchesHubCategory(d.category, section.category!));
  }, [section]);

  if (!section) {
    return <Navigate to="/knowledge-hub" replace />;
  }

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
    <div className={`section-page section-page--library section-page--${section.accent}`}>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: section.title },
        ]}
      />

      <HubSectionNav />

      <header className="section-library-header">
        <div className="hub-ov-section-head">
          <h1 id="section-docs-heading">{section.title}</h1>
          <p>
            {section.kind === 'documents'
              ? `${docs.length} document${docs.length === 1 ? '' : 's'} · ${section.description}`
              : `1 document · ${section.description}`}
          </p>
        </div>
      </header>

      {section.kind === 'documents' ? (
        <section className="section-content" aria-labelledby="section-docs-heading">
          {docs.length === 0 ? (
            <EmptyState
              title="No content available"
              description={`Documents for ${section.title} will appear here when published to the Hub.`}
              actions={
                <Link className="btn btn-primary" to="/knowledge-hub/browse">
                  Browse all Hub content
                </Link>
              }
            />
          ) : (
            <ul className="section-docs-grid">
              {docs.map((doc) => (
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
          )}

          <SelectedDocumentsBar
            selectedIds={selectedDocumentIds}
            m360Selected={m360Selected}
            onClear={clearDocumentSelection}
            onRemove={(id) => toggleDocumentSelection(id)}
            onRemoveM360={toggleM360Selection}
            onAskInChat={askInChat}
          />
        </section>
      ) : null}

      {section.kind === 'glossary' ? (
        <section className="section-content" aria-labelledby="section-docs-heading">
          <ul className="section-docs-grid">
            <li>
              <a
                className="document-card document-card--tile document-card--external"
                href={GLOSSARY_FILE.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${GLOSSARY_FILE.title} in SharePoint`}
              >
                <div className="document-card__top document-card__top--tile">
                  <h3 className="document-card__title">{GLOSSARY_FILE.title}</h3>
                  <span className="document-card__badge">{GLOSSARY_FILE.format}</span>
                </div>
                <p className="document-card__desc">{GLOSSARY_FILE.description}</p>
                <p className="document-card__meta-line">
                  <span>SharePoint</span>
                  <span aria-hidden="true">·</span>
                  <span>Excel workbook</span>
                </p>
                <div className="document-card__actions document-card__actions--tile">
                  <span className="btn btn-primary btn-sm document-card__ask">Open in SharePoint</span>
                </div>
              </a>
            </li>
          </ul>
        </section>
      ) : null}

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
