/**
 * Creates (or updates) a platform admin from environment variables, and
 * removes the demo accounts shipped by `prisma/seed.ts` if they are present.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='<strong password>' npm run create-admin
 *
 * The demo accounts use a password published in this repository's README, so
 * any environment reachable from the internet must not keep them.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DEMO_EMAILS = [
  "admin@rentcar.dev",
  "owner@rentcar.dev",
  "renter@rentcar.dev",
];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "ผู้ดูแลระบบ";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name },
    create: { email, passwordHash, role: "ADMIN", name },
  });

  console.log(`Admin ready: ${admin.email}`);

  // Purge demo accounts and everything hanging off them.
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true, email: true },
  });

  if (demoUsers.length === 0) {
    console.log("No demo accounts present.");
    return;
  }

  const demoUserIds = demoUsers.map((u) => u.id);

  const demoCars = await prisma.car.findMany({
    where: { ownerId: { in: demoUserIds } },
    select: { id: true },
  });
  const demoCarIds = demoCars.map((c) => c.id);

  // Delete children before parents to satisfy foreign keys.
  await prisma.review.deleteMany({
    where: {
      OR: [
        { authorId: { in: demoUserIds } },
        { carId: { in: demoCarIds } },
      ],
    },
  });
  await prisma.booking.deleteMany({
    where: {
      OR: [
        { renterId: { in: demoUserIds } },
        { carId: { in: demoCarIds } },
      ],
    },
  });
  await prisma.carImage.deleteMany({ where: { carId: { in: demoCarIds } } });
  await prisma.car.deleteMany({ where: { id: { in: demoCarIds } } });
  await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });

  console.log(
    `Removed ${demoUsers.length} demo account(s): ${demoUsers
      .map((u) => u.email)
      .join(", ")}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
