import { FILTER_OPTIONS } from '../data/documents';
import type { HubFilters } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: HubFilters;
  onChange: (filters: HubFilters) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  variant?: 'sidebar' | 'toolbar';
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
  variant = 'sidebar',
}: FilterPanelProps) {
  const update = (key: keyof HubFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const fields = (
    <>
      <label className="filter-panel__field">
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

      <label className="filter-panel__field">
        <span className="field-label">Market</span>
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

      <label className="filter-panel__field">
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
    </>
  );

  if (variant === 'toolbar') {
    return (
      <div className="filter-toolbar" aria-label="Knowledge Hub filters">
        <div className="filter-toolbar__meta">
          <strong>Filters</strong>
          <span aria-live="polite">
            {resultCount} of {totalCount}
          </span>
        </div>
        <div className="filter-toolbar__fields">{fields}</div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
          Reset
        </button>
      </div>
    );
  }

  return (
    <aside className="filter-panel panel" aria-label="Knowledge Hub filters">
      <div className="filter-panel__head">
        <h2 className="filter-panel__title">Filters</h2>
        <p className="filter-panel__count" aria-live="polite">
          {resultCount} of {totalCount} documents
        </p>
      </div>
      <div className="filter-panel__fields">{fields}</div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
        Reset Filters
      </button>
    </aside>
  );
}
