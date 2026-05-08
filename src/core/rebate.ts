import { resolveMonthDays } from "./date";
import type { PolicyTemplate, PolicyTier } from "./types";

export interface RebateInput {
  policy: PolicyTemplate;
  month: string;
  policyEffectiveDailyVolume: number;
  layerBaseDailyVolume: number;
  businessDailyVolume?: number;
  overrideDays?: number;
}

export interface RebateResult {
  days: number;
  tier: PolicyTier;
  policyEffectiveDailyVolume: number;
  businessDailyVolume: number;
  layerBaseDailyVolume: number;
  baseRebateDailyVolume: number;
  baseRebateDailyAmount: number;
  layerRebateDailyVolume: number;
  layerRebateDailyAmount: number;
  totalDailyRebate: number;
  monthlyRebate: number;
  effectivePerTicketRebate: number;
  totalPerTicketRebate: number;
  reachedLayerBase: boolean;
}

export function findPolicyTier(
  policy: PolicyTemplate,
  dailyVolume: number
): PolicyTier {
  assertNonNegative(dailyVolume, "政策有效票量");

  const tiers = [...policy.tiers].sort(
    (a, b) => a.minDailyVolume - b.minDailyVolume
  );
  const tier = tiers.find(
    (item) => item.maxDailyVolume === null || dailyVolume <= item.maxDailyVolume
  );

  if (!tier) {
    throw new Error(`未找到匹配档位: ${dailyVolume} 票/天。`);
  }

  return tier;
}

export function calculateRebate(input: RebateInput): RebateResult {
  const days = resolveMonthDays(input.month, input.overrideDays);
  const policyEffectiveDailyVolume = input.policyEffectiveDailyVolume;
  const businessDailyVolume =
    input.businessDailyVolume ?? input.policyEffectiveDailyVolume;
  const layerBaseDailyVolume = input.layerBaseDailyVolume;

  assertPositive(policyEffectiveDailyVolume, "政策有效票量");
  assertPositive(businessDailyVolume, "业务量考核票量");
  assertNonNegative(layerBaseDailyVolume, "分层基数");

  const tier = findPolicyTier(input.policy, policyEffectiveDailyVolume);
  const baseRebateDailyVolume =
    policyEffectiveDailyVolume * (1 - tier.baseRatio);
  const baseRebateDailyAmount =
    baseRebateDailyVolume * tier.baseSubsidy;
  const layerRebateDailyVolume = Math.max(
    policyEffectiveDailyVolume - layerBaseDailyVolume,
    0
  );
  const layerRebateDailyAmount =
    layerRebateDailyVolume * tier.layerSubsidy;
  const totalDailyRebate =
    baseRebateDailyAmount + layerRebateDailyAmount;

  return {
    days,
    tier,
    policyEffectiveDailyVolume,
    businessDailyVolume,
    layerBaseDailyVolume,
    baseRebateDailyVolume,
    baseRebateDailyAmount,
    layerRebateDailyVolume,
    layerRebateDailyAmount,
    totalDailyRebate,
    monthlyRebate: totalDailyRebate * days,
    effectivePerTicketRebate: totalDailyRebate / policyEffectiveDailyVolume,
    totalPerTicketRebate: totalDailyRebate / businessDailyVolume,
    reachedLayerBase: layerRebateDailyVolume > 0
  };
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必须大于 0。`);
  }
}

function assertNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label}不能小于 0。`);
  }
}
