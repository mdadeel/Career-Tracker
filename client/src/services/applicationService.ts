import { api } from "./api";
import type { Application, ApplicationFormData, PaginatedApplications } from "../types";

interface GetApplicationsParams {
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

/** Convert form-data string salary values to numbers (or null) for the API. */
function prepareSalaryData<T extends { salaryMin?: string; salaryMax?: string }>(
  data: T
): T & { salaryMin?: number | null; salaryMax?: number | null } {
  return {
    ...data,
    salaryMin: data.salaryMin !== undefined && data.salaryMin !== "" ? Number(data.salaryMin) : null,
    salaryMax: data.salaryMax !== undefined && data.salaryMax !== "" ? Number(data.salaryMax) : null,
  };
}

export const applicationService = {
  getAll: (params?: GetApplicationsParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.source) query.set("source", params.source);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return api.get<PaginatedApplications>(`/applications${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => api.get<Application>(`/applications/${id}`),

  create: (data: ApplicationFormData) =>
    api.post<Application>("/applications", prepareSalaryData(data)),

  update: (id: string, data: Partial<ApplicationFormData>) =>
    api.patch<Application>(`/applications/${id}`, prepareSalaryData(data)),

  delete: (id: string) => api.delete<void>(`/applications/${id}`),
};
