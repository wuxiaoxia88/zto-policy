const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

export function daysInMonth(month: string): number {
  const parsed = MONTH_PATTERN.exec(month);

  if (!parsed) {
    throw new Error(`测算月份格式错误: ${month}，应为 YYYY-MM。`);
  }

  const year = Number(parsed[1]);
  const monthIndex = Number(parsed[2]);

  if (monthIndex < 1 || monthIndex > 12) {
    throw new Error(`测算月份超出范围: ${month}。`);
  }

  return new Date(year, monthIndex, 0).getDate();
}

export function resolveMonthDays(month: string, overrideDays?: number): number {
  if (overrideDays === undefined) {
    return daysInMonth(month);
  }

  if (!Number.isFinite(overrideDays) || overrideDays <= 0) {
    throw new Error("手动覆盖天数必须大于 0。");
  }

  return overrideDays;
}
