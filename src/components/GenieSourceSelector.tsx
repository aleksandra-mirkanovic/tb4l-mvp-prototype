import './GenieSourceSelector.css';

interface GenieSourceSelectorProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function GenieSourceSelector({ enabled, onChange, disabled }: GenieSourceSelectorProps) {
  return (
    <section className="genie-selector panel" aria-label="Genie M360 structured data">
      <div className="genie-selector__row">
        <div>
          <span className="badge badge-genie">Genie / M360</span>
          <h2 className="genie-selector__title">Structured data source</h2>
          <p className="genie-selector__desc">
            Explicitly enable Genie before asking data questions. Genie is never auto-triggered.
          </p>
        </div>
        <label className="genie-selector__toggle">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            aria-describedby="genie-help"
          />
          <span>{enabled ? 'Genie enabled' : 'Enable Genie / M360'}</span>
        </label>
      </div>
      {enabled ? (
        <p id="genie-help" className="genie-selector__notice" role="status">
          This request uses M360 data through Genie and may take longer than a standard TB4L Chat
          response.
        </p>
      ) : (
        <p id="genie-help" className="sr-only">
          Genie is off. Enable before submitting structured data questions.
        </p>
      )}
    </section>
  );
}
