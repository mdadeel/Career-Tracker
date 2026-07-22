import { describe, it, expect } from "vitest";
import { generateToken, verifyToken } from "../utils/token";

describe("Token utility", () => {
  it("generates and verifies a valid JWT token", () => {
    const payload = { userId: "test-user-123", email: "alex@example.com" };
    const token = generateToken(payload);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(10);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("throws on invalid or tampered token", () => {
    expect(() => verifyToken("invalid-token-string")).toThrow();
  });
});
