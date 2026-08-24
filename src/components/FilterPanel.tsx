import { FILTER_OPTIONS } from '../data/documents';
import type { HubFilters } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: HubFilters;
  onChange: (filters: HubFilters) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterPanel({ filters, onChange, onReset, resultCount, totalCount }: FilterPanelProps) {
  const update = (key: keyof HubFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <aside className="filter-panel panel" aria-label="Knowledge Hub filters">
      <div className="filter-panel__head">
        <h2 className="filter-panel__title">Filters</h2>
        <p className="filter-panel__count" aria-live="polite">
          {resultCount} of {totalCount} documents
        </p>
      </div>

      <div className="filter-panel__fields">
        <label>
          <span className="field-label">Brand</span>
          <select
            className="field-control"
            value={filters.brand}
            onChange={(e) => update('brand', e.target.value)}
            aria-label="Filter by brand"
          >
            <option value="">All brands</option>
            {FILTER_OPTIONS.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Market / Country</span>
          <select
            className="field-control"
            value={filters.market}
            onChange={(e) => update('market', e.target.value)}
            aria-label="Filter by market or country"
          >
            <option value="">All markets</option>
            {FILTER_OPTIONS.markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Category</span>
          <select
            className="field-control"
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {FILTER_OPTIONS.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Document Type</span>
          <select
            className="field-control"
            value={filters.documentType}
            onChange={(e) => update('documentType', e.target.value)}
            aria-label="Filter by document type"
          >
            <option value="">All types</option>
            {FILTER_OPTIONS.documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Year</span>
          <select
            className="field-control"
            value={filters.year}
            onChange={(e) => update('year', e.target.value)}
            aria-label="Filter by year"
          >
            <option value="">All years</option>
            {FILTER_OPTIONS.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
        Reset Filters
      </button>
    </aside>
  );
}
