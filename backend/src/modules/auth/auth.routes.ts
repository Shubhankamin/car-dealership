import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { AuthController } from "./auth.controller";
import { PrismaUserRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

const controller = new AuthController(
  new AuthService(new PrismaUserRepository(prisma)),
);

export const authRouter = Router();
authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
