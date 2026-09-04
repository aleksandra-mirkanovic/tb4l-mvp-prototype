import { Breadcrumbs } from '../components/Breadcrumbs';
import { HubSectionNav } from '../components/HubSectionNav';
import {
  CORE_TEAM_MEMBERS,
  getTeamInitials,
  IT_TEAM_MEMBERS,
  type TeamMember,
} from '../data/team';
import './KnowledgeHubClassicPage.css';
import './SectionPage.css';
import './TeamPage.css';

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="team-card">
      <div className="team-card__avatar" aria-hidden="true">
        {getTeamInitials(member.name)}
      </div>
      <h4>{member.name}</h4>
      <p className="team-card__role">{member.role}</p>
      <p className="team-card__focus">{member.focus}</p>
      <div className="team-card__meta">
        <span className="badge badge-hub">{member.side === 'it' ? 'IT' : member.region}</span>
        <span className="team-card__email">{member.emailLabel}</span>
      </div>
    </article>
  );
}

export function TeamPage() {
  return (
    <div className="team-page hub-page hub-page--workspace section-page section-page--purple">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub', to: '/knowledge-hub' },
          { label: 'TB4L Team' },
        ]}
      />

      <HubSectionNav mode="full" />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">People & support</p>
          <h1 className="section-hero__title">TB4L Team</h1>
          <p className="section-hero__tagline">
            Core programme contacts for TB4L, plus the IT product team behind Hub & Chat.
          </p>
        </div>
      </header>

      <section className="section-content" aria-labelledby="team-core-heading">
        <div className="section-content__head">
          <h2 id="team-core-heading" className="section-title">
            TB4L Core Team
          </h2>
          <p>
            Reach out for programme, capability, and regional growth support. Profiles are contacts
            only—they are not selected as Chat sources.
          </p>
        </div>
        <div className="team-grid">
          {CORE_TEAM_MEMBERS.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <section className="section-content" aria-labelledby="team-it-heading">
        <div className="section-content__head">
          <h2 id="team-it-heading" className="section-title">
            IT Team
          </h2>
          <p>Product and engineering contacts for TB4L Hub and Chat.</p>
        </div>
        <div className="team-grid">
          {IT_TEAM_MEMBERS.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}
