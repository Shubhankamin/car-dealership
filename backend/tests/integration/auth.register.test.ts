import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("creates a user and never exposes the password hash", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "alice@test.com", password: "Password123" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: "alice@test.com",
      role: "USER",
    });
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
