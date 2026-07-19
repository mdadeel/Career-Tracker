import { getCached, setCache, invalidateCache } from "./cache";

const API_BASE = "/api";
const MAX_RETRIES = 2;

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Exponential backoff: only retry on network errors (TypeError from fetch),
  // not on HTTP errors (4xx/5xx) which are handled by the response.ok check
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Invalidate entire cache on any mutation (POST, PATCH, DELETE)
      if (options.method && options.method !== "GET") {
        invalidateCache();
      }

      return data.data;
    } catch (err) {
      lastError = err;

      // Only retry on network errors (TypeError when fetch itself fails),
      // not on HTTP errors (4xx, 5xx) or JSON parse errors
      if (err instanceof TypeError && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 500; // 500ms, 1000ms
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export const api = {
  get: <T>(endpoint: string) => {
    const cached = getCached<T>(endpoint);
    if (cached !== null) {
      return Promise.resolve(cached);
    }
    return request<T>(endpoint).then((data) => {
      setCache(endpoint, data);
      return data;
    });
  },
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};
