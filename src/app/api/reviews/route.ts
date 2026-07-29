import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";
import { safeJson } from "@/lib/parse-json";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await safeJson(req);
  if (body === undefined) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const { bookingId, rating, comment } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking || booking.renterId !== session.user.id) {
    return NextResponse.json({ error: "ไม่พบรายการจอง" }, { status: 404 });
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "สามารถรีวิวได้หลังจบการเช่าเท่านั้น" },
      { status: 400 }
    );
  }

  if (booking.review) {
    return NextResponse.json(
      { error: "คุณได้รีวิวการจองนี้ไปแล้ว" },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      carId: booking.carId,
      authorId: session.user.id,
      rating,
      comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
