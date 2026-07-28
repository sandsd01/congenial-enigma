import Link from "next/link";

type CarCardProps = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  imageUrl: string | null;
};

export function CarCard(car: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        {car.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.imageUrl}
            alt={car.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🚗
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{car.title}</h3>
        <p className="text-sm text-slate-500">
          {car.brand} {car.model} · {car.year}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          📍 {car.location} · {car.seats} ที่นั่ง ·{" "}
          {car.transmission === "AUTO" ? "เกียร์ออโต้" : "เกียร์ธรรมดา"}
        </p>
        <p className="mt-2 text-lg font-bold text-blue-600">
          ฿{car.pricePerDay.toLocaleString()}{" "}
          <span className="text-sm font-normal text-slate-500">/ วัน</span>
        </p>
      </div>
    </Link>
  );
}
