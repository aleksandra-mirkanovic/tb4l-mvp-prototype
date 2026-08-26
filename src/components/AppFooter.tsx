import './AppFooter.css';

export function AppFooter() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <p className="app-footer__soon">
          <span className="app-footer__soon-label">Coming soon</span>
          AIssistant — AI support for brand teams
        </p>
        <p className="app-footer__prototype">MVP Prototype · Mocked data</p>
      </div>
    </footer>
  );
}
