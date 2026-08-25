export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  related: string[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'g1',
    term: 'TB4L',
    definition:
      'Trusted Brands for Life — Bayer Consumer Health’s brand-building framework supporting the Road to Billions Strategy. It combines marketing capabilities, patient medical needs, market insights, product science, and the role of HCPs.',
    related: ['Discover', 'Define', 'Design', 'Deliver', 'Brand Frames'],
  },
  {
    id: 'g2',
    term: 'WHERE TO PLAY / HOW TO WIN',
    definition:
      'The two broad domains of the TB4L brand-building framework. Together they organise strategic focus and execution choices across the four stages.',
    related: ['TB4L', 'Define', 'Design'],
  },
  {
    id: 'g3',
    term: 'Discover',
    definition:
      'Identify growth opportunities through landscape insights and brand assessments.',
    related: ['Define', 'Market insights', 'Brand assessment'],
  },
  {
    id: 'g4',
    term: 'Define',
    definition:
      'Make strategic choices based on insights from Discover.',
    related: ['Discover', 'Brand Frames', 'HOW TO WIN'],
  },
  {
    id: 'g5',
    term: 'Design',
    definition:
      'Translate strategic choices into winning plans.',
    related: ['Define', 'Deliver', 'Brand Growth Strategy'],
  },
  {
    id: 'g6',
    term: 'Deliver',
    definition:
      'Execute plans with excellence and track outcomes.',
    related: ['Design', 'HCP', 'Measurement'],
  },
  {
    id: 'g7',
    term: 'Brand Frames',
    definition:
      'Six principles that outline the DNA of each brand: Brand Equity, Brand World, Brand Science, Brand Sustainability, Brand Growth Strategy, and Brand Architecture.',
    related: ['Brand Equity', 'Brand Science', 'Brand Architecture'],
  },
  {
    id: 'g8',
    term: 'Accelerator',
    definition:
      'An intensive learning-by-doing programme that helps markets sharpen TB4L choices and produce actionable outputs, supported by feedback, data, automation, AI, and peer-led development.',
    related: ['Capability Building', 'Accelerator Outputs'],
  },
  {
    id: 'g9',
    term: 'Knowledge Hub',
    definition:
      'The curated content experience for trusted TB4L documents—playbooks, templates, training, and market outputs.',
    related: ['Sources', 'AI-generated summary'],
  },
  {
    id: 'g10',
    term: 'Contextual Chat',
    definition:
      'TB4L Chat grounded in selected Hub documents and/or general framework knowledge, with optional M360 structured data.',
    related: ['Sources', 'M360'],
  },
  {
    id: 'g11',
    term: 'M360',
    definition:
      'An explicitly selected structured-data path that queries M360 indicators. It is never auto-triggered and may take longer than standard Chat.',
    related: ['Structured data', 'Deliver'],
  },
];
