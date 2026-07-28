import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// This seed creates demo accounts with a well-known password. Running it
// against a production database would hand anyone who reads this repo an
// admin login, so refuse unless the operator explicitly overrides.
if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEMO_SEED) {
  console.error(
    "Refusing to seed demo data in production.\n" +
      "These accounts use a publicly known password and must never exist on a\n" +
      "live site. Use `npm run create-admin` to create a real admin instead.\n" +
      "Set ALLOW_DEMO_SEED=1 only for a throwaway environment."
  );
  process.exit(1);
}

async function main() {
  await prisma.platformSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", commissionRate: 0.15 },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@rentcar.dev" },
    update: {},
    create: {
      name: "ผู้ดูแลระบบ",
      email: "admin@rentcar.dev",
      passwordHash,
      role: "ADMIN",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@rentcar.dev" },
    update: {},
    create: {
      name: "สมชาย เจ้าของรถ",
      email: "owner@rentcar.dev",
      passwordHash,
      phone: "081-234-5678",
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: "renter@rentcar.dev" },
    update: {},
    create: {
      name: "สมหญิง ผู้เช่ารถ",
      email: "renter@rentcar.dev",
      passwordHash,
      phone: "089-876-5432",
      role: "RENTER",
    },
  });

  const existingCars = await prisma.car.count({ where: { ownerId: owner.id } });
  if (existingCars === 0) {
    await prisma.car.createMany({
      data: [
        {
          ownerId: owner.id,
          title: "Toyota Yaris 2022 เกียร์ออโต้ ประหยัดน้ำมัน",
          brand: "Toyota",
          model: "Yaris",
          year: 2022,
          transmission: "AUTO",
          seats: 5,
          fuelType: "GASOLINE",
          location: "กรุงเทพมหานคร",
          pricePerDay: 1200,
          description:
            "รถสภาพดี ประหยัดน้ำมัน เหมาะสำหรับขับในเมือง มีประกันชั้น 1",
          status: "APPROVED",
        },
        {
          ownerId: owner.id,
          title: "Honda CR-V 2021 SUV 7 ที่นั่ง",
          brand: "Honda",
          model: "CR-V",
          year: 2021,
          transmission: "AUTO",
          seats: 7,
          fuelType: "HYBRID",
          location: "เชียงใหม่",
          pricePerDay: 2200,
          description: "SUV กว้างขวาง เหมาะสำหรับเดินทางไกลหรือครอบครัวใหญ่",
          status: "APPROVED",
        },
        {
          ownerId: owner.id,
          title: "Tesla Model 3 ไฟฟ้า 100%",
          brand: "Tesla",
          model: "Model 3",
          year: 2023,
          transmission: "AUTO",
          seats: 5,
          fuelType: "EV",
          location: "ภูเก็ต",
          pricePerDay: 3000,
          description: "รถไฟฟ้ารุ่นใหม่ล่าสุด ขับเงียบ ประหยัดค่าน้ำมัน",
          status: "PENDING",
        },
      ],
    });
  }

  console.log("Seed complete. Admin login: admin@rentcar.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
