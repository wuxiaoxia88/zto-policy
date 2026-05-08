export interface PolicyTier {
  id: number;
  name: string;
  minDailyVolume: number;
  maxDailyVolume: number | null;
  baseRatio: number;
  baseSubsidy: number;
  layerSubsidy: number;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  tiers: PolicyTier[];
}

export type IncrementConclusion = "增量增利" | "增量持平" | "增量减利";

export type RecommendationLevel = "建议做" | "谨慎做" | "不建议做" | "数据不足";
