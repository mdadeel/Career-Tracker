import { useState, useEffect, useCallback, useRef } from "react";
import { applicationService } from "../services/applicationService";
import { getCached } from "../services/cache";
import type { Application, ApplicationFormData } from "../types";

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_LIMIT = 10;

function cacheKey(
  search: string,
  statusFilter: string,
  sourceFilter: string,
  sortBy: string,
  page: number
): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (statusFilter !== "All") params.set("status", statusFilter);
  if (sourceFilter !== "All") params.set("source", sourceFilter);
  if (sortBy) params.set("sortBy", sortBy);
  if (page) params.set("page", String(page));
  params.set("limit", String(PAGE_LIMIT));
  return `/applications?${params.toString()}`;
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface UseApplicationsOptions {
  initialStatus?: string;
}

export function useApplications(options?: UseApplicationsOptions) {
  const initialStatus = options?.initialStatus || "All";
  const initialKey = cacheKey("", initialStatus, "All", "newest", 1);
  const initialCached = getCached<{
    applications: Application[];
    total: number;
    totalPages: number;
  }>(initialKey);

  const [applications, setApplications] = useState<Application[]>(
    initialCached?.applications ?? []
  );
  const [isLoading, setIsLoading] = useState(!initialCached);
  const [error, setError] = useState<string | null>(null);
  const hasCached = useRef(!!initialCached);
  const [total, setTotal] = useState(initialCached?.total ?? 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialCached?.totalPages ?? 1);

  // ── Search with debounce ──
  // `search` updates instantly for the controlled input rendering.
  // `searchDebounced` lags by SEARCH_DEBOUNCE_MS and drives the API call.
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebouncedForApi] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const setSearchDebounced = useCallback((value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchDebouncedForApi(value);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Track committed filter values so we can detect changes without race conditions
  const filtersRef = useRef({
    search: "",
    statusFilter: "All",
    sourceFilter: "All",
    sortBy: "newest",
  });

  const fetchApplications = useCallback(async () => {
    const currentFilters = { search: searchDebounced, statusFilter, sourceFilter, sortBy };

    if (!hasCached.current) {
      setIsLoading(true);
    }
    hasCached.current = true;
    setError(null);
    try {
      // Auto-reset to page 1 when filters change
      let currentPage = page;
      const prevFilters = filtersRef.current;
      if (
        prevFilters.search !== currentFilters.search ||
        prevFilters.statusFilter !== currentFilters.statusFilter ||
        prevFilters.sourceFilter !== currentFilters.sourceFilter ||
        prevFilters.sortBy !== currentFilters.sortBy
      ) {
        currentPage = 1;
        if (page !== 1) setPage(1);
        filtersRef.current = currentFilters;
      }

      const result = await applicationService.getAll({
        search: searchDebounced || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        source: sourceFilter !== "All" ? sourceFilter : undefined,
        sortBy,
        page: currentPage,
        limit: PAGE_LIMIT,
      });
      setApplications(result.applications);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  }, [searchDebounced, statusFilter, sourceFilter, sortBy, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Optimistic mutations ──

  const createApplication = async (data: ApplicationFormData) => {
    const tempId = generateTempId();
    const optimisticApp: Application = {
      id: tempId,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl || null,
      source: data.source,
      applicationDate: data.applicationDate,
      status: data.status,
      notes: data.notes || null,
      jobDescription: data.jobDescription || null,
      resumeLink: data.resumeLink || null,
      interviewDate: data.interviewDate || null,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
      salaryCurrency: data.salaryCurrency || "USD",
      location: data.location || null,
      employmentType: data.employmentType || null,
      remoteStatus: data.remoteStatus || null,
      companyLogo: data.companyLogo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const prevApplications = applications;
    const prevTotal = total;

    setApplications((prev) => [optimisticApp, ...prev]);
    setTotal((t) => t + 1);
    setPage(1);

    try {
      const created = await applicationService.create(data);
      setApplications((prev) =>
        prev.map((a) => (a.id === tempId ? created : a))
      );
    } catch (err) {
      setApplications(prevApplications);
      setTotal(prevTotal);
      throw err;
    }
  };

  const updateApplication = async (id: string, data: Partial<ApplicationFormData>) => {
    const prevApplications = applications;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...data,
              applicationDate: data.applicationDate ?? a.applicationDate,
              interviewDate: (data.interviewDate ?? a.interviewDate) || null,
              jobUrl: (data.jobUrl ?? a.jobUrl) || null,
              notes: (data.notes ?? a.notes) || null,
              jobDescription: (data.jobDescription ?? a.jobDescription) || null,
              resumeLink: (data.resumeLink ?? a.resumeLink) || null,
              salaryMin: data.salaryMin !== undefined ? (data.salaryMin ? Number(data.salaryMin) : null) : a.salaryMin,
              salaryMax: data.salaryMax !== undefined ? (data.salaryMax ? Number(data.salaryMax) : null) : a.salaryMax,
              salaryCurrency: data.salaryCurrency ?? a.salaryCurrency,
              location: (data.location ?? a.location) || null,
              employmentType: (data.employmentType ?? a.employmentType) || null,
              remoteStatus: (data.remoteStatus ?? a.remoteStatus) || null,
              companyLogo: (data.companyLogo ?? a.companyLogo) || null,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    try {
      await applicationService.update(id, data);
    } catch (err) {
      setApplications(prevApplications);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    const prevApplications = applications;
    const prevTotal = total;

    setApplications((prev) => prev.filter((a) => a.id !== id));
    setTotal((t) => Math.max(0, t - 1));

    let needsPageRollback = false;
    if (prevApplications.length === 1 && page > 1) {
      needsPageRollback = true;
      setPage(page - 1);
    }

    try {
      await applicationService.delete(id);
      if (!needsPageRollback) {
        await fetchApplications();
      }
    } catch (err) {
      setApplications(prevApplications);
      setTotal(prevTotal);
      if (needsPageRollback) {
        setPage(page);
      }
      throw err;
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return {
    applications,
    isLoading,
    error,
    total,
    page,
    totalPages,
    search,
    setSearch: setSearchDebounced,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    goToPage,
    createApplication,
    updateApplication,
    deleteApplication,
    refresh: fetchApplications,
  };
}
