import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { DEFAULT_COMMISSION_RATE } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { renterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { car: true },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const { carId, startDate, endDate, notes } = parsed.data;

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.status !== "APPROVED" || !car.isActive) {
    return NextResponse.json({ error: "ไม่พบรถที่ต้องการจอง" }, { status: 404 });
  }

  if (car.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "ไม่สามารถจองรถของตัวเองได้" },
      { status: 400 }
    );
  }

  const overlapping = await prisma.booking.findFirst({
    where: {
      carId,
      status: "CONFIRMED",
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (overlapping) {
    return NextResponse.json(
      { error: "รถไม่ว่างในช่วงวันที่เลือก" },
      { status: 409 }
    );
  }

  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const setting = await prisma.platformSetting.findUnique({
    where: { id: "singleton" },
  });
  const commissionRate = setting?.commissionRate ?? DEFAULT_COMMISSION_RATE;

  const subtotal = days * car.pricePerDay;
  const commissionAmount = Math.round(subtotal * commissionRate * 100) / 100;
  const ownerPayout = Math.round((subtotal - commissionAmount) * 100) / 100;

  const booking = await prisma.booking.create({
    data: {
      carId,
      renterId: session.user.id,
      startDate,
      endDate,
      days,
      pricePerDay: car.pricePerDay,
      subtotal,
      commissionRate,
      commissionAmount,
      ownerPayout,
      notes,
      status: "PENDING",
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
