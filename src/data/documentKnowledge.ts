import { DOCUMENTS, getDocumentById } from './documents';
import type { KnowledgeDocument } from '../types';

export interface DocumentKnowledgeView {
  /** Business purpose — must not repeat the document title */
  purpose: string;
  keyTakeaways: string[];
  recommendedFor: string[];
  aiInsights: string[];
  relatedDocumentIds: string[];
  suggestedQuestions: string[];
  author: string;
}

type KnowledgeSeed = Omit<DocumentKnowledgeView, 'author'> & { author?: string };

const DEFAULT_PERSONAS = ['Brand Managers', 'Marketing Excellence'] as const;

const CATEGORY_PERSONAS: Partial<Record<KnowledgeDocument['category'], string[]>> = {
  Playbooks: ['Brand Managers', 'Activation Teams', 'Marketing Excellence'],
  Templates: ['Brand Managers', 'Activation Teams', 'Marketing Excellence'],
  'Discover Templates': ['Brand Managers', 'Insights', 'Marketing Excellence'],
  Training: ['Brand Managers', 'Marketing Excellence', 'New Joiners'],
  'Brand Frames': ['Brand Managers', 'Medical Affairs', 'Insights'],
  'Accelerator Outputs': ['Brand Managers', 'Activation Teams', 'Country Leads'],
  'Global Best Practices': ['Brand Managers', 'Marketing Excellence', 'Country Leads'],
  'Brand & Strategy': ['Brand Managers', 'Marketing Excellence', 'Medical Affairs'],
};

const CATEGORY_AUTHOR: Partial<Record<KnowledgeDocument['category'], string>> = {
  Playbooks: 'TB4L Capability Team',
  Templates: 'TB4L Capability Team',
  'Discover Templates': 'TB4L Insights Guild',
  Training: 'TB4L Learning & Capability',
  'Brand Frames': 'Global Brand Strategy',
  'Accelerator Outputs': 'TB4L Accelerator Faculty',
  'Global Best Practices': 'Marketing Excellence',
  'Brand & Strategy': 'Global Brand Strategy',
};

