import { SourceChip } from './SourceChip';
import type { ChatSource } from '../types';
import './ActiveSourcesPanel.css';

interface ActiveSourcesPanelProps {
  sources: ChatSource[];
  onRemove: (id: string) => void;
  onAddSources: () => void;
}

export function ActiveSourcesPanel({ sources, onRemove, onAddSources }: ActiveSourcesPanelProps) {
  const hasDocuments = sources.some((s) => s.kind === 'document');
  const onlyGeneral = sources.length === 1 && sources[0].kind === 'general';

  return (
    <section className="active-sources panel" aria-label="Active chat sources">
      <div className="active-sources__head">
        <div>
          <h2 className="active-sources__title">Active sources</h2>
          <p className="active-sources__hint">
            {onlyGeneral
              ? 'General TB4L Knowledge — add Hub documents for contextual answers.'
              : hasDocuments
                ? 'Answers will cite the selected Knowledge Hub documents.'
                : 'Sources guide how TB4L Chat responds.'}
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAddSources}>
          + Add Sources
        </button>
      </div>
      <div className="active-sources__list">
        {sources.map((source) => (
          <SourceChip
            key={source.id}
            source={source}
            onRemove={source.kind === 'general' && sources.length === 1 ? undefined : () => onRemove(source.id)}
          />
        ))}
      </div>
    </section>
  );
}
