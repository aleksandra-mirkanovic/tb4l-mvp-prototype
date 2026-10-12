/**
 * Bain-logic Market story — AI Assistant v4.
 * Same chrome as v3 plus Kirill’s TB4L-003 blocks (structure, growth×share, candidates).
 */
import { M360MarketStoryV3 } from './M360MarketStoryV3';

export function M360MarketStoryV4() {
  return <M360MarketStoryV3 includeTb4l003 />;
}