/** Curated AI knowledge views keyed by document id (prototype mock). */
const KNOWLEDGE_BY_ID: Record<string, KnowledgeSeed> = {
  'doc-1': {
    purpose:
      'Gives brand teams a shared operating model for WHERE TO PLAY and HOW TO WIN so global strategy stays consistent while markets stay locally relevant.',
    keyTakeaways: [
      'Four-stage rhythm: Discover → Define → Design → Deliver',
      'Brand Frames as the DNA layer for every brand',
      'Clear role expectations across Brand, Medical, and Insights',
      'Road to Billions outcomes mapped to TB4L choices',
    ],
    recommendedFor: ['Brand Managers', 'Marketing Excellence', 'Medical Affairs', 'Country Leads'],
    aiInsights: [
      'Most useful as the first grounding source before planning or Chat questions',
      'Pairs well with Brand Planning Playbook for execution detail',
      'Frequently cited when onboarding new brand team members',
    ],
    relatedDocumentIds: ['doc-2', 'doc-6', 'doc-7', 'doc-8'],
    suggestedQuestions: [
      'What are the four TB4L stages and how do they connect?',
      'How should Brand Frames be used in planning?',
      'What roles do Brand, Medical, and Insights play?',
      'How does TB4L support the Road to Billions?',
    ],
  },
  'doc-2': {
    purpose:
      'Turns TB4L principles into a practical annual and campaign planning ritual with workshops, artefacts, and Brand Frame checklists.',
    keyTakeaways: [
      'Workshop agendas for Discover through Deliver',
      'Brand Frame templates across six DNA principles',
      'Decision checkpoints that prevent weak strategic choices',
      'Handoffs from plan design into activation measurement',
    ],
    recommendedFor: ['Brand Managers', 'Activation Teams', 'Marketing Excellence'],
    aiInsights: [
      'Most useful when building or refreshing a yearly brand plan',
      'Supports consistent facilitation across markets',
      'Frequently paired with Discover templates and Brand Frame examples',
    ],
    relatedDocumentIds: ['doc-1', 'doc-7', 'doc-8', 'doc-12'],
    suggestedQuestions: [
      'Summarize the brand planning ritual from Discover to Deliver',
      'Which Brand Frame artefacts are required in Define?',
      'What workshop checkpoints prevent weak choices?',
      'How should plans hand off into activation measurement?',
    ],
  },
  'doc-3': {
    purpose:
      'Surfaces reusable patterns from high-performing markets so teams can adapt proven approaches instead of starting from scratch.',
    keyTakeaways: [
      'Cross-market patterns in insight depth and quality',
      'Channel sequencing plays that repeatedly worked',
      'Post-campaign learning loops that feed the next cycle',
      'Adaptation guidance for local market constraints',
    ],
    recommendedFor: ['Brand Managers', 'Marketing Excellence', 'Country Leads'],
    aiInsights: [
      'Most useful before local adaptation of a global idea',
      'Helps compare Germany, Poland, Brazil, and Japan approaches',
      'Frequently used to stress-test channel and insight choices',
    ],
    relatedDocumentIds: ['doc-4', 'doc-5', 'doc-10', 'doc-1'],
    suggestedQuestions: [
      'What cross-market patterns should we reuse?',
      'How do high-performing markets sequence channels?',
      'What learning loops feed the next Discover cycle?',
      'How should we adapt these practices locally?',
    ],
  },
  'doc-4': {
    purpose:
      'Captures Germany Accelerator decisions so other markets can reuse ambition, journey priorities, and activation sequencing tied to M360 signals.',
    keyTakeaways: [
      'Sharpened brand ambition and audience focus',
      'Prioritized HCP and patient journey moments',
      'Phased activation roadmap with clear gates',
      'M360 indicators linked to Deliver tracking',
    ],
    recommendedFor: ['Brand Managers', 'Activation Teams', 'Country Leads'],
    aiInsights: [
      'Most useful when preparing an Accelerator or reviewing Germany outcomes',
      'Strong reference for HCP journey prioritization',
      'Frequently compared with Poland Accelerator outputs',
    ],
    relatedDocumentIds: ['doc-5', 'doc-11', 'doc-3', 'doc-2'],
    suggestedQuestions: [
      'What ambition and audience choices did Germany make?',
      'Which HCP journey moments were prioritized?',
      'How is the activation roadmap phased?',
      'Which M360 indicators track Deliver outcomes?',
    ],
  },
  'doc-5': {
    purpose:
      'Documents Poland Accelerator choices on access, retail partnerships, and a focused early learning agenda for CEE planning.',
    keyTakeaways: [
      'Access-barrier framing for local strategy',
      'Retail partnership priorities for activation',
      'Two-quarter learning agenda with clear hypotheses',
      'Reusable decision capture from Accelerator sessions',
    ],
    recommendedFor: ['Brand Managers', 'Activation Teams', 'Country Leads'],
    aiInsights: [
      'Most useful for CEE market planning and access-led strategies',
      'Useful contrast to Germany’s HCP-journey emphasis',
      'Frequently referenced in cross-market Accelerator comparisons',
    ],
    relatedDocumentIds: ['doc-4', 'doc-3', 'doc-9', 'doc-10'],
    suggestedQuestions: [
      'How did Poland frame access barriers?',
      'What retail partnership priorities were set?',
      'What is in the two-quarter learning agenda?',
      'How does Poland differ from Germany Accelerator outputs?',
    ],
  },
  'doc-6': {
    purpose:
      'Builds shared TB4L language and rituals so Brand, Medical, and Insights collaborate with the same vocabulary and stage expectations.',
    keyTakeaways: [
      'Core TB4L vocabulary and stage definitions',
      'Brand Frames explained for cross-functional partners',
      'Learning-by-doing model for capability building',
      'Collaboration patterns across Brand, Medical, and Insights',
    ],
    recommendedFor: ['Brand Managers', 'Marketing Excellence', 'Medical Affairs', 'New Joiners'],
    aiInsights: [
      'Most useful as an onboarding or refresher source',
      'Supports consistent workshop facilitation language',
      'Frequently recommended before first Brand Frame drafting',
    ],
    relatedDocumentIds: ['doc-1', 'doc-12', 'doc-7', 'doc-2'],
    suggestedQuestions: [
      'Explain TB4L vocabulary for new joiners',
      'How should Brand, Medical, and Insights collaborate?',
      'What does learning-by-doing mean in TB4L?',
      'Which Brand Frame concepts are essential to learn first?',
    ],
  },
  'doc-7': {
    purpose:
      'Shows what a high-quality Brand Frame looks like in practice so teams can raise Define-stage quality before Design planning.',
    keyTakeaways: [
      'Worked example across six Brand Frame principles',
      'Quality criteria and commentary on strong language',
      'Common pitfalls that weaken brand DNA framing',
      'How Chat can stress-test framing statements',
    ],
    recommendedFor: ['Brand Managers', 'Medical Affairs', 'Insights'],
    aiInsights: [
      'Most useful when drafting or reviewing Brand Frames',
      'Pairs with the Brand Frames Quality Checklist',
      'Frequently used in Define workshops as a quality benchmark',
    ],
    relatedDocumentIds: ['doc-7b', 'doc-2', 'doc-1', 'doc-11'],
    suggestedQuestions: [
      'What makes a strong Brand Frame?',
      'What pitfalls weaken Brand Frame language?',
      'How do the six principles work together?',
      'How does this align with Brand Frame barriers in activation?',
    ],
  },
  'doc-7b': {
    purpose:
      'Gives facilitators a shared review lens so Brand Frame drafts are challenged consistently before they enter Design.',
    keyTakeaways: [
      'Checklist criteria for all six Brand Frame principles',
      'Facilitation prompts for Brand, Medical, and Insights',
      'Quality gates before Design handoff',
      'Consistency cues for multi-market reviews',
    ],
    recommendedFor: ['Brand Managers', 'Medical Affairs', 'Marketing Excellence'],
    aiInsights: [
      'Most useful during Define workshops and peer review',
      'Supports cross-functional challenge without slowing progress',
      'Frequently used alongside annotated Brand Frame examples',
    ],
    relatedDocumentIds: ['doc-7', 'doc-2', 'doc-12', 'doc-1'],
    suggestedQuestions: [
      'What quality criteria should we apply to Brand Frames?',
      'Which facilitation prompts challenge weak language?',
      'What are the gates before Design handoff?',
      'How do we keep Brand Frames consistent across markets?',
    ],
  },
  'doc-8': {
    purpose:
      'Structures early discovery work so insights, opportunities, and evidence are captured in a form that feeds planning and M360 questions.',
    keyTakeaways: [
      'Insight log format for Discover-stage evidence',
      'Opportunity scorecard for prioritization',
      'Evidence index ready for Brand Planning handoff',
      'Markdown structure designed for reuse in Chat',
    ],
    recommendedFor: ['Brand Managers', 'Insights', 'Marketing Excellence'],
    aiInsights: [
      'Most useful at the start of a planning cycle',
      'Improves the quality of later Define choices',
      'Frequently used as a Chat source for opportunity framing',
    ],
    relatedDocumentIds: ['doc-2', 'doc-1', 'doc-3', 'doc-9'],
    suggestedQuestions: [
      'How should we structure Discover insights?',
      'What belongs in the opportunity scorecard?',
      'How does Discover evidence feed Brand Planning?',
      'Which Discover outputs are useful for M360 questions?',
    ],
  },
  'doc-9': {
    purpose:
      'Shows how TB4L strategic choices cascade into objectives, initiatives, KPIs, and investment logic for formal business planning.',
    keyTakeaways: [
      'Strategy-to-plan cascade with clear ownership',
      'KPI set linked to TB4L Deliver outcomes',
      'Investment logic aligned to brand priorities',
      'Multi-year horizon example for Brazil',
    ],
    recommendedFor: ['Brand Managers', 'Marketing Excellence', 'Country Leads'],
    aiInsights: [
      'Most useful when translating TB4L choices into business plans',
      'Bridges brand strategy artefacts and investment decisions',
      'Frequently referenced for KPI and resource conversations',
    ],
    relatedDocumentIds: ['doc-1', 'doc-2', 'doc-10', 'doc-5'],
    suggestedQuestions: [
      'How do TB4L choices cascade into business plan KPIs?',
      'What investment logic is recommended?',
      'How should objectives map to Deliver outcomes?',
      'What can we reuse from the Brazil example?',
    ],
  },
  'doc-10': {
    purpose:
      'Models Deliver-stage learning so campaigns close with evidence, indicator review, and recommendations that restart Discover.',
    keyTakeaways: [
      'Hypothesis review after campaign execution',
      'Leading and lagging indicator structure',
      'Qualitative insight capture for next cycle',
      'Recommended changes feeding Discover',
    ],
    recommendedFor: ['Brand Managers', 'Activation Teams', 'Marketing Excellence'],
    aiInsights: [
      'Most useful after activation waves and campaign close-outs',
      'Strengthens the learning loop between Deliver and Discover',
      'Frequently used as a template for market retrospectives',
    ],
    relatedDocumentIds: ['doc-3', 'doc-11', 'doc-8', 'doc-9'],
    suggestedQuestions: [
      'What KPIs are recommended for campaign learning?',
      'How should we review leading vs lagging indicators?',
      'How do campaign learnings feed Discover?',
      'What belongs in a Deliver-stage retrospective?',
    ],
  },
  'doc-11': {
    purpose:
      'Helps activation teams design compliant, insight-led HCP journeys with clear channel roles, content governance, and measurement.',
    keyTakeaways: [
      'Recommended HCP engagement channels and roles',
      'Governance and compliance requirements for content',
      'Measurement framework and KPIs for HCP programs',
      'Content planning best practices tied to Brand Frame barriers',
    ],
    recommendedFor: ['Brand Managers', 'Activation Teams', 'Medical Affairs', 'Marketing Excellence'],
    aiInsights: [
      'Most useful when designing HCP engagement strategies',
      'Supports compliant multi-channel activation planning',
      'Frequently used together with Brand Frame assets',
    ],
    relatedDocumentIds: ['doc-7', 'doc-2', 'doc-10', 'doc-4'],
    suggestedQuestions: [
      'Summarize the HCP engagement framework',
      'What KPIs are recommended?',
      'How does this align with Brand Frame barriers?',
      'What governance requirements should markets follow?',
    ],
  },
  'doc-12': {
    purpose:
      'Equips Country Leads to run consistent two-day brand strategy workshops with clear agendas, breakouts, and decision capture.',
    keyTakeaways: [
      'Two-day agenda with timing and facilitation cues',
      'Breakout instructions for cross-functional teams',
      'Decision capture sheets for TB4L artefacts',
      'Quality checks before workshop close',
    ],
    recommendedFor: ['Country Leads', 'Brand Managers', 'Marketing Excellence'],
    aiInsights: [
      'Most useful when preparing market strategy workshops',
      'Improves consistency of decisions across markets',
      'Frequently used with Brand Planning Playbook artefacts',
    ],
    relatedDocumentIds: ['doc-2', 'doc-6', 'doc-7b', 'doc-1'],
    suggestedQuestions: [
      'What is the recommended two-day workshop agenda?',
      'How should breakouts capture TB4L decisions?',
      'What quality checks close a strategy workshop?',
      'Which artefacts should be ready before Design?',
    ],
  },
};

