# 开发文档

**项目**: 中通面单返利测算工具
**版本基线**: v0.6.0
**日期**: 2026-05-09
**开发原则**: 先验证计算口径，再做交互体验；每个阶段测试通过后再进入下一阶段。

---

## 1. 开发目标

本项目从旧版单文件原型升级为 React + TypeScript + Vite 的工程化前端项目，同时保留静态部署和单文件传播能力。

MVP 目标:

1. 让用户可输入或导入政策、网点、客户、成本和业务量参数。
2. 根据测算月份自动识别天数并计算月度返利、成本、处罚和毛利。
3. 支持多客户叠加测算，而不是只做方案前后对比。
4. 用返利阶梯图、瀑布图、业务量处罚图解释变化原因。
5. 输出中文决策建议，并支持导出数据和保存图片。

---

## 2. 技术栈

| 模块 | 选型 |
|---|---|
| 前端框架 | React + TypeScript + Vite |
| 图表 | ECharts |
| 状态管理 | Zustand 或 React Context |
| 表格导入 | SheetJS/xlsx + CSV parser |
| 图片导出 | html-to-image + Canvas fallback |
| 测试 | Vitest + Playwright |
| 代码规范 | ESLint + Prettier |
| 发布 | 静态目录版 + 单文件版 |

旧版 `index.html` 保留为历史原型参考，新版开发不继续在旧文件上堆功能。

---

## 3. 目录规划

```text
src/
  core/
    rebate.ts
    penalty.ts
    cost.ts
    customer.ts
    increment.ts
    recommendation.ts
    date.ts
  data/
    policy-presets.ts
    cost-presets.ts
    sample-scenarios.ts
  state/
    store.ts
  components/
    app-shell/
    parameters/
    customer-stack/
    charts/
    recommendation/
    export/
  pages/
    Workbench.tsx
  tests/
    core/
    ui/
```

---

## 4. 开发阶段

### Sprint 0: 工程基线

目标:

1. 初始化 React + TypeScript + Vite 工程。
2. 接入 ESLint、Prettier、Vitest。
3. 建立基础目录、示例数据和 CI 脚本。
4. 保证本地能启动、能构建、能跑测试。

完成标准:

```text
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
```

全部通过后进入 Sprint 1。

当前状态: 已完成。工程基线已通过 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm build:single` 和浏览器截图验收。

### Sprint 1: 计算引擎

目标:

1. 实现月份天数、政策档位、基础返利、分层补贴。
2. 实现业务量处罚规则，两种处罚只取其一。
3. 实现客户叠加、增量增利、增量减利。
4. 用苏南标准、案例一、案例二做单元测试。

完成标准:

1. 核心公式有单元测试。
2. 案例一输出 `-38.8 元/天`。
3. 案例二输出 `+105.2 元/天`。
4. 2026-05 自动识别 31 天，2026-06 自动识别 30 天。

当前状态: 已完成。计算引擎已覆盖日期、返利、处罚、客户贡献、增量拆解和决策建议初版。

### Sprint 2: 网点视角 MVP

目标:

1. 完成三栏工作台。
2. 完成参数手工输入。
3. 完成日均票量滑块。
4. 完成客户叠加表。
5. 完成核心结果卡和决策建议。

完成标准:

1. 拖动票量后核心结果实时刷新。
2. 新增、停用、删除客户均正常。
3. 数据缺失时不输出错误建议，只提示缺失项。

当前状态: 已完成 MVP 主干。已支持参数手工输入、JSON 导入入口、日均票量滑块、客户追加/停用/删除、核心结果卡、返利趋势图、增量拆解图、图片保存和决策建议。复制客户、完整导入预览、成本重量段明细将在后续阶段继续完善。

### Sprint 3: 可视化与导出

目标:

1. 完成返利阶梯图。
2. 完成增量增利/减利瀑布图。
3. 完成业务量处罚风险图。
4. 完成数据导出和图片导出。

完成标准:

1. 阶梯图保留政策断点。
2. 瀑布图能解释最终增利/减利来源。
3. 图片导出中文不乱码、不裁切。

当前状态: 已完成 MVP 主干。已接入 ECharts 返利趋势图、增量拆解图、业务量处罚风险图，并新增 XLSX 数据导出。图片导出已保留，后续继续补隐私开关、CSV/JSON 导出和更细的截图回归。

### Sprint 4: 管区视角

目标:

1. 完成政策宣讲视角。
2. 完成典型案例展示。
3. 完成政策讲解图导出。

完成标准:

1. 不展示客户敏感字段和网点内部毛利。
2. 讲解图适合会议投屏和微信群传播。

当前状态: 已完成 MVP 主干。已支持顶部双视角切换、管区政策宣讲页、公开典型案例、宣讲话术、分享版摘要和管区公开数据导出。会议横图、手机长图模板和批量案例库将在后续阶段完善。

### Sprint 5: 导入模板与稳定性

目标:

1. 完成政策模板、客户列表、成本模板、业务量指标导入。
2. 完成导入预览和字段校验。
3. 完成异常提示和本地保存。

完成标准:

1. 缺字段、格式错误、覆盖冲突都有中文提示。
2. 导入后可替换、追加或另存为模板。

---

## 5. 阶段门禁

每个 Sprint 结束必须完成:

1. 更新 `CHANGELOG.md`。
2. 更新相关开发文档或使用说明。
3. 运行自动化测试。
4. 进行至少一次浏览器人工验收。
5. 生成或更新必要截图。
6. 确认没有阻塞问题后再进入下一 Sprint。

不允许带着核心计算错误进入下一阶段。

---

## 6. 版本控制规范

版本号采用语义化版本:

```text
MAJOR.MINOR.PATCH
```

当前规划:

| 版本 | 内容 |
|---|---|
| v0.1.0 | 文档、PRD、UI 规范、开发基线 |
| v0.2.0 | 工程化项目骨架 |
| v0.3.0 | 计算引擎 |
| v0.4.0 | 网点视角 MVP |
| v0.5.0 | 图表与导出 |
| v0.6.0 | 管区视角 |
| v1.0.0 | 可公开使用的 MVP |

提交信息建议:

```text
docs: update UI design spec
feat: add rebate calculation engine
test: add increment scenario tests
fix: correct penalty calculation
chore: configure build pipeline
```

---

## 7. 分支策略

| 分支 | 用途 |
|---|---|
| `main` | 稳定可发布版本 |
| `develop` | 日常开发集成 |
| `feature/*` | 具体功能 |
| `fix/*` | 缺陷修复 |

MVP 早期可以直接在 `main` 开发，但每个阶段必须有清晰提交记录和标签。

---

## 8. 本地运行

工程化版本完成后使用:

```bash
pnpm install
pnpm dev
```

构建:

```bash
pnpm build
```

测试:

```bash
pnpm lint
pnpm test
pnpm build
```

### 8.1 包管理器说明

项目使用 `pnpm@10.23.0`。本机曾遇到 npm 全局缓存目录存在 root-owned 文件的问题，因此开发基线统一使用 pnpm 锁文件 `pnpm-lock.yaml`，避免依赖安装受到系统级 npm cache 影响。

---

## 9. 开源说明

本项目为非官方辅助测算工具，不代表中通官方政策解释。所有政策、返利、成本和罚款结果应以管区最新文件和实际结算为准。
