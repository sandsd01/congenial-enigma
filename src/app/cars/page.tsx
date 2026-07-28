import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/car-card";
import { THAI_LOCATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

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
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">ค้นหารถเช่า</h1>

      <form className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          type="text"
          name="q"
          placeholder="ค้นหา ยี่ห้อ / รุ่น"
          defaultValue={params.q}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          name="location"
          defaultValue={params.location ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="ราคาสูงสุด/วัน"
          defaultValue={params.maxPrice}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:col-span-1"
        >
          ค้นหา
        </button>
      </form>

      {cars.length === 0 ? (
        <p className="text-slate-500">ไม่พบรถที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      )}
    </div>
  );
}
