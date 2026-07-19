import { describe, it, expect } from "vitest";
import { formatDate } from "../format";

describe("formatDate", () => {
  it("formats a full ISO date string to 'Mon DD, YYYY'", () => {
    const result = formatDate("2026-07-19T10:30:00.000Z");
    expect(result).toBe("Jul 19, 2026");
  });

  it("formats a date-only string", () => {
    const result = formatDate("2024-01-05");
    expect(result).toBe("Jan 5, 2024");
  });

  it("formats the first day of the year", () => {
    const result = formatDate("2026-01-01");
    expect(result).toBe("Jan 1, 2026");
  });

  it("formats the last day of the year", () => {
    const result = formatDate("2026-12-31");
    expect(result).toBe("Dec 31, 2026");
  });

  it("handles a leap day", () => {
    const result = formatDate("2024-02-29");
    expect(result).toBe("Feb 29, 2024");
  });

  it("handles a date in the past", () => {
    const result = formatDate("2020-03-15");
    expect(result).toBe("Mar 15, 2020");
  });

  it("handles an empty string gracefully", () => {
    const result = formatDate("");
    // Invalid date returns "Invalid Date" from toLocaleDateString
    expect(result).toBe("Invalid Date");
  });

  it("handles an invalid date string gracefully", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("Invalid Date");
  });

  it("handles a date string with time component at midnight UTC", () => {
    // Use midnight UTC to avoid timezone boundary issues
    const result = formatDate("2026-07-19T00:00:00.000Z");
    expect(result).toBe("Jul 19, 2026");
  });
});
