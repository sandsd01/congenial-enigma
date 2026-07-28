import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma/enums";

const OWNER_ALLOWED = new Set<BookingStatus>([
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
]);
const RENTER_ALLOWED = new Set<BookingStatus>(["CANCELLED"]);
const ADMIN_ALLOWED = new Set<BookingStatus>([
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

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

  const body = await req.json();
  const { status, paymentStatus } = body as {
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
    const allowed = isAdmin
      ? ADMIN_ALLOWED
      : isOwner
        ? OWNER_ALLOWED
        : RENTER_ALLOWED;

    if (!allowed.has(status)) {
      return NextResponse.json(
        { error: "ไม่สามารถเปลี่ยนสถานะนี้ได้" },
        { status: 403 }
      );
    }
    if (booking.status !== "PENDING" && status !== "CANCELLED") {
      return NextResponse.json(
        { error: "รายการจองนี้ถูกดำเนินการแล้ว" },
        { status: 409 }
      );
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
