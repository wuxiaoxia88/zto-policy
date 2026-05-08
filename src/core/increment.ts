import { resolveMonthDays } from "./date";
import type { IncrementConclusion } from "./types";

export interface IncrementBreakdownInput {
  month?: string;
  days?: number;
  stockBenefitDaily: number;
  newCustomerProfitDaily: number;
  penaltyReductionDaily?: number;
  returnIncomeDaily?: number;
  otherBenefitDaily?: number;
}

export interface IncrementBreakdownResult {
  days?: number;
  stockBenefitDaily: number;
  newCustomerProfitDaily: number;
  penaltyReductionDaily: number;
  returnIncomeDaily: number;
  otherBenefitDaily: number;
  finalDailyImpact: number;
  finalMonthlyImpact?: number;
  conclusion: IncrementConclusion;
}

export function calculateIncrementBreakdown(
  input: IncrementBreakdownInput
): IncrementBreakdownResult {
  const days =
    input.days ??
    (input.month === undefined ? undefined : resolveMonthDays(input.month));
  const stockBenefitDaily = input.stockBenefitDaily;
  const newCustomerProfitDaily = input.newCustomerProfitDaily;
  const penaltyReductionDaily = input.penaltyReductionDaily ?? 0;
  const returnIncomeDaily = input.returnIncomeDaily ?? 0;
  const otherBenefitDaily = input.otherBenefitDaily ?? 0;

  [
    stockBenefitDaily,
    newCustomerProfitDaily,
    penaltyReductionDaily,
    returnIncomeDaily,
    otherBenefitDaily
  ].forEach((value) => {
    if (!Number.isFinite(value)) {
      throw new Error("增量拆解金额必须是有效数字。");
    }
  });

  const finalDailyImpact =
    stockBenefitDaily +
    newCustomerProfitDaily +
    penaltyReductionDaily +
    returnIncomeDaily +
    otherBenefitDaily;

  return {
    days,
    stockBenefitDaily,
    newCustomerProfitDaily,
    penaltyReductionDaily,
    returnIncomeDaily,
    otherBenefitDaily,
    finalDailyImpact,
    finalMonthlyImpact:
      days === undefined ? undefined : finalDailyImpact * days,
    conclusion: classifyIncrement(finalDailyImpact)
  };
}

export function classifyIncrement(value: number): IncrementConclusion {
  if (value > 0) {
    return "增量增利";
  }

  if (value < 0) {
    return "增量减利";
  }

  return "增量持平";
}
