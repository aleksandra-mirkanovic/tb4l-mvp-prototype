import { getDocumentById } from './documents';

export const GENERAL_SUGGESTIONS = [
  'What is the TB4L framework?',
  'How should teams use TB4L?',
  'What TB4L training materials are available?',
  'Where can I find templates?',
  'What are the main stages of TB4L?',
];

export const DOCUMENT_SUGGESTIONS = [
  'What are the main learnings across these documents?',
  'Summarize key recommendations.',
  'Compare these documents.',
  'What should a Brand Manager focus on?',
  'Which markets are referenced?',
];

export const GENIE_SUGGESTIONS = [
  'What is the latest brand performance in Germany?',
  'Compare M360 indicators for Poland and Germany.',
  'Which markets show the strongest growth signals?',
  'Summarize access-related indicators for Brand A.',
];

const STAGE_OVERVIEW =
  'Trusted Brands for Life (TB4L) is Bayer Consumer Health’s brand-building framework that supports the Road to Billions Strategy. It helps teams build trusted brands effectively and consistently by combining marketing capabilities, deep understanding of patient medical needs, rigorous market insights, product science, and the role of Health Care Professionals (HCPs).\n\nTB4L is organised into two domains—WHERE TO PLAY and HOW TO WIN—and four stages: Discover, Define, Design, and Deliver.';

export function buildGeneralResponse(question: string): { content: string; citations: string[] } {
  const q = question.toLowerCase();

  if (q.includes('what is') && q.includes('tb4l')) {
    return {
      content: `${STAGE_OVERVIEW}\n\nBrand Frames capture the DNA of each brand across six principles: Brand Equity, Brand World, Brand Science, Brand Sustainability, Brand Growth Strategy, and Brand Architecture.\n\nUse the Knowledge Hub for curated guidance, and TB4L Chat to ask questions—optionally grounded in Hub sources or M360 data via Genie.`,
      citations: ['General TB4L Knowledge'],
    };
  }

  if ((q.includes('how should teams') || q.includes('how should')) && q.includes('use')) {
    return {
      content:
        'Teams should use TB4L as a shared brand-building system:\n1. Discover growth opportunities with landscape insights and brand assessments.\n2. Define strategic choices based on those insights.\n3. Design winning plans that translate choices into action.\n4. Deliver with excellence and track outcomes.\n\nStart in the Knowledge Hub for playbooks and templates, then ask focused questions in TB4L Chat. Use Genie/M360 only when you need structured performance data. Capability building is learning-by-doing—supported by Accelerators, feedback, data, automation, AI, and peer-led development.',
      citations: ['General TB4L Knowledge'],
    };
  }

  if (q.includes('training')) {
    return {
      content:
        'TB4L training is shifting from classroom-style sessions to learning-by-doing. Foundational materials include the TB4L Training Module and the Market Brand Strategy Workshop Guide. They cover TB4L language, the four stages, Brand Frames, and how Hub content supports day-to-day work. Filter the Knowledge Hub by “TB4L Training” to browse them.',
      citations: ['General TB4L Knowledge', 'TB4L Training Module'],
    };
  }

  if (q.includes('template')) {
    return {
      content:
        'Templates live in the Knowledge Hub under Templates and Discover Templates—examples include Brand Frame Example and Discover Template 2027. Use them to capture Brand Frame principles and Discover-stage evidence, then add them as Chat sources for tailored guidance.',
      citations: ['General TB4L Knowledge'],
    };
  }

  if (q.includes('stage') || q.includes('discover') || q.includes('define') || q.includes('design') || q.includes('deliver')) {
    return {
      content:
        'The four TB4L stages are:\n1. Discover — Identify growth opportunities through landscape insights and brand assessments.\n2. Define — Make strategic choices based on insights from Discover.\n3. Design — Translate choices into winning plans.\n4. Deliver — Execute plans with excellence and track outcomes.\n\nThese stages sit within two domains: WHERE TO PLAY and HOW TO WIN. Each stage has Hub artefacts (playbooks, templates, reports) you can load into Chat.',
      citations: ['General TB4L Knowledge', 'TB4L Global Framework Overview 2026'],
    };
  }

  if (q.includes('brand frame') || q.includes('purpose') || q.includes('benefit')) {
    return {
      content:
        'TB4L aims to create meaningful consumer engagement, become a preferred partner for customers, and advocate through credible science. It unites Consumer Health teams around a best-in-class framework that accelerates sustainable growth and supports the Road to Billions strategy.\n\nBrand Frames outline brand DNA through six principles: Brand Equity, Brand World, Brand Science, Brand Sustainability, Brand Growth Strategy, and Brand Architecture.',
      citations: ['General TB4L Knowledge'],
    };
  }

  return {
    content: `${STAGE_OVERVIEW}\n\nBased on your question (“${question}”), I can help with framework concepts, stages, Brand Frames, training, or templates. For document-specific answers, add Knowledge Hub sources. For M360 metrics, connect Genie before asking.`,
    citations: ['General TB4L Knowledge'],
  };
}

