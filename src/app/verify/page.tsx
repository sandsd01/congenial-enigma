import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { VerificationForm } from "@/components/verification-form";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/verify");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { verificationStatus: true, verificationRejectReason: true },
  });

  if (!user) {
    redirect("/login?callbackUrl=/verify");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-normal text-ink">ยืนยันตัวตน</h1>
        {user.verificationStatus !== "UNVERIFIED" && (
          <StatusBadge status={user.verificationStatus} />
        )}
      </div>
      <p className="mb-6 text-sm text-ink-muted">
        อัปโหลดบัตรประชาชนหรือใบขับขี่เพื่อรับตราสัญลักษณ์ความน่าเชื่อถือ
        การยืนยันตัวตนไม่ใช่ข้อบังคับในการจองหรือปล่อยเช่ารถ
      </p>
      <VerificationForm
        status={user.verificationStatus}
        rejectReason={user.verificationRejectReason}
      />
    </div>
  );
}
