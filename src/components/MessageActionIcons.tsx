import type { FeedbackValue } from '../types';
import './MessageActionIcons.css';

interface MessageActionIconsProps {
  feedback?: FeedbackValue;
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
  onRegenerate: () => void;
}

export function MessageActionIcons({
  feedback,
  onCopy,
  onLike,
  onDislike,
  onRegenerate,
}: MessageActionIconsProps) {
  return (
    <div className="msg-actions" role="group" aria-label="Message actions">
      <button type="button" className="msg-action" onClick={onCopy} aria-label="Copy" title="Copy">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`msg-action ${feedback === 'like' ? 'is-on' : ''}`}
        onClick={onLike}
        aria-label="Like"
        title="Like"
        aria-pressed={feedback === 'like'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm3 9h7.2a2 2 0 0 0 1.94-1.5l1.5-6A2 2 0 0 0 18.7 10H14V6a2 2 0 0 0-2-2l-2 7v9z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`msg-action ${feedback === 'dislike' ? 'is-on-bad' : ''}`}
        onClick={onDislike}
        aria-label="Dislike"
        title="Dislike"
        aria-pressed={feedback === 'dislike'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3zm-3-9H6.8a2 2 0 0 0-1.94 1.5l-1.5 6A2 2 0 0 0 5.3 14H10v4a2 2 0 0 0 2 2l2-7V4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className="msg-action"
        onClick={onRegenerate}
        aria-label="Regenerate"
        title="Regenerate"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M21 12a9 9 0 1 1-2.6-6.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M21 3v6h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
