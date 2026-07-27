import { api } from "./api";
import type { Resume } from "../types";

const API_BASE = (() => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  return envApiUrl ? `${envApiUrl.replace(/\/$/, "")}/api` : "/api";
})();

export const resumeService = {
  list: () => api.get<Resume[]>("/resumes"),

  getById: (id: string) => api.get<Resume>(`/resumes/${id}`),

  upload: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch(`${API_BASE}/resumes/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Upload failed");
    }
    const data = await response.json();
    return data.data;
  },

  update: (id: string, data: { textContent?: string; fileName?: string }) =>
    api.patch<Resume>(`/resumes/${id}`, data),

  delete: (id: string) => api.delete<void>(`/resumes/${id}`),
};
