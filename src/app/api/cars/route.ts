import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { carSchema } from "@/lib/validation";
import { safeJson } from "@/lib/parse-json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");
  const q = searchParams.get("q");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minPriceNum = minPrice ? Number(minPrice) : NaN;
  const maxPriceNum = maxPrice ? Number(maxPrice) : NaN;

  const cars = await prisma.car.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      ...(location ? { location } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { brand: { contains: q } },
              { model: { contains: q } },
            ],
          }
        : {}),
      ...(!Number.isNaN(minPriceNum) ? { pricePerDay: { gte: minPriceNum } } : {}),
      ...(!Number.isNaN(maxPriceNum) ? { pricePerDay: { lte: maxPriceNum } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });

  return NextResponse.json(cars);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await safeJson(req);
  if (body === undefined) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const parsed = carSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const car = await prisma.car.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      ownerId: session.user.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(car, { status: 201 });
}
