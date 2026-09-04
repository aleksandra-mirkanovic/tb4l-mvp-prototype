import { useEffect, useMemo, useState } from 'react';
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

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function KnowledgeHubBrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();
  const {
    filters,
    setFilters,
    resetFilters,
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
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const showPagination = filtered.length > pageSize;

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filtered.length);

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
    <div className="browse-page section-page section-page--purple">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'Browse all' },
        ]}
      />

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
        <>
          <div className="browse-page__toolbar">
            <p className="browse-page__range" aria-live="polite">
              Showing {rangeStart}–{rangeEnd} of {filtered.length}
            </p>
            <label className="browse-page__page-size">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
                aria-label="Number of files per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="section-docs-grid browse-page__grid">
            {pageItems.map((doc) => (
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

          {showPagination ? (
            <nav className="browse-page__pagination" aria-label="Document pages">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <ul className="browse-page__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li key={pageNum}>
                    <button
                      type="button"
                      className={`browse-page__page-btn${pageNum === page ? ' is-active' : ''}`}
                      onClick={() => setPage(pageNum)}
                      aria-current={pageNum === page ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}

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
