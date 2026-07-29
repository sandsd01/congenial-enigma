import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdminCarStatusActions } from "@/components/admin-car-status-actions";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/cars");
  }

  const { q } = await searchParams;

  const cars = await prisma.car.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
            { owner: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-normal text-ink">
          รถทั้งหมด ({cars.length})
        </h1>
        <Link
          href="/admin"
          className="text-sm text-ink-muted transition-colors hover:text-accent"
        >
          ← กลับแดชบอร์ด
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          placeholder="ค้นหาชื่อรถ ยี่ห้อ รุ่น หรือเจ้าของ"
          defaultValue={q}
          className="w-full max-w-sm rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </form>

      <div className="space-y-3">
        {cars.length === 0 && (
          <p className="text-ink-muted">ไม่พบรถ</p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink">{car.title}</p>
                <StatusBadge status={car.status} />
                {!car.isActive && (
                  <span className="text-xs text-ink-faint">(ปิดประกาศแล้ว)</span>
                )}
              </div>
              <p className="text-sm text-ink-muted">
                {car.brand} {car.model} · {car.year} · {car.location} · ฿
                {car.pricePerDay.toLocaleString()}/วัน
              </p>
              <p className="text-xs text-ink-faint">
                เจ้าของ: {car.owner.name} ({car.owner.email})
              </p>
              {car.status === "REJECTED" && car.rejectReason && (
                <p className="mt-1 text-xs text-danger">
                  เหตุผล: {car.rejectReason}
                </p>
              )}
            </div>
            <AdminCarStatusActions
              carId={car.id}
              status={car.status}
              isActive={car.isActive}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