export function buildDocumentResponse(
  question: string,
  sourceTitles: string[],
): { content: string; citations: string[] } {
  const titles = sourceTitles.filter((t) => t !== 'Genie / M360' && t !== 'General TB4L Knowledge');
  const list = titles.length ? titles.map((t) => `• ${t}`).join('\n') : '• (no Hub documents selected)';
  const q = question.toLowerCase();

  let focus =
    'Across the selected sources, the strongest themes are clear WHERE TO PLAY / HOW TO WIN choices, strong Brand Frame quality, and disciplined movement through Discover → Define → Design → Deliver.';

  if (q.includes('compare')) {
    focus =
      'Comparison highlights: Accelerator outputs (Germany vs Poland) differ on access vs HCP journey emphasis, while the Global Framework and Playbooks provide the shared TB4L operating rules across Discover, Define, Design, and Deliver.';
  } else if (q.includes('recommend')) {
    focus =
      'Key recommendations: sharpen Brand Frames before Design, use Discover templates for evidence quality, define strategic choices explicitly, and track Deliver outcomes with leading and lagging indicators.';
  } else if (q.includes('brand manager')) {
    focus =
      'A Brand Manager should prioritize: (1) Brand Frame quality across the six principles, (2) clear choices in Define, (3) executable Design plans, and (4) Deliver excellence with measurable outcomes—using Hub sources to stay aligned.';
  } else if (q.includes('market')) {
    focus =
      'Markets referenced across your sources include Global, Germany, Poland, United Kingdom, Brazil, Japan, United States, and Multi-Market collections.';
  } else if (q.includes('learning') || q.includes('learnings')) {
    focus =
      'Main learnings: insight depth in Discover predicts Define quality; Brand Frames that cover Equity, World, Science, Sustainability, Growth Strategy, and Architecture travel better across markets; Accelerator markets that set a clear learning agenda iterate faster in Deliver.';
  }

  return {
    content: `Using your selected Knowledge Hub sources:\n${list}\n\n${focus}\n\nI can refine this further—ask to zoom into a single document, compare two markets, or draft next-step recommendations for your team.`,
    citations: titles.length ? titles : ['General TB4L Knowledge'],
  };
}

export function buildGenieResponse(question: string): { content: string; citations: string[] } {
  const q = question.toLowerCase();

  if (q.includes('poland') && q.includes('germany')) {
    return {
      content:
        'M360 snapshot (mocked): Germany shows stronger HCP engagement reach (+8% QoQ) while Poland leads on access-related dispense indicators (+5% QoQ). Both markets are above brand average on brand preference. Pair these signals with Accelerator Output documents to connect Deliver outcomes back to Define/Design choices.',
      citations: ['Genie / M360'],
    };
  }

  if (q.includes('germany')) {
    return {
      content:
        'M360 snapshot for Germany (mocked): Brand A awareness stable, consideration +3 pts vs prior quarter, and activation spend efficiency within target band. Leading indicator watch-out: digital HCP open rates softened in the last 4 weeks—review Deliver tracking against the Design plan.',
      citations: ['Genie / M360'],
    };
  }

  if (q.includes('access')) {
    return {
      content:
        'M360 access indicators for Brand A (mocked): coverage stable in priority accounts; time-to-therapy improved in 2 of 4 focus markets. Poland shows the clearest positive access trend; recommend reviewing Poland Accelerator outputs for associated Design and Deliver initiatives.',
      citations: ['Genie / M360'],
    };
  }

  if (q.includes('growth')) {
    return {
      content:
        'M360 growth signals (mocked): strongest momentum in Germany and Brazil; Japan stable; UK mixed with softer retail velocity. Use Hub Best Practices and Campaign Learning Report to interpret qualitative drivers behind these Deliver-stage signals.',
      citations: ['Genie / M360'],
    };
  }

  return {
    content: `M360 response via Genie (mocked) for: “${question}”.\n\nStructured indicators suggest stable overall brand health with pockets of opportunity in engagement efficiency and access. This is simulated data for the MVP prototype—pair with Knowledge Hub sources to interpret results through the TB4L Discover → Define → Design → Deliver lens.`,
    citations: ['Genie / M360'],
  };
}

export function buildUnavailableSourceResponse(): { content: string; citations: string[] } {
  return {
    content:
      'One or more selected sources appear unavailable in this prototype simulation. You can continue with General TB4L Knowledge, re-add sources from the Hub, or try again.',
    citations: [],
  };
}

export function titlesFromSourceIds(ids: string[]): string[] {
  return ids
    .map((id) => {
      if (id === 'genie') return 'Genie / M360';
      if (id === 'general') return 'General TB4L Knowledge';
      return getDocumentById(id)?.title ?? 'Unknown source';
    })
    .filter(Boolean);
}
