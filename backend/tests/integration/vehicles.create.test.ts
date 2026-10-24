import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";
import { createUserWithToken } from "../helpers/auth";

const prisma = new PrismaClient();

const validVehicle = {
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 28500,
  quantity: 5,
};

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/vehicles", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/vehicles").send(validVehicle);
    expect(res.status).toBe(401);
  });

  it("creates a vehicle for an authenticated user", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(validVehicle);
    expect(res.body.id).toBeDefined();
  });

  it("returns 400 for invalid data", async () => {
    const { token } = await createUserWithToken("USER");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validVehicle, price: -10, quantity: -1 });

    expect(res.status).toBe(400);
  });
});
