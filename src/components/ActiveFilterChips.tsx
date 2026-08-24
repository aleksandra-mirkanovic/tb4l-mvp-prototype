import type { HubFilters } from '../types';
import './ActiveFilterChips.css';

interface ActiveFilterChipsProps {
  filters: HubFilters;
  onClearOne: (key: keyof HubFilters) => void;
  onClearAll: () => void;
}

const LABELS: Record<keyof HubFilters, string> = {
  brand: 'Brand',
  market: 'Market',
  category: 'Category',
  documentType: 'Type',
  year: 'Year',
};

export function ActiveFilterChips({ filters, onClearOne, onClearAll }: ActiveFilterChipsProps) {
  const active = (Object.keys(filters) as (keyof HubFilters)[]).filter((k) => filters[k]);

  if (active.length === 0) return null;

  return (
    <div className="active-filters" aria-label="Active filters">
      <span className="active-filters__label">Active filters</span>
      <div className="active-filters__list">
        {active.map((key) => (
          <span key={key} className="chip chip-hub chip-removable">
            <span>
              {LABELS[key]}: {filters[key]}
            </span>
            <button
              type="button"
              aria-label={`Remove ${LABELS[key]} filter`}
              onClick={() => onClearOne(key)}
            >
              ×
            </button>
          </span>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClearAll}>
          Clear All
        </button>
      </div>
    </div>
  );
}
