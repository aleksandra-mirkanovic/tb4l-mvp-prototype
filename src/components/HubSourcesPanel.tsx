import { useApp } from '../context/AppContext';
import { DATA_SOURCES } from '../data/dataSources';

function isLiveSource(status: string) {
  return status === 'connected';
}

export function HubSourcesPanel() {
  const { m360Selected, toggleM360Selection } = useApp();
  const sourceCount = DATA_SOURCES.length;

  return (
    <section className="hub-ov-sources" aria-labelledby="hub-sources-heading">
      <header className="hub-ov-section-head">
        <h2 id="hub-sources-heading">Sources</h2>
        <p>
          {sourceCount} data {sourceCount === 1 ? 'source' : 'sources'} for TB4L Chat — M360
          available now; more coming soon
        </p>
      </header>

      <ul className="hub-ov-sources__grid">
        {DATA_SOURCES.map((source) => {
          const live = isLiveSource(source.status);
          if (live) {
            return (
              <li key={source.id}>
                <button
                  type="button"
                  className={`hub-ov-source-card is-live${m360Selected ? ' is-selected' : ''}`}
                  onClick={toggleM360Selection}
                  aria-pressed={m360Selected}
                  aria-label={`${m360Selected ? 'Deselect' : 'Select'} ${source.name}`}
                >
                  <div className="hub-ov-source-card__top">
                    <h3 className="hub-ov-source-card__title">{source.name}</h3>
                    <span className="hub-ov-source-card__badge hub-ov-source-card__badge--live">
                      Available now
                    </span>
                  </div>
                  <p className="hub-ov-source-card__desc">{source.description}</p>
                  <span className="hub-ov-source-card__check" aria-hidden="true">
                    {m360Selected ? '✓' : ''}
                  </span>
                </button>
              </li>
            );
          }

          return (
            <li key={source.id}>
              <article className="hub-ov-source-card">
                <div className="hub-ov-source-card__top">
                  <h3 className="hub-ov-source-card__title">{source.name}</h3>
                  <span className="hub-ov-source-card__badge">Coming soon</span>
                </div>
                <p className="hub-ov-source-card__desc">{source.description}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
