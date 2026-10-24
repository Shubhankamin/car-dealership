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
  it("returns 409 when the email is already registered", async () => {
    const body = { email: "alice@test.com", password: "Password123" };
    await request(app).post("/api/auth/register").send(body);

    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(409);
  });

  it("returns 400 for an invalid email or a short password", async () => {
    const badEmail = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "Password123" });
    const shortPassword = await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@test.com", password: "short" });

    expect(badEmail.status).toBe(400);
    expect(shortPassword.status).toBe(400);
  });

  it("ignores a role sent by the client", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "eve@test.com", password: "Password123", role: "ADMIN" });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("USER");
  });
});
