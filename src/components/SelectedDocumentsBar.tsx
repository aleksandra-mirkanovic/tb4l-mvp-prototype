import { getDocumentById } from '../data/documents';
import './SelectedDocumentsBar.css';

interface SelectedDocumentsBarProps {
  selectedIds: string[];
  m360Selected?: boolean;
  onClear: () => void;
  onRemove: (id: string) => void;
  onRemoveM360?: () => void;
  onAskInChat: () => void;
}

export function SelectedDocumentsBar({
  selectedIds,
  m360Selected = false,
  onClear,
  onRemove,
  onRemoveM360,
  onAskInChat,
}: SelectedDocumentsBarProps) {
  const total = selectedIds.length + (m360Selected ? 1 : 0);
  if (total === 0) return null;

  return (
    <>
      <div className="selected-bar-spacer" aria-hidden="true" />
      <div className="selected-bar" role="region" aria-label="Selected context for TB4L Chat">
        <div className="selected-bar__info">
          <strong>
            {total} trusted source{total === 1 ? '' : 's'} selected
          </strong>
          <p className="selected-bar__hint">
            {m360Selected
              ? 'Open TB4L Chat with M360 connected for structured market and brand data.'
              : 'Open TB4L Chat with these Hub documents as context. You can also connect data sources (like M360) inside Chat.'}
          </p>
          <div className="selected-bar__chips">
            {m360Selected ? (
              <span className="chip chip-hub chip-removable">
                <span>M360</span>
                <button
                  type="button"
                  aria-label="Remove M360"
                  onClick={() => onRemoveM360?.()}
                >
                  ×
                </button>
              </span>
            ) : null}
            {selectedIds.map((id) => {
              const doc = getDocumentById(id);
              return (
                <span key={id} className="chip chip-hub chip-removable">
                  <span>{doc?.title ?? id}</span>
                  <button type="button" aria-label={`Remove ${doc?.title ?? id}`} onClick={() => onRemove(id)}>
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
        <div className="selected-bar__actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear
          </button>
          <button type="button" className="btn selected-bar__cta" onClick={onAskInChat}>
            Ask with these sources
          </button>
        </div>
      </div>
    </>
  );
}
