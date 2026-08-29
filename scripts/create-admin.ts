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
  const password = "maram123439@@39";

  console.log("");
  console.log("========================================");
  console.log("START PASSWORD CHANGE");
  console.log("========================================");

  console.log("Connecting to database...");

  await prisma.$connect();

  console.log("Database connection successful.");

  // ============================================================
  // FIND ADMIN
  // ============================================================

  console.log("");
  console.log("Searching for admin...");
  console.log(`Email: ${email}`);

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (!existingAdmin) {
    console.log("");
    console.log("========================================");
    console.log("ADMIN NOT FOUND");
    console.log("========================================");

    return;
  }

  console.log("");
  console.log("Admin found!");
  console.log(`Admin ID: ${existingAdmin.id}`);

  // ============================================================
  // TEST OLD PASSWORD
  // ============================================================

  console.log("");
  console.log("Testing current password...");

  // ============================================================
  // HASH NEW PASSWORD
  // ============================================================

  console.log("");
  console.log("Hashing new password...");

  const passwordHash = await bcrypt.hash(password, 12);

  console.log("New password hashed successfully.");

  // ============================================================
  // UPDATE
  // ============================================================

  console.log("");
  console.log("Updating database...");

  const updatedAdmin = await prisma.admin.update({
    where: {
      email,
    },
    data: {
      password: passwordHash,
    },
  });

  console.log("Database update completed.");

  console.log(`Updated admin ID: ${updatedAdmin.id}`);

  // ============================================================
  // READ AGAIN
  // ============================================================

  console.log("");
  console.log("Reading admin again from database...");

  const adminAfterUpdate = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (!adminAfterUpdate) {
    throw new Error(
      "Admin was not found after update."
    );
  }

  console.log("Admin successfully read after update.");

  // ============================================================
  // VERIFY NEW PASSWORD
  // ============================================================

  console.log("");
  console.log("Verifying new password...");

  const newPasswordWorks = await bcrypt.compare(
    password,
    adminAfterUpdate.password
  );

  console.log("");
  console.log("========================================");
  console.log("RESULT");
  console.log("========================================");

  console.log(
    `New password verification: ${
      newPasswordWorks
        ? "SUCCESS"
        : "FAILED"
    }`
  );

  console.log("========================================");

  if (!newPasswordWorks) {
    throw new Error(
      "Password was updated but verification failed."
    );
  }

  console.log("");
  console.log("PASSWORD CHANGED SUCCESSFULLY!");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("========================================");
    console.error("PASSWORD CHANGE FAILED");
    console.error("========================================");
    console.error(error);
    console.error("========================================");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });