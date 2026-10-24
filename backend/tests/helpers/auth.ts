import { PrismaClient } from "@prisma/client";
import { signToken } from "../../src/modules/auth/token";

const prisma = new PrismaClient();

export async function createUserWithToken(role: "USER" | "ADMIN" = "USER") {
  const user = await prisma.user.create({
    data: {
      email: `${role.toLowerCase()}-${Date.now()}-${Math.random()}@test.com`,
      passwordHash: "not-used-in-these-tests",
      role,
    },
  });
  return { user, token: signToken({ sub: user.id, role: user.role }) };
}
