import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { carSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");
  const q = searchParams.get("q");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

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
      ...(minPrice ? { pricePerDay: { gte: Number(minPrice) } } : {}),
      ...(maxPrice ? { pricePerDay: { lte: Number(maxPrice) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });

  return NextResponse.json(cars);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await req.json();
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
