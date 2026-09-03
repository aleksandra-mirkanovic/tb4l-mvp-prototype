import { Breadcrumbs } from '../components/Breadcrumbs';
import { TEAM_MEMBERS } from '../data/team';
import './SectionPage.css';
import './TeamPage.css';

export function TeamPage() {
  return (
    <div className="team-page section-page section-page--purple">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Team' },
        ]}
      />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">People & support</p>
          <h1 className="section-hero__title">TB4L Team</h1>
          <p className="section-hero__tagline">
            Key contacts for framework stewardship, Accelerators, training, and Hub adoption.
          </p>
        </div>
      </header>

      <section className="section-content" aria-labelledby="team-heading">
        <div className="section-content__head">
          <h2 id="team-heading" className="section-title">
            Enablement partners
          </h2>
          <p>
            Reach out for Accelerator support, training, or Hub adoption coaching. Team profiles are
            contacts only—they are not selected as Chat sources.
          </p>
        </div>
        <div className="team-grid">
          {TEAM_MEMBERS.map((member) => (
            <article key={member.id} className="team-card">
              <div className="team-card__avatar" aria-hidden="true">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <h4>{member.name}</h4>
              <p className="team-card__role">{member.role}</p>
              <p className="team-card__focus">{member.focus}</p>
              <div className="team-card__meta">
                <span className="badge badge-hub">{member.region}</span>
                <span className="team-card__email">{member.emailLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
