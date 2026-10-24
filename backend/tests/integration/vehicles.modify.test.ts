import request from "supertest";
import { PrismaClient, Vehicle } from "@prisma/client";
import { app } from "../../src/app";
import { createUserWithToken } from "../helpers/auth";

const prisma = new PrismaClient();
let vehicle: Vehicle;

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

describe("PUT /api/vehicles/:id", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .send({ price: 100 });
    expect(res.status).toBe(401);
  });

  it("updates only the fields that are sent", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 27000 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: vehicle.id,
      make: "Toyota",
      price: 27000,
      quantity: 5,
    });
  });

  it("returns 400 for invalid data", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: -5 });

    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown vehicle", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .put("/api/vehicles/does-not-exist")
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 100 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin user and keeps the vehicle", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .delete(`/api/vehicles/${vehicle.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(await prisma.vehicle.count()).toBe(1);
  });

  it("lets an admin delete a vehicle", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await request(app)
      .delete(`/api/vehicles/${vehicle.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await prisma.vehicle.count()).toBe(0);
  });

  it("returns 404 for an unknown vehicle", async () => {
    const { token } = await createUserWithToken("ADMIN");

    const res = await request(app)
      .delete("/api/vehicles/does-not-exist")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vehicle not found");
  });
});
