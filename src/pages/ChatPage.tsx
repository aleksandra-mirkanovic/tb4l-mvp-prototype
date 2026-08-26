import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddSourcesModal } from '../components/AddSourcesModal';
import { ErrorState } from '../components/ErrorState';
import { MessageActionIcons } from '../components/MessageActionIcons';
import { useApp } from '../context/AppContext';
import {
  CHAT_EMPTY_SUGGESTIONS,
  DOCUMENT_SUGGESTIONS,
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
const PENDING_ASK_KEY = 'tb4l-pending-ask';

/** Survives React Strict Mode remounts so home→chat asks are only seeded once. */
let seededPendingAsk: string | null = null;

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const [plusMenu, setPlusMenu] = useState<'closed' | 'main' | 'data'>('closed');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string }[]>([]);
  const [attachNotice, setAttachNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const cancelRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  const documentSources = activeSources.filter((s) => s.kind === 'document');
  const hasDocuments = documentSources.length > 0;
  const hasGenie = genieEnabled;

  const suggestions = useMemo(() => {
    if (hasGenie && !hasDocuments) return GENIE_SUGGESTIONS;
    if (hasDocuments) return DOCUMENT_SUGGESTIONS;
    return CHAT_EMPTY_SUGGESTIONS;
  }, [hasDocuments, hasGenie]);

  const emptySuggestions = useMemo(() => {
    if (hasGenie && !hasDocuments) return GENIE_SUGGESTIONS.slice(0, 3);
    if (hasDocuments) return DOCUMENT_SUGGESTIONS.slice(0, 3);
    return CHAT_EMPTY_SUGGESTIONS;
  }, [hasDocuments, hasGenie]);

  const contextHelp = useMemo(() => {
    if (hasDocuments && hasGenie) {
      return 'Answers use your selected Hub documents plus M360 data. This prototype simulates responses—verify before real decisions.';
    }
    if (hasDocuments) {
      return 'Answers are grounded in your selected Hub documents (mocked for this prototype). Citations appear under each reply.';
    }
    if (hasGenie) {
      return 'M360 is connected for structured data. Replies are simulated in this prototype and may take longer.';
    }
    return 'Without Hub sources, Chat uses approved TB4L framework guidance. Add documents or M360 via + for grounded context.';
  }, [hasDocuments, hasGenie]);

  const sourceStatus = useMemo(() => {
    const parts: string[] = ['Prototype · mocked'];
    if (hasGenie) parts.push('M360 connected');
    if (hasDocuments) parts.push(`${documentSources.length} Hub source${documentSources.length > 1 ? 's' : ''}`);
    if (!hasGenie && !hasDocuments) parts.push('framework knowledge');
    return parts.join(' · ');
  }, [documentSources.length, hasDocuments, hasGenie]);

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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, streaming, waitingOnGenie, isTyping]);

  useEffect(() => {
    if (plusMenu === 'closed') return;
    const onPointerDown = (e: MouseEvent) => {
      if (!plusMenuRef.current?.contains(e.target as Node)) {
        setPlusMenu('closed');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlusMenu('closed');
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [plusMenu]);

  const handleAttachFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `file-${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
    }));
    setAttachedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.id));
      return [...prev, ...next.filter((f) => !existing.has(f.id))];
    });
    setAttachNotice('File attached for this prototype chat (mocked — not uploaded).');
    window.setTimeout(() => setAttachNotice(''), 2800);
    setPlusMenu('closed');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

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
    (
      fullText: string,
      meta: { citations: string[]; isGenie?: boolean; error?: boolean },
      regenerateId?: string,
      onComplete?: () => void,
    ) => {
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
          onComplete?.();
        }
      };
      step();
    },
    [addMessage, hasGenie, setGenieStatus, updateMessage],
  );

  const respond = useCallback(
    (
      question: string,
      regenerateMessageId?: string,
      options?: { immediate?: boolean; onComplete?: () => void },
    ) => {
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

      const delay = options?.immediate ? 0 : useGenie ? GENIE_DELAY_MS : 450;

      schedule(() => {
        if (cancelRef.current) {
          setIsTyping(false);
          setWaitingOnGenie(false);
          return;
        }

        if (question.toLowerCase().includes('source unavailable')) {
          const payload = buildUnavailableSourceResponse();
          setWaitingOnGenie(false);
          streamText(
            payload.content,
            { citations: payload.citations, error: true },
            regenerateMessageId,
            options?.onComplete,
          );
          return;
        }

        if (useGenie && question.toLowerCase().includes('fail genie')) {
          setWaitingOnGenie(false);
          setIsTyping(false);
          setGenieStatus('error');
          addMessage({
            role: 'assistant',
            content:
              'M360 request failed while querying data. You can try again or continue with General TB4L Chat.',
            error: true,
            isGenie: true,
          });
          options?.onComplete?.();
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
          options?.onComplete,
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
    const queryAsk = searchParams.get('ask')?.trim();
    let ask = queryAsk || '';
    let askKey = queryAsk || '';

    const raw = sessionStorage.getItem(PENDING_ASK_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { q?: string; t?: number };
        if (parsed.q) {
          ask = parsed.q.trim();
          askKey = `${parsed.t ?? 0}:${ask}`;
        } else {
          ask = raw.trim();
          askKey = ask;
        }
      } catch {
        ask = raw.trim();
        askKey = ask;
      }
    }

    if (!ask) return;

    const last = chatMessages[chatMessages.length - 1];
    const prev = chatMessages[chatMessages.length - 2];
    const answered =
      last?.role === 'assistant' && prev?.role === 'user' && prev.content === ask;
    if (answered) {
      sessionStorage.removeItem(PENDING_ASK_KEY);
      seededPendingAsk = null;
      if (queryAsk) setSearchParams({}, { replace: true });
      return;
    }

    if (seededPendingAsk === askKey) return;
    seededPendingAsk = askKey;
    sessionStorage.removeItem(PENDING_ASK_KEY);
    if (queryAsk) setSearchParams({}, { replace: true });

    const userAlreadyThere = last?.role === 'user' && last.content === ask;
    if (!userAlreadyThere) {
      addMessage({ role: 'user', content: ask });
    }

    respond(ask, undefined, {
      immediate: true,
      onComplete: () => {
        seededPendingAsk = null;
      },
    });
  }, [addMessage, chatMessages, respond, searchParams, setSearchParams]);

  const cancelGenie = () => {
    cancelRef.current = true;
    clearTimers();
    setIsTyping(false);
    setWaitingOnGenie(false);
    setStreaming('');
    setGenieStatus('cancelled');
    addMessage({
      role: 'assistant',
      content: 'M360 request cancelled. You can ask again or continue with standard TB4L Chat.',
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
    sessionStorage.removeItem(PENDING_ASK_KEY);
    seededPendingAsk = null;
    startNewSession();
    setInput('');
    setStreaming('');
    setWaitingOnGenie(false);
    setIsTyping(false);
    setLastPrompt(null);
    setAttachedFiles([]);
    setPlusMenu('closed');
  };

  const openSession = (sessionId: string) => {
    if (isTyping || sessionId === activeSessionId) return;
    cancelRef.current = true;
    clearTimers();
    setStreaming('');
    setWaitingOnGenie(false);
    setIsTyping(false);
    setLastPrompt(null);
    setAttachedFiles([]);
    setPlusMenu('closed');
    setSidebarCollapsed(false);
    loadSession(sessionId);
  };

  const empty = chatMessages.length === 0 && !streaming && !waitingOnGenie;

  return (
    <div className={`chat-layout${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      {sidebarCollapsed ? (
        <aside className="chat-sidebar-rail" aria-label="Collapsed chat sidebar">
          <button
            type="button"
            className="chat-sidebar-rail__btn"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand history sidebar"
            title="Show history"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
              <path d="m14 9 3 3-3 3" />
            </svg>
          </button>
          <button
            type="button"
            className="chat-sidebar-rail__btn chat-sidebar-rail__btn--primary"
            onClick={() => {
              setSidebarCollapsed(false);
              startNewChat();
            }}
            aria-label="New chat"
            title="New chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </aside>
      ) : (
        <aside className="chat-sidebar" aria-label="Chat sidebar">
          <div className="chat-sidebar__section chat-sidebar__section--top">
            <div className="chat-sidebar__top-row">
              <button type="button" className="btn btn-primary chat-sidebar__new" onClick={startNewChat}>
                + New Chat
              </button>
              <button
                type="button"
                className="chat-sidebar-collapse-btn"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse history sidebar"
                title="Collapse sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16" />
                  <path d="m15 15-3-3 3-3" />
                </svg>
              </button>
            </div>
          </div>

          <div id="chat-history-list" className="chat-sidebar__section chat-sidebar__section--grow">
            <div className="chat-sidebar__label">History</div>
            <div className="chat-sidebar__sublabel">Today</div>
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

            <div className="chat-sidebar__sublabel chat-sidebar__sublabel--spaced">Previous</div>
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
        </aside>
      )}

      <section className="chat-main" aria-label="Conversation">
        <div className="chat-toolbar">
          <div className="chat-toolbar__left">
            {sidebarCollapsed ? (
              <button
                type="button"
                className="chat-sidebar-collapse-btn chat-sidebar-collapse-btn--toolbar"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand history sidebar"
                title="Show history"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16" />
                  <path d="m14 9 3 3-3 3" />
                </svg>
              </button>
            ) : null}
            <span className="chat-toolbar__title">TB4L Chat</span>
            <span className="chat-status">
              <span className="chat-status__dot" aria-hidden="true" />
              {sourceStatus}
            </span>
            {copyNotice ? <span className="chat-toolbar__notice">{copyNotice}</span> : null}
            {attachNotice ? <span className="chat-toolbar__notice">{attachNotice}</span> : null}
          </div>
          <div className="chat-toolbar__right">
            <button type="button" className="btn btn-ghost btn-sm" onClick={startNewChat}>
              Clear
            </button>
          </div>
        </div>

        {hasGenie ? (
          <div className="chat-genie-banner" role="status">
            <strong>M360</strong>
            <span>Connected for structured data. Responses may take longer than standard Chat.</span>
            {waitingOnGenie ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={cancelGenie}>
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}

        {documentSources.length > 0 || attachedFiles.length > 0 ? (
          <div className="chat-sources-bar" aria-label="Active context">
            <span className="chat-sources-bar__label">Talking about</span>
            {documentSources.map((s) => (
              <span key={s.id} className="chip chip-hub chip-removable">
                {s.title}
                <button type="button" aria-label={`Remove ${s.title}`} onClick={() => removeSource(s.id)}>
                  ×
                </button>
              </span>
            ))}
            {attachedFiles.map((file) => (
              <span key={file.id} className="chip chip-file chip-removable">
                {file.name}
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeAttachedFile(file.id)}>
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
              <h1>TB4L Chat</h1>
              <p className="chat-empty__tagline">
                Build stronger brands with trusted knowledge and AI guidance.
              </p>
              <p className="chat-empty__trust">
                Prototype · answers are simulated. With Hub sources selected, replies cite those
                documents.
              </p>
              <p className="chat-empty__context">{contextHelp}</p>
              <div className="chat-empty__actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setPlusMenu('main');
                  }}
                >
                  + Add context
                </button>
              </div>
              <p className="chat-empty__ask">Try a framework question</p>
              <div className="chat-suggestions">
                {emptySuggestions.map((q) => (
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
                  title="M360 request failed"
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
          {!empty ? <p className="chat-context-help">{contextHelp}</p> : null}
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
            onChange={(e) => handleAttachFiles(e.target.files)}
          />
          <form
            className="chat-composer-wrap"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="chat-composer-plus" ref={plusMenuRef}>
              <button
                type="button"
                className={`chat-plus-btn${plusMenu !== 'closed' ? ' is-open' : ''}`}
                aria-label="Add context"
                aria-haspopup="menu"
                aria-expanded={plusMenu !== 'closed'}
                disabled={isTyping}
                onClick={() => setPlusMenu((v) => (v === 'closed' ? 'main' : 'closed'))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>

              {plusMenu !== 'closed' ? (
                <div className="chat-plus-menu" role="menu" aria-label="Add context">
                  {plusMenu === 'main' ? (
                    <>
                      <button
                        type="button"
                        className="chat-plus-menu__item"
                        role="menuitem"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="chat-plus-menu__icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                        </span>
                        <span>
                          <strong>Attach file</strong>
                          <em>Upload from your laptop</em>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="chat-plus-menu__item"
                        role="menuitem"
                        onClick={() => {
                          setPlusMenu('closed');
                          setShowAddSources(true);
                        }}
                      >
                        <span className="chat-plus-menu__icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </span>
                        <span>
                          <strong>From Knowledge Hub</strong>
                          <em>Choose curated TB4L documents</em>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="chat-plus-menu__item"
                        role="menuitem"
                        onClick={() => setPlusMenu('data')}
                      >
                        <span className="chat-plus-menu__icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
                            <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
                          </svg>
                        </span>
                        <span>
                          <strong>Connect to data source</strong>
                          <em>M360 and more platforms</em>
                        </span>
                        <span className="chat-plus-menu__chevron" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="chat-plus-menu__back"
                        onClick={() => setPlusMenu('main')}
                      >
                        ← Back
                      </button>
                      <p className="chat-plus-menu__section">Data sources</p>
                      <button
                        type="button"
                        className={`chat-plus-menu__item chat-plus-menu__item--toggle${hasGenie ? ' is-on' : ''}`}
                        role="menuitemcheckbox"
                        aria-checked={hasGenie}
                        disabled={isTyping}
                        title="M360 data is used as one of the data sources in the Landscape Assessment module within the Discover phase of the TB4L Brand Building Framework. It helps in understanding market dynamics, competitor analysis, and brand performance."
                        onClick={() => setGenieEnabled(!hasGenie)}
                      >
                        <span className={`chat-connection__dot ${hasGenie ? 'is-live' : ''}`} aria-hidden="true" />
                        <span>
                          <strong>M360</strong>
                          <em>
                            {hasGenie
                              ? 'Connected · Landscape Assessment / Discover'
                              : 'Connect for market & brand performance data'}
                          </em>
                        </span>
                        <span className="chat-plus-menu__badge">{hasGenie ? 'On' : 'Off'}</span>
                      </button>
                      {[
                        { id: 'bht', name: 'BHT' },
                        { id: 'fico', name: 'FICO' },
                        { id: 'eda', name: 'EDA' },
                        { id: 'mmm', name: 'MMM' },
                      ].map((source) => (
                        <button
                          key={source.id}
                          type="button"
                          className="chat-plus-menu__item is-disabled"
                          role="menuitem"
                          disabled
                        >
                          <span className="chat-connection__dot" aria-hidden="true" />
                          <span>
                            <strong>{source.name}</strong>
                            <em>Not connected to the platform yet</em>
                          </span>
                          <span className="chat-plus-menu__badge chat-plus-menu__badge--soon">Soon</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              ) : null}
            </div>

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
                  ? 'Ask an M360 data question…'
                  : hasDocuments || attachedFiles.length
                    ? 'Ask about your selected files or Hub documents…'
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
            TB4L AI can make mistakes. Verify important information. Do not enter sensitive personal data.
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
