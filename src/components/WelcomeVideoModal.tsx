import { useCallback, useEffect, useRef, useState } from 'react';
import './WelcomeVideoModal.css';

const STORAGE_KEY = 'tb4l-welcome-video-seen';

const SCENES = [
  {
    id: 'intro',
    durationMs: 5200,
    title: 'Welcome to TB4L',
    caption:
      'Trusted Brands for Life is Bayer Consumer Health’s brand-building workspace—combining curated knowledge with AI-powered guidance.',
  },
  {
    id: 'hub',
    durationMs: 5600,
    title: 'Build context in TB4L Hub',
    caption:
      'Browse approved playbooks, templates, training, and Brand Frames. Select the documents you want Chat to use as trusted sources.',
  },
  {
    id: 'data',
    durationMs: 5200,
    title: 'Connect live data sources',
    caption:
      'Add business data such as M360 alongside Hub documents. More connections—BHT, FICO, EDA, and MMM—are coming soon.',
  },
  {
    id: 'chat',
    durationMs: 5600,
    title: 'Ask in TB4L Chat',
    caption:
      'Open Chat with your selected context and ask grounded questions. Answers cite Hub sources so you can verify before acting.',
  },
] as const;

interface WelcomeVideoModalProps {
  forceOpen?: boolean;
  onForceClose?: () => void;
}

export function WelcomeVideoModal({ forceOpen = false, onForceClose }: WelcomeVideoModalProps) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const scene = SCENES[sceneIndex];
  const isLastScene = sceneIndex >= SCENES.length - 1;

  const clearTimers = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    timerRef.current = null;
    tickRef.current = null;
  }, []);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* ignore */
    }
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setPlaying(false);
    setOpen(false);
    setSceneIndex(0);
    setProgress(0);
    markSeen();
    onForceClose?.();
  }, [clearTimers, markSeen, onForceClose]);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setSceneIndex(0);
      setProgress(0);
      setPlaying(false);
      return;
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [close, open]);

  useEffect(() => {
    if (!playing || !open) {
      clearTimers();
      return;
    }

    startedAtRef.current = Date.now();
    const duration = scene.durationMs;

    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setProgress(Math.min(100, (elapsed / duration) * 100));
    }, 80);

    timerRef.current = window.setTimeout(() => {
      if (isLastScene) {
        setPlaying(false);
        setProgress(100);
        clearTimers();
        return;
      }
      setSceneIndex((i) => i + 1);
      setProgress(0);
    }, duration);

    return clearTimers;
  }, [clearTimers, isLastScene, open, playing, scene.durationMs, sceneIndex]);

  const startPlayback = () => {
    setSceneIndex(0);
    setProgress(0);
    setPlaying(true);
  };

  const togglePlayback = () => {
    if (!playing && progress >= 100 && isLastScene) {
      startPlayback();
      return;
    }
    if (!playing) {
      setPlaying(true);
      return;
    }
    setPlaying(false);
    clearTimers();
  };

  if (!open) return null;

  return (
    <div className="welcome-video-overlay" role="presentation" onClick={close}>
      <div
        className="welcome-video-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-video-title"
        aria-describedby="welcome-video-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="welcome-video-modal__head">
          <div>
            <p className="welcome-video-modal__eyebrow">TB4L Intro · Prototype</p>
            <h2 id="welcome-video-title" className="welcome-video-modal__title">
              How TB4L works
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="welcome-video-modal__close"
            onClick={close}
            aria-label="Close welcome video"
          >
            ×
          </button>
        </header>

        <div className="welcome-video-modal__player">
          <div
            className={`welcome-video-modal__screen${playing ? ' is-playing' : ''}`}
            aria-live="polite"
          >
            <div className="welcome-video-modal__screen-glow" aria-hidden="true" />
            {!playing && progress === 0 ? (
              <button
                type="button"
                className="welcome-video-modal__play"
                onClick={startPlayback}
                aria-label="Play welcome video"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : null}
            <div className="welcome-video-modal__scene">
              <span className="welcome-video-modal__scene-badge">Scene {sceneIndex + 1}</span>
              <h3>{scene.title}</h3>
              <p id="welcome-video-desc">{scene.caption}</p>
            </div>
          </div>

          <div className="welcome-video-modal__controls">
            <button
              type="button"
              className="welcome-video-modal__control-btn"
              onClick={togglePlayback}
              aria-label={playing ? 'Pause welcome video' : 'Play welcome video'}
            >
              {playing ? 'Pause' : progress >= 100 && isLastScene ? 'Replay' : 'Play'}
            </button>
            <div
              className="welcome-video-modal__progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Video progress"
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="welcome-video-modal__time">
              {sceneIndex + 1} / {SCENES.length}
            </span>
          </div>
        </div>

        <footer className="welcome-video-modal__foot">
          <p className="welcome-video-modal__note">
            Simulated intro video for this MVP prototype—walks through Hub context, data sources,
            and Chat. Replace with a recorded welcome video when available.
          </p>
          <div className="welcome-video-modal__actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
              Skip for now
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={close}>
              {playing ? 'Continue' : 'Got it'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
