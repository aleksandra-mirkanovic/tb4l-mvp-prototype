import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActiveFilterChips } from '../components/ActiveFilterChips';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { HubSectionNav } from '../components/HubSectionNav';
import { SelectedDocumentsBar } from '../components/SelectedDocumentsBar';
import { useApp } from '../context/AppContext';
import { DOCUMENTS } from '../data/documents';
import { matchesHubCategory } from '../data/sections';
import type { HubFilters } from '../types';
import './KnowledgeHubBrowsePage.css';
import './SectionPage.css';

export function KnowledgeHubBrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();
  const {
    filters,
    setFilters,
    resetFilters,
    selectedDocumentIds,
    toggleDocumentSelection,
    selectDocument,
    clearDocumentSelection,
    setActiveSourcesFromSelection,
    addSources,
  } = useApp();

  const [summaryId, setSummaryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      if (filters.brand && doc.brand !== filters.brand) return false;
      if (filters.market && doc.market !== filters.market) return false;
      if (filters.category && !matchesHubCategory(doc.category, filters.category)) return false;
      if (searchQuery) {
        const haystack = `${doc.title} ${doc.description} ${doc.category} ${doc.keyTopics.join(' ')}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      return true;
    });
  }, [filters, searchQuery]);

  const summaryDoc = summaryId ? DOCUMENTS.find((d) => d.id === summaryId) ?? null : null;

  const clearOne = (key: keyof HubFilters) => {
    setFilters({ ...filters, [key]: '' });
  };

  const openInChat = (id: string) => {
    selectDocument(id);
    addSources([id]);
    setSummaryId(null);
    navigate('/chat');
  };

  const askInChat = () => {
    setActiveSourcesFromSelection();
    navigate('/chat');
  };

  return (
    <div className="browse-page section-page section-page--purple">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'Browse all' },
        ]}
      />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">TB4L Hub</p>
          <h1 className="section-hero__title">
            {searchQuery ? `Results for “${searchParams.get('q')}”` : 'Browse all documents'}
          </h1>
          <p className="section-hero__tagline">
            {searchQuery
              ? 'Refine with filters, then select documents to build Chat context.'
              : 'Filter and select Hub documents to build Chat context, then ask with those sources.'}
          </p>
        </div>
        <div className="section-hero__actions">
          <p className="browse-page__count" aria-live="polite">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>

      <HubSectionNav />

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        resultCount={filtered.length}
        totalCount={DOCUMENTS.length}
        variant="toolbar"
      />

      <ActiveFilterChips filters={filters} onClearOne={clearOne} onClearAll={resetFilters} />

      {DOCUMENTS.length === 0 ? (
        <EmptyState
          title="No content available"
          description="There are currently no documents in the Knowledge Hub."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching documents"
          description="No documents match the current filters. Reset filters, or continue with general TB4L Chat if you only need framework guidance."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={resetFilters}>
                Reset Filters
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/chat')}
              >
                Continue with General TB4L Chat
              </button>
            </>
          }
        />
      ) : (
        <div className="browse-page__list" role="list">
          {filtered.map((doc) => (
            <div key={doc.id} role="listitem">
              <DocumentCard
                document={doc}
                selected={selectedDocumentIds.includes(doc.id)}
                onToggle={() => toggleDocumentSelection(doc.id)}
                onViewSummary={() => setSummaryId(doc.id)}
                compact
              />
            </div>
          ))}
        </div>
      )}

      <SelectedDocumentsBar
        selectedIds={selectedDocumentIds}
        onClear={clearDocumentSelection}
        onRemove={(id) => toggleDocumentSelection(id)}
        onAskInChat={askInChat}
      />

      {summaryDoc ? (
        <DocumentSummaryPanel
          document={summaryDoc}
          selected={selectedDocumentIds.includes(summaryDoc.id)}
          onClose={() => setSummaryId(null)}
          onSelectForChat={() => selectDocument(summaryDoc.id)}
          onOpenInChat={() => openInChat(summaryDoc.id)}
        />
      ) : null}
    </div>
  );
}
