import { useEffect, useMemo, useRef, useState } from 'react';
import { getDocumentKnowledge, getRelatedDocuments } from '../data/documentKnowledge';
import { formatExtension } from '../data/documents';
import type { KnowledgeDocument } from '../types';
import './DocumentSummaryPanel.css';

interface DocumentSummaryPanelProps {
  document: KnowledgeDocument;
  selected: boolean;
  onClose: () => void;
  onSelectForChat: () => void;
  onOpenInChat: () => void;
  onOpenRelated?: (id: string) => void;
  onAskQuestion?: (question: string) => void;
}

export function DocumentSummaryPanel({
  document,
  selected,
  onClose,
  onSelectForChat,
  onOpenInChat,
  onOpenRelated,
  onAskQuestion,
}: DocumentSummaryPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const knowledge = useMemo(() => getDocumentKnowledge(document), [document]);
  const relatedDocs = useMemo(() => getRelatedDocuments(document), [document]);
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
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
    const readyTimer = window.setTimeout(() => setPhase('ready'), 720);
    return () => window.clearTimeout(readyTimer);
  }, [document.id]);

  const copyKnowledge = async () => {
    const text = [
      document.title,
      '',
      'Why it matters',
      document.whyRelevant,
      knowledge.purpose,
      '',
      'Key takeaways',
      ...knowledge.keyTakeaways.map((t) => `• ${t}`),
      '',
      'AI insights',
      ...knowledge.aiInsights.map((t) => `• ${t}`),
      '',
      'Related knowledge',
      ...relatedDocs.map((d) => `• ${d.title}`),
      '',
      'Suggested questions',
      ...knowledge.suggestedQuestions.map((q) => `• ${q}`),
      '',
      'Recommended for',
      knowledge.recommendedFor.join(', '),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const askQuestion = (question: string) => {
    if (onAskQuestion) {
      onAskQuestion(question);
      return;
    }
    onOpenInChat();
  };

  return (
    <div className="overlay summary-overlay" role="presentation" onClick={onClose}>
      <aside
        className="summary-panel summary-panel--premium summary-panel--knowledge"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="summary-cover" data-category={document.category}>
          <div className="summary-cover__top">
            <div className="summary-cover__eyebrow">
              <span className="badge badge-ai">AI knowledge view</span>
              <p className="summary-cover__layer">Intelligence layer on TB4L Hub</p>
            </div>
            <div className="summary-cover__tools">
              <button type="button" className="btn btn-ghost btn-sm summary-cover__close" onClick={copyKnowledge}>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                ref={closeRef}
                type="button"
                className="btn btn-ghost btn-sm summary-cover__close"
                onClick={onClose}
                aria-label="Close knowledge panel"
              >
                Close
              </button>
            </div>
          </div>
          <h2 id="summary-title" className="summary-cover__title">
            {document.title}
          </h2>
          <p className="summary-cover__purpose">{knowledge.purpose}</p>
        </header>

        <div className="summary-body">
          {phase === 'loading' ? (
            <div className="summary-generating summary-generating--block" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              Analyzing document and connecting enterprise knowledge…
            </div>
          ) : (
            <>
              <section className="summary-hero" aria-labelledby="why-heading">
                <h3 id="why-heading">Why it matters</h3>
                <p className="summary-hero__text">{document.whyRelevant}</p>
              </section>

              <section className="summary-panel__section summary-knowledge-block" aria-labelledby="takeaways-heading">
                <h3 id="takeaways-heading">Key takeaways</h3>
                <ul className="summary-takeaways">
                  {knowledge.keyTakeaways.map((item, index) => (
                    <li
                      key={item}
                      className="summary-takeaways__item"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="summary-takeaways__mark" aria-hidden="true">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="summary-panel__section summary-knowledge-block summary-ai-insights"
                aria-labelledby="insights-heading"
              >
                <h3 id="insights-heading">AI insights</h3>
                <ul className="summary-insights">
                  {knowledge.aiInsights.map((insight, index) => (
                    <li
                      key={insight}
                      className="summary-insights__item"
                      style={{ animationDelay: `${index * 55}ms` }}
                    >
                      <span className="summary-insights__icon" aria-hidden="true">
                        ✦
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {relatedDocs.length > 0 ? (
                <section
                  className="summary-panel__section summary-knowledge-block"
                  aria-labelledby="related-heading"
                >
                  <h3 id="related-heading">Related knowledge</h3>
                  <ul className="summary-related">
                    {relatedDocs.map((related) => (
                      <li key={related.id}>
                        {onOpenRelated ? (
                          <button
                            type="button"
                            className="summary-related__btn"
                            onClick={() => onOpenRelated(related.id)}
                          >
                            <span className="summary-related__title">{related.title}</span>
                            <span className="summary-related__meta">
                              {related.category} · {formatExtension(related.fileFormat)}
                            </span>
                          </button>
                        ) : (
                          <div className="summary-related__btn summary-related__btn--static">
                            <span className="summary-related__title">{related.title}</span>
                            <span className="summary-related__meta">
                              {related.category} · {formatExtension(related.fileFormat)}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section
                className="summary-panel__section summary-knowledge-block summary-questions"
                aria-labelledby="questions-heading"
              >
                <h3 id="questions-heading">Suggested questions for TB4L Chat</h3>
                <div className="summary-prompts" role="list">
                  {knowledge.suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="summary-prompt"
                      role="listitem"
                      onClick={() => askQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </section>

              <section className="summary-panel__section summary-knowledge-block summary-recommended" aria-labelledby="personas-heading">
                <h3 id="personas-heading">Recommended for</h3>
                <div className="summary-personas" role="list">
                  {knowledge.recommendedFor.map((persona, index) => (
                    <span
                      key={persona}
                      className="summary-persona"
                      role="listitem"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {persona}
                    </span>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="summary-panel__actions">
            <button type="button" className="btn btn-secondary" onClick={onSelectForChat}>
              {selected ? 'Selected for Chat ✓' : 'Select for Chat'}
            </button>
            <button type="button" className="btn btn-primary" onClick={onOpenInChat}>
              Open in Chat
            </button>
          </div>

          <footer className="summary-meta-footer" aria-label="Document metadata">
            <span>
              <strong>Type</strong> {formatExtension(document.fileFormat)}
            </span>
            <span>
              <strong>Author</strong> {knowledge.author}
            </span>
            <span>
              <strong>Updated</strong> {document.lastUpdated}
            </span>
            <span>
              <strong>Category</strong> {document.category}
            </span>
            <span className="summary-meta-footer__tags">
              <strong>Tags</strong> {document.keyTopics.slice(0, 4).join(' · ')}
            </span>
          </footer>
        </div>
      </aside>
    </div>
  );
}
