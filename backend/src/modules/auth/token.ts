import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../errors/AppError";

export interface TokenPayload {
  sub: string;
  role: string;
}

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return value;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign({ role: payload.role }, secret(), {
    subject: payload.sub,
    expiresIn: "1d",
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, secret()) as jwt.JwtPayload;
    return { sub: decoded.sub as string, role: decoded.role as string };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
