import jwt from "jsonwebtoken";

const SECRET: string = process.env.JWT_SECRET || "dev-secret-change-in-production";
const EXPIRY = process.env.JWT_EXPIRY || "24h";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: EXPIRY as string & jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
