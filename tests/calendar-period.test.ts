import { it, expect } from "vitest";
import { monthPeriod, dateKey } from "@/pages/calendar/model/calendar-period";
it("keeps the complete selected local month across positive and negative offsets", () => {
  process.env.TZ = "Asia/Seoul";
  const range = monthPeriod("2026-09");
  expect(range.from.toISOString()).toBe("2026-08-31T15:00:00.000Z");
  expect(range.to.toISOString()).toBe("2026-09-30T15:00:00.000Z");
  expect(range.days).toBe(30);
  expect(dateKey(new Date("2026-09-01T23:30:00Z"))).toBe("2026-09-02");
});
