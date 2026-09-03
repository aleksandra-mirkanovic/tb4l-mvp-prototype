import { Link } from 'react-router-dom';
import './AppFooter.css';

export function AppFooter() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <p className="app-footer__soon">
          <span className="app-footer__soon-label">Coming soon</span>
          AIssistant — AI support for brand teams
        </p>
        <div className="app-footer__meta">
          <Link className="app-footer__link" to="/knowledge-hub/team">
            TB4L Team
          </Link>
          <p className="app-footer__prototype">MVP Prototype · Mocked data</p>
        </div>
      </div>
    </footer>
  );
}
