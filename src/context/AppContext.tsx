import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { EMPTY_FILTERS, getDocumentById } from '../data/documents';
import type {
  AppState,
  ChatMessage,
  ChatSession,
  ChatSource,
  FeedbackValue,
  GenieStatus,
  HubFilters,
} from '../types';

const GENERAL_SOURCE: ChatSource = {
  id: 'general',
  title: 'General TB4L Knowledge',
  kind: 'general',
};

const SESSIONS_STORAGE_KEY = 'tb4l-chat-sessions-v1';

interface AppContextValue extends AppState {
  setFilters: (filters: HubFilters | ((prev: HubFilters) => HubFilters)) => void;
  resetFilters: () => void;
  toggleDocumentSelection: (id: string) => void;
  selectDocument: (id: string) => void;
  clearDocumentSelection: () => void;
  m360Selected: boolean;
  toggleM360Selection: () => void;
  setActiveSourcesFromSelection: () => void;
  addSources: (documentIds: string[]) => void;
  removeSource: (id: string) => void;
  clearSources: () => void;
  setGenieEnabled: (enabled: boolean) => void;
  setGenieStatus: (status: GenieStatus) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => string;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  setMessageFeedback: (id: string, feedback: FeedbackValue) => void;
  clearChat: () => void;
  replaceMessages: (messages: ChatMessage[]) => void;
  startNewSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  togglePinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
}

