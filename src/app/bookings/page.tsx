import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings");
  }

  const bookings = await prisma.booking.findMany({
    where: { renterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { car: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">การจองของฉัน</h1>

      {bookings.length === 0 ? (
        <p className="text-slate-500">
          คุณยังไม่มีการจอง{" "}
          <Link href="/cars" className="text-blue-600 hover:underline">
            ค้นหารถเช่า
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <Link
                  href={`/cars/${b.carId}`}
                  className="font-semibold hover:underline"
                >
                  {b.car.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {new Date(b.startDate).toLocaleDateString("th-TH")} -{" "}
                  {new Date(b.endDate).toLocaleDateString("th-TH")} ·{" "}
                  {b.days} วัน
                </p>
                <p className="text-sm font-medium text-slate-700">
                  ฿{b.subtotal.toLocaleString()}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
