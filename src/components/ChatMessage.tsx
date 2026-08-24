import type { ChatMessage as ChatMessageType } from '../types';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
  onRegenerate: () => void;
}

export function ChatMessageView({
  message,
  onCopy,
  onLike,
  onDislike,
  onRegenerate,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <article
      className={`chat-message chat-message--${message.role}${message.isGenie ? ' chat-message--genie' : ''}${message.error ? ' chat-message--error' : ''}`}
      aria-label={isUser ? 'Your message' : 'Assistant message'}
    >
      <div className="chat-message__meta">
        <span className={`badge ${message.isGenie ? 'badge-genie' : isUser ? 'badge-hub' : 'badge-chat'}`}>
          {isUser ? 'You' : message.isGenie ? 'Genie / M360' : 'TB4L Chat'}
        </span>
      </div>
      <div className="chat-message__body">
        {message.content.split('\n').map((line, i) => (
          <p key={i}>{line || '\u00A0'}</p>
        ))}
      </div>
      {!isUser && message.citations && message.citations.length > 0 ? (
        <div className="chat-message__citations" aria-label="Citations">
          <span className="chat-message__citations-label">Sources</span>
          {message.citations.map((c) => (
            <span key={c} className="chip chip-hub">
              {c}
            </span>
          ))}
        </div>
      ) : null}
      {!isUser ? (
        <div className="chat-message__actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCopy}>
            Copy
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${message.feedback === 'like' ? 'is-active-like' : ''}`}
            onClick={onLike}
            aria-pressed={message.feedback === 'like'}
          >
            Like
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${message.feedback === 'dislike' ? 'is-active-dislike' : ''}`}
            onClick={onDislike}
            aria-pressed={message.feedback === 'dislike'}
          >
            Dislike
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRegenerate}>
            Regenerate
          </button>
        </div>
      ) : null}
    </article>
  );
}
