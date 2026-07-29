import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { OwnerBookingActions } from "@/components/owner-booking-actions";

export const dynamic = "force-dynamic";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login?callbackUrl=/owner");
  }

  const cars = await prisma.car.findMany({
    where: { ownerId: session.user.id, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      bookings: {
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      },
    },
  });

  const bookings = await prisma.booking.findMany({
    where: { car: { ownerId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      car: true,
      renter: { select: { name: true, phone: true, verificationStatus: true } },
    },
    take: 20,
  });

  const totalPayout = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.ownerPayout, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">รถของฉัน</h1>
        <Link
          href="/owner/cars/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          + ลงประกาศรถใหม่
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-ink-muted">
          รายได้สุทธิสะสม (หลังหักค่าคอมมิชชั่น)
        </p>
        <p className="text-3xl font-bold text-success">
          ฿{totalPayout.toLocaleString()}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.length === 0 && (
          <p className="text-ink-muted">คุณยังไม่มีรถลงประกาศ</p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-ink">{car.title}</h3>
              <StatusBadge status={car.status} />
            </div>
            <p className="text-sm text-ink-muted">
              {car.brand} {car.model} · ฿{car.pricePerDay.toLocaleString()}/วัน
            </p>
            {car.status === "REJECTED" && car.rejectReason && (
              <p className="mt-1 text-xs text-danger">
                เหตุผล: {car.rejectReason}
              </p>
            )}
            <div className="mt-3 flex gap-3 text-sm">
              <Link
                href={`/owner/cars/${car.id}/edit`}
                className="text-accent transition-colors hover:text-accent-hover"
              >
                แก้ไข
              </Link>
              {car.status === "APPROVED" && (
                <Link
                  href={`/cars/${car.id}`}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  ดูประกาศ
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-bold text-ink">คำขอจองล่าสุด</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-hover text-left text-ink-muted">
            <tr>
              <th className="px-4 py-2">รถ</th>
              <th className="px-4 py-2">ผู้เช่า</th>
              <th className="px-4 py-2">วันที่</th>
              <th className="px-4 py-2">ยอดรวม</th>
              <th className="px-4 py-2">รายได้สุทธิ</th>
              <th className="px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-ink-faint"
                >
                  ยังไม่มีคำขอจอง
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingRow({
  booking,
}: {
  booking: {
    id: string;
    car: { title: string };
    renter: { name: string; phone: string | null; verificationStatus: string };
    startDate: Date;
    endDate: Date;
    subtotal: number;
    ownerPayout: number;
    status: string;
  };
}) {
  return (
    <tr className="border-t border-border text-ink transition-colors hover:bg-surface-hover">
      <td className="px-4 py-2">{booking.car.title}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span>{booking.renter.name}</span>
          {booking.renter.verificationStatus === "VERIFIED" && (
            <StatusBadge status="VERIFIED" />
          )}
        </div>
        {booking.renter.phone && (
          <div className="text-xs text-ink-faint">
            {booking.renter.phone}
          </div>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {new Date(booking.startDate).toLocaleDateString("th-TH")} -{" "}
        {new Date(booking.endDate).toLocaleDateString("th-TH")}
      </td>
      <td className="px-4 py-2">฿{booking.subtotal.toLocaleString()}</td>
      <td className="px-4 py-2 font-medium text-success">
        ฿{booking.ownerPayout.toLocaleString()}
      </td>
      <td className="px-4 py-2">
        <BookingStatusControls
          bookingId={booking.id}
          status={booking.status}
        />
      </td>
    </tr>
  );
}

function BookingStatusControls({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  if (status === "PENDING" || status === "CONFIRMED") {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <OwnerBookingActions bookingId={bookingId} status={status} />
      </div>
    );
  }

  return <StatusBadge status={status} />;
}
