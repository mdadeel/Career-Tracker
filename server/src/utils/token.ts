import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL: JWT_SECRET environment variable is missing!");
  }
  return secret || "dev-secret-change-in-production";
}

function getExpiry(): string {
  return process.env.JWT_EXPIRY || "24h";
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: getExpiry() as string & jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as TokenPayload;
}

