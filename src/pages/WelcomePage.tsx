import { Link } from 'react-router-dom';
import { ExperienceCard } from '../components/ExperienceCard';
import './WelcomePage.css';

export function WelcomePage() {
  return (
    <div className="welcome-page">
      <section className="welcome-hero" aria-labelledby="welcome-heading">
        <div className="welcome-hero__copy">
          <p className="welcome-hero__brand">TB4L</p>
          <h1 id="welcome-heading" className="welcome-hero__title">
            Trusted Brands for Life
          </h1>
          <p className="welcome-hero__support">
            Bayer Consumer Health’s brand-building framework for the Road to Billions Strategy—
            combining marketing capability, patient needs, market insights, product science, and HCPs.
          </p>
          <div className="welcome-hero__actions">
            <Link className="btn btn-primary" to="/knowledge-hub">
              Explore TB4L Hub
            </Link>
            <Link className="btn btn-secondary" to="/chat">
              Open TB4L Chat
            </Link>
          </div>
        </div>
        <div className="welcome-hero__visual" aria-hidden="true">
          <div className="welcome-hero__visual-inner">
            <span>Discover · Define · Design · Deliver</span>
            <strong>WHERE TO PLAY · HOW TO WIN</strong>
          </div>
        </div>
      </section>

      <section className="welcome-about" aria-labelledby="about-heading">
        <div className="welcome-sections__head">
          <h2 id="about-heading" className="section-title">
            What is TB4L?
          </h2>
          <p>
            TB4L helps Consumer Health teams build trusted brands effectively and consistently. It
            unites teams around a best-in-class framework that accelerates sustainable growth,
            creates meaningful consumer engagement, and advocates through credible science.
          </p>
        </div>
        <div className="welcome-about__stages">
          <article>
            <h3>Discover</h3>
            <p>Identify growth opportunities through landscape insights and brand assessments.</p>
          </article>
          <article>
            <h3>Define</h3>
            <p>Make strategic choices based on insights from Discover.</p>
          </article>
          <article>
            <h3>Design</h3>
            <p>Translate choices into winning plans.</p>
          </article>
          <article>
            <h3>Deliver</h3>
            <p>Execute plans with excellence and track outcomes.</p>
          </article>
        </div>
      </section>

      <section className="welcome-experiences" aria-labelledby="experiences-heading">
        <div className="welcome-sections__head">
          <h2 id="experiences-heading" className="section-title">
            Two ways to work
          </h2>
          <p>Hub for discovery. Chat for answers. Documents move with you.</p>
        </div>
        <div className="welcome-page__relation" role="note">
          <div>
            <strong>TB4L Hub</strong>
            <span>Discover trusted TB4L content by section</span>
          </div>
          <span className="welcome-page__arrow" aria-hidden="true">
            →
          </span>
          <div>
            <strong>TB4L Chat</strong>
            <span>Ask questions with optional Hub or M360 sources</span>
          </div>
        </div>
        <div className="welcome-page__grid">
          <ExperienceCard
            accent="hub"
            badge="Discover"
            badgeClass="badge-hub"
            title="TB4L Hub"
            description="Browse curated sections—Playbooks, Templates, Training, Accelerator Outputs, Glossary, and Team—then select documents as Chat sources."
            buttonLabel="Explore TB4L Hub"
            to="/knowledge-hub"
          />
          <ExperienceCard
            accent="chat"
            badge="Ask"
            badgeClass="badge-chat"
            title="TB4L Chat"
            description="Ask about Trusted Brands for Life, Brand Frames, and the four stages—or add Hub documents and connect Genie/M360 for contextual answers."
            buttonLabel="Open TB4L Chat"
            to="/chat"
          />
        </div>
      </section>
    </div>
  );
}
