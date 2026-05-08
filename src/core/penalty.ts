import { resolveMonthDays } from "./date";

export type PenaltyReason = "none" | "target_shortfall" | "negative_growth";

export interface PenaltyInput {
  month: string;
  targetDailyVolume: number;
  actualDailyVolume: number;
  yoyDailyVolume?: number;
  targetShortfallRate?: number;
  negativeGrowthRate?: number;
  overrideDays?: number;
}

export interface PenaltyResult {
  days: number;
  targetDailyVolume: number;
  actualDailyVolume: number;
  yoyDailyVolume?: number;
  shortfallDailyVolume: number;
  rate: number;
  reason: PenaltyReason;
  dailyPenalty: number;
  monthlyPenalty: number;
  isNegativeGrowth: boolean;
}

const DEFAULT_TARGET_SHORTFALL_RATE = 0.35;
const DEFAULT_NEGATIVE_GROWTH_RATE = 0.4;

export function calculatePenalty(input: PenaltyInput): PenaltyResult {
  const days = resolveMonthDays(input.month, input.overrideDays);
  const targetShortfallRate =
    input.targetShortfallRate ?? DEFAULT_TARGET_SHORTFALL_RATE;
  const negativeGrowthRate =
    input.negativeGrowthRate ?? DEFAULT_NEGATIVE_GROWTH_RATE;

  assertNonNegative(input.targetDailyVolume, "业务量指标");
  assertNonNegative(input.actualDailyVolume, "实际业务量");
  assertNonNegative(targetShortfallRate, "未达标处罚单价");
  assertNonNegative(negativeGrowthRate, "负增长处罚单价");

  if (input.yoyDailyVolume !== undefined) {
    assertNonNegative(input.yoyDailyVolume, "去年同期业务量");
  }

  const shortfallDailyVolume = Math.max(
    input.targetDailyVolume - input.actualDailyVolume,
    0
  );
  const isNegativeGrowth =
    input.yoyDailyVolume !== undefined &&
    input.actualDailyVolume < input.yoyDailyVolume;

  if (shortfallDailyVolume === 0) {
    return {
      days,
      targetDailyVolume: input.targetDailyVolume,
      actualDailyVolume: input.actualDailyVolume,
      yoyDailyVolume: input.yoyDailyVolume,
      shortfallDailyVolume,
      rate: 0,
      reason: "none",
      dailyPenalty: 0,
      monthlyPenalty: 0,
      isNegativeGrowth
    };
  }

  const reason: PenaltyReason = isNegativeGrowth
    ? "negative_growth"
    : "target_shortfall";
  const rate = isNegativeGrowth ? negativeGrowthRate : targetShortfallRate;
  const dailyPenalty = shortfallDailyVolume * rate;

  return {
    days,
    targetDailyVolume: input.targetDailyVolume,
    actualDailyVolume: input.actualDailyVolume,
    yoyDailyVolume: input.yoyDailyVolume,
    shortfallDailyVolume,
    rate,
    reason,
    dailyPenalty,
    monthlyPenalty: dailyPenalty * days,
    isNegativeGrowth
  };
}

function assertNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label}不能小于 0。`);
  }
}
