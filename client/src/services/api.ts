import { getCached, setCache, invalidateCache } from "./cache";

const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl ? `${envApiUrl.replace(/\/$/, "")}/api` : "/api";
const MAX_RETRIES = 2;

type UnauthorizedCallback = () => void;
const unauthorizedListeners: Set<UnauthorizedCallback> = new Set();

export function onUnauthorized(callback: UnauthorizedCallback): () => void {
  unauthorizedListeners.add(callback);
  return () => {
    unauthorizedListeners.delete(callback);
  };
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((cb) => cb());
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Token is sent automatically via httpOnly cookie — no manual Authorization header needed.
  // Include credentials so the browser sends cookies cross-origin.

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Invalidate affected cache entries on any mutation (POST, PATCH, DELETE)
  if (options.method && options.method !== "GET") {
    const resource = endpoint.split('/').filter(Boolean).slice(0, 1).join('/');
    invalidateCache(resource ? `/${resource}` : undefined);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies (httpOnly token) with every request
      });

      if (response.status === 401) {
        notifyUnauthorized();
        // On 401, also clear any stale user state
        localStorage.removeItem("user");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
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

