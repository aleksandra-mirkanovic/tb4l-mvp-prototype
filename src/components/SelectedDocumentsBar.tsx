import { getDocumentById } from '../data/documents';
import './SelectedDocumentsBar.css';

interface SelectedDocumentsBarProps {
  selectedIds: string[];
  onClear: () => void;
  onRemove: (id: string) => void;
  onAskInChat: () => void;
}

export function SelectedDocumentsBar({
  selectedIds,
  onClear,
  onRemove,
  onAskInChat,
}: SelectedDocumentsBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="selected-bar" role="region" aria-label="Selected documents">
      <div className="selected-bar__info">
        <strong>{selectedIds.length} selected</strong>
        <div className="selected-bar__chips">
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
          Clear selection
        </button>
        <button type="button" className="btn btn-primary" onClick={onAskInChat}>
          Ask Questions in Chat
        </button>
      </div>
    </div>
  );
}
