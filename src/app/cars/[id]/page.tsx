import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking-form";

export const dynamic = "force-dynamic";

const TRANSMISSION_LABEL: Record<string, string> = {
  AUTO: "เกียร์ออโต้",
  MANUAL: "เกียร์ธรรมดา",
};

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "น้ำมันเบนซิน",
  DIESEL: "ดีเซล",
  HYBRID: "ไฮบริด",
  EV: "ไฟฟ้า (EV)",
};

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!car || car.status !== "APPROVED" || !car.isActive) {
    notFound();
  }

  const avgRating =
    car.reviews.length > 0
      ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
            {car.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={car.imageUrl}
                alt={car.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">
                🚗
              </div>
            )}
          </div>

          <h1 className="mt-6 text-2xl font-bold">{car.title}</h1>
          <p className="text-slate-500">
            {car.brand} {car.model} · {car.year}
          </p>
          {avgRating !== null && (
            <p className="mt-1 text-sm text-amber-500">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}{" "}
              <span className="text-slate-500">
                {avgRating.toFixed(1)} ({car.reviews.length} รีวิว)
              </span>
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoPill label="ที่ตั้ง" value={car.location} />
            <InfoPill label="ที่นั่ง" value={`${car.seats} ที่นั่ง`} />
            <InfoPill
              label="เกียร์"
              value={TRANSMISSION_LABEL[car.transmission] ?? car.transmission}
            />
            <InfoPill
              label="เชื้อเพลิง"
              value={FUEL_LABEL[car.fuelType] ?? car.fuelType}
            />
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-semibold">รายละเอียด</h2>
            <p className="whitespace-pre-wrap text-slate-700">
              {car.description}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
            ปล่อยเช่าโดย <span className="font-medium">{car.owner.name}</span>
          </div>

          {car.reviews.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold">
                รีวิวจากผู้เช่า ({car.reviews.length})
              </h2>
              <div className="space-y-3">
                {car.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {review.author.name}
                      </span>
                      <span className="text-amber-400">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-slate-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-bold text-blue-600">
              ฿{car.pricePerDay.toLocaleString()}
              <span className="text-sm font-normal text-slate-500"> / วัน</span>
            </p>
          </div>
          <BookingForm carId={car.id} pricePerDay={car.pricePerDay} />
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
