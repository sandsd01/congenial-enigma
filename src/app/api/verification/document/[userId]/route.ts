import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();

  if (
    !session?.user ||
    (session.user.id !== userId && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const document = await prisma.identityDocument.findUnique({
    where: { userId },
  });
  if (!document) {
    return NextResponse.json({ error: "ไม่พบเอกสาร" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(document.data), {
    headers: {
      "Content-Type": document.mimeType,
      "Cache-Control": "private, no-store",
    },
  });
}
