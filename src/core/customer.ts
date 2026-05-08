import type { RebateResult } from "./rebate";

export interface CustomerChange {
  id: string;
  name: string;
  enabled: boolean;
  policyEffectiveDailyVolume: number;
  businessDailyVolume?: number;
  pricePerTicket: number;
  costPerTicket: number;
  returnRate?: number;
  returnIncomePerTicket?: number;
  otherIncomePerTicket?: number;
}

export interface CustomerContribution {
  id: string;
  name: string;
  policyEffectiveDailyVolume: number;
  businessDailyVolume: number;
  dailyRevenue: number;
  dailyCost: number;
  dailyReturnIncome: number;
  dailyOtherIncome: number;
  dailyProfitBeforeRebate: number;
  enabled: boolean;
}

export interface StackedVolumeInput {
  basePolicyEffectiveDailyVolume: number;
  baseBusinessDailyVolume?: number;
  customers: CustomerChange[];
}

export interface StackedVolumeResult {
  policyEffectiveDailyVolume: number;
  businessDailyVolume: number;
}

export function calculateCustomerContribution(
  customer: CustomerChange
): CustomerContribution {
  const businessDailyVolume =
    customer.businessDailyVolume ?? customer.policyEffectiveDailyVolume;

  assertNonNegative(customer.policyEffectiveDailyVolume, "客户政策有效票量");
  assertNonNegative(businessDailyVolume, "客户业务量票量");
  assertNonNegative(customer.pricePerTicket, "客户报价");
  assertNonNegative(customer.costPerTicket, "客户成本");

  const returnIncomePerTicket = customer.returnIncomePerTicket ?? 0;
  const returnRate = customer.returnRate ?? 0;
  const otherIncomePerTicket = customer.otherIncomePerTicket ?? 0;

  assertNonNegative(returnIncomePerTicket, "退件收益");
  assertNonNegative(returnRate, "退件率");
  assertNonNegative(otherIncomePerTicket, "其他收益");

  if (!customer.enabled) {
    return {
      id: customer.id,
      name: customer.name,
      policyEffectiveDailyVolume: 0,
      businessDailyVolume: 0,
      dailyRevenue: 0,
      dailyCost: 0,
      dailyReturnIncome: 0,
      dailyOtherIncome: 0,
      dailyProfitBeforeRebate: 0,
      enabled: false
    };
  }

  const dailyRevenue =
    customer.policyEffectiveDailyVolume * customer.pricePerTicket;
  const dailyCost =
    customer.policyEffectiveDailyVolume * customer.costPerTicket;
  const dailyReturnIncome =
    customer.policyEffectiveDailyVolume * returnRate * returnIncomePerTicket;
  const dailyOtherIncome =
    customer.policyEffectiveDailyVolume * otherIncomePerTicket;

  return {
    id: customer.id,
    name: customer.name,
    policyEffectiveDailyVolume: customer.policyEffectiveDailyVolume,
    businessDailyVolume,
    dailyRevenue,
    dailyCost,
    dailyReturnIncome,
    dailyOtherIncome,
    dailyProfitBeforeRebate:
      dailyRevenue + dailyReturnIncome + dailyOtherIncome - dailyCost,
    enabled: true
  };
}

export function calculateStackedVolumes(
  input: StackedVolumeInput
): StackedVolumeResult {
  assertNonNegative(input.basePolicyEffectiveDailyVolume, "基础政策有效票量");
  const baseBusinessDailyVolume =
    input.baseBusinessDailyVolume ?? input.basePolicyEffectiveDailyVolume;
  assertNonNegative(baseBusinessDailyVolume, "基础业务量票量");

  return input.customers.reduce<StackedVolumeResult>(
    (result, customer) => {
      const contribution = calculateCustomerContribution(customer);
      return {
        policyEffectiveDailyVolume:
          result.policyEffectiveDailyVolume +
          contribution.policyEffectiveDailyVolume,
        businessDailyVolume:
          result.businessDailyVolume + contribution.businessDailyVolume
      };
    },
    {
      policyEffectiveDailyVolume: input.basePolicyEffectiveDailyVolume,
      businessDailyVolume: baseBusinessDailyVolume
    }
  );
}

export function calculateRebateDelta(
  before: RebateResult,
  after: RebateResult
): number {
  return after.monthlyRebate - before.monthlyRebate;
}

function assertNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label}不能小于 0。`);
  }
}
