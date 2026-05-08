import { describe, expect, it } from "vitest";
import {
  calculateCustomerContribution,
  calculateStackedVolumes
} from "./customer";

describe("customer core", () => {
  it("calculates one customer contribution before rebate allocation", () => {
    const result = calculateCustomerContribution({
      id: "a",
      name: "服装客户 A",
      enabled: true,
      policyEffectiveDailyVolume: 500,
      pricePerTicket: 2.5,
      costPerTicket: 2.18,
      returnRate: 0.5,
      returnIncomePerTicket: 1.2
    });

    expect(result.dailyRevenue).toBeCloseTo(1250, 6);
    expect(result.dailyCost).toBeCloseTo(1090, 6);
    expect(result.dailyReturnIncome).toBeCloseTo(300, 6);
    expect(result.dailyProfitBeforeRebate).toBeCloseTo(460, 6);
  });

  it("stacks enabled customer volumes only", () => {
    const result = calculateStackedVolumes({
      basePolicyEffectiveDailyVolume: 7500,
      baseBusinessDailyVolume: 7500,
      customers: [
        {
          id: "a",
          name: "客户 A",
          enabled: true,
          policyEffectiveDailyVolume: 500,
          pricePerTicket: 2.5,
          costPerTicket: 2.18
        },
        {
          id: "b",
          name: "客户 B",
          enabled: false,
          policyEffectiveDailyVolume: 1000,
          pricePerTicket: 2,
          costPerTicket: 2.2
        }
      ]
    });

    expect(result.policyEffectiveDailyVolume).toBe(8000);
    expect(result.businessDailyVolume).toBe(8000);
  });
});
