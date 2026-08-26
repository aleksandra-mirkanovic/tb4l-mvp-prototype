import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function KnowledgeHubBrowsePage() {
  const navigate = useNavigate();
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
      return true;
    });
  }, [filters]);

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
    <div className="browse-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'Browse all' },
        ]}
      />

      <header className="browse-page__header">
        <div>
          <span className="badge badge-hub">TB4L Hub</span>
          <h1 className="browse-page__title">Browse all documents</h1>
          <p className="browse-page__subtitle">
            Filter by brand or market, select documents, then use them in Chat for grounded answers.
          </p>
        </div>
        <p className="browse-page__count" aria-live="polite">
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </p>
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
          description="No documents match the current filters. Try adjusting or resetting filters."
          actions={
            <button type="button" className="btn btn-primary" onClick={resetFilters}>
              Reset Filters
            </button>
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
