import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { api } from "../api";
import { invalidateCache } from "../cache";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("api", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    invalidateCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends GET requests with the correct path, headers, and credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "1" } }),
    });

    const result = await api.get<{ id: string }>("/applications");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/applications",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        credentials: "include",
      })
    );
    expect(result).toEqual({ id: "1" });
  });

  it("sends credentials: include for cookie-based auth", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await api.get("/applications");

    // Token is sent via httpOnly cookie, not Authorization header
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/applications",
      expect.objectContaining({
        credentials: "include",
      })
    );

    // No explicit Authorization header should be set
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers).not.toHaveProperty("Authorization");
  });

  it("notifies unauthorized listeners on 401", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });

    await expect(api.get("/protected")).rejects.toThrow("Unauthorized");
  });

  it("throws an error for non-ok responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Not found" }),
    });

    await expect(api.get("/applications/999")).rejects.toThrow("Not found");
  });

  it("throws a default error message when no server message is provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(api.get("/test")).rejects.toThrow("Something went wrong");
  });

  it("sends POST requests with JSON body and credentials: include", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "new-1" } }),
    });

    const body = { companyName: "Test Corp" };
    const result = await api.post<{ id: string }>("/applications", body);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/applications",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include",
      })
    );
    expect(result).toEqual({ id: "new-1" });
  });

  it("sends PATCH requests with JSON body and credentials: include", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "1", status: "Interview" } }),
    });

    const result = await api.patch<{ id: string; status: string }>("/applications/1", {
      status: "Interview",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/applications/1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "Interview" }),
        credentials: "include",
      })
    );
    expect(result.status).toBe("Interview");
  });

  it("sends DELETE requests with credentials: include", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { message: "Deleted" } }),
    });

    await api.delete("/applications/1");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/applications/1",
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      })
    );
  });

  it("retries on network errors (TypeError) with exponential backoff", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockRejectedValueOnce(new TypeError("Network failure"))
      .mockRejectedValueOnce(new TypeError("Network failure"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: "finally works" }),
      });

    const promise = api.get<string>("/retry-test");

    // Advance past first retry delay (500ms)
    await vi.advanceTimersByTimeAsync(500);
    // Advance past second retry delay (1000ms)
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toBe("finally works");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry on HTTP 4xx errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "Bad request" }),
    });

    await expect(api.get("/bad-request")).rejects.toThrow("Bad request");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry on HTTP 5xx errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Server error" }),
    });

    await expect(api.get("/server-error")).rejects.toThrow("Server error");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting all retries on persistent network errors", async () => {
    vi.useFakeTimers();
    mockFetch.mockRejectedValue(new TypeError("Persistent network failure"));

    // Suppress unhandled rejection logs for expected failure
    const onRejected = vi.fn();
    api.get("/persistent-fail").catch(onRejected);

    // Advance past 500ms + 1000ms delays
    await vi.advanceTimersByTimeAsync(500);
    await vi.advanceTimersByTimeAsync(1000);

    await vi.waitFor(() => {
      expect(onRejected).toHaveBeenCalled();
    });
    expect(onRejected).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Persistent network failure" })
    );
    expect(mockFetch).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});
