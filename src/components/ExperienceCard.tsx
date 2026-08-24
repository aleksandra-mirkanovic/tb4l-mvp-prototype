import { Link } from 'react-router-dom';
import './ExperienceCard.css';

interface ExperienceCardProps {
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
  accent: 'chat' | 'hub';
}

export function ExperienceCard({
  badge,
  badgeClass,
  title,
  description,
  buttonLabel,
  to,
  accent,
}: ExperienceCardProps) {
  return (
    <article className={`experience-card experience-card--${accent}`}>
      <span className={`badge ${badgeClass}`}>{badge}</span>
      <h2 className="experience-card__title">{title}</h2>
      <p className="experience-card__desc">{description}</p>
      <Link className="btn btn-primary" to={to}>
        {buttonLabel}
      </Link>
    </article>
  );
}
