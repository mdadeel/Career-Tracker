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

  it("shows not logged in when no token exists", async () => {
    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });
  });

  it("logs in a user and updates state", async () => {
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

    expect(localStorage.getItem("token")).toBe("fake-jwt");
  });

  it("registers a user and updates state", async () => {
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

    expect(localStorage.getItem("token")).toBe("register-jwt");
  });

  it("logs out a user and clears state", async () => {
    // Seed a token so the context thinks there's an active session
    localStorage.setItem("token", "existing-token");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "1", name: "Test User", email: "test@example.com", createdAt: "2026-01-01" },
        }),
    });

    renderAuth();

    // Wait for the me() call to complete and show logged in
    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Logged in as Test User");
    });

    // Click logout
    await userEvent.click(screen.getByTestId("logout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });

    expect(localStorage.getItem("token")).toBeNull();
  });

  it("clears token on me() failure", async () => {
    localStorage.setItem("token", "expired-token");

    mockFetch.mockRejectedValueOnce(new Error("Token expired"));

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("Not logged in");
    });

    expect(localStorage.getItem("token")).toBeNull();
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
