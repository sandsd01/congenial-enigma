import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/car-card";
import { THAI_LOCATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const inputClass =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const labelClass = "mb-1 block text-xs font-medium text-ink-muted";

type SearchParams = {
  q?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const startDate = params.startDate ? new Date(params.startDate) : null;
  const endDate = params.endDate ? new Date(params.endDate) : null;
  const hasValidDateRange =
    startDate &&
    endDate &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate > startDate;

  const dateError =
    (startDate || endDate) && !hasValidDateRange
      ? "กรุณาเลือกวันรับรถและวันคืนรถให้ถูกต้อง (วันคืนรถต้องอยู่หลังวันรับรถ)"
      : null;

  const cars = await prisma.car.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      ...(params.location ? { location: params.location } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q } },
              { brand: { contains: params.q } },
              { model: { contains: params.q } },
            ],
          }
        : {}),
      ...(params.minPrice
        ? { pricePerDay: { gte: Number(params.minPrice) } }
        : {}),
      ...(params.maxPrice
        ? { pricePerDay: { lte: Number(params.maxPrice) } }
        : {}),
      // A car is unavailable if it has a CONFIRMED booking overlapping the
      // requested range — mirrors the overlap check in POST /api/bookings.
      ...(hasValidDateRange
        ? {
            bookings: {
              none: {
                status: "CONFIRMED",
                startDate: { lt: endDate! },
                endDate: { gt: startDate! },
              },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const dateQuery = hasValidDateRange
    ? `?startDate=${params.startDate}&endDate=${params.endDate}`
    : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">ค้นหารถเช่า</h1>

      <form className="mb-8 space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="q"
            placeholder="ค้นหา ยี่ห้อ / รุ่น"
            defaultValue={params.q}
            className={inputClass}
          />
          <select
            name="location"
            defaultValue={params.location ?? ""}
            className={inputClass}
          >
            <option value="">ทุกจังหวัด</option>
            {THAI_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="minPrice"
            placeholder="ราคาต่ำสุด/วัน"
            defaultValue={params.minPrice}
            className={inputClass}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="ราคาสูงสุด/วัน"
            defaultValue={params.maxPrice}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>วันรับรถ</label>
            <input
              type="date"
              name="startDate"
              defaultValue={params.startDate}
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className={labelClass}>วันคืนรถ</label>
            <input
              type="date"
              name="endDate"
              defaultValue={params.endDate}
              className={`${inputClass} w-full`}
            />
          </div>
          <button
            type="submit"
            className="col-span-2 self-end rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover sm:col-span-1"
          >
            ค้นหา
          </button>
        </div>
        {dateError && <p className="text-xs text-danger">{dateError}</p>}
        {hasValidDateRange && (
          <p className="text-xs text-ink-faint">
            แสดงเฉพาะรถที่ว่างในช่วงวันที่เลือก
          </p>
        )}
      </form>

      {cars.length === 0 ? (
        <p className="text-ink-muted">ไม่พบรถที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} {...car} hrefQuery={dateQuery} />
          ))}
        </div>
      )}
    </div>
  );
}
