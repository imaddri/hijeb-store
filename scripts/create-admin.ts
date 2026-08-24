import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "manarbt@store.com";
  const password = "ma123456789@39";

  console.log("Connecting to database...");

  await prisma.$connect();

  console.log("Database connection successful.");

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log("========================================");
    console.log("Admin already exists.");
    console.log("========================================");
    console.log(`Email: ${existingAdmin.email}`);
    console.log("========================================");

    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.create({
    data: {
      email,
      password: passwordHash,
    },
  });

  console.log("========================================");
  console.log("Admin created successfully!");
  console.log("========================================");
  console.log(`Email: ${email}`);
  console.log("Password: ***************");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("Failed to create admin:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });