import { TokenPayload } from "../modules/auth/token";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
