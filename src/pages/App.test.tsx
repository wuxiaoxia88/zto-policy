import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the Chinese workbench baseline", () => {
    render(<App />);

    expect(screen.getByText("中通面单返利测算工具")).toBeInTheDocument();
    expect(screen.getByText("网点视角")).toBeInTheDocument();
    expect(screen.getByText("月度总返利")).toBeInTheDocument();
    expect(screen.getByText("客户叠加测算")).toBeInTheDocument();
    expect(screen.getByText("决策建议")).toBeInTheDocument();
  });
});