function relatedByOverlap(doc: KnowledgeDocument, limit = 4): string[] {
  const topicSet = new Set(doc.keyTopics.map((t) => t.toLowerCase()));
  return DOCUMENTS.filter((other) => other.id !== doc.id)
    .map((other) => {
      const sharedTopics = other.keyTopics.filter((t) => topicSet.has(t.toLowerCase())).length;
      const sameCategory = other.category === doc.category ? 2 : 0;
      return { id: other.id, score: sharedTopics * 2 + sameCategory };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.id);
}

function fallbackKnowledge(doc: KnowledgeDocument): DocumentKnowledgeView {
  const takeaways =
    doc.keyTopics.length >= 3
      ? doc.keyTopics.slice(0, 5)
      : [
          ...doc.keyTopics,
          'Actionable guidance for TB4L planning',
          'Reusable artefacts for cross-functional teams',
          'Clear connection to Chat sourcing',
        ].slice(0, 5);

  return {
    purpose: doc.whyRelevant || doc.description,
    keyTakeaways: takeaways,
    recommendedFor: CATEGORY_PERSONAS[doc.category] ?? [...DEFAULT_PERSONAS],
    aiInsights: [
      `Most useful when working on ${doc.category.toLowerCase()} questions`,
      `Supports ${doc.market} planning with ${doc.brand} context`,
      'Frequently valuable as a grounded Chat source',
    ],
    relatedDocumentIds: relatedByOverlap(doc),
    suggestedQuestions: [
      `Summarize the key guidance in ${doc.documentType.toLowerCase()} form`,
      'What actions should Brand Managers take from this?',
      'How does this connect to Brand Frames?',
      'What should markets measure after applying this?',
    ],
    author: CATEGORY_AUTHOR[doc.category] ?? 'TB4L Knowledge Team',
  };
}

export function getDocumentKnowledge(doc: KnowledgeDocument): DocumentKnowledgeView {
  const seeded = KNOWLEDGE_BY_ID[doc.id];
  if (!seeded) return fallbackKnowledge(doc);
  return {
    ...seeded,
    author: seeded.author ?? CATEGORY_AUTHOR[doc.category] ?? 'TB4L Knowledge Team',
  };
}

export function getRelatedDocuments(doc: KnowledgeDocument): KnowledgeDocument[] {
  const knowledge = getDocumentKnowledge(doc);
  return knowledge.relatedDocumentIds
    .map((id) => getDocumentById(id))
    .filter((item): item is KnowledgeDocument => Boolean(item));
}
