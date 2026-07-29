import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const file = formData.get("document");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์เอกสาร" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP" },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "ไฟล์เอกสารว่างเปล่า" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ไฟล์ต้องมีขนาดไม่เกิน 4MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const userId = session.user.id;

  await prisma.identityDocument.upsert({
    where: { userId },
    update: { data: buffer, mimeType: file.type },
    create: { userId, data: buffer, mimeType: file.type },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "PENDING", verificationRejectReason: null },
  });

  return NextResponse.json({ ok: true, verificationStatus: "PENDING" });
}
