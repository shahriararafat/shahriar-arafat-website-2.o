import { describe, expect, it } from "vitest";
import { formatDhakaClock } from "./dhaka-time";

describe("formatDhakaClock", () => {
  it("formats Asia/Dhaka, which is six hours ahead of UTC", () => {
    const morning = formatDhakaClock(new Date("2026-01-15T00:00:00.000Z"));
    expect(morning.time).toBe("06:00:00");
    expect(morning.dateLabel).toMatch(/15/);
    expect(morning.dateLabel).toMatch(/Jan/);
    expect(morning.iso).toBe("2026-01-15T00:00:00.000Z");

    const afterMidnight = formatDhakaClock(new Date("2026-01-15T19:30:45.000Z"));
    expect(afterMidnight.time).toBe("01:30:45");
    expect(afterMidnight.dateLabel).toMatch(/16/);
  });
});
