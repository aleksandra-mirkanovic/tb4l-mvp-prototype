import type { ChatSource } from '../types';
import './SourceChip.css';

interface SourceChipProps {
  source: ChatSource;
  onRemove?: () => void;
}

export function SourceChip({ source, onRemove }: SourceChipProps) {
  const chipClass =
    source.kind === 'genie' ? 'chip-genie' : source.kind === 'document' ? 'chip-hub' : 'chip-chat';
  const label =
    source.kind === 'genie' ? 'M360' : source.kind === 'document' ? 'Hub' : 'General';

  return (
    <span className={`chip ${chipClass} source-chip ${onRemove ? 'chip-removable' : ''}`}>
      <span className="source-chip__kind" aria-hidden="true">
        {label}
      </span>
      <span>{source.title}</span>
      {onRemove ? (
        <button type="button" aria-label={`Remove source ${source.title}`} onClick={onRemove}>
          ×
        </button>
      ) : null}
    </span>
  );
}
