import request from "supertest";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";

const prisma = new PrismaClient();
const credentials = { email: "alice@test.com", password: "Password123" };

beforeEach(async () => {
  await prisma.user.deleteMany();
  await request(app).post("/api/auth/register").send(credentials);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("returns a signed JWT for valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(credentials);

    expect(res.status).toBe(200);
    const payload = jwt.verify(
      res.body.token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    expect(payload.role).toBe("USER");
    expect(payload.sub).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...credentials, password: "WrongPassword1" });

    expect(res.status).toBe(401);
  });

  it("returns 401 with the same message for an unknown email", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ ...credentials, password: "WrongPassword1" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "Password123" });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.error).toBe(wrongPassword.body.error);
  });
});
