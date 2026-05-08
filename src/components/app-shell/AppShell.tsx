import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  calculateCustomerContribution,
  calculateIncrementBreakdown,
  calculatePenalty,
  calculateRebate,
  calculateRebateDelta,
  calculateStackedVolumes,
  generateRecommendation
} from "../../core";
import type { CustomerChange, PolicyTier } from "../../core";
import { sunanPolicyTemplate } from "../../data/policy-presets";

interface SiteInputs {
  siteName: string;
  month: string;
  policyEffectiveDailyVolume: number;
  businessDailyVolume: number;
  layerBaseDailyVolume: number;
  businessTargetDailyVolume: number;
  sameMonthLastYearDailyVolume: number;
}

const defaultSiteInputs: SiteInputs = {
  siteName: "无锡某网点",
  month: "2026-06",
  policyEffectiveDailyVolume: 7500,
  businessDailyVolume: 7500,
  layerBaseDailyVolume: 4500,
  businessTargetDailyVolume: 8000,
  sameMonthLastYearDailyVolume: 7600
};

const defaultCustomers: CustomerChange[] = [
  {
    id: "fashion-a",
    name: "服装客户 A",
    enabled: true,
    policyEffectiveDailyVolume: 500,
    businessDailyVolume: 500,
    pricePerTicket: 2.5,
    costPerTicket: 2.18,
    returnRate: 0.5,
    returnIncomePerTicket: 1.2
  },
  {
    id: "price-b",
    name: "降价客户 B",
    enabled: true,
    policyEffectiveDailyVolume: 620,
    businessDailyVolume: 620,
    pricePerTicket: 2.2,
    costPerTicket: 2.16,
    returnRate: 0.08,
    returnIncomePerTicket: 0.8
  },
  {
    id: "case-c",
    name: "案例客户 C",
    enabled: false,
    policyEffectiveDailyVolume: 1000,
    businessDailyVolume: 1000,
    pricePerTicket: 2,
    costPerTicket: 2.206,
    returnRate: 0,
    returnIncomePerTicket: 0
  }
];

