import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

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
  /** Optional query string (e.g. "?startDate=...&endDate=...") carried through to the detail page. */
  hrefQuery?: string;
};

export function CarCard(car: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.id}${car.hrefQuery ?? ""}`}
      className="group overflow-hidden rounded-md border border-border bg-surface transition-colors duration-200 hover:border-border-strong"
    >
      <div className="aspect-video w-full overflow-hidden bg-surface-hover">
        {car.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.imageUrl}
            alt={car.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LogoMark className="h-10 w-10 opacity-25" />
          </div>
        )}
      </div>
      <div className="border-t border-border p-4">
        <h3 className="font-medium text-ink">{car.title}</h3>
        <p className="text-sm text-ink-muted">
          {car.brand} {car.model} · {car.year}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {car.location} · {car.seats} ที่นั่ง ·{" "}
          {car.transmission === "AUTO" ? "เกียร์ออโต้" : "เกียร์ธรรมดา"}
        </p>
        <p className="font-display mt-2 text-lg text-accent">
          ฿{car.pricePerDay.toLocaleString()}{" "}
          <span className="font-sans text-sm text-ink-faint">/ วัน</span>
        </p>
      </div>
    </Link>
  );
}
