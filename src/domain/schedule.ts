import { addDays } from "../time.js";
export interface ScheduleInput {
  capturedOn: string;
  scheduleDays: readonly number[];
  intensity: number;
  reflections: ReadonlyArray<{
    reflectedOn: string;
    resolution: "let_go" | "easing" | "still_matters";
    intensityNow: number;
  }>;
  snoozedUntil: string | null;
  outcomeKnownBy: string | null;
}
/** 决定下一次回看日期。约束：释怀后停止；尊重推迟；等待结果揭晓。 */
export function computeNextReviewOn(input: ScheduleInput): string | null {
  // 所有者在 2026-10-11 明确取消自动排程；保留接口供手动复盘复用。
  return null;
}
