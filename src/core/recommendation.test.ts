import { describe, expect, it } from "vitest";
import { calculateIncrementBreakdown } from "./increment";
import { generateRecommendation } from "./recommendation";

describe("recommendation core", () => {
  it("returns data-insufficient when cost data is missing", () => {
    const recommendation = generateRecommendation({
      hasCostData: false,
      increment: calculateIncrementBreakdown({
        stockBenefitDaily: 94.8,
        newCustomerProfitDaily: 10.4
      })
    });

    expect(recommendation.level).toBe("数据不足");
  });

  it("recommends cautious approval when total is positive but new customer loses money", () => {
    const recommendation = generateRecommendation({
      hasCostData: true,
      increment: calculateIncrementBreakdown({
        stockBenefitDaily: 250,
        newCustomerProfitDaily: -100
      })
    });

    expect(recommendation.level).toBe("谨慎做");
  });

  it("does not recommend profit-decreasing increments", () => {
    const recommendation = generateRecommendation({
      hasCostData: true,
      increment: calculateIncrementBreakdown({
        stockBenefitDaily: 167.2,
        newCustomerProfitDaily: -206
      })
    });

    expect(recommendation.level).toBe("不建议做");
  });
});
