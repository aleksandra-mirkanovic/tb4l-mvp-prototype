import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { EmptyState } from '../components/EmptyState';
import { HubSectionNav } from '../components/HubSectionNav';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { DOCUMENTS, EMPTY_FILTERS } from '../data/documents';
import { GLOSSARY_TERMS } from '../data/glossary';
import { getHubSectionBySlug, matchesHubCategory } from '../data/sections';
import { TEAM_MEMBERS } from '../data/team';
import './SectionPage.css';

export function KnowledgeHubSectionPage() {
  const { slug = '' } = useParams();
  const section = getHubSectionBySlug(slug);
  const navigate = useNavigate();
  const {
    selectedDocumentIds,
    toggleDocumentSelection,
    selectDocument,
    clearDocumentSelection,
    setActiveSourcesFromSelection,
    addSources,
    setFilters,
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

  const openBrowseFiltered = () => {
    if (section.category) {
      setFilters({ ...EMPTY_FILTERS, category: section.category });
    } else {
      setFilters(EMPTY_FILTERS);
    }
    navigate('/knowledge-hub/browse');
  };

  const openInChat = (id: string) => {
    selectDocument(id);
    addSources([id]);
    setSummaryId(null);
    navigate('/chat');
  };

  const askTopic = (id: string, topic: string) => {
    selectDocument(id);
    addSources([id]);
    setSummaryId(null);
    navigate(`/chat?ask=${encodeURIComponent(`Tell me more about “${topic}” in this document.`)}`);
  };

  const askInChat = () => {
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  return (
    <div className={`section-page section-page--${section.accent}`}>
      <Breadcrumbs
        items={[
          { label: 'Welcome', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: section.title },
        ]}
      />

      <HubSectionNav />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">{section.eyebrow}</p>
          <h1 className="section-hero__brand">TB4L Hub</h1>
          <h2 className="section-hero__title">{section.title}</h2>
          <p className="section-hero__tagline">{section.tagline}</p>
          <p className="section-hero__desc">{section.description}</p>
          <div className="section-hero__actions">
            {section.kind === 'documents' ? (
              <>
                <button type="button" className="btn btn-primary" onClick={openBrowseFiltered}>
                  Open in full library
                </button>
                <Link className="btn btn-secondary" to="/chat">
                  Ask in TB4L Chat
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/chat">
                  Ask about this in Chat
                </Link>
                <Link className="btn btn-secondary" to="/knowledge-hub/browse">
                  Browse all documents
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="section-hero__panel" aria-hidden="true">
          <div className="section-hero__panel-label">{section.title}</div>
          <p>{section.tagline}</p>
        </div>
      </header>

      {section.kind === 'documents' ? (
        <section className="section-content" aria-labelledby="section-docs-heading">
          <div className="section-content__head">
            <h3 id="section-docs-heading" className="section-title">
              Documents in {section.title}
            </h3>
            <p>
              {docs.length} curated document{docs.length === 1 ? '' : 's'} · select any to use in Chat
            </p>
          </div>
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
            <div className="section-docs-grid">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  selected={selectedDocumentIds.includes(doc.id)}
                  onToggle={() => toggleDocumentSelection(doc.id)}
                  onViewSummary={() => setSummaryId(doc.id)}
                />
              ))}
            </div>
          )}

          <SelectedDocumentsBar
            selectedIds={selectedDocumentIds}
            onClear={clearDocumentSelection}
            onRemove={(id) => toggleDocumentSelection(id)}
            onAskInChat={askInChat}
          />
        </section>
      ) : null}

      {section.kind === 'glossary' ? (
        <section className="section-content" aria-labelledby="glossary-heading">
          <div className="section-content__head">
            <h3 id="glossary-heading" className="section-title">
              Glossary
            </h3>
            <p>Shared definitions used across Knowledge Hub and Chat.</p>
          </div>
          <div className="glossary-list">
            {GLOSSARY_TERMS.map((item) => (
              <article key={item.id} className="glossary-item">
                <h4>{item.term}</h4>
                <p>{item.definition}</p>
                <div className="glossary-item__related" aria-label="Related terms">
                  {item.related.map((r) => (
                    <span key={r} className="chip chip-hub">
                      {r}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {section.kind === 'team' ? (
        <section className="section-content" aria-labelledby="team-heading">
          <div className="section-content__head">
            <h3 id="team-heading" className="section-title">
              Enablement partners
            </h3>
            <p>Reach out for Accelerator support, training, or Hub adoption coaching.</p>
          </div>
          <div className="team-grid">
            {TEAM_MEMBERS.map((member) => (
              <article key={member.id} className="team-card">
                <div className="team-card__avatar" aria-hidden="true">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <h4>{member.name}</h4>
                <p className="team-card__role">{member.role}</p>
                <p className="team-card__focus">{member.focus}</p>
                <div className="team-card__meta">
                  <span className="badge badge-hub">{member.region}</span>
                  <span className="team-card__email">{member.emailLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {summaryDoc ? (
        <DocumentSummaryPanel
          document={summaryDoc}
          selected={selectedDocumentIds.includes(summaryDoc.id)}
          onClose={() => setSummaryId(null)}
          onSelectForChat={() => selectDocument(summaryDoc.id)}
          onOpenInChat={() => openInChat(summaryDoc.id)}
          onAskTopic={(topic) => askTopic(summaryDoc.id, topic)}
        />
      ) : null}
    </div>
  );
}
