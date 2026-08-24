import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description: string;
  iconLabel?: string;
  actions?: ReactNode;
}

export function EmptyState({ title, description, iconLabel = 'Empty', actions }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon" aria-hidden="true">
        ⌀
      </div>
      <span className="sr-only">{iconLabel}</span>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  );
}
