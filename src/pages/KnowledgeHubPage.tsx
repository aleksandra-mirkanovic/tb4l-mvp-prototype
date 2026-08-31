import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
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
          { label: 'Home', to: '/' },
          { label: 'TB4L Hub' },
        ]}
      />

      <HubSectionNav />

      <header className="section-hero">
        <div className="section-hero__copy">
          <p className="section-hero__eyebrow">Overview</p>
          <h1 className="section-hero__title">TB4L Hub</h1>
          <p className="section-hero__tagline">
            Trusted knowledge to build stronger brands—open a section, select documents, then ask in
            Chat.
          </p>
        </div>
      </header>

      <ol className="hub-loop" aria-label="How Hub works with Chat">
        <li className="hub-loop__step">
          <span className="hub-loop__num">1</span>
          <div>
            <strong>Choose a section</strong>
            <p>Playbooks, Templates, Training, Accelerator Outputs, Glossary, Brand Frames, or Teams.</p>
          </div>
        </li>
        <li className="hub-loop__step">
          <span className="hub-loop__num">2</span>
          <div>
            <strong>Filter &amp; select</strong>
            <p>Narrow by brand or market, then select the documents you need.</p>
          </div>
        </li>
        <li className="hub-loop__step">
          <span className="hub-loop__num">3</span>
          <div>
            <strong>Ask with these sources</strong>
            <p>Send selections into TB4L Chat for grounded, source-backed answers.</p>
          </div>
        </li>
      </ol>

      <section className="hub-sections" aria-labelledby="hub-sections-heading">
        <div className="hub-sections__head">
          <h2 id="hub-sections-heading" className="section-title">
            Sections
          </h2>
          <Link className="hub-sections__browse" to="/knowledge-hub/browse">
            Browse all documents
          </Link>
        </div>
        <div className="hub-sections__grid">
          {HUB_SECTIONS.map((section) => (
            <SectionTile key={section.slug} section={section} />
          ))}
        </div>
      </section>
    </div>
  );
}
