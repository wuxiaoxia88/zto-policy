import type { IncrementBreakdownResult } from "./increment";
import type { RecommendationLevel } from "./types";

export interface RecommendationInput {
  increment: IncrementBreakdownResult;
  hasCostData: boolean;
}

export interface RecommendationResult {
  level: RecommendationLevel;
  title: string;
  reasons: string[];
}

export function generateRecommendation(
  input: RecommendationInput
): RecommendationResult {
  if (!input.hasCostData) {
    return {
      level: "数据不足",
      title: "当前成本数据不足，暂不输出完整毛利建议。",
      reasons: ["请补充客户成本、重量段成本或简易单票成本。"]
    };
  }

  const { increment } = input;

  if (increment.finalDailyImpact > 0 && increment.newCustomerProfitDaily >= 0) {
    return {
      level: "建议做",
      title: "该方案预计带来增量增利。",
      reasons: [
        `最终净影响为 ${formatMoney(increment.finalDailyImpact)} 元/天。`,
        "新增客户自身利润为正，且叠加后整体收益提升。"
      ]
    };
  }

  if (increment.finalDailyImpact > 0) {
    return {
      level: "谨慎做",
      title: "该方案整体增利，但新增客户自身存在压力。",
      reasons: [
        `最终净影响为 ${formatMoney(increment.finalDailyImpact)} 元/天。`,
        "建议核实客户重量段、退件收益、账期和服务成本。"
      ]
    };
  }

  if (increment.finalDailyImpact < 0) {
    return {
      level: "不建议做",
      title: "该方案预计形成增量减利。",
      reasons: [
        `最终净影响为 ${formatMoney(increment.finalDailyImpact)} 元/天。`,
        "除非能提高报价、降低成本或减少处罚，否则不建议按当前条件接入。"
      ]
    };
  }

  return {
    level: "谨慎做",
    title: "该方案基本持平，需要结合客户质量判断。",
    reasons: ["当前测算未形成明确增利，应继续核实成本和风险。"]
  };
}

function formatMoney(value: number): string {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 2
  });
}
