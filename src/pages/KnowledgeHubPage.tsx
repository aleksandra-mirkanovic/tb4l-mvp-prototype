import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExperienceCard } from '../components/ExperienceCard';
import { HubSectionNav } from '../components/HubSectionNav';
import { SectionTile } from '../components/SectionTile';
import { HUB_SECTIONS } from '../data/sections';
import './KnowledgeHubPage.css';
import './SectionPage.css';

export function KnowledgeHubPage() {
  return (
    <div className="hub-page section-page section-page--teal">
      <Breadcrumbs
        items={[
          { label: 'Welcome', to: '/' },
          { label: 'TB4L Hub' },
        ]}
      />

      <HubSectionNav />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">Overview</p>
          <h1 className="section-hero__title">TB4L Hub</h1>
          <p className="section-hero__tagline">
            Curated Trusted Brands for Life content—open a section, then take documents into Chat.
          </p>
        </div>
        <div className="section-hero__actions">
          <Link className="btn btn-secondary btn-sm" to="/knowledge-hub/browse">
            Browse all documents
          </Link>
          <Link className="btn btn-primary btn-sm" to="/chat">
            Ask in Chat
          </Link>
        </div>
      </header>

      <section className="hub-sections" aria-labelledby="hub-sections-heading">
        <div className="hub-sections__head">
          <h2 id="hub-sections-heading" className="section-title">
            Sections
          </h2>
        </div>
        <div className="hub-sections__grid">
          {HUB_SECTIONS.map((section) => (
            <SectionTile key={section.slug} section={section} />
          ))}
        </div>
      </section>

      <section className="hub-page__cta-band" aria-label="Continue to Chat">
        <ExperienceCard
          accent="chat"
          badge="Next step"
          badgeClass="badge-chat"
          title="Take Hub content into Chat"
          description="Select documents inside any section, then ask questions with those sources active in TB4L Chat."
          buttonLabel="Open TB4L Chat"
          to="/chat"
          compact
        />
      </section>
    </div>
  );
}
