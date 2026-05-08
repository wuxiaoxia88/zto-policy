import { describe, expect, it } from "vitest";
import { daysInMonth, resolveMonthDays } from "./date";

describe("date core", () => {
  it("resolves natural month days", () => {
    expect(daysInMonth("2026-05")).toBe(31);
    expect(daysInMonth("2026-06")).toBe(30);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29);
  });

  it("supports manual settlement-day override", () => {
    expect(resolveMonthDays("2026-06", 26)).toBe(26);
  });

  it("rejects invalid month text", () => {
    expect(() => daysInMonth("2026/06")).toThrow("YYYY-MM");
    expect(() => daysInMonth("2026-13")).toThrow("超出范围");
  });
});
