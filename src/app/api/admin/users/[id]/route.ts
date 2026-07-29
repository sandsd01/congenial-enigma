import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { safeJson } from "@/lib/parse-json";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await safeJson(req);
  if (body === undefined || typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { isSuspended } = body as { isSuspended?: unknown };
  if (typeof isSuspended !== "boolean") {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      { error: "ไม่สามารถระงับบัญชีแอดมินได้" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isSuspended },
  });

  return NextResponse.json({ id: updated.id, isSuspended: updated.isSuspended });
}
