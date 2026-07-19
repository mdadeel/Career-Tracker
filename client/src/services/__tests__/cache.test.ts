import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getCached, setCache, invalidateCache } from "../cache";

describe("cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    invalidateCache(); // clear any entries from previous tests
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for a missing key", () => {
    expect(getCached("missing-key")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    setCache("test-key", { foo: "bar" });
    expect(getCached("test-key")).toEqual({ foo: "bar" });
  });

  it("returns null for an expired entry", () => {
    setCache("test-key", "some data");
    // Advance time past the 30s TTL
    vi.advanceTimersByTime(31_000);
    expect(getCached("test-key")).toBeNull();
  });

  it("returns data within the TTL window", () => {
    setCache("test-key", "fresh data");
    vi.advanceTimersByTime(15_000);
    expect(getCached("test-key")).toBe("fresh data");
  });

  it("invalidates all entries when no pattern is given", () => {
    setCache("key-a", "A");
    setCache("key-b", "B");
    invalidateCache();
    expect(getCached("key-a")).toBeNull();
    expect(getCached("key-b")).toBeNull();
  });

  it("invalidates only entries matching the given prefix pattern", () => {
    setCache("/api/applications?page=1", "page1");
    setCache("/api/applications?page=2", "page2");
    setCache("/api/dashboard/stats", "stats");

    invalidateCache("/api/applications");

    expect(getCached("/api/applications?page=1")).toBeNull();
    expect(getCached("/api/applications?page=2")).toBeNull();
    expect(getCached("/api/dashboard/stats")).toBe("stats");
  });

  it("stores different data types correctly", () => {
    const obj = { nested: { value: 42 } };
    setCache("obj", obj);
    expect(getCached("obj")).toEqual(obj);

    setCache("num", 123);
    expect(getCached("num")).toBe(123);

    setCache("arr", [1, 2, 3]);
    expect(getCached("arr")).toEqual([1, 2, 3]);
  });
});
