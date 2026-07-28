import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdminCarActions } from "@/components/admin-car-actions";
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
      <h1 className="mb-6 text-2xl font-bold">แดชบอร์ดแอดมิน</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="ค่าคอมมิชชั่นสะสม" value={`฿${totalCommission.toLocaleString()}`} highlight />
        <Stat label="มูลค่าการจองรวม" value={`฿${totalGmv.toLocaleString()}`} />
        <Stat label="จำนวนรถทั้งหมด" value={carCount.toLocaleString()} />
        <Stat label="จำนวนผู้ใช้" value={userCount.toLocaleString()} />
      </div>

      <CommissionSetting
        currentRate={setting?.commissionRate ?? DEFAULT_COMMISSION_RATE}
      />

      <h2 className="mb-4 text-xl font-bold">รถรอตรวจสอบ ({pendingCars.length})</h2>
      <div className="mb-10 space-y-3">
        {pendingCars.length === 0 && (
          <p className="text-slate-500">ไม่มีรถรอตรวจสอบ</p>
        )}
        {pendingCars.map((car) => (
          <div
            key={car.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold">{car.title}</p>
              <p className="text-sm text-slate-500">
                {car.brand} {car.model} · {car.year} · {car.location} · ฿
                {car.pricePerDay.toLocaleString()}/วัน
              </p>
              <p className="text-xs text-slate-400">
                เจ้าของ: {car.owner.name}
              </p>
            </div>
            <AdminCarActions carId={car.id} />
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-bold">รายการจองล่าสุด</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
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
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{b.car.title}</td>
                <td className="px-4 py-2">{b.renter.name}</td>
                <td className="px-4 py-2">฿{b.subtotal.toLocaleString()}</td>
                <td className="px-4 py-2 text-blue-600">
                  ฿{b.commissionAmount.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={b.paymentStatus} />
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          highlight ? "text-green-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
