import type { KeyboardEvent, MouseEvent } from 'react';
import type { KnowledgeDocument } from '../types';
import { formatExtension } from '../data/documents';
import './DocumentCard.css';

interface DocumentCardProps {
  document: KnowledgeDocument;
  selected: boolean;
  onToggle: () => void;
  onViewSummary: () => void;
  onAskAi?: () => void;
  askLabel?: string;
  compact?: boolean;
  /** Sources-like tile for Hub section pages */
  tile?: boolean;
}

function stopCardAction(e: MouseEvent | KeyboardEvent) {
  e.stopPropagation();
}

export function DocumentCard({
  document,
  selected,
  onToggle,
  onViewSummary,
  onAskAi,
  askLabel = 'Ask AI about this document',
  compact = false,
  tile = false,
}: DocumentCardProps) {
  const onCardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  if (tile) {
    return (
      <article
        className={`document-card document-card--tile document-card--clickable${selected ? ' is-selected' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onToggle}
        onKeyDown={onCardKeyDown}
        aria-label={`${selected ? 'Deselect' : 'Select'} ${document.title} for chat`}
      >
        <span className="document-card__select document-card__select--tile" aria-hidden="true">
          <span className="document-card__check">{selected ? '✓' : ''}</span>
        </span>

        <div className="document-card__top document-card__top--tile">
          <h3 className="document-card__title">{document.title}</h3>
          <span className="document-card__badge">{formatExtension(document.fileFormat)}</span>
        </div>
        <p className="document-card__desc">{document.description}</p>
        <p className="document-card__meta-line">
          <span>{document.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{document.market}</span>
          <span aria-hidden="true">·</span>
          <span>{document.documentType}</span>
        </p>
        <div className="document-card__actions document-card__actions--tile">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              stopCardAction(e);
              onViewSummary();
            }}
          >
            Summary
          </button>
        </div>
      </article>
    );
  }

  if (compact) {
    return (
      <article
        className={`document-card document-card--compact document-card--clickable card${selected ? ' is-selected' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onToggle}
        onKeyDown={onCardKeyDown}
        aria-label={`${selected ? 'Deselect' : 'Select'} ${document.title} for chat`}
      >
        <span className="document-card__select" aria-hidden="true">
          <span className="document-card__check">{selected ? '✓' : ''}</span>
        </span>

        <div className="document-card__body">
          <div className="document-card__topline">
            <h3 className="document-card__title">{document.title}</h3>
            <span className="badge badge-hub">{document.category}</span>
          </div>
          <p className="document-card__desc">{document.description}</p>
          <p className="document-card__meta-line">
            <span>{document.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{document.market}</span>
            <span aria-hidden="true">·</span>
            <span>{document.documentType}</span>
            <span aria-hidden="true">·</span>
            <span>{document.year}</span>
            <span aria-hidden="true">·</span>
            <span>{formatExtension(document.fileFormat)}</span>
          </p>
        </div>

        <div className="document-card__actions document-card__actions--compact">
          {onAskAi ? (
            <button
              type="button"
              className="btn btn-primary btn-sm document-card__ask"
              onClick={(e) => {
                stopCardAction(e);
                onAskAi();
              }}
              aria-label={`${askLabel}: ${document.title}`}
            >
              {askLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              stopCardAction(e);
              onViewSummary();
            }}
          >
            Summary
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`document-card document-card--clickable card${selected ? ' is-selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={onCardKeyDown}
      aria-label={`${selected ? 'Deselect' : 'Select'} ${document.title} for chat`}
    >
      <div className="document-card__top">
        <span className="document-card__select" aria-hidden="true">
          <span className="document-card__check">{selected ? '✓' : ''}</span>
        </span>
        <span className="badge badge-hub">{document.category}</span>
      </div>

      <h3 className="document-card__title">{document.title}</h3>
      <p className="document-card__desc">{document.description}</p>

      <dl className="document-card__meta">
        <div>
          <dt>Brand</dt>
          <dd>{document.brand}</dd>
        </div>
        <div>
          <dt>Market</dt>
          <dd>{document.market}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{document.documentType}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{document.year}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{formatExtension(document.fileFormat)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{document.lastUpdated}</dd>
        </div>
      </dl>

      <div className="document-card__actions">
        {onAskAi ? (
          <button
            type="button"
            className="btn btn-primary btn-sm document-card__ask"
            onClick={(e) => {
              stopCardAction(e);
              onAskAi();
            }}
            aria-label={`${askLabel}: ${document.title}`}
          >
            {askLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            stopCardAction(e);
            onViewSummary();
          }}
        >
          View Summary
        </button>
      </div>
    </article>
  );
}
