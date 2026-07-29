import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { safeJson } from "@/lib/parse-json";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await safeJson(req);
  if (body === undefined || typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { status, rejectReason } = body as {
    status?: string;
    rejectReason?: string;
  };

  if (status !== "VERIFIED" && status !== "REJECTED") {
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }

  if (
    rejectReason !== undefined &&
    (typeof rejectReason !== "string" || rejectReason.length > 500)
  ) {
    return NextResponse.json({ error: "เหตุผลยาวเกินไป" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.verificationStatus !== "PENDING") {
    return NextResponse.json(
      { error: "ไม่พบคำขอยืนยันตัวตนที่รอตรวจสอบ" },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: status,
      verificationRejectReason: status === "REJECTED" ? (rejectReason ?? null) : null,
    },
  });

  return NextResponse.json({ ok: true, verificationStatus: updated.verificationStatus });
}
