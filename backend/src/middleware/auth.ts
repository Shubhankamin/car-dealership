import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";
import { verifyToken } from "../modules/auth/token";

/** Requires a valid "Authorization: Bearer <token>" header. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or malformed Authorization header"),
    );
  }
  try {
    req.user = verifyToken(header.slice("Bearer ".length));
    next();
  } catch (err) {
    next(err);
  }
}

/** Requires the authenticated user to have one of the given roles. */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}
