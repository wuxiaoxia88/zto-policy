# 更新日志

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
