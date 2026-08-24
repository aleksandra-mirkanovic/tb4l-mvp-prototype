import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExperienceCard } from '../components/ExperienceCard';
import { HubSectionNav } from '../components/HubSectionNav';
import { SectionTile } from '../components/SectionTile';
import { HUB_SECTIONS } from '../data/sections';
import './KnowledgeHubPage.css';

export function KnowledgeHubPage() {
  return (
    <div className="hub-page">
      <Breadcrumbs
        items={[
          { label: 'Welcome', to: '/' },
          { label: 'TB4L Hub' },
        ]}
      />

      <header className="hub-page__header hub-page__header--marketing">
        <div>
          <span className="badge badge-hub">TB4L Hub</span>
          <p className="hub-page__brand">TB4L</p>
          <h1 className="page-title">TB4L Hub</h1>
          <p className="page-subtitle">
            Curated Trusted Brands for Life content organised by section. Explore Playbooks,
            Templates, Training, Accelerator Outputs, Glossary, and Team—then take documents into
            Chat as sources.
          </p>
        </div>
        <div className="hub-page__header-actions">
          <Link className="btn btn-secondary" to="/knowledge-hub/browse">
            Browse all documents
          </Link>
          <Link className="btn btn-primary" to="/chat">
            Ask in Chat
          </Link>
        </div>
      </header>

      <HubSectionNav />

      <section className="hub-sections" aria-labelledby="hub-sections-heading">
        <div className="hub-sections__head">
          <h2 id="hub-sections-heading" className="section-title">
            Hub sections
          </h2>
          <p>Choose a section to explore curated content for that area.</p>
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
        />
      </section>
    </div>
  );
}
