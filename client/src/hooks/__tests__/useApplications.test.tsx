import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useApplications } from "../useApplications";
import { invalidateCache } from "../../services/cache";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockApplications = [
  {
    id: "1",
    companyName: "Stripe",
    jobTitle: "Engineer",
    source: "LinkedIn",
    status: "Applied",
    applicationDate: "2026-07-01T00:00:00.000Z",
    notes: null,
    jobUrl: null,
    jobDescription: null,
    resumeLink: null,
    interviewDate: null,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: "USD",
    location: null,
    employmentType: null,
    remoteStatus: null,
    companyLogo: null,
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "2",
    companyName: "Vercel",
    jobTitle: "Frontend Engineer",
    source: "Wellfound",
    status: "Interview",
    applicationDate: "2026-06-20T00:00:00.000Z",
    notes: null,
    jobUrl: null,
    jobDescription: null,
    resumeLink: null,
    interviewDate: null,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: "USD",
    location: null,
    employmentType: null,
    remoteStatus: null,
    companyLogo: null,
    createdAt: "2026-06-20T12:00:00.000Z",
    updatedAt: "2026-06-20T12:00:00.000Z",
  },
];

function mockGetApplications(overrides = {}) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          applications: mockApplications,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          ...overrides,
        },
      }),
  });
}

describe("useApplications", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    invalidateCache(); // clear module-level cache from other tests
  });

  it("fetches applications on mount", async () => {
    mockGetApplications();

    const { result } = renderHook(() => useApplications());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // After fetch completes
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.applications).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it("sets error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.applications).toEqual([]);
  });

  it("refetches when search changes", async () => {
    mockGetApplications();
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change search
    mockGetApplications();
    result.current.setSearch("Stripe");

    await waitFor(() => {
      // Should trigger a refetch
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Fetch call for search should include the search param
    const secondCallUrl = mockFetch.mock.calls[1][0];
    expect(secondCallUrl).toContain("search");
  });

  it("updates status filter and resets to page 1", async () => {
    mockGetApplications();
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetApplications();
    result.current.setStatusFilter("Interview");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(result.current.statusFilter).toBe("Interview");
    expect(result.current.page).toBe(1);
  });

  it("creates an application and refreshes the list", async () => {
    mockGetApplications();
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock the create POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "3", companyName: "New Co", jobTitle: "New Role" },
        }),
    });

    // Mock the refetch GET after create
    mockGetApplications({ total: 3 });

    await result.current.createApplication({
      companyName: "New Co",
      jobTitle: "New Role",
      jobUrl: "",
      source: "LinkedIn",
      applicationDate: "2026-07-19",
      status: "Saved",
      notes: "",
      jobDescription: "",
      resumeLink: "",
      interviewDate: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "USD",
      location: "",
      employmentType: "",
      remoteStatus: "",
      companyLogo: "",
    });

    // Should have called POST then a new GET
    expect(mockFetch.mock.calls[1][1]?.method).toBe("POST");
  });

  it("deletes an application", async () => {
    mockGetApplications();
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock DELETE + refetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { message: "Deleted" } }),
    });

    mockGetApplications({ total: 1, applications: [mockApplications[0]] });

    await result.current.deleteApplication("2");

    // DELETE then refetch
    expect(mockFetch.mock.calls[1][1]?.method).toBe("DELETE");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("navigates pages with goToPage", async () => {
    mockGetApplications({ total: 20, totalPages: 2 });
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.page).toBe(1);

    mockGetApplications({ total: 20, totalPages: 2, page: 2 });
    result.current.goToPage(2);

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });
  });

  it("does not go beyond available pages", async () => {
    mockGetApplications({ total: 5, totalPages: 1 });
    const { result } = renderHook(() => useApplications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.goToPage(5);
    expect(result.current.page).toBe(1);
  });
});
