import { NextFunction, Request, Response } from "express";
import { registerSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = registerSchema.parse(req.body);
      const user = await this.service.register(input);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  };
}
