import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdminCarActions } from "@/components/admin-car-actions";
import { AdminVerificationActions } from "@/components/admin-verification-actions";
import { AdminPaymentAction } from "@/components/admin-payment-action";
import { CommissionSetting } from "@/components/commission-setting";
import { DEFAULT_COMMISSION_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const [
    pendingCars,
    pendingVerifications,
    revenueBookings,
    recentBookings,
    carCount,
    userCount,
    setting,
  ] = await Promise.all([
    prisma.car.findMany({
      where: { status: "PENDING", isActive: true },
      orderBy: { createdAt: "asc" },
      include: { owner: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { updatedAt: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      select: { commissionAmount: true, subtotal: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { car: true, renter: { select: { name: true } } },
    }),
    prisma.car.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.platformSetting.findUnique({ where: { id: "singleton" } }),
  ]);

  const totalCommission = revenueBookings.reduce(
    (sum, b) => sum + b.commissionAmount,
    0
  );
  const totalGmv = revenueBookings.reduce((sum, b) => sum + b.subtotal, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-normal text-ink">
          แดชบอร์ดแอดมิน
        </h1>
        <div className="flex gap-4 text-sm">
          <Link
            href="/admin/users"
            className="text-ink-muted transition-colors hover:text-accent"
          >
            ผู้ใช้ทั้งหมด →
          </Link>
          <Link
            href="/admin/cars"
            className="text-ink-muted transition-colors hover:text-accent"
          >
            รถทั้งหมด →
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="ค่าคอมมิชชั่นสะสม"
          value={`฿${totalCommission.toLocaleString()}`}
          highlight
        />
        <Stat label="มูลค่าการจองรวม" value={`฿${totalGmv.toLocaleString()}`} />
        <Stat label="จำนวนรถทั้งหมด" value={carCount.toLocaleString()} />
        <Stat label="จำนวนผู้ใช้" value={userCount.toLocaleString()} />
      </div>

      <CommissionSetting
        currentRate={setting?.commissionRate ?? DEFAULT_COMMISSION_RATE}
      />

      <h2 className="mb-4 font-display text-xl font-normal text-ink">
        รถรอตรวจสอบ ({pendingCars.length})
      </h2>
      <div className="mb-10 space-y-3">
        {pendingCars.length === 0 && (
          <p className="text-ink-muted">ไม่มีรถรอตรวจสอบ</p>
        )}
        {pendingCars.map((car) => (
          <div
            key={car.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <p className="font-semibold text-ink">{car.title}</p>
              <p className="text-sm text-ink-muted">
                {car.brand} {car.model} · {car.year} · {car.location} · ฿
                {car.pricePerDay.toLocaleString()}/วัน
              </p>
              <p className="text-xs text-ink-faint">
                เจ้าของ: {car.owner.name}
              </p>
            </div>
            <AdminCarActions carId={car.id} />
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-xl font-normal text-ink">
        คำขอยืนยันตัวตนรอตรวจสอบ ({pendingVerifications.length})
      </h2>
      <div className="mb-10 space-y-3">
        {pendingVerifications.length === 0 && (
          <p className="text-ink-muted">ไม่มีคำขอยืนยันตัวตนรอตรวจสอบ</p>
        )}
        {pendingVerifications.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-ink-muted">{user.email}</p>
            </div>
            <AdminVerificationActions userId={user.id} />
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-xl font-normal text-ink">รายการจองล่าสุด</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-surface-hover text-left text-ink-muted">
            <tr>
              <th className="px-4 py-2">รถ</th>
              <th className="px-4 py-2">ผู้เช่า</th>
              <th className="px-4 py-2">ยอดรวม</th>
              <th className="px-4 py-2">ค่าคอมมิชชั่น</th>
              <th className="px-4 py-2">สถานะ</th>
              <th className="px-4 py-2">การชำระเงิน</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr
                key={b.id}
                className="border-t border-border text-ink transition-colors hover:bg-surface-hover"
              >
                <td className="px-4 py-2">{b.car.title}</td>
                <td className="px-4 py-2">
                  {b.renter?.name ?? b.guestName}
                  {!b.renter && (
                    <span className="ml-1 text-xs text-ink-faint">(ผู้เยี่ยมชม)</span>
                  )}
                </td>
                <td className="px-4 py-2">฿{b.subtotal.toLocaleString()}</td>
                <td className="px-4 py-2 text-accent">
                  ฿{b.commissionAmount.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.paymentStatus} />
                    <AdminPaymentAction
                      bookingId={b.id}
                      paymentStatus={b.paymentStatus}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          highlight ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
