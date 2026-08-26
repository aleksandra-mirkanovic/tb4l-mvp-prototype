import { useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from './EmptyState';
import { DOCUMENTS } from '../data/documents';
import { matchesHubCategory } from '../data/sections';
import type { KnowledgeDocument } from '../types';
import './AddSourcesModal.css';

interface AddSourcesModalProps {
  existingSourceIds: string[];
  onClose: () => void;
  onAdd: (ids: string[]) => void;
}

const TABS: { id: string; label: string; category?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'playbooks', label: 'Playbooks', category: 'Playbooks' },
  { id: 'templates', label: 'Templates', category: 'Templates' },
  { id: 'training', label: 'Training', category: 'Training' },
  { id: 'accelerator', label: 'Accelerator Outputs', category: 'Accelerator Outputs' },
  { id: 'brand-frames', label: 'Brand Frames', category: 'Brand Frames' },
  { id: 'strategy', label: 'Brand & Strategy', category: 'Brand & Strategy' },
  { id: 'practices', label: 'Best Practices', category: 'Global Best Practices' },
];

function matchesSearch(doc: KnowledgeDocument, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    doc.title.toLowerCase().includes(q) ||
    doc.description.toLowerCase().includes(q) ||
    doc.brand.toLowerCase().includes(q) ||
    doc.market.toLowerCase().includes(q) ||
    doc.category.toLowerCase().includes(q) ||
    doc.documentType.toLowerCase().includes(q)
  );
}

export function AddSourcesModal({ existingSourceIds, onClose, onAdd }: AddSourcesModalProps) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const existing = useMemo(() => new Set(existingSourceIds), [existingSourceIds]);

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  const visible = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      if (activeTab.category && !matchesHubCategory(doc.category, activeTab.category)) return false;
      return matchesSearch(doc, search.trim());
    });
  }, [activeTab.category, search]);

  const availableCount = visible.filter((d) => !existing.has(d.id)).length;

  const toggle = (id: string) => {
    if (existing.has(id)) return;
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectVisible = () => {
    const ids = visible.filter((d) => !existing.has(d.id)).map((d) => d.id);
    setPicked((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearPicked = () => setPicked([]);

  const pickedDocs = picked
    .map((id) => DOCUMENTS.find((d) => d.id === id))
    .filter((d): d is KnowledgeDocument => Boolean(d));

  return (
    <div className="overlay overlay-center" role="presentation" onClick={onClose}>
      <div
        className="sources-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sources-picker__header">
          <div>
            <h2 id="sources-picker-title">Add Knowledge Hub sources</h2>
            <p>Search or browse sections, select documents, then add them to this chat.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>

        <div className="sources-picker__toolbar">
          <label className="sources-picker__search">
            <span className="sr-only">Search Knowledge Hub documents</span>
            <span className="sources-picker__search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={searchRef}
              type="search"
              value={search}
              placeholder="Search by title, brand, market, or topic…"
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button type="button" className="sources-picker__clear-search" onClick={() => setSearch('')}>
                Clear
              </button>
            ) : null}
          </label>

          <div className="sources-picker__tabs" role="tablist" aria-label="Hub sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`sources-picker__tab ${tab === item.id ? 'is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sources-picker__meta">
          <span>
            <strong>{availableCount}</strong> available
            {existingSourceIds.filter((id) => id !== 'general' && id !== 'genie').length > 0
              ? ` · ${existingSourceIds.filter((id) => id !== 'general' && id !== 'genie').length} already in chat`
              : ''}
          </span>
          <div className="sources-picker__meta-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={selectVisible}
              disabled={availableCount === 0}
            >
              Select all visible
            </button>
            {picked.length > 0 ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearPicked}>
                Clear selection
              </button>
            ) : null}
          </div>
        </div>

        <div className="sources-picker__list" role="listbox" aria-multiselectable="true" aria-label="Documents">
          {visible.length === 0 ? (
            <EmptyState
              title="No documents found"
              description="Try another search term or switch section tabs."
              actions={
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearch('');
                    setTab('all');
                  }}
                >
                  Reset search
                </button>
              }
            />
          ) : (
            visible.map((doc) => {
              const alreadyInChat = existing.has(doc.id);
              const isPicked = picked.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  role="option"
                  aria-selected={alreadyInChat || isPicked}
                  disabled={alreadyInChat}
                  className={`sources-picker__item ${alreadyInChat ? 'is-added' : ''} ${isPicked ? 'is-picked' : ''}`}
                  onClick={() => toggle(doc.id)}
                >
                  <span className="sources-picker__check" aria-hidden="true">
                    {alreadyInChat || isPicked ? '✓' : ''}
                  </span>
                  <span className="sources-picker__item-main">
                    <span className="sources-picker__item-top">
                      <span className="sources-picker__type">{doc.category}</span>
                      {alreadyInChat ? <span className="sources-picker__status">Already in chat</span> : null}
                    </span>
                    <strong className="sources-picker__item-title">{doc.title}</strong>
                    <span className="sources-picker__item-desc">{doc.description}</span>
                    <span className="sources-picker__item-meta">
                      {doc.brand} · {doc.market} · {doc.year} · {doc.fileFormat}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <footer className="sources-picker__footer">
          <div className="sources-picker__picked">
            {pickedDocs.length === 0 ? (
              <span className="sources-picker__picked-empty">Select one or more documents to continue</span>
            ) : (
              <>
                <span className="sources-picker__picked-count">{pickedDocs.length} selected</span>
                <div className="sources-picker__picked-chips">
                  {pickedDocs.map((doc) => (
                    <span key={doc.id} className="chip chip-hub chip-removable">
                      {doc.title}
                      <button type="button" aria-label={`Remove ${doc.title}`} onClick={() => toggle(doc.id)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="sources-picker__footer-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={picked.length === 0}
              onClick={() => onAdd(picked)}
            >
              {picked.length === 0 ? 'Add to Chat' : `Add ${picked.length} to Chat`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