export function AppShell() {
  const [siteInputs, setSiteInputs] = useState(defaultSiteInputs);
  const [customers, setCustomers] = useState(defaultCustomers);
  const [importMessage, setImportMessage] = useState("手工输入模式");
  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const model = useMemo(() => {
    const beforeRebate = calculateRebate({
      policy: sunanPolicyTemplate,
      month: siteInputs.month,
      policyEffectiveDailyVolume: siteInputs.policyEffectiveDailyVolume,
      businessDailyVolume: siteInputs.businessDailyVolume,
      layerBaseDailyVolume: siteInputs.layerBaseDailyVolume
    });
    const stacked = calculateStackedVolumes({
      basePolicyEffectiveDailyVolume: siteInputs.policyEffectiveDailyVolume,
      baseBusinessDailyVolume: siteInputs.businessDailyVolume,
      customers
    });
    const afterRebate = calculateRebate({
      policy: sunanPolicyTemplate,
      month: siteInputs.month,
      policyEffectiveDailyVolume: Math.max(stacked.policyEffectiveDailyVolume, 1),
      businessDailyVolume: Math.max(stacked.businessDailyVolume, 1),
      layerBaseDailyVolume: siteInputs.layerBaseDailyVolume
    });
    const beforePenalty = calculatePenalty({
      month: siteInputs.month,
      targetDailyVolume: siteInputs.businessTargetDailyVolume,
      actualDailyVolume: siteInputs.businessDailyVolume,
      yoyDailyVolume: siteInputs.sameMonthLastYearDailyVolume
    });
    const afterPenalty = calculatePenalty({
      month: siteInputs.month,
      targetDailyVolume: siteInputs.businessTargetDailyVolume,
      actualDailyVolume: stacked.businessDailyVolume,
      yoyDailyVolume: siteInputs.sameMonthLastYearDailyVolume
    });
    const customerContributions = customers.map(calculateCustomerContribution);
    const enabledCustomerContributions = customerContributions.filter(
      (item) => item.enabled
    );
    const customerBaseProfitDaily = enabledCustomerContributions.reduce(
      (sum, item) => sum + item.dailyRevenue - item.dailyCost,
      0
    );
    const returnIncomeDaily = enabledCustomerContributions.reduce(
      (sum, item) => sum + item.dailyReturnIncome,
      0
    );
    const otherIncomeDaily = enabledCustomerContributions.reduce(
      (sum, item) => sum + item.dailyOtherIncome,
      0
    );
    const rebateDeltaMonthly = calculateRebateDelta(beforeRebate, afterRebate);
    const rebateDeltaDaily = rebateDeltaMonthly / beforeRebate.days;
    const penaltyReductionDaily =
      beforePenalty.dailyPenalty - afterPenalty.dailyPenalty;
    const increment = calculateIncrementBreakdown({
      month: siteInputs.month,
      stockBenefitDaily: rebateDeltaDaily,
      newCustomerProfitDaily: customerBaseProfitDaily,
      penaltyReductionDaily,
      returnIncomeDaily,
      otherBenefitDaily: otherIncomeDaily
    });
    const recommendation = generateRecommendation({
      increment,
      hasCostData: enabledCustomerContributions.every((item) => {
        const customer = customers.find((candidate) => candidate.id === item.id);
        return customer !== undefined && customer.costPerTicket > 0;
      })
    });
    const nextTier = findNextTier(
      sunanPolicyTemplate.tiers,
      afterRebate.policyEffectiveDailyVolume
    );

    return {
      beforeRebate,
      afterRebate,
      beforePenalty,
      afterPenalty,
      customerContributions,
      enabledCustomerContributions,
      increment,
      nextTier,
      recommendation,
      rebateDeltaDaily,
      stacked
    };
  }, [customers, siteInputs]);

  const updateSiteInput = <K extends keyof SiteInputs>(
    key: K,
    value: SiteInputs[K]
  ) => {
    setSiteInputs((current) => ({
      ...current,
      [key]: value
    }));
  };

  const updateCustomer = (
    id: string,
    patch: Partial<Omit<CustomerChange, "id">>
  ) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id ? { ...customer, ...patch } : customer
      )
    );
  };

  const addCustomer = () => {
    setCustomers((current) => [
      ...current,
      {
        id: `customer-${Date.now()}`,
        name: `新增客户 ${current.length + 1}`,
        enabled: true,
        policyEffectiveDailyVolume: 300,
        businessDailyVolume: 300,
        pricePerTicket: 2.4,
        costPerTicket: 2.15,
        returnRate: 0,
        returnIncomePerTicket: 0
      }
    ]);
  };

  const removeCustomer = (id: string) => {
    setCustomers((current) => current.filter((customer) => customer.id !== id));
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload: unknown = JSON.parse(text);
      if (!isRecord(payload)) {
        throw new Error("导入文件格式不正确。");
      }

      const sitePayload = payload.siteInputs;
      if (isRecord(sitePayload)) {
        setSiteInputs((current) => ({
          ...current,
          ...sanitizeSiteInputs(sitePayload)
        }));
      }

      if (Array.isArray(payload.customers)) {
        setCustomers(payload.customers.map(sanitizeCustomer));
      }

      setImportMessage(`已导入 ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "导入失败";
      setImportMessage(message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const exportWorkspace = async () => {
    if (!captureRef.current) {
      return;
    }

    const dataUrl = await toPng(captureRef.current, {
      cacheBust: true,
      backgroundColor: "#f4f7fb",
      pixelRatio: 2
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `中通面单返利测算-${siteInputs.siteName}-${siteInputs.month}.png`;
    link.click();
  };

  return (
    <div className="app-shell" ref={captureRef}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ZTO</span>
          <span>中通面单返利测算工具</span>
        </div>
        <div className="segmented" aria-label="视角切换">
          <button type="button">管区视角</button>
          <button type="button" className="active">
            网点视角
          </button>
        </div>
        <div className="top-actions">
          <button type="button" className="ghost-button">
            苏南标准 2026
          </button>
          <button type="button" className="ghost-button">
            {siteInputs.month}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => fileInputRef.current?.click()}
          >
            导入参数
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => void exportWorkspace()}
          >
            保存图片
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </div>
      </header>

      <main className="workbench">
        <aside className="panel parameter-panel">
          <PanelTitle title="网点基础" extra={importMessage} />
          <TextField
            label="网点名称"
            value={siteInputs.siteName}
            onChange={(value) => updateSiteInput("siteName", value)}
          />
          <label className="field">
            <span>测算月份</span>
            <input
              type="month"
              value={siteInputs.month}
              onChange={(event) => updateSiteInput("month", event.target.value)}
            />
          </label>
          <NumberField
            label="政策有效票量"
            unit="票/天"
            value={siteInputs.policyEffectiveDailyVolume}
            min={1}
            onChange={(value) =>
              updateSiteInput("policyEffectiveDailyVolume", value)
            }
          />
          <NumberField
            label="业务量考核票量"
            unit="票/天"
            value={siteInputs.businessDailyVolume}
            min={1}
            onChange={(value) => updateSiteInput("businessDailyVolume", value)}
          />
          <NumberField
            label="业务量指标"
            unit="票/天"
            value={siteInputs.businessTargetDailyVolume}
            min={0}
            onChange={(value) =>
              updateSiteInput("businessTargetDailyVolume", value)
            }
          />
          <NumberField
            label="去年同期业务量"
            unit="票/天"
            value={siteInputs.sameMonthLastYearDailyVolume}
            min={0}
            onChange={(value) =>
              updateSiteInput("sameMonthLastYearDailyVolume", value)
            }
          />
          <NumberField
            label="分层基数"
            unit="票/天"
            value={siteInputs.layerBaseDailyVolume}
            min={0}
            onChange={(value) =>
              updateSiteInput("layerBaseDailyVolume", value)
            }
          />

          <PanelTitle title="政策档位" extra="基础模板可替换" />
          <div className="mini-table policy-table">
            <div>档位</div>
            <div>票量区间</div>
            <div>分层补贴</div>
            {sunanPolicyTemplate.tiers.map((tier) => (
              <PolicyTierRow
                active={tier.id === model.afterRebate.tier.id}
                key={tier.id}
                tier={tier}
              />
            ))}
          </div>
        </aside>

        <section className="center-stack">
          <section className="hero-card">
            <div className="hero-copy">
              <div>
                <h1>
                  {model.recommendation.level}：预计
                  {model.increment.conclusion}
                  {formatSignedMoney(model.increment.finalMonthlyImpact ?? 0)}
                  元/月
                </h1>
                <p>{model.recommendation.title}</p>
              </div>
              <span className={`decision-pill ${toneClass(model.recommendation.level)}`}>
                {model.recommendation.level}
              </span>
            </div>
            <div className="metric-grid">
              <MetricCard
                label="月度总返利"
                value={formatMoney(model.afterRebate.monthlyRebate)}
                caption={`较当前 ${formatSignedMoney(
                  model.afterRebate.monthlyRebate -
                    model.beforeRebate.monthlyRebate
                )} 元`}
              />
              <MetricCard
                label="最终净影响"
                value={formatSignedMoney(model.increment.finalMonthlyImpact ?? 0)}
                caption="元/月"
                tone={model.increment.finalDailyImpact >= 0 ? "good" : "bad"}
              />
              <MetricCard
                label="业务量处罚"
                value={formatMoney(model.afterPenalty.monthlyPenalty)}
                caption={`较当前 ${formatSignedMoney(
                  model.beforePenalty.monthlyPenalty -
                    model.afterPenalty.monthlyPenalty
                )} 元`}
                tone={model.afterPenalty.monthlyPenalty > 0 ? "bad" : "good"}
              />
              <MetricCard
                label="方案后单票返点"
                value={formatMoney(model.afterRebate.effectivePerTicketRebate, 3)}
                caption={`当前 ${formatMoney(
                  model.beforeRebate.effectivePerTicketRebate,
                  3
                )} 元/票`}
              />
            </div>
          </section>

          <section className="slider-card">
            <div className="slider-copy">
              <strong>
                方案后日均票量：{formatMoney(model.afterRebate.policyEffectiveDailyVolume)} 票/天
              </strong>
              <span>{nextTierText(model.afterRebate.policyEffectiveDailyVolume, model.nextTier)}</span>
            </div>
            <input
              className="volume-slider"
              type="range"
              min={1000}
              max={30000}
              step={100}
              value={siteInputs.policyEffectiveDailyVolume}
              onChange={(event) =>
                updateSiteInput(
                  "policyEffectiveDailyVolume",
                  Number(event.target.value)
                )
              }
            />
            <div className="slider-ticks">
              <span>1,000</span>
              <span>8,000</span>
              <span>15,000</span>
              <span>22,000</span>
              <span>30,000</span>
            </div>
          </section>

          <section className="panel customer-panel">
            <PanelTitle
              title="客户叠加测算"
              extra={`${model.enabledCustomerContributions.length} 个客户参与测算`}
            />
            <div className="customer-toolbar">
              <button type="button" className="ghost-button" onClick={addCustomer}>
                追加客户
              </button>
              <span>可随时调整件量、报价、成本、退件率，结果会自动刷新。</span>
            </div>
            <div className="customer-table" role="table">
              <div className="customer-row header" role="row">
                <span>启用</span>
                <span>客户</span>
                <span>票量</span>
                <span>报价</span>
                <span>成本</span>
                <span>退件率</span>
                <span>日贡献</span>
                <span>操作</span>
              </div>
              {customers.map((customer) => {
                const contribution = model.customerContributions.find(
                  (item) => item.id === customer.id
                );
                const dailyContribution =
                  contribution?.dailyProfitBeforeRebate ?? 0;

                return (
                  <div className="customer-row" role="row" key={customer.id}>
                    <span>
                      <input
                        type="checkbox"
                        checked={customer.enabled}
                        onChange={(event) =>
                          updateCustomer(customer.id, {
                            enabled: event.target.checked
                          })
                        }
                        aria-label={`启用 ${customer.name}`}
                      />
                    </span>
                    <span>
                      <input
                        value={customer.name}
                        onChange={(event) =>
                          updateCustomer(customer.id, {
                            name: event.target.value
                          })
                        }
                        aria-label="客户名称"
                      />
                    </span>
                    <span>
                      <SmallNumberInput
                        value={customer.policyEffectiveDailyVolume}
                        min={0}
                        onChange={(value) =>
                          updateCustomer(customer.id, {
                            policyEffectiveDailyVolume: value,
                            businessDailyVolume: value
                          })
                        }
                      />
                    </span>
                    <span>
                      <SmallNumberInput
                        value={customer.pricePerTicket}
                        min={0}
                        step={0.01}
                        onChange={(value) =>
                          updateCustomer(customer.id, {
                            pricePerTicket: value
                          })
                        }
                      />
                    </span>
                    <span>
                      <SmallNumberInput
                        value={customer.costPerTicket}
                        min={0}
                        step={0.001}
                        onChange={(value) =>
                          updateCustomer(customer.id, {
                            costPerTicket: value
                          })
                        }
                      />
                    </span>
                    <span>
                      <SmallNumberInput
                        value={customer.returnRate ?? 0}
                        min={0}
                        step={0.01}
                        onChange={(value) =>
                          updateCustomer(customer.id, {
                            returnRate: value
                          })
                        }
                      />
                    </span>
                    <span>
                      <span className={`status ${dailyContribution >= 0 ? "增利" : "减利"}`}>
                        {formatSignedMoney(dailyContribution)}
                      </span>
                    </span>
                    <span>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => removeCustomer(customer.id)}
                      >
                        删除
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <aside className="right-stack">
          <section className="panel chart-card">
            <PanelTitle title="返利趋势曲线" extra="随票量实时变化" />
            <RebateTrendChart
              currentVolume={model.afterRebate.policyEffectiveDailyVolume}
              layerBaseDailyVolume={siteInputs.layerBaseDailyVolume}
              month={siteInputs.month}
            />
          </section>
          <section className="panel chart-card">
            <PanelTitle title="增量影响拆解" extra="元/月" />
            <WaterfallChart
              days={model.beforeRebate.days}
              stockBenefitDaily={model.increment.stockBenefitDaily}
              customerProfitDaily={model.increment.newCustomerProfitDaily}
              returnIncomeDaily={model.increment.returnIncomeDaily}
              otherBenefitDaily={model.increment.otherBenefitDaily}
              penaltyReductionDaily={model.increment.penaltyReductionDaily}
            />
          </section>
          <section className="insight-card">
            <h2>决策建议</h2>
            <p>{model.recommendation.title}</p>
            {model.recommendation.reasons.map((reason) => (
              <div key={reason}>{reason}</div>
            ))}
            <div>
              当前处罚：{penaltyText(model.beforePenalty.reason)}；方案后：
              {penaltyText(model.afterPenalty.reason)}。
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

function PanelTitle({ title, extra }: { title: string; extra?: string }) {
  return (
    <div className="panel-title">
      <strong>{title}</strong>
      {extra ? <span>{extra}</span> : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({
  label,
  value,
  unit,
  min,
  onChange
}: {
  label: string;
  value: number;
  unit?: string;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="number-field">
        <input
          type="number"
          value={value}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {unit ? <em>{unit}</em> : null}
      </span>
    </label>
  );
}

function SmallNumberInput({
  value,
  min,
  step = 1,
  onChange
}: {
  value: number;
  min: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      className="small-input"
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function MetricCard({
  label,
  value,
  caption,
  tone
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "good" | "bad";
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

function PolicyTierRow({
  tier,
  active
}: {
  tier: PolicyTier;
  active: boolean;
}) {
  return (
    <>
      <div className={active ? "active-cell" : undefined}>{tier.name}</div>
      <div className={active ? "active-cell" : undefined}>
        {formatMoney(tier.minDailyVolume, 0)}-
        {tier.maxDailyVolume === null ? "以上" : formatMoney(tier.maxDailyVolume, 0)}
      </div>
      <div className={active ? "active-cell" : undefined}>
        {formatMoney(tier.layerSubsidy, 3)}
      </div>
    </>
  );
}

function RebateTrendChart({
  currentVolume,
  layerBaseDailyVolume,
  month
}: {
  currentVolume: number;
  layerBaseDailyVolume: number;
  month: string;
}) {
  const chartMaxVolume = Math.max(30000, Math.ceil(currentVolume * 1.35));
  const samples = Array.from({ length: 26 }, (_, index) => {
    const volume = Math.max(1, (chartMaxVolume / 25) * index);
    const rebate = calculateRebate({
      policy: sunanPolicyTemplate,
      month,
      policyEffectiveDailyVolume: volume,
      businessDailyVolume: volume,
      layerBaseDailyVolume
    });
    return { volume, value: rebate.monthlyRebate };
  });
  const maxRebate = Math.max(...samples.map((item) => item.value));
  const points = samples.map((item) => ({
    x: 34 + (item.volume / chartMaxVolume) * 326,
    y: 170 - (item.value / maxRebate) * 126
  }));
  const currentX = 34 + (currentVolume / chartMaxVolume) * 326;
  const currentY =
    170 -
    (calculateRebate({
      policy: sunanPolicyTemplate,
      month,
      policyEffectiveDailyVolume: currentVolume,
      businessDailyVolume: currentVolume,
      layerBaseDailyVolume
    }).monthlyRebate /
      maxRebate) *
      126;

  return (
    <svg viewBox="0 0 388 220" role="img" aria-label="返利趋势曲线">
      <line x1="34" y1="170" x2="364" y2="170" className="axis" />
      <line x1="34" y1="34" x2="34" y2="170" className="axis" />
      <path
        d={`${buildLinePath(points)} L 360 170 L 34 170 Z`}
        className="chart-area"
      />
      <path d={buildLinePath(points)} className="smooth-line" />
      <line x1={currentX} y1="34" x2={currentX} y2="170" className="guide-line" />
      <circle cx={currentX} cy={currentY} r="6" className="current-dot" />
      <text x={Math.min(currentX + 8, 296)} y={Math.max(currentY - 10, 22)}>
        当前 {formatMoney(currentVolume, 0)}
      </text>
      <text x="38" y="198">
        0
      </text>
      <text x="154" y="198">
        {formatMoney(chartMaxVolume / 3, 0)}
      </text>
      <text x="260" y="198">
        {formatMoney((chartMaxVolume / 3) * 2, 0)}
      </text>
    </svg>
  );
}

function WaterfallChart({
  days,
  stockBenefitDaily,
  customerProfitDaily,
  returnIncomeDaily,
  otherBenefitDaily,
  penaltyReductionDaily
}: {
  days: number;
  stockBenefitDaily: number;
  customerProfitDaily: number;
  returnIncomeDaily: number;
  otherBenefitDaily: number;
  penaltyReductionDaily: number;
}) {
  const items = [
    { label: "返利", value: stockBenefitDaily * days },
    { label: "客户", value: customerProfitDaily * days },
    { label: "退件", value: returnIncomeDaily * days },
    { label: "其他", value: otherBenefitDaily * days },
    { label: "少罚", value: penaltyReductionDaily * days }
  ];
  const maxAbs = Math.max(1, ...items.map((item) => Math.abs(item.value)));

  return (
    <svg viewBox="0 0 388 220" role="img" aria-label="增量影响拆解瀑布图">
      <line x1="26" y1="112" x2="368" y2="112" className="axis" />
      {items.map((item, index) => {
        const height = Math.max(4, (Math.abs(item.value) / maxAbs) * 72);
        const x = 38 + index * 66;
        const y = item.value >= 0 ? 112 - height : 112;

        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width="36"
              height={height}
              className={item.value >= 0 ? "bar-good" : "bar-bad"}
              rx="4"
            />
            <text x={x - 4} y={item.value >= 0 ? y - 8 : y + height + 16}>
              {formatSignedMoney(item.value)}
            </text>
            <text x={x + 4} y="188">
              {item.label}
            </text>
          </g>
        );
      })}
      <text x="228" y="42" className="chart-total">
        合计 {formatSignedMoney(items.reduce((sum, item) => sum + item.value, 0))}
      </text>
    </svg>
  );
}

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function findNextTier(
  tiers: PolicyTier[],
  currentVolume: number
): PolicyTier | undefined {
  return [...tiers]
    .sort((a, b) => a.minDailyVolume - b.minDailyVolume)
    .find((tier) => tier.minDailyVolume > currentVolume);
}

function nextTierText(currentVolume: number, nextTier: PolicyTier | undefined) {
  if (!nextTier) {
    return "已进入最高档位";
  }

  return `还差 ${formatMoney(nextTier.minDailyVolume - currentVolume, 0)} 票/天进入 ${nextTier.name}`;
}

function penaltyText(reason: string): string {
  if (reason === "none") {
    return "无处罚";
  }

  if (reason === "negative_growth") {
    return "负增长处罚";
  }

  return "业务量缺口处罚";
}

function toneClass(level: string): string {
  if (level === "建议做") {
    return "good";
  }

  if (level === "不建议做" || level === "数据不足") {
    return "bad";
  }

  return "warn";
}

function formatMoney(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits,
    minimumFractionDigits: 0
  });
}

function formatSignedMoney(value: number): string {
  const formatted = formatMoney(Math.abs(value));
  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return "0";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeSiteInputs(payload: Record<string, unknown>): Partial<SiteInputs> {
  return {
    siteName: stringValue(payload.siteName),
    month: stringValue(payload.month),
    policyEffectiveDailyVolume: numberValue(payload.policyEffectiveDailyVolume),
    businessDailyVolume: numberValue(payload.businessDailyVolume),
    layerBaseDailyVolume: numberValue(payload.layerBaseDailyVolume),
    businessTargetDailyVolume: numberValue(payload.businessTargetDailyVolume),
    sameMonthLastYearDailyVolume: numberValue(payload.sameMonthLastYearDailyVolume)
  };
}

function sanitizeCustomer(payload: unknown, index: number): CustomerChange {
  if (!isRecord(payload)) {
    return defaultCustomers[0];
  }

  return {
    id: stringValue(payload.id) ?? `imported-${index}`,
    name: stringValue(payload.name) ?? `导入客户 ${index + 1}`,
    enabled: typeof payload.enabled === "boolean" ? payload.enabled : true,
    policyEffectiveDailyVolume: numberValue(payload.policyEffectiveDailyVolume) ?? 0,
    businessDailyVolume: numberValue(payload.businessDailyVolume),
    pricePerTicket: numberValue(payload.pricePerTicket) ?? 0,
    costPerTicket: numberValue(payload.costPerTicket) ?? 0,
    returnRate: numberValue(payload.returnRate) ?? 0,
    returnIncomePerTicket: numberValue(payload.returnIncomePerTicket) ?? 0,
    otherIncomePerTicket: numberValue(payload.otherIncomePerTicket) ?? 0
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
