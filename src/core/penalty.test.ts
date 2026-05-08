import { describe, expect, it } from "vitest";
import { calculatePenalty } from "./penalty";

describe("penalty core", () => {
  it("calculates normal target-shortfall penalty", () => {
    const result = calculatePenalty({
      month: "2026-06",
      targetDailyVolume: 8000,
      actualDailyVolume: 7500,
      yoyDailyVolume: 7400
    });

    expect(result.days).toBe(30);
    expect(result.shortfallDailyVolume).toBe(500);
    expect(result.reason).toBe("target_shortfall");
    expect(result.rate).toBe(0.35);
    expect(result.dailyPenalty).toBeCloseTo(175, 6);
    expect(result.monthlyPenalty).toBeCloseTo(5250, 6);
  });

  it("uses negative-growth penalty instead of stacking two policies", () => {
    const result = calculatePenalty({
      month: "2026-06",
      targetDailyVolume: 8000,
      actualDailyVolume: 7500,
      yoyDailyVolume: 7600
    });

    expect(result.reason).toBe("negative_growth");
    expect(result.rate).toBe(0.4);
    expect(result.dailyPenalty).toBeCloseTo(200, 6);
    expect(result.monthlyPenalty).toBeCloseTo(6000, 6);
  });

  it("does not penalize when actual volume reaches target", () => {
    const result = calculatePenalty({
      month: "2026-06",
      targetDailyVolume: 8000,
      actualDailyVolume: 8100,
      yoyDailyVolume: 8200
    });

    expect(result.reason).toBe("none");
    expect(result.shortfallDailyVolume).toBe(0);
    expect(result.monthlyPenalty).toBe(0);
  });
});
