import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DEFAULT_COMMISSION_RATE } from "@/lib/constants";

const settingSchema = z.object({
  // Stored as a fraction (0.15 = 15%)
  commissionRate: z.coerce.number().min(0).max(0.5),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = settingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "อัตราค่าคอมมิชชั่นต้องอยู่ระหว่าง 0% ถึง 50%" },
      { status: 400 }
    );
  }

  const setting = await prisma.platformSetting.upsert({
    where: { id: "singleton" },
    update: { commissionRate: parsed.data.commissionRate },
    create: {
      id: "singleton",
      commissionRate: parsed.data.commissionRate,
    },
  });

  return NextResponse.json(setting);
}

export async function GET() {
  const setting = await prisma.platformSetting.findUnique({
    where: { id: "singleton" },
  });

  return NextResponse.json({
    commissionRate: setting?.commissionRate ?? DEFAULT_COMMISSION_RATE,
  });
}
