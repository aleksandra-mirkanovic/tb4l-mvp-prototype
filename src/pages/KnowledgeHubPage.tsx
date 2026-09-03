/**
 * TB4L Hub entry — switches AI-first vs classic Overview.
 * Revert AI-first Hub: set AI_FIRST_HUB = false in src/config/aiFirstHub.ts
 */
import { AI_FIRST_HUB } from '../config/aiFirstHub';
import { AiFirstHubPage } from './AiFirstHubPage';
import { KnowledgeHubClassicPage } from './KnowledgeHubClassicPage';

export function KnowledgeHubPage() {
  return AI_FIRST_HUB ? <AiFirstHubPage /> : <KnowledgeHubClassicPage />;
}
