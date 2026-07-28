import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  req: Request,
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

  const formData = await req.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 4MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.carImage.upsert({
    where: { carId: id },
    update: { data: buffer, mimeType: file.type },
    create: { carId: id, data: buffer, mimeType: file.type },
  });

  await prisma.car.update({
    where: { id },
    data: { imageUrl: `/api/cars/${id}/image`, status: "PENDING", rejectReason: null },
  });

  return NextResponse.json({ ok: true, imageUrl: `/api/cars/${id}/image` });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const image = await prisma.carImage.findUnique({ where: { carId: id } });
  if (!image) {
    return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
