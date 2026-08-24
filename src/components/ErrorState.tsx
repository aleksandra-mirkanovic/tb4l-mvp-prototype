import type { ReactNode } from 'react';
import './EmptyState.css';

interface ErrorStateProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ErrorState({ title, description, actions }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        !
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__desc">{description}</p>
      {actions ? <div className="error-state__actions">{actions}</div> : null}
    </div>
  );
}
