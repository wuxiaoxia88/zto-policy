const metrics = [
  { label: "月度总返利", value: "204,663", caption: "较当前 +42,810 元" },
  { label: "最终净影响", value: "+18,520", caption: "元/月", tone: "good" },
  { label: "业务量处罚", value: "0", caption: "少罚 5,250 元", tone: "bad" },
  { label: "保本报价", value: "2.18", caption: "元/票" }
];

const customers = [
  {
    name: "服装客户 A",
    type: "新增",
    volume: "500/天",
    price: "2.50",
    cost: "2.18",
    contribution: "+14,880",
    conclusion: "增利"
  },
  {
    name: "大客户 B",
    type: "降价增量",
    volume: "620/天",
    price: "2.20",
    cost: "2.16",
    contribution: "+3,640",
    conclusion: "谨慎"
  },
  {
    name: "案例客户 C",
    type: "新增",
    volume: "1,000/天",
    price: "2.00",
    cost: "2.206",
    contribution: "-6,180",
    conclusion: "减利"
  }
];

export function AppShell() {
  return (
    <div className="app-shell">
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
            2026 年 6 月
          </button>
          <button type="button" className="ghost-button">
            导入参数
          </button>
          <button type="button" className="primary-button">
            保存图片
          </button>
        </div>
      </header>

      <main className="workbench">
        <aside className="panel parameter-panel">
          <PanelTitle title="网点基础" extra="数据完整度 9/11" />
          <Field label="网点名称" value="无锡某网点" />
          <Field label="政策有效票量" value="7,500" unit="票/天" />
          <Field label="业务量指标" value="8,000" unit="票/天" />
          <Field label="分层基数" value="4,500" unit="票/天" />

          <PanelTitle title="政策档位" extra="可编辑" />
          <div className="mini-table">
            <div>档位</div>
            <div>票量区间</div>
            <div>分层补贴</div>
            <div>4 档</div>
            <div>5,001-8,000</div>
            <div>0.28</div>
            <div>5 档</div>
            <div>8,001-10,000</div>
            <div>0.34</div>
            <div>6 档</div>
            <div>10,001-15,000</div>
            <div>0.42</div>
          </div>

          <PanelTitle title="成本参数" extra="手工 / 导入" />
          <Field label="简易单票发件成本" value="2.08" unit="元/票" />
          <Field label="退件平均收益" value="1.20" unit="元/件" />
        </aside>

        <section className="center-stack">
          <section className="hero-card">
            <div className="hero-copy">
              <div>
                <h1>叠加两个客户后，预计月度净影响为增利</h1>
                <p>
                  当前方案同时提升返利档位，并减少业务量处罚。建议重点核实客户 B
                  的重量段成本。
                </p>
              </div>
              <span className="decision-pill">建议做</span>
            </div>
            <div className="metric-grid">
              {metrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong className={metric.tone}>{metric.value}</strong>
                  <small>{metric.caption}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="slider-card">
            <div className="slider-copy">
              <strong>日均票量模拟: 8,620 票/天</strong>
              <span>还差 1,381 票/天进入下一档</span>
            </div>
            <div className="slider-track" aria-hidden="true">
              <span />
            </div>
            <div className="slider-ticks">
              <span>5,000</span>
              <span>8,000</span>
              <span>10,000</span>
              <span>15,000</span>
              <span>20,000</span>
            </div>
          </section>

          <section className="panel customer-panel">
            <PanelTitle title="客户叠加测算" extra="追加客户" />
            <div className="customer-table" role="table">
              <div className="customer-row header" role="row">
                <span>客户</span>
                <span>类型</span>
                <span>票量</span>
                <span>报价</span>
                <span>成本</span>
                <span>边际贡献</span>
                <span>结论</span>
              </div>
              {customers.map((customer) => (
                <div className="customer-row" role="row" key={customer.name}>
                  <span>{customer.name}</span>
                  <span>{customer.type}</span>
                  <span>{customer.volume}</span>
                  <span>{customer.price}</span>
                  <span>{customer.cost}</span>
                  <span>{customer.contribution}</span>
                  <span>
                    <span className={`status ${customer.conclusion}`}>
                      {customer.conclusion}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="right-stack">
          <section className="panel chart-card">
            <PanelTitle title="返利阶梯曲线" extra="月度返利" />
            <StepChart />
          </section>
          <section className="panel chart-card">
            <PanelTitle title="增量增利 / 减利瀑布图" extra="元/月" />
            <WaterfallChart />
          </section>
          <section className="insight-card">
            <h2>决策建议</h2>
            <p>
              该方案进入更高返利档位，并补足业务量缺口。客户 C 自身亏损，但当前组合仍保持正向净影响。
            </p>
            <div>存量收益提升: +12,870 元/月</div>
            <div>业务量处罚减少: +5,250 元/月</div>
            <div>客户 C 需重新谈价或限制重量段</div>
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

function Field({
  label,
  value,
  unit
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="input-like">
        <strong>{value}</strong>
        {unit ? <em>{unit}</em> : null}
      </span>
    </label>
  );
}

function StepChart() {
  return (
    <svg viewBox="0 0 388 210" role="img" aria-label="返利阶梯曲线示意图">
      <line x1="36" y1="172" x2="364" y2="172" className="axis" />
      <line x1="36" y1="30" x2="36" y2="172" className="axis" />
      <rect x="138" y="30" width="78" height="142" className="band-blue" />
      <path
        d="M36 150 H92 V132 H150 V98 H218 V76 H286 V54 H364"
        className="step-line"
      />
      <line x1="216" y1="30" x2="216" y2="172" className="guide-line" />
      <circle cx="192" cy="98" r="7" className="current-dot" />
      <text x="188" y="22">
        当前 8,620
      </text>
      <text x="40" y="194">
        5k
      </text>
      <text x="142" y="194">
        8k
      </text>
      <text x="218" y="194">
        10k
      </text>
      <text x="330" y="194">
        15k
      </text>
    </svg>
  );
}

function WaterfallChart() {
  return (
    <svg viewBox="0 0 388 210" role="img" aria-label="增量瀑布图示意图">
      <line x1="26" y1="160" x2="368" y2="160" className="axis" />
      <rect x="36" y="110" width="38" height="50" className="bar-base" />
      <rect x="94" y="82" width="38" height="78" className="bar-good" />
      <rect x="152" y="104" width="38" height="56" className="bar-good" />
      <rect x="210" y="132" width="38" height="28" className="bar-bad" />
      <rect x="268" y="90" width="38" height="70" className="bar-good" />
      <rect x="326" y="62" width="38" height="98" className="bar-total" />
      <text x="324" y="50" className="chart-total">
        +18,520
      </text>
      <text x="34" y="180">
        当前
      </text>
      <text x="84" y="180">
        存量收益
      </text>
      <text x="144" y="180">
        分层补贴
      </text>
      <text x="205" y="180">
        客户亏损
      </text>
      <text x="266" y="180">
        少罚款
      </text>
      <text x="326" y="180">
        最终
      </text>
    </svg>
  );
}
