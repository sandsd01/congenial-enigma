import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { carSchema, carModerationSchema } from "@/lib/validation";
import { safeJson } from "@/lib/parse-json";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { owner: { select: { name: true, phone: true } } },
  });

  if (!car) {
    return NextResponse.json({ error: "ไม่พบรถ" }, { status: 404 });
  }

  return NextResponse.json(car);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) {
    return NextResponse.json({ error: "ไม่พบรถ" }, { status: 404 });
  }

  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const isOwner = session.user.id === car.ownerId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await safeJson(req);
  if (body === undefined || typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  // Admin-only moderation actions
  if (isAdmin && "status" in body) {
    const parsedModeration = carModerationSchema.safeParse(body);
    if (!parsedModeration.success) {
      return NextResponse.json(
        { error: parsedModeration.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const updated = await prisma.car.update({
      where: { id },
      data: {
        status: parsedModeration.data.status,
        rejectReason: parsedModeration.data.rejectReason ?? null,
      },
    });
    return NextResponse.json(updated);
  }

  if (!isOwner) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const parsed = carSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const updated = await prisma.car.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      status: "PENDING", // re-review after edits
      rejectReason: null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) {
    return NextResponse.json({ error: "ไม่พบรถ" }, { status: 404 });
  }

  if (
    !session?.user ||
    (session.user.id !== car.ownerId && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  await prisma.car.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ ok: true });
}
