import { describe, expect, it } from "vitest";
import { calculateIncrementBreakdown } from "./increment";

describe("increment core", () => {
  it("recognizes profit-increasing increment from case two", () => {
    const result = calculateIncrementBreakdown({
      stockBenefitDaily: 94.8,
      newCustomerProfitDaily: 10.4
    });

    expect(result.finalDailyImpact).toBeCloseTo(105.2, 6);
    expect(result.conclusion).toBe("增量增利");
  });

  it("recognizes profit-decreasing increment from case one", () => {
    const result = calculateIncrementBreakdown({
      stockBenefitDaily: 167.2,
      newCustomerProfitDaily: -206
    });

    expect(result.finalDailyImpact).toBeCloseTo(-38.8, 6);
    expect(result.conclusion).toBe("增量减利");
  });

  it("can convert daily increment to monthly impact", () => {
    const result = calculateIncrementBreakdown({
      month: "2026-06",
      stockBenefitDaily: 94.8,
      newCustomerProfitDaily: 10.4
    });

    expect(result.days).toBe(30);
    expect(result.finalMonthlyImpact).toBeCloseTo(3156, 6);
  });
});
