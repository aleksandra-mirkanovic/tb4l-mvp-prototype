import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AddSourcesModal } from '../components/AddSourcesModal';
import { ErrorState } from '../components/ErrorState';
import { MessageActionIcons } from '../components/MessageActionIcons';
import { useApp } from '../context/AppContext';
import {
  DOCUMENT_SUGGESTIONS,
  GENERAL_SUGGESTIONS,
  GENIE_SUGGESTIONS,
  buildDocumentResponse,
  buildGeneralResponse,
  buildGenieResponse,
  buildUnavailableSourceResponse,
} from '../data/chatResponses';
import type { ChatSession } from '../types';
import './ChatPage.css';

const GENIE_DELAY_MS = 1800;
const STREAM_TICK_MS = 22;

function formatLines(content: string) {
  return content.split('\n').map((line, i) => <p key={i}>{line || '\u00A0'}</p>);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatSessionTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSessionDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ChatPage() {
  const {
    activeSources,
    chatMessages,
    chatSessions,
    activeSessionId,
    genieEnabled,
    genieStatus,
    addSources,
    removeSource,
    clearSources,
    setGenieEnabled,
    setGenieStatus,
    addMessage,
    updateMessage,
    setMessageFeedback,
    startNewSession,
    loadSession,
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [waitingOnGenie, setWaitingOnGenie] = useState(false);
  const [showAddSources, setShowAddSources] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const cancelRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const askHandledRef = useRef(false);

  const documentSources = activeSources.filter((s) => s.kind === 'document');
  const hasDocuments = documentSources.length > 0;
  const hasGenie = genieEnabled;

  const suggestions = useMemo(() => {
    if (hasGenie && !hasDocuments) return GENIE_SUGGESTIONS;
    if (hasDocuments) return DOCUMENT_SUGGESTIONS;
    return GENERAL_SUGGESTIONS;
  }, [hasDocuments, hasGenie]);

  const { todaySessions, previousSessions } = useMemo(() => {
    const todayStart = startOfToday();
    const sorted = [...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt);
    const today: ChatSession[] = [];
    const previous: ChatSession[] = [];
    for (const session of sorted) {
      if (session.messages.length === 0 && session.id !== activeSessionId) continue;
      if (session.updatedAt >= todayStart) today.push(session);
      else previous.push(session);
    }
    return { todaySessions: today, previousSessions: previous };
  }, [activeSessionId, chatSessions]);

  const sourceStatus = useMemo(() => {
    const parts: string[] = [];
    if (hasGenie) parts.push('Genie/M360 connected');
    if (hasDocuments) parts.push(`${documentSources.length} Hub document${documentSources.length > 1 ? 's' : ''}`);
    if (!parts.length) return 'Using approved TB4L framework content';
    return parts.join(' · ');
  }, [documentSources.length, hasDocuments, hasGenie]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, streaming, waitingOnGenie, isTyping]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const streamText = useCallback(
    (fullText: string, meta: { citations: string[]; isGenie?: boolean; error?: boolean }, regenerateId?: string) => {
      let i = 0;
      setStreaming('');
      const step = () => {
        if (cancelRef.current) {
          setStreaming('');
          setIsTyping(false);
          setWaitingOnGenie(false);
          return;
        }
        if (i < fullText.length) {
          const chunk = Math.min(hasGenie ? 2 : 3, fullText.length - i);
          i += chunk;
          setStreaming(fullText.slice(0, i));
          schedule(step, STREAM_TICK_MS);
        } else {
          setStreaming('');
          setIsTyping(false);
          setWaitingOnGenie(false);
          if (regenerateId) {
            updateMessage(regenerateId, {
              content: fullText,
              citations: meta.citations,
              isGenie: meta.isGenie,
              error: meta.error,
              feedback: null,
            });
          } else {
            addMessage({
              role: 'assistant',
              content: fullText,
              citations: meta.citations,
              isGenie: meta.isGenie,
              error: meta.error,
            });
          }
          if (meta.isGenie) setGenieStatus(meta.error ? 'error' : 'success');
          else setGenieStatus('idle');
        }
      };
      step();
    },
    [addMessage, hasGenie, setGenieStatus, updateMessage],
  );

  const respond = useCallback(
    (question: string, regenerateMessageId?: string) => {
      cancelRef.current = false;
      clearTimers();
      setIsTyping(true);
      setStreaming('');
      setLastPrompt(question);

      const useGenie = hasGenie;
      if (useGenie) {
        setGenieStatus('loading');
        setWaitingOnGenie(true);
      }

      const delay = useGenie ? GENIE_DELAY_MS : 450;

      schedule(() => {
        if (cancelRef.current) {
          setIsTyping(false);
          setWaitingOnGenie(false);
          return;
        }

        if (question.toLowerCase().includes('source unavailable')) {
          const payload = buildUnavailableSourceResponse();
          setWaitingOnGenie(false);
          streamText(payload.content, { citations: payload.citations, error: true }, regenerateMessageId);
          return;
        }

        if (useGenie && question.toLowerCase().includes('fail genie')) {
          setWaitingOnGenie(false);
          setIsTyping(false);
          setGenieStatus('error');
          addMessage({
            role: 'assistant',
            content:
              'Genie request failed while querying M360 data. You can try again or continue with General TB4L Chat.',
            error: true,
            isGenie: true,
          });
          return;
        }

        let payload;
        if (useGenie) {
          payload = buildGenieResponse(question);
        } else if (hasDocuments) {
          payload = buildDocumentResponse(
            question,
            documentSources.map((s) => s.title),
          );
        } else {
          payload = buildGeneralResponse(question);
        }

        setWaitingOnGenie(false);
        streamText(
          payload.content,
          { citations: payload.citations, isGenie: useGenie },
          regenerateMessageId,
        );
      }, delay);
    },
    [
      addMessage,
      documentSources,
      hasDocuments,
      hasGenie,
      setGenieStatus,
      streamText,
    ],
  );

  const submit = (question?: string) => {
    const trimmed = (question ?? input).trim();
    if (!trimmed || isTyping) return;
    addMessage({ role: 'user', content: trimmed });
    setInput('');
    respond(trimmed);
  };

  useEffect(() => {
    const ask = searchParams.get('ask');
    if (!ask) {
      askHandledRef.current = false;
      return;
    }
    if (askHandledRef.current || isTyping) return;
    askHandledRef.current = true;
    setSearchParams({}, { replace: true });
    const timer = window.setTimeout(() => {
      addMessage({ role: 'user', content: ask });
      respond(ask);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [addMessage, isTyping, respond, searchParams, setSearchParams]);

  const cancelGenie = () => {
    cancelRef.current = true;
    clearTimers();
    setIsTyping(false);
    setWaitingOnGenie(false);
    setStreaming('');
    setGenieStatus('cancelled');
    addMessage({
      role: 'assistant',
      content: 'Genie request cancelled. You can ask again or continue with standard TB4L Chat.',
      isGenie: true,
    });
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyNotice('Copied');
      window.setTimeout(() => setCopyNotice(''), 1400);
    } catch {
      setCopyNotice('Copy failed');
      window.setTimeout(() => setCopyNotice(''), 1400);
    }
  };

  const handleRegenerate = (assistantId: string) => {
    const idx = chatMessages.findIndex((m) => m.id === assistantId);
    const priorUser = [...chatMessages.slice(0, idx)].reverse().find((m) => m.role === 'user');
    const prompt = priorUser?.content ?? lastPrompt;
    if (!prompt || isTyping) return;
    respond(prompt, assistantId);
  };

  const startNewChat = () => {
    cancelRef.current = true;
    clearTimers();
    startNewSession();
    setInput('');
    setStreaming('');
    setWaitingOnGenie(false);
    setIsTyping(false);
    setLastPrompt(null);
  };

  const openSession = (sessionId: string) => {
    if (isTyping || sessionId === activeSessionId) return;
    cancelRef.current = true;
    clearTimers();
    setStreaming('');
    setWaitingOnGenie(false);
    setIsTyping(false);
    setLastPrompt(null);
    loadSession(sessionId);
  };

  const empty = chatMessages.length === 0 && !streaming && !waitingOnGenie;

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar" aria-label="Chat sidebar">
        <div className="chat-sidebar__section">
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={startNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-sidebar__section chat-sidebar__section--grow">
          <div className="chat-sidebar__label">Today’s sessions</div>
          {todaySessions.length === 0 ? (
            <p className="chat-sidebar__hint">No chats yet today. Start one below.</p>
          ) : (
            todaySessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`chat-recent ${session.id === activeSessionId ? 'is-active' : ''}`}
                onClick={() => openSession(session.id)}
                disabled={isTyping}
              >
                <span className="chat-recent__title">{session.title}</span>
                <span className="chat-recent__meta">{formatSessionTime(session.updatedAt)}</span>
              </button>
            ))
          )}

          <div className="chat-sidebar__label" style={{ marginTop: 16 }}>
            Previous sessions
          </div>
          {previousSessions.length === 0 ? (
            <p className="chat-sidebar__hint">Earlier conversations will appear here.</p>
          ) : (
            previousSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`chat-recent ${session.id === activeSessionId ? 'is-active' : ''}`}
                onClick={() => openSession(session.id)}
                disabled={isTyping}
              >
                <span className="chat-recent__title">{session.title}</span>
                <span className="chat-recent__meta">{formatSessionDate(session.updatedAt)}</span>
              </button>
            ))
          )}
        </div>

        <div className="chat-sidebar__section">
          <div className="chat-sidebar__label">Direct connections</div>
          <button
            type="button"
            className={`chat-connection ${hasGenie ? 'is-connected' : ''}`}
            onClick={() => setGenieEnabled(!hasGenie)}
            aria-pressed={hasGenie}
            disabled={isTyping}
          >
            <span className={`chat-connection__dot ${hasGenie ? 'is-live' : ''}`} aria-hidden="true" />
            <span className="chat-connection__body">
              <strong>Genie / M360</strong>
              <span>{hasGenie ? 'Connected · data questions' : 'Click to connect'}</span>
            </span>
            <span className="chat-connection__badge">{hasGenie ? 'On' : 'Off'}</span>
          </button>
          <p className="chat-sidebar__hint">
            Connect M360 explicitly before asking performance or indicator questions. Never auto-triggered.
          </p>
        </div>

        <div className="chat-sidebar__section chat-sources-panel">
          <div className="chat-sidebar__label-row">
            <div className="chat-sidebar__label">
              Knowledge sources
              {documentSources.length > 0 ? (
                <span className="chat-sources-count" aria-label={`${documentSources.length} documents selected`}>
                  {documentSources.length}
                </span>
              ) : null}
            </div>
          </div>

          {documentSources.length ? (
            <>
              <p className="chat-sidebar__hint chat-sources-panel__hint">
                Chat will use these Hub documents as context.
              </p>
              <div className="chat-sources-list">
                {documentSources.map((source) => (
                  <div key={source.id} className="chat-source-chip">
                    <span className="chat-source-chip__icon" aria-hidden="true">
                      DOC
                    </span>
                    <span className="chat-source-chip__title" title={source.title}>
                      {source.title}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${source.title}`}
                      onClick={() => removeSource(source.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="chat-sources-panel__actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddSources(true)}>
                  + Add more
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => documentSources.forEach((s) => removeSource(s.id))}
                >
                  Clear all
                </button>
              </div>
            </>
          ) : (
            <div className="chat-sources-empty">
              <p>
                <strong>No Hub documents yet</strong>
                Framework knowledge is still available. Add documents when you want to talk about specific Hub
                content.
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddSources(true)}>
                + Add from Knowledge Hub
              </button>
              <Link className="chat-inline-link" to="/knowledge-hub">
                Or browse the Hub first →
              </Link>
            </div>
          )}
        </div>
      </aside>

      <section className="chat-main" aria-label="Conversation">
        <div className="chat-toolbar">
          <div className="chat-toolbar__left">
            <span className="chat-toolbar__title">TB4L Chat</span>
            <span className="chat-status">
              <span className="chat-status__dot" aria-hidden="true" />
              {sourceStatus}
            </span>
            {copyNotice ? <span className="chat-toolbar__notice">{copyNotice}</span> : null}
          </div>
          <div className="chat-toolbar__right">
            <button type="button" className="btn btn-ghost btn-sm" onClick={startNewChat}>
              Clear
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddSources(true)}>
              + Add Sources
            </button>
          </div>
        </div>

        {hasGenie ? (
          <div className="chat-genie-banner" role="status">
            <strong>Genie / M360</strong>
            <span>Connected for structured data. Responses may take longer than standard Chat.</span>
            {waitingOnGenie ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={cancelGenie}>
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}

        {documentSources.length > 0 ? (
          <div className="chat-sources-bar" aria-label="Background sources">
            <span className="chat-sources-bar__label">Talking about</span>
            {documentSources.map((s) => (
              <span key={s.id} className="chip chip-hub chip-removable">
                {s.title}
                <button type="button" aria-label={`Remove ${s.title}`} onClick={() => removeSource(s.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="chat-messages" ref={messagesRef} aria-live="polite">
          {empty ? (
            <div className="chat-empty">
              <div className="chat-empty__mark" aria-hidden="true">
                TB
              </div>
              <h1>Welcome to TB4L Chat</h1>
              <p>
                Ask about Trusted Brands for Life—the four stages, Brand Frames, and Road to Billions
                guidance. Add Knowledge Hub documents for brand or market context, or connect
                Genie/M360 for data questions.
              </p>
              <div className="chat-empty__actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddSources(true)}>
                  + Add from Knowledge Hub
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${hasGenie ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setGenieEnabled(!hasGenie)}
                >
                  {hasGenie ? 'M360 connected' : 'Connect M360'}
                </button>
              </div>
              <p className="chat-empty__ask">Here are some of the things you can ask me</p>
              <div className="chat-suggestions">
                {suggestions.map((q) => (
                  <button key={q} type="button" className="chat-suggestion" onClick={() => submit(q)} disabled={isTyping}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <article
                    key={message.id}
                    className={`chat-bubble-row ${isUser ? 'is-user' : 'is-assistant'}${message.isGenie ? ' is-genie' : ''}${message.error ? ' is-error' : ''}`}
                  >
                    <div className="chat-avatar" aria-hidden="true">
                      {isUser ? 'You' : message.isGenie ? 'M360' : 'AI'}
                    </div>
                    <div className="chat-bubble-wrap">
                      <div className="chat-bubble">{formatLines(message.content)}</div>
                      {!isUser && message.citations && message.citations.length > 0 ? (
                        <div className="chat-citations">
                          {message.citations.map((c) => (
                            <span key={c} className="chip chip-hub">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {!isUser ? (
                        <MessageActionIcons
                          feedback={message.feedback}
                          onCopy={() => handleCopy(message.content)}
                          onLike={() => setMessageFeedback(message.id, 'like')}
                          onDislike={() => setMessageFeedback(message.id, 'dislike')}
                          onRegenerate={() => handleRegenerate(message.id)}
                        />
                      ) : null}
                      {message.error && message.content.toLowerCase().includes('source') ? (
                        <div className="chat-inline-error">
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => handleRegenerate(message.id)}>
                            Try Again
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => clearSources()}>
                            Continue with General TB4L Chat
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}

              {genieStatus === 'error' ? (
                <ErrorState
                  title="Genie request failed"
                  description="The M360 query could not be completed in this prototype simulation."
                  actions={
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => lastPrompt && respond(lastPrompt)}
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setGenieEnabled(false);
                          setGenieStatus('idle');
                        }}
                      >
                        Continue with General TB4L Chat
                      </button>
                    </>
                  }
                />
              ) : null}

              {waitingOnGenie ? (
                <article className="chat-bubble-row is-assistant is-genie">
                  <div className="chat-avatar">M360</div>
                  <div className="chat-bubble chat-bubble--typing">
                    <span />
                    <span />
                    <span />
                    <em>Querying M360 data — this may take longer…</em>
                  </div>
                </article>
              ) : null}

              {streaming ? (
                <article className={`chat-bubble-row is-assistant${hasGenie ? ' is-genie' : ''}`}>
                  <div className="chat-avatar">{hasGenie ? 'M360' : 'AI'}</div>
                  <div className="chat-bubble">
                    {formatLines(streaming)}
                    <span className="chat-caret" aria-hidden="true" />
                  </div>
                </article>
              ) : null}
            </>
          )}
        </div>

        {!empty && !isTyping ? (
          <div className="chat-suggestions chat-suggestions--footer">
            <span className="chat-empty__ask">You can also ask</span>
            {suggestions.slice(0, 3).map((q) => (
              <button key={q} type="button" className="chat-suggestion" onClick={() => submit(q)}>
                {q}
              </button>
            ))}
          </div>
        ) : null}

        <div className="chat-composer-area">
          <form
            className="chat-composer-wrap"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="sr-only" htmlFor="chat-input">
              Message TB4L Chat
            </label>
            <textarea
              id="chat-input"
              className="chat-input"
              rows={1}
              value={input}
              disabled={isTyping}
              placeholder={
                hasGenie
                  ? 'Ask a Genie/M360 data question…'
                  : hasDocuments
                    ? 'Ask about your Hub documents…'
                    : 'Ask about Trusted Brands for Life…'
              }
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button type="submit" className="chat-send" disabled={isTyping || !input.trim()} aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </form>
          <p className="chat-disclaimer">
            Prototype chat · Framework answers use approved TB4L content · Genie/M360 and Hub sources are simulated
          </p>
        </div>
      </section>

      {showAddSources ? (
        <AddSourcesModal
          existingSourceIds={activeSources.map((s) => s.id)}
          onClose={() => setShowAddSources(false)}
          onAdd={(ids) => {
            addSources(ids);
            setShowAddSources(false);
          }}
        />
      ) : null}
    </div>
  );
}
