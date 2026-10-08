import { Link } from 'react-router-dom';
import './AppFooter.css';

export function AppFooter() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <p className="app-footer__soon">
          <Link className="app-footer__link" to="/ai-assistant/market">
            AI Assistant
          </Link>
          {' · '}
          <Link className="app-footer__link" to="/ai-assistant-v2/market">
            AI Assistant v2
          </Link>
          — Brand manager report
        </p>
        <div className="app-footer__meta">
          <Link className="app-footer__link" to="/team">
            TB4L Team
          </Link>
          <p className="app-footer__prototype">MVP Prototype · Mocked data</p>
        </div>
      </div>
    </footer>
  );
}
