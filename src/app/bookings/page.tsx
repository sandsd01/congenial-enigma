import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ReviewForm } from "@/components/review-form";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings");
  }

  const bookings = await prisma.booking.findMany({
    where: { renterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { car: true, review: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-normal text-ink">การจองของฉัน</h1>

      {bookings.length === 0 ? (
        <p className="text-ink-muted">
          คุณยังไม่มีการจอง{" "}
          <Link
            href="/cars"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            ค้นหารถเช่า
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/cars/${b.carId}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {b.car.title}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    {new Date(b.startDate).toLocaleDateString("th-TH")} -{" "}
                    {new Date(b.endDate).toLocaleDateString("th-TH")} ·{" "}
                    {b.days} วัน
                  </p>
                  <p className="text-sm font-medium text-ink">
                    ฿{b.subtotal.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={b.status} />
                  {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                    <CancelBookingButton bookingId={b.id} />
                  )}
                </div>
              </div>

              {b.status === "COMPLETED" &&
                (b.review ? (
                  <div className="mt-2 rounded-lg border border-border bg-surface-hover p-3 text-sm">
                    <span className="text-accent">
                      {"★".repeat(b.review.rating)}
                      {"☆".repeat(5 - b.review.rating)}
                    </span>
                    {b.review.comment && (
                      <p className="mt-1 text-ink-muted">
                        {b.review.comment}
                      </p>
                    )}
                  </div>
                ) : (
                  <ReviewForm bookingId={b.id} />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
