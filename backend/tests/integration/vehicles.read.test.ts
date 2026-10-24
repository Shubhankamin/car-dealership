import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/app";
import { createUserWithToken } from "../helpers/auth";

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vehicle.createMany({
    data: [
      {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 28500,
        quantity: 5,
      },
      {
        make: "Honda",
        model: "CR-V",
        category: "SUV",
        price: 32000,
        quantity: 3,
      },
      {
        make: "Tesla",
        model: "Model 3",
        category: "Electric",
        price: 39990,
        quantity: 0,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/vehicles", () => {
  it("returns 401 without a token", async () => {
    expect((await request(app).get("/api/vehicles")).status).toBe(401);
  });

  it("lists all vehicles", async () => {
    const { token } = await createUserWithToken();
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});

describe("GET /api/vehicles/search", () => {
  const search = async (query: string) => {
    const { token } = await createUserWithToken();
    return request(app)
      .get(`/api/vehicles/search?${query}`)
      .set("Authorization", `Bearer ${token}`);
  };

  it("filters by make (case-insensitive)", async () => {
    const res = await search("make=toyota");
    expect(res.status).toBe(200);
    expect(res.body.map((v: { model: string }) => v.model)).toEqual(["Camry"]);
  });

  it("filters by category", async () => {
    const res = await search("category=SUV");
    expect(res.body.map((v: { model: string }) => v.model)).toEqual(["CR-V"]);
  });

  it("filters by price range", async () => {
    const res = await search("minPrice=30000&maxPrice=40000");
    expect(res.body.map((v: { model: string }) => v.model).sort()).toEqual([
      "CR-V",
      "Model 3",
    ]);
  });

  it("combines filters", async () => {
    const res = await search("category=SUV&maxPrice=20000");
    expect(res.body).toEqual([]);
  });

  it("returns 400 for a non-numeric price", async () => {
    const res = await search("minPrice=abc");
    expect(res.status).toBe(400);
  });
});
