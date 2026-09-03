import { Link } from 'react-router-dom';
import { DATA_SOURCES, DATA_SOURCE_STATUS_LABEL } from '../data/dataSources';
import './HubDataSources.css';

interface HubDataSourcesProps {
  embedded?: boolean;
}

export function HubDataSources({ embedded = false }: HubDataSourcesProps) {
  const connected = DATA_SOURCES.filter((s) => s.status === 'connected');
  const upcoming = DATA_SOURCES.filter(
    (s) => s.status === 'coming_soon' || s.status === 'planned',
  );

  return (
    <div
      className={`hub-data-sources${embedded ? ' hub-data-sources--embedded' : ''}`}
      aria-label="Available data connections"
    >
      <p className="hub-data-sources__group-label">Connected today</p>
      <ul className="hub-data-sources__list">
        {connected.map((source) => (
          <li key={source.id} className="hub-data-sources__item hub-data-sources__item--featured">
            <div className="hub-data-sources__item-head">
              <span className="hub-data-sources__dot is-live" aria-hidden="true" />
              <div className="hub-data-sources__item-copy">
                <div className="hub-data-sources__item-title-row">
                  <h4 className="hub-data-sources__item-title">{source.name}</h4>
                  <span className="hub-data-sources__badge hub-data-sources__badge--available">
                    {DATA_SOURCE_STATUS_LABEL[source.status]}
                  </span>
                </div>
                <p className="hub-data-sources__item-desc">{source.description}</p>
                {source.usage ? (
                  <p className="hub-data-sources__item-usage">{source.usage}</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="hub-data-sources__group-label">Coming soon &amp; planned</p>
      <ul className="hub-data-sources__soon">
        {upcoming.map((source) => (
          <li key={source.id}>
            <span>{source.name}</span>
            <em>{DATA_SOURCE_STATUS_LABEL[source.status]}</em>
          </li>
        ))}
      </ul>

      <Link className="hub-data-sources__cta" to="/chat">
        Connect in TB4L Chat
      </Link>
    </div>
  );
}
