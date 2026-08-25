import { useEffect, useRef, useState } from 'react';
import type { KnowledgeDocument } from '../types';
import './DocumentSummaryPanel.css';

interface DocumentSummaryPanelProps {
  document: KnowledgeDocument;
  selected: boolean;
  onClose: () => void;
  onSelectForChat: () => void;
  onOpenInChat: () => void;
}

export function DocumentSummaryPanel({
  document,
  selected,
  onClose,
  onSelectForChat,
  onOpenInChat,
}: DocumentSummaryPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
  const [visibleSummary, setVisibleSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setPhase('loading');
    setVisibleSummary('');

    const readyTimer = window.setTimeout(() => setPhase('ready'), 700);
    let i = 0;
    let streamTimer: number | undefined;

    const startStream = window.setTimeout(() => {
      const full = document.summary;
      const tick = () => {
        i = Math.min(full.length, i + 3);
        setVisibleSummary(full.slice(0, i));
        if (i < full.length) {
          streamTimer = window.setTimeout(tick, 16);
        }
      };
      tick();
    }, 720);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(startStream);
      if (streamTimer) window.clearTimeout(streamTimer);
    };
  }, [document]);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(
        `${document.title}\n\n${document.summary}\n\nKey topics: ${document.keyTopics.join(', ')}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overlay summary-overlay" role="presentation" onClick={onClose}>
      <aside
        className="summary-panel summary-panel--premium"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="summary-cover" data-category={document.category}>
          <div className="summary-cover__top">
            <span className="badge badge-ai">AI-generated summary</span>
            <button
              ref={closeRef}
              type="button"
              className="btn btn-ghost btn-sm summary-cover__close"
              onClick={onClose}
              aria-label="Close summary"
            >
              Close
            </button>
          </div>
          <p className="summary-cover__format">{document.fileFormat}</p>
          <h2 id="summary-title" className="summary-cover__title">
            {document.title}
          </h2>
          <p className="summary-cover__why">{document.whyRelevant}</p>
        </div>

        <div className="summary-body">
          <section className="summary-panel__section">
            <div className="summary-section-head">
              <h3>Summary</h3>
              {phase === 'loading' ? (
                <span className="summary-generating">
                  <span className="spinner" aria-hidden="true" />
                  Generating insight…
                </span>
              ) : (
                <button type="button" className="btn btn-ghost btn-sm" onClick={copySummary}>
                  {copied ? 'Copied' : 'Copy summary'}
                </button>
              )}
            </div>
            <p className="summary-stream">{visibleSummary || ' '}</p>
          </section>

          <section className="summary-panel__section">
            <h3>Key topics</h3>
            <div className="summary-topics">
              {document.keyTopics.map((topic, index) => (
                <span
                  key={topic}
                  className="summary-topic"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <div className="summary-panel__actions">
            <button type="button" className="btn btn-secondary" onClick={onSelectForChat}>
              {selected ? 'Selected for Chat ✓' : 'Select for Chat'}
            </button>
            <button type="button" className="btn btn-primary" onClick={onOpenInChat}>
              Open in Chat
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
