import type { KnowledgeDocument } from '../types';
import './DocumentCard.css';

interface DocumentCardProps {
  document: KnowledgeDocument;
  selected: boolean;
  onToggle: () => void;
  onViewSummary: () => void;
}

export function DocumentCard({ document, selected, onToggle, onViewSummary }: DocumentCardProps) {
  return (
    <article className={`document-card card ${selected ? 'is-selected' : ''}`}>
      <div className="document-card__top">
        <label className="document-card__select">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select ${document.title} for chat`}
          />
          <span className="document-card__check" aria-hidden="true">
            {selected ? '✓' : ''}
          </span>
          <span className="sr-only">{selected ? 'Selected' : 'Not selected'}</span>
        </label>
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
          <dd>{document.fileFormat}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{document.lastUpdated}</dd>
        </div>
      </dl>

      <div className="document-card__actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onViewSummary}>
          View Summary
        </button>
      </div>
    </article>
  );
}
