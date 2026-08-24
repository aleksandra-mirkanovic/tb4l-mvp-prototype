import { useEffect, useMemo, useRef, useState } from 'react';
import type { KnowledgeDocument } from '../types';
import './DocumentSummaryPanel.css';

interface DocumentSummaryPanelProps {
  document: KnowledgeDocument;
  selected: boolean;
  onClose: () => void;
  onSelectForChat: () => void;
  onOpenInChat: () => void;
  onAskTopic?: (topic: string) => void;
}

export function DocumentSummaryPanel({
  document,
  selected,
  onClose,
  onSelectForChat,
  onOpenInChat,
  onAskTopic,
}: DocumentSummaryPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
  const [visibleSummary, setVisibleSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const relevance = useMemo(() => {
    const base = 72 + (document.keyTopics.length % 5) * 4 + (document.year % 10);
    return Math.min(96, base);
  }, [document]);

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
    setActiveTopic(null);

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
          <div className="summary-cover__meta">
            <span>{document.brand}</span>
            <span>{document.market}</span>
            <span>{document.year}</span>
            <span>{document.documentType}</span>
          </div>
        </div>

        <div className="summary-body">
          <div className="summary-score" aria-label={`Relevance score ${relevance} percent`}>
            <div className="summary-score__label">
              <strong>Why it matters now</strong>
              <span>{relevance}% fit for TB4L planning</span>
            </div>
            <div className="summary-score__track" role="presentation">
              <div
                className={`summary-score__fill ${phase === 'ready' ? 'is-animated' : ''}`}
                style={{ ['--score' as string]: `${relevance}%` }}
              />
            </div>
          </div>

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
            <p className="summary-hint">Click a topic to explore it in Chat.</p>
            <div className="summary-topics">
              {document.keyTopics.map((topic, index) => (
                <button
                  key={topic}
                  type="button"
                  className={`summary-topic ${activeTopic === topic ? 'is-active' : ''}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                  onClick={() => {
                    setActiveTopic(topic);
                    onAskTopic?.(topic);
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>

          <dl className="summary-panel__meta">
            <div>
              <dt>Category</dt>
              <dd>{document.category}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{document.lastUpdated}</dd>
            </div>
            <div>
              <dt>Brand</dt>
              <dd>{document.brand}</dd>
            </div>
            <div>
              <dt>Market</dt>
              <dd>{document.market}</dd>
            </div>
          </dl>

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
