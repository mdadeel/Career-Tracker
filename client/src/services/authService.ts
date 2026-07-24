import { api } from "./api";
import type { AuthResponse, User } from "../types";

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),

  me: () => api.get<User>("/auth/me"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<{ message: string }>("/auth/password", data),

  updateResume: (resumeText: string) =>
    api.patch<User>("/auth/resume", { resumeText }),

  updateAiConfig: (data: { aiProvider: string; aiApiKey?: string; aiBaseUrl?: string; aiModel?: string }) =>
    api.patch<User>("/auth/ai-config", data),
};
