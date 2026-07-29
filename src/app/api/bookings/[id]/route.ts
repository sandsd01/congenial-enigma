import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bookingStatusUpdateSchema } from "@/lib/validation";
import { safeJson } from "@/lib/parse-json";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma/enums";

type Role = "owner" | "renter" | "admin";

// Maps a (fromStatus -> toStatus) transition to the roles allowed to perform it.
const TRANSITIONS: Record<string, Role[]> = {
  "PENDING->CONFIRMED": ["owner", "admin"],
  "PENDING->REJECTED": ["owner", "admin"],
  "PENDING->CANCELLED": ["renter", "admin"],
  "CONFIRMED->COMPLETED": ["owner", "admin"],
  "CONFIRMED->CANCELLED": ["renter", "owner", "admin"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "ไม่พบรายการจอง" }, { status: 404 });
  }

  const body = await safeJson(req);
  if (body === undefined) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const parsedBody = bookingStatusUpdateSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }
  const { status, paymentStatus } = parsedBody.data as {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
  };

  const isOwner = session.user.id === booking.car.ownerId;
  const isRenter = session.user.id === booking.renterId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isRenter && !isAdmin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const data: { status?: BookingStatus; paymentStatus?: PaymentStatus } = {};

  if (status) {
    const allowedRoles = TRANSITIONS[`${booking.status}->${status}`];

    if (!allowedRoles) {
      return NextResponse.json(
        { error: "ไม่สามารถเปลี่ยนสถานะนี้ได้" },
        { status: 409 }
      );
    }

    const hasRole =
      (isAdmin && allowedRoles.includes("admin")) ||
      (isOwner && allowedRoles.includes("owner")) ||
      (isRenter && allowedRoles.includes("renter"));

    if (!hasRole) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    data.status = status;
  }

  if (paymentStatus && isAdmin) {
    data.paymentStatus = paymentStatus;
  }

  const updated = await prisma.booking.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