function persistSessionsSnapshot(sessions: ChatSession[], activeId: string) {
  try {
    const meaningful = sessions.filter(
      (s) => s.messages.length > 0 || s.id === activeId,
    );
    localStorage.setItem(
      SESSIONS_STORAGE_KEY,
      JSON.stringify({ activeSessionId: activeId, sessions: meaningful }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function readPersistedSessions(): { sessions: ChatSession[]; activeSessionId: string } | null {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      activeSessionId?: string;
      sessions?: ChatSession[];
    };
    if (!parsed?.sessions?.length || !parsed.activeSessionId) return null;
    if (!parsed.sessions.some((s) => s.id === parsed.activeSessionId)) return null;
    const sessions = parsed.sessions.map((s) => ({
      ...s,
      pinned: Boolean(s.pinned),
      titleCustom: Boolean(s.titleCustom),
    }));
    return { sessions, activeSessionId: parsed.activeSessionId };
  } catch {
    return null;
  }
}

function documentSource(id: string): ChatSource {
  const doc = getDocumentById(id);
  return {
    id,
    title: doc?.title ?? 'Unknown document',
    kind: 'document',
  };
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromMessages(messages: ChatMessage[]) {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return 'New chat';
  const text = firstUser.content.trim().replace(/\s+/g, ' ');
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

function daysAgo(days: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.getTime();
}

function createEmptySession(): ChatSession {
  const now = Date.now();
  return {
    id: uid('session'),
    title: 'New chat',
    messages: [],
    sources: [GENERAL_SOURCE],
    genieEnabled: false,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

function withActiveSessionSnapshot(
  session: ChatSession,
  snapshot: {
    messages: ChatMessage[];
    sources: ChatSource[];
    genieEnabled: boolean;
  },
): ChatSession {
  const wroteAgain = snapshot.messages.some(
    (m) => m.role === 'user' && !session.messages.some((s) => s.id === m.id),
  );
  return {
    ...session,
    title:
      session.titleCustom || !snapshot.messages.length
        ? session.title
        : titleFromMessages(snapshot.messages),
    messages: snapshot.messages,
    sources: snapshot.sources,
    genieEnabled: snapshot.genieEnabled,
    updatedAt: wroteAgain ? Date.now() : session.updatedAt,
  };
}

function seedSessions(currentId: string): ChatSession[] {
  const current = {
    ...createEmptySession(),
    id: currentId,
  };

  const previous: ChatSession[] = [
    {
      id: 'session-prev-1',
      title: 'What is the TB4L framework?',
      createdAt: daysAgo(1, 9),
      updatedAt: daysAgo(1, 9),
      genieEnabled: false,
      sources: [GENERAL_SOURCE],
      messages: [
        {
          id: 'seed-1a',
          role: 'user',
          content: 'What is the TB4L framework?',
          timestamp: daysAgo(1, 9),
        },
        {
          id: 'seed-1b',
          role: 'assistant',
          content:
            'Trusted Brands for Life (TB4L) is Bayer Consumer Health’s brand-building framework supporting the Road to Billions Strategy across Discover, Define, Design, and Deliver.',
          citations: ['General TB4L Knowledge'],
          timestamp: daysAgo(1, 9) + 1000,
          feedback: null,
        },
      ],
    },
    {
      id: 'session-prev-2',
      title: 'Brand Frame principles',
      createdAt: daysAgo(2, 14),
      updatedAt: daysAgo(2, 15),
      genieEnabled: false,
      sources: [
        {
          id: 'doc-7',
          title: 'Brand Frame Example',
          kind: 'document',
        },
      ],
      messages: [
        {
          id: 'seed-2a',
          role: 'user',
          content: 'What should a Brand Manager focus on?',
          timestamp: daysAgo(2, 14),
        },
        {
          id: 'seed-2b',
          role: 'assistant',
          content:
            'Focus on Brand Frame quality across the six principles, clear Define choices, executable Design plans, and Deliver excellence with measurable outcomes.',
          citations: ['Brand Frame Example'],
          timestamp: daysAgo(2, 14) + 1200,
          feedback: 'like',
        },
      ],
    },
    {
      id: 'session-prev-3',
      title: 'Germany M360 snapshot',
      createdAt: daysAgo(5, 11),
      updatedAt: daysAgo(5, 11),
      genieEnabled: true,
      sources: [{ id: 'genie', title: 'M360', kind: 'genie' }],
      messages: [
        {
          id: 'seed-3a',
          role: 'user',
          content: 'What is the latest brand performance in Germany?',
          timestamp: daysAgo(5, 11),
        },
        {
          id: 'seed-3b',
          role: 'assistant',
          content:
            'M360 snapshot for Germany (mocked): consideration +3 pts vs prior quarter; watch digital HCP open rates in Deliver tracking.',
          citations: ['M360'],
          timestamp: daysAgo(5, 11) + 2000,
          isGenie: true,
          feedback: null,
        },
      ],
    },
    {
      id: 'session-prev-4',
      title: 'Discover stage checklist',
      createdAt: daysAgo(7, 10),
      updatedAt: daysAgo(7, 10),
      genieEnabled: false,
      sources: [GENERAL_SOURCE],
      messages: [
        {
          id: 'seed-4a',
          role: 'user',
          content: 'What should we complete in Discover?',
          timestamp: daysAgo(7, 10),
        },
        {
          id: 'seed-4b',
          role: 'assistant',
          content:
            'Discover gathers consumer, market, and competitive insight so Define choices rest on evidence—not assumptions.',
          citations: ['General TB4L Knowledge'],
          timestamp: daysAgo(7, 10) + 1000,
          feedback: null,
        },
      ],
    },
    {
      id: 'session-prev-5',
      title: 'Sustainability Brand Frame',
      createdAt: daysAgo(9, 16),
      updatedAt: daysAgo(9, 16),
      genieEnabled: false,
      sources: [
        {
          id: 'doc-7',
          title: 'Brand Frame Example',
          kind: 'document',
        },
      ],
      messages: [
        {
          id: 'seed-5a',
          role: 'user',
          content: 'How do we write the Sustainability principle?',
          timestamp: daysAgo(9, 16),
        },
        {
          id: 'seed-5b',
          role: 'assistant',
          content:
            'Anchor Sustainability in credible science and brand-relevant commitments that fit WHERE TO PLAY and HOW TO WIN.',
          citations: ['Brand Frame Example'],
          timestamp: daysAgo(9, 16) + 1100,
          feedback: null,
        },
      ],
    },
    {
      id: 'session-prev-6',
      title: 'Deliver measurement tips',
      createdAt: daysAgo(12, 8),
      updatedAt: daysAgo(12, 9),
      genieEnabled: false,
      sources: [GENERAL_SOURCE],
      messages: [
        {
          id: 'seed-6a',
          role: 'user',
          content: 'How should Deliver track brand excellence?',
          timestamp: daysAgo(12, 8),
        },
        {
          id: 'seed-6b',
          role: 'assistant',
          content:
            'Deliver ties activation to clear KPIs—equity health, execution quality, and learning loops back into Discover.',
          citations: ['General TB4L Knowledge'],
          timestamp: daysAgo(12, 8) + 900,
          feedback: 'like',
        },
      ],
    },
  ];

  return [current, ...previous];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const boot = useMemo(() => {
    const persisted = readPersistedSessions();
    if (persisted) {
      const active =
        persisted.sessions.find((s) => s.id === persisted.activeSessionId) ??
        persisted.sessions[0];
      return {
        sessions: persisted.sessions,
        activeSessionId: active.id,
        messages: active.messages,
        sources: active.sources.length ? active.sources : [GENERAL_SOURCE],
        genieEnabled: active.genieEnabled,
      };
    }
    const id = uid('session');
    return {
      sessions: seedSessions(id),
      activeSessionId: id,
      messages: [] as ChatMessage[],
      sources: [GENERAL_SOURCE],
      genieEnabled: false,
    };
  }, []);

  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [m360Selected, setM360Selected] = useState(false);
  const [activeSources, setActiveSources] = useState<ChatSource[]>(boot.sources);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(boot.messages);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(boot.sessions);
  const [activeSessionId, setActiveSessionId] = useState(boot.activeSessionId);
  const [filters, setFilters] = useState<HubFilters>(EMPTY_FILTERS);
  const [genieEnabled, setGenieEnabled] = useState(boot.genieEnabled);
  const [genieStatus, setGenieStatus] = useState<GenieStatus>('idle');

  useEffect(() => {
    setChatSessions((prev) => {
      const next = prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        return withActiveSessionSnapshot(session, {
          messages: chatMessages,
          sources: activeSources,
          genieEnabled,
        });
      });
      persistSessionsSnapshot(next, activeSessionId);
      return next;
    });
  }, [activeSessionId, activeSources, chatMessages, genieEnabled]);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const toggleDocumentSelection = useCallback((id: string) => {
    setM360Selected(false);
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectDocument = useCallback((id: string) => {
    setM360Selected(false);
    setSelectedDocumentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clearDocumentSelection = useCallback(() => {
    setSelectedDocumentIds([]);
    setM360Selected(false);
  }, []);

  const toggleM360Selection = useCallback(() => {
    setM360Selected((prev) => {
      const next = !prev;
      if (next) setSelectedDocumentIds([]);
      return next;
    });
  }, []);

  const setActiveSourcesFromSelection = useCallback(() => {
    setActiveSources((prev) => {
      const keepGenie = prev.find((s) => s.kind === 'genie');
      const next = selectedDocumentIds.map(documentSource);
      if (next.length === 0 && !keepGenie) {
        return [GENERAL_SOURCE];
      }
      return [...(keepGenie ? [keepGenie] : []), ...next];
    });
  }, [selectedDocumentIds]);

  const addSources = useCallback((documentIds: string[]) => {
    setActiveSources((prev) => {
      const existing = new Set(prev.map((s) => s.id));
      const additions = documentIds.filter((id) => !existing.has(id)).map(documentSource);
      const withoutGeneral = additions.length > 0 ? prev.filter((s) => s.kind !== 'general') : prev;
      const next = [...withoutGeneral, ...additions];
      if (next.length === 0 || (next.length === 1 && next[0].kind === 'genie')) {
        return [...next.filter((s) => s.kind !== 'general'), GENERAL_SOURCE];
      }
      return next;
    });
  }, []);

  const removeSource = useCallback((id: string) => {
    setActiveSources((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === 'genie') {
        setGenieEnabled(false);
        setGenieStatus('idle');
      }
      const hasDocs = next.some((s) => s.kind === 'document');
      const hasGeneral = next.some((s) => s.kind === 'general');
      if (!hasDocs && !hasGeneral) {
        return [...next, GENERAL_SOURCE];
      }
      return next;
    });
  }, []);

  const clearSources = useCallback(() => {
    setActiveSources([GENERAL_SOURCE]);
    setGenieEnabled(false);
    setGenieStatus('idle');
  }, []);

  const handleSetGenieEnabled = useCallback((enabled: boolean) => {
    setGenieEnabled(enabled);
    setActiveSources((prev) => {
      const without = prev.filter((s) => s.kind !== 'genie');
      if (!enabled) {
        return without.length ? without : [GENERAL_SOURCE];
      }
      return [{ id: 'genie', title: 'M360', kind: 'genie' }, ...without.filter((s) => s.kind !== 'general')];
    });
    if (!enabled) setGenieStatus('idle');
  }, []);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => {
      const id = message.id ?? uid('msg');
      setChatMessages((prev) => [
        ...prev,
        {
          ...message,
          id,
          timestamp: Date.now(),
          feedback: message.feedback ?? null,
        },
      ]);
      return id;
    },
    [],
  );

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setChatMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const setMessageFeedback = useCallback((id: string, feedback: FeedbackValue) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m,
      ),
    );
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    setGenieStatus('idle');
  }, []);

  const replaceMessages = useCallback((messages: ChatMessage[]) => {
    setChatMessages(messages);
  }, []);

  const startNewSession = useCallback(() => {
    const next = createEmptySession();
    setChatSessions((prev) => {
      const persisted = prev.map((session) =>
        session.id === activeSessionId
          ? withActiveSessionSnapshot(session, {
              messages: chatMessages,
              sources: activeSources,
              genieEnabled,
            })
          : session,
      );
      const cleaned = persisted.filter((s) => s.id !== activeSessionId || s.messages.length > 0);
      const merged = [next, ...cleaned];
      persistSessionsSnapshot(merged, next.id);
      return merged;
    });
    setActiveSessionId(next.id);
    setChatMessages([]);
    setActiveSources([GENERAL_SOURCE]);
    setGenieEnabled(false);
    setGenieStatus('idle');
  }, [activeSessionId, activeSources, chatMessages, genieEnabled]);

  const loadSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return;

      const target = chatSessions.find((s) => s.id === sessionId);
      if (!target) return;

      // Snapshot before any state updates so history can't be wiped by sync races.
      const nextMessages = target.messages.map((m) => ({ ...m }));
      const nextSources = target.sources.length
        ? target.sources.map((s) => ({ ...s }))
        : [GENERAL_SOURCE];
      const nextGenie = target.genieEnabled;

      setChatSessions((prev) => {
        const merged = prev.map((session) =>
          session.id === activeSessionId
            ? withActiveSessionSnapshot(session, {
                messages: chatMessages,
                sources: activeSources,
                genieEnabled,
              })
            : session,
        );
        persistSessionsSnapshot(merged, sessionId);
        return merged;
      });

      setActiveSessionId(sessionId);
      setChatMessages(nextMessages);
      setActiveSources(nextSources);
      setGenieEnabled(nextGenie);
      setGenieStatus('idle');
    },
    [activeSessionId, activeSources, chatMessages, chatSessions, genieEnabled],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const deletingActive = sessionId === activeSessionId;
      const remaining = chatSessions.filter((s) => s.id !== sessionId);

      if (!deletingActive) {
        setChatSessions(() => {
          persistSessionsSnapshot(remaining, activeSessionId);
          return remaining;
        });
        return;
      }

      const fallback =
        remaining.find((s) => s.messages.length > 0) ?? remaining[0] ?? createEmptySession();
      const nextSessions = remaining.some((s) => s.id === fallback.id)
        ? remaining
        : [fallback, ...remaining];

      setChatSessions(() => {
        persistSessionsSnapshot(nextSessions, fallback.id);
        return nextSessions;
      });
      setActiveSessionId(fallback.id);
      setChatMessages(fallback.messages.map((m) => ({ ...m })));
      setActiveSources(
        fallback.sources.length ? fallback.sources.map((s) => ({ ...s })) : [GENERAL_SOURCE],
      );
      setGenieEnabled(fallback.genieEnabled);
      setGenieStatus('idle');
    },
    [activeSessionId, chatSessions],
  );

  const togglePinSession = useCallback((sessionId: string) => {
    setChatSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, pinned: !s.pinned } : s,
      );
      persistSessionsSnapshot(next, activeSessionId);
      return next;
    });
  }, [activeSessionId]);

  const renameSession = useCallback(
    (sessionId: string, title: string) => {
      const nextTitle = title.trim() || 'New chat';
      setChatSessions((prev) => {
        const next = prev.map((s) =>
          s.id === sessionId ? { ...s, title: nextTitle, titleCustom: true } : s,
        );
        persistSessionsSnapshot(next, activeSessionId);
        return next;
      });
    },
    [activeSessionId],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      selectedDocumentIds,
      m360Selected,
      activeSources,
      chatMessages,
      chatSessions,
      activeSessionId,
      filters,
      genieEnabled,
      genieStatus,
      setFilters,
      resetFilters,
      toggleDocumentSelection,
      selectDocument,
      clearDocumentSelection,
      toggleM360Selection,
      setActiveSourcesFromSelection,
      addSources,
      removeSource,
      clearSources,
      setGenieEnabled: handleSetGenieEnabled,
      setGenieStatus,
      addMessage,
      updateMessage,
      setMessageFeedback,
      clearChat,
      replaceMessages,
      startNewSession,
      loadSession,
      deleteSession,
      togglePinSession,
      renameSession,
    }),
    [
      selectedDocumentIds,
      m360Selected,
      activeSources,
      chatMessages,
      chatSessions,
      activeSessionId,
      filters,
      genieEnabled,
      genieStatus,
      resetFilters,
      toggleDocumentSelection,
      selectDocument,
      clearDocumentSelection,
      toggleM360Selection,
      setActiveSourcesFromSelection,
      addSources,
      removeSource,
      clearSources,
      handleSetGenieEnabled,
      addMessage,
      updateMessage,
      setMessageFeedback,
      clearChat,
      replaceMessages,
      startNewSession,
      loadSession,
      deleteSession,
      togglePinSession,
      renameSession,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
