import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.to && !isLast ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
