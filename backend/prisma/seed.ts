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
    imageUrl: "/cars/camry.jpg",
  },
  {
    make: "Honda",
    model: "CR-V",
    category: "SUV",
    price: 32000,
    quantity: 3,
    imageUrl: "/cars/camry.jpg",
  },
  {
    make: "Ford",
    model: "F-150",
    category: "Truck",
    price: 41000,
    quantity: 2,
    imageUrl: "/cars/camry.jpg",
  },
  {
    make: "Tesla",
    model: "Model 3",
    category: "Electric",
    price: 39990,
    quantity: 0,
    imageUrl: "/cars/camry.jpg",
  },
  {
    make: "BMW",
    model: "M4",
    category: "Coupe",
    price: 78000,
    quantity: 1,
    imageUrl: "/cars/camry.jpg",
  },
  {
    make: "Hyundai",
    model: "i20",
    category: "Hatchback",
    price: 15000,
    quantity: 8,
    imageUrl: "/cars/camry.jpg",
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@dealership.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345";

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({ data: vehicles });
  }

  for (const { make, model, imageUrl } of vehicles) {
    await prisma.vehicle.updateMany({
      where: { make, model, imageUrl: null },
      data: { imageUrl },
    });
  }

  console.log(`Seeded admin ${email} and ${vehicles.length} sample vehicles`);
}

main().finally(() => prisma.$disconnect());
