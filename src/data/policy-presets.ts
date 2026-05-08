import type { PolicyTemplate } from "../core/types";

export const sunanPolicyTemplate: PolicyTemplate = {
  id: "sunan-2026",
  name: "苏南标准 2026",
  description: "根据苏南 9 档基础参数整理的内置模板。",
  tiers: [
    {
      id: 1,
      name: "第 1 档",
      minDailyVolume: 0,
      maxDailyVolume: 500,
      baseRatio: 0.1,
      baseSubsidy: 1.5,
      layerSubsidy: 1.1
    },
    {
      id: 2,
      name: "第 2 档",
      minDailyVolume: 501,
      maxDailyVolume: 1000,
      baseRatio: 0.75,
      baseSubsidy: 1.5,
      layerSubsidy: 0.8
    },
    {
      id: 3,
      name: "第 3 档",
      minDailyVolume: 1001,
      maxDailyVolume: 2000,
      baseRatio: 0.7,
      baseSubsidy: 1.5,
      layerSubsidy: 0.75
    },
    {
      id: 4,
      name: "第 4 档",
      minDailyVolume: 2001,
      maxDailyVolume: 5000,
      baseRatio: 0.45,
      baseSubsidy: 1.5,
      layerSubsidy: 0.4
    },
    {
      id: 5,
      name: "第 5 档",
      minDailyVolume: 5001,
      maxDailyVolume: 10000,
      baseRatio: 0.35,
      baseSubsidy: 1.5,
      layerSubsidy: 0.28
    },
    {
      id: 6,
      name: "第 6 档",
      minDailyVolume: 10001,
      maxDailyVolume: 30000,
      baseRatio: 0.3,
      baseSubsidy: 1.5,
      layerSubsidy: 0.26
    },
    {
      id: 7,
      name: "第 7 档",
      minDailyVolume: 30001,
      maxDailyVolume: 50000,
      baseRatio: 0.2,
      baseSubsidy: 1.5,
      layerSubsidy: 0.12
    },
    {
      id: 8,
      name: "第 8 档",
      minDailyVolume: 50001,
      maxDailyVolume: 100000,
      baseRatio: 0.15,
      baseSubsidy: 1.5,
      layerSubsidy: 0.04
    },
    {
      id: 9,
      name: "第 9 档",
      minDailyVolume: 100001,
      maxDailyVolume: null,
      baseRatio: 0.12,
      baseSubsidy: 1.5,
      layerSubsidy: 0
    }
  ]
};
