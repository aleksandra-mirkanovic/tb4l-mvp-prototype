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
  const docCount = selectedIds.length;
  const total = docCount + (m360Selected ? 1 : 0);
  if (total === 0) return null;

  const sourceLabel =
    total === 1
      ? m360Selected
        ? 'AI grounded on 1 trusted live source'
        : 'AI grounded on 1 trusted source'
      : `AI grounded on ${total} trusted sources`;

  return (
    <>
      <div className="selected-bar-spacer" aria-hidden="true" />
      <div
        className="selected-bar selected-bar--context"
        role="region"
        aria-label="AI context for TB4L Chat"
      >
        <div className="selected-bar__main">
          <div className="selected-bar__header">
            <p className="selected-bar__eyebrow">AI Context Ready</p>
            <strong className="selected-bar__title">{sourceLabel}</strong>
            <p className="selected-bar__hint">
              TB4L Chat will use approved knowledge assets to generate grounded, traceable
              responses.
            </p>
          </div>

          <div className="selected-bar__assets" aria-label="Connected knowledge assets">
            {m360Selected ? (
              <span className="context-asset context-asset--live">
                <span className="context-asset__name">M360</span>
                <button
                  type="button"
                  className="context-asset__remove"
                  aria-label="Remove M360 from AI context"
                  onClick={() => onRemoveM360?.()}
                >
                  ×
                </button>
              </span>
            ) : null}
            {selectedIds.map((id) => {
              const doc = getDocumentById(id);
              return (
                <span key={id} className="context-asset">
                  <span className="context-asset__name">{doc?.title ?? id}</span>
                  <button
                    type="button"
                    className="context-asset__remove"
                    aria-label={`Remove ${doc?.title ?? id} from AI context`}
                    onClick={() => onRemove(id)}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          <ul className="selected-bar__trust">
            <li>Grounded in selected TB4L knowledge</li>
            <li>Sources cited in answers</li>
            <li>Approved knowledge, not generic AI</li>
          </ul>
        </div>

        <div className="selected-bar__actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear context
          </button>
          <div className="selected-bar__cta-wrap">
            <button type="button" className="btn selected-bar__cta" onClick={onAskInChat}>
              Ask TB4L Chat
            </button>
            <p className="selected-bar__cta-hint">
              Generate AI responses grounded in selected sources.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
