/**
 * Bain-logic Market story — AI Assistant v4.
 * Kirill’s TB4L-003 blocks + reading beside each chart (scroller).
 * v3 keeps reading stacked under the chart like the deployed build.
 */
import { M360MarketStoryV3 } from './M360MarketStoryV3';

export function M360MarketStoryV4() {
  return <M360MarketStoryV3 includeTb4l003 />;
}
