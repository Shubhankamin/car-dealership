import fs from "fs/promises";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";
import { createUserWithToken } from "../helpers/auth";

const prisma = new PrismaClient();

// A valid 1x1 PNG.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  await fs.rm(process.env.UPLOAD_DIR as string, {
    recursive: true,
    force: true,
  });
});

function upload(token: string | null, file: Buffer, filename = "car.png") {
  const req = request(app).post("/api/uploads");
  if (token) req.set("Authorization", `Bearer ${token}`);
  return req.attach("image", file, { filename, contentType: "image/png" });
}

describe("POST /api/uploads", () => {
  it("returns 401 without a token", async () => {
    expect((await upload(null, png)).status).toBe(401);
  });

  it("returns 403 for a non-admin user", async () => {
    const { token } = await createUserWithToken("USER");
    expect((await upload(token, png)).status).toBe(403);
  });

  it("stores an image for an admin and serves it back", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await upload(token, png);

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/api\/uploads\/[0-9a-f-]+\.png$/);

    const served = await request(app).get(res.body.url);
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toMatch(/image\/png/);
  });

  it("never uses the file name sent by the client", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await upload(token, png, "../../evil.png");

    expect(res.status).toBe(201);
    expect(res.body.url).not.toContain("evil");
    expect(res.body.url).toMatch(/^\/api\/uploads\/[0-9a-f-]+\.png$/);
  });

  it("returns 400 when no file is sent", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .field("note", "no file here");

    expect(res.status).toBe(400);
  });

  it("returns 400 when the content is not really an image", async () => {
    const { token } = await createUserWithToken("ADMIN");

    // The name and content type claim PNG, but the bytes are a script.
    const res = await upload(
      token,
      Buffer.from("<script>alert(1)</script>"),
      "evil.png",
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/JPEG, PNG or WebP/);
  });

  it("returns 413 for a file over 2 MB", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await upload(
      token,
      Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]),
    );

    expect(res.status).toBe(413);
  });
});
