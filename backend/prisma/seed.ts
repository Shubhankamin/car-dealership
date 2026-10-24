import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const vehicles = [
  {
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 28500,
    quantity: 5,
  },
  { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 3 },
  {
    make: "Ford",
    model: "F-150",
    category: "Truck",
    price: 41000,
    quantity: 2,
  },
  {
    make: "Tesla",
    model: "Model 3",
    category: "Electric",
    price: 39990,
    quantity: 0,
  },
  { make: "BMW", model: "M4", category: "Coupe", price: 78000, quantity: 1 },
  {
    make: "Hyundai",
    model: "i20",
    category: "Hatchback",
    price: 15000,
    quantity: 8,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@dealership.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({ data: vehicles });
  }
  console.log(`Seeded admin ${email} and ${vehicles.length} sample vehicles`);
}

main().finally(() => prisma.$disconnect());
