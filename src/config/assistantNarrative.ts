/**
 * Brand-manager narrative pass: labeled hypotheses, stronger readout and actions.
 *
 * TO REVERT (one step):
 *   Set `ASSISTANT_NARRATIVE_V2` to `false` below, save, and refresh.
 *   Charts, cards, and the finance extract stay as they are.
 */
export const ASSISTANT_NARRATIVE_V2 = true;

/**
 * AI Assistant v3 Market story: full TB4L analysis under each chart (stacked)
 * + section dividers + synthesis that includes Key implications.
 *
 * Used only by M360MarketStoryV3. AI Assistant v2 ignores this flag.
 *
 * TO REVERT analysis chrome / dividers on v3 (one step):
 *   Set `ASSISTANT_STORY_RAIL` to `false` below, save, and refresh.
 */
export const ASSISTANT_STORY_RAIL = true;
