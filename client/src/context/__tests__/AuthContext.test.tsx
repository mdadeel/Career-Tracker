import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";
import { invalidateCache } from "../../services/cache";

// Component that consumes the auth context for testing
function TestConsumer() {
  const { user, isLoading, login, register, logout } = useAuth();

  if (isLoading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="auth-state">
        {user ? `Logged in as ${user.name}` : "Not logged in"}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button data-testid="login-btn" onClick={() => login("test@example.com", "password123")}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register("Test User", "test@example.com", "password123")}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("AuthContext", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    invalidateCache(); // clear module-level cache from other tests
  });

  function renderAuth() {
    return render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
  }

  it("shows not logged in when session restore fails (no cookie)", async () => {
    // On mount, AuthContext calls /auth/me which fails (no cookie = 401)
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ success: false, message: "Authentication required" }),
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });
  });

  it("logs in a user and updates state", async () => {
    // First call: /auth/me on mount (fails — no cookie yet)
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ success: false, message: "Authentication required" }),
    });

    // Second call: login POST — sets user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            token: "fake-jwt",
            user: { id: "1", name: "Test User", email: "test@example.com", createdAt: "2026-01-01" },
          },
        }),
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("login-btn")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Logged in as Test User");
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    });

    // Token is stored as httpOnly cookie by the server — NOT in localStorage
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("registers a user and updates state", async () => {
    // First call: /auth/me on mount (fails)
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ success: false, message: "Authentication required" }),
    });

    // Second call: register POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            token: "register-jwt",
            user: { id: "2", name: "Test User", email: "test@example.com", createdAt: "2026-01-01" },
          },
        }),
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("register-btn")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("register-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Logged in as Test User");
    });

    // Token is in httpOnly cookie, not localStorage
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("logs out a user and clears state", async () => {
    // On mount: /auth/me succeeds → restore session
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "1", name: "Test User", email: "test@example.com", createdAt: "2026-01-01" },
        }),
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Logged in as Test User");
    });

    // On logout: POST /auth/logout
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { message: "Logged out" } }),
    });

    await userEvent.click(screen.getByTestId("logout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });

    // No localStorage token to clear
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("shows not logged in on me() failure (expired session)", async () => {
    // On mount: /auth/me fails (expired/invalid cookie)
    mockFetch.mockRejectedValueOnce(new Error("Token expired"));

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    // Suppress console.error for the expected error boundary output
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    console.error = originalError;
  });
});
