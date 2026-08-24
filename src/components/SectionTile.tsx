import { Link } from 'react-router-dom';
import type { HubSection } from '../data/sections';
import './SectionTile.css';

interface SectionTileProps {
  section: HubSection;
}

export function SectionTile({ section }: SectionTileProps) {
  return (
    <Link
      to={`/knowledge-hub/${section.slug}`}
      className={`section-tile section-tile--${section.accent}`}
      aria-label={`${section.title}: ${section.tagline}`}
    >
      <span className="section-tile__eyebrow">{section.eyebrow}</span>
      <span className="section-tile__title">{section.title}</span>
      <span className="section-tile__tagline">{section.tagline}</span>
      <span className="section-tile__cta">
        {section.ctaLabel}
        <span aria-hidden="true"> →</span>
      </span>
    </Link>
  );
}
