import express from "express";
import request from "supertest";
import { authenticate, authorize } from "../../src/middleware/auth";
import { errorHandler } from "../../src/middleware/errorHandler";
import { signToken } from "../../src/modules/auth/token";

const testApp = express();
testApp.get("/protected", authenticate, (req, res) =>
  res.json({ user: req.user }),
);
testApp.get("/admin-only", authenticate, authorize("ADMIN"), (_req, res) =>
  res.json({ ok: true }),
);
testApp.use(errorHandler);

const userToken = signToken({ sub: "u1", role: "USER" });
const adminToken = signToken({ sub: "a1", role: "ADMIN" });

describe("authenticate", () => {
  it("returns 401 when no token is sent", async () => {
    expect((await request(testApp).get("/protected")).status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(testApp)
      .get("/protected")
      .set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
  });

  it("attaches the user and continues for a valid token", async () => {
    const res = await request(testApp)
      .get("/protected")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ sub: "u1", role: "USER" });
  });
});

describe("authorize", () => {
  it("returns 403 when the role is not allowed", async () => {
    const res = await request(testApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("lets an allowed role through", async () => {
    const res = await request(testApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
