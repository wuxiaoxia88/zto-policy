import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the Chinese workbench baseline", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("中通面单返利测算工具");
    expect(html).toContain("管区视角");
    expect(html).toContain("网点视角");
    expect(html).toContain("月度总返利");
    expect(html).toContain("客户叠加测算");
    expect(html).toContain("导出数据");
    expect(html).toContain("业务量处罚风险");
    expect(html).toContain("决策建议");
  });
});
