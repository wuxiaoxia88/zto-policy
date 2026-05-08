# 更新日志

## v0.3.0 - 2026-05-08

### Added

- 新增 `src/core/date.ts`，支持自然月天数和手动覆盖天数。
- 新增 `src/core/rebate.ts`，支持政策档位匹配、基础返利、分层补贴、单票返利和月度返利。
- 新增 `src/core/penalty.ts`，支持业务量未达标处罚和同比负增长处罚二选一。
- 新增 `src/core/customer.ts`，支持客户基础贡献和多客户票量叠加。
- 新增 `src/core/increment.ts`，支持增量增利/增量减利拆解。
- 新增 `src/core/recommendation.ts`，输出建议做、谨慎做、不建议做、数据不足。
- 新增苏南政策模板 `src/data/policy-presets.ts`。
- 新增计算引擎说明文档 `docs/CALCULATION.md`。

### Verified

- `pnpm test` 通过，7 个测试文件、20 个测试用例。
- 覆盖 2026-05/2026-06 月份天数。
- 覆盖苏南模板 4 个返利验收用例。
- 覆盖 8000 指标、7500 实际业务量处罚案例。
- 覆盖案例二 `94.8 + 10.4 = 105.2`，结论为增量增利。
- 覆盖案例一 `167.2 - 206 = -38.8`，结论为增量减利。
- `pnpm lint`、`pnpm build`、`pnpm build:single` 均通过。

### Notes

- 默认测试环境改为轻量 `node`，避免外置卷上 jsdom worker 启动超时。
- React 页面基线测试改为服务端静态渲染断言。

## v0.2.0 - 2026-05-08

### Added

- 初始化 React + TypeScript + Vite 工程。
- 配置 pnpm、TypeScript、ESLint、Prettier、Vitest 和 Vite 单文件构建。
- 新增基础三栏工作台页面，包含网点参数、核心结果卡、客户叠加表、返利阶梯图、瀑布图和决策建议。
- 新增首个 UI 单元测试。
- 将旧版单文件原型移动到 `legacy/index.html`。

### Verified

- `pnpm lint` 通过。
- `pnpm test` 通过。
- `pnpm build` 通过。
- `pnpm build:single` 通过。
- Chrome headless 截图验收通过，核心金额和客户表格无明显裁切。

### Notes

- 本机 npm 全局缓存存在权限问题，项目基线改用 `pnpm@10.23.0` 和 `pnpm-lock.yaml`。
- 当前页面仍是 Sprint 0 工程骨架和静态 UI，业务计算引擎将在 v0.3.0 实现。

## v0.1.0 - 2026-05-08

### Added

- 建立 PRD v2.0。
- 建立技术框架、UI 方向与开发规划。
- 建立 UI 设计规范 v3.0。
- 生成 UI 预览图。
- 新增开发文档、测试规范、使用说明、路线图。
- 新增开源贡献说明和许可证。

### Notes

- 当前 `index.html` 是旧版历史原型，后续开发将使用 React + TypeScript + Vite 重构。
- 项目结果仅作为辅助测算，最终以管区政策和实际结算为准。
