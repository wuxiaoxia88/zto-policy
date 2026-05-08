import { describe, expect, it } from "vitest";
import { sunanPolicyTemplate } from "../data/policy-presets";
import { calculateRebate, findPolicyTier } from "./rebate";

describe("rebate core", () => {
  it("matches Sunan policy tiers by effective daily volume", () => {
    expect(findPolicyTier(sunanPolicyTemplate, 500).id).toBe(1);
    expect(findPolicyTier(sunanPolicyTemplate, 501).id).toBe(2);
    expect(findPolicyTier(sunanPolicyTemplate, 1500).id).toBe(3);
    expect(findPolicyTier(sunanPolicyTemplate, 100001).id).toBe(9);
  });

  it("calculates case Qe=1500, B=1000", () => {
    const result = calculateRebate({
      policy: sunanPolicyTemplate,
      month: "2026-05",
      policyEffectiveDailyVolume: 1500,
      layerBaseDailyVolume: 1000
    });

    expect(result.tier.id).toBe(3);
    expect(result.baseRebateDailyAmount).toBeCloseTo(675, 6);
    expect(result.layerRebateDailyAmount).toBeCloseTo(375, 6);
    expect(result.totalDailyRebate).toBeCloseTo(1050, 6);
    expect(result.effectivePerTicketRebate).toBeCloseTo(0.7, 6);
    expect(result.monthlyRebate).toBeCloseTo(32550, 6);
  });

  it("calculates case Qe=2500, B=1000", () => {
    const result = calculateRebate({
      policy: sunanPolicyTemplate,
      month: "2026-05",
      policyEffectiveDailyVolume: 2500,
      layerBaseDailyVolume: 1000
    });

    expect(result.tier.id).toBe(4);
    expect(result.baseRebateDailyAmount).toBeCloseTo(2062.5, 6);
    expect(result.layerRebateDailyAmount).toBeCloseTo(600, 6);
    expect(result.totalDailyRebate).toBeCloseTo(2662.5, 6);
    expect(result.effectivePerTicketRebate).toBeCloseTo(1.065, 6);
  });

  it("does not pay layer subsidy before layer base", () => {
    const result = calculateRebate({
      policy: sunanPolicyTemplate,
      month: "2026-06",
      policyEffectiveDailyVolume: 8000,
      layerBaseDailyVolume: 11000
    });

    expect(result.tier.id).toBe(5);
    expect(result.baseRebateDailyAmount).toBeCloseTo(7800, 6);
    expect(result.layerRebateDailyVolume).toBe(0);
    expect(result.layerRebateDailyAmount).toBe(0);
    expect(result.reachedLayerBase).toBe(false);
  });

  it("calculates high-volume layer subsidy", () => {
    const result = calculateRebate({
      policy: sunanPolicyTemplate,
      month: "2026-06",
      policyEffectiveDailyVolume: 35000,
      layerBaseDailyVolume: 11000
    });

    expect(result.tier.id).toBe(7);
    expect(result.baseRebateDailyAmount).toBeCloseTo(42000, 6);
    expect(result.layerRebateDailyAmount).toBeCloseTo(2880, 6);
    expect(result.totalDailyRebate).toBeCloseTo(44880, 6);
  });
});
