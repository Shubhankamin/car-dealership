import request from "supertest";
import { PrismaClient, Vehicle } from "@prisma/client";
import { app } from "../../src/app";
import { createUserWithToken } from "../helpers/auth";

const prisma = new PrismaClient();
let vehicle: Vehicle;

const quantityOf = async (id: string) =>
  (await prisma.vehicle.findUniqueOrThrow({ where: { id } })).quantity;

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  vehicle = await prisma.vehicle.create({
    data: {
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 28500,
      quantity: 5,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/vehicles/:id/purchase", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);
    expect(res.status).toBe(401);
  });

  it("decreases the quantity by one", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
    expect(await quantityOf(vehicle.id)).toBe(4);
  });

  it("returns 409 when the vehicle is out of stock", async () => {
    const { token } = await createUserWithToken("USER");
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { quantity: 0 },
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Vehicle is out of stock");
    expect(await quantityOf(vehicle.id)).toBe(0);
  });

  it("returns 404 for an unknown vehicle", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .post("/api/vehicles/does-not-exist/purchase")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vehicle not found");
  });

  it("never oversells when purchases arrive at the same time", async () => {
    const { token } = await createUserWithToken("USER");
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { quantity: 1 },
    });

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .post(`/api/vehicles/${vehicle.id}/purchase`)
          .set("Authorization", `Bearer ${token}`),
      ),
    );

    expect(responses.map((r) => r.status).sort()).toEqual([
      200, 409, 409, 409, 409,
    ]);
    expect(await quantityOf(vehicle.id)).toBe(0);
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .send({ quantity: 3 });
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin user and keeps the quantity", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(await quantityOf(vehicle.id)).toBe(5);
  });

  it("lets an admin increase the quantity", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(15);
    expect(await quantityOf(vehicle.id)).toBe(15);
  });

  it("returns 400 for an invalid amount", async () => {
    const { token } = await createUserWithToken("ADMIN");
    const send = (body: object) =>
      request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);

    expect((await send({ quantity: 0 })).status).toBe(400);
    expect((await send({ quantity: -3 })).status).toBe(400);
    expect((await send({ quantity: 1.5 })).status).toBe(400);
    expect((await send({})).status).toBe(400);
  });

  it("returns 404 for an unknown vehicle", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await request(app)
      .post("/api/vehicles/does-not-exist/restock")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vehicle not found");
  });
});
