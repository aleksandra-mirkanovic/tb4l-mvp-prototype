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
import './KnowledgeHubPage.css';

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
      if (filters.documentType && doc.documentType !== filters.documentType) return false;
      if (filters.year && String(doc.year) !== filters.year) return false;
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
    <div className="hub-page">
      <Breadcrumbs
        items={[
          { label: 'Welcome', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'Browse all' },
        ]}
      />

      <header className="hub-page__header">
        <div>
          <span className="badge badge-hub">TB4L Hub</span>
          <h1 className="page-title" style={{ marginTop: 8 }}>
            Browse all documents
          </h1>
          <p className="page-subtitle">
            Filter across the full Hub library, review AI-generated summaries, and select sources for
            Chat.
          </p>
        </div>
      </header>

      <HubSectionNav />

      <div className="hub-page__layout">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          resultCount={filtered.length}
          totalCount={DOCUMENTS.length}
        />

        <div className="hub-page__content">
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
            <div className="hub-page__grid" role="list">
              {filtered.map((doc) => (
                <div key={doc.id} role="listitem">
                  <DocumentCard
                    document={doc}
                    selected={selectedDocumentIds.includes(doc.id)}
                    onToggle={() => toggleDocumentSelection(doc.id)}
                    onViewSummary={() => setSummaryId(doc.id)}
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
        </div>
      </div>

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
