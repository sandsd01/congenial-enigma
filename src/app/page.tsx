import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/car-card";
import { IconListing, IconHandshake, IconPayout } from "@/components/feature-icons";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    n: "01",
    Icon: IconListing,
    title: "ลงประกาศฟรี",
    body: "เจ้าของรถลงประกาศได้ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า",
  },
  {
    n: "02",
    Icon: IconHandshake,
    title: "จองง่าย ปลอดภัย",
    body: "ระบบจองและยืนยันผ่านแพลตฟอร์ม ตรวจสอบได้ทุกขั้นตอน",
  },
  {
    n: "03",
    Icon: IconPayout,
    title: "รับรายได้ทันทีที่มีคนเช่า",
    body: "แพลตฟอร์มหักค่าคอมมิชชั่นเพียงเล็กน้อยจากยอดจองแต่ละครั้ง",
  },
];

export default async function Home() {
  const cars = await prisma.car.findMany({
    where: { status: "APPROVED", isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        {/* An oversized echo of the logo mark, faint, bleeding off the edge —
            replaces the generic radial-gradient hero blob. */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute -right-24 top-1/2 h-[440px] w-[440px] -translate-y-1/2 opacity-[0.06] sm:-right-16"
          aria-hidden="true"
        >
          <path
            d="M 55.209 79.544 A 30 30 0 1 0 21.809 60.261"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="35" cy="75.981" r="1.1" fill="var(--accent)" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="animate-fade-in-up text-xs font-medium tracking-[0.08em] text-rust">
              แพลตฟอร์มเช่ารถ ตัวกลางที่คุณวางใจได้
            </p>
            <h1 className="animate-fade-in-up [animation-delay:0.05s] font-display mt-4 text-4xl font-light leading-[1.15] text-ink sm:text-5xl">
              เช่ารถได้ง่ายๆ
              <br />
              จาก<span className="text-accent">เจ้าของรถทั่วประเทศ</span>
            </h1>
            <p className="animate-fade-in-up mt-6 max-w-md text-ink-muted [animation-delay:0.1s]">
              แพลตฟอร์มตัวกลางเชื่อมเจ้าของรถกับผู้เช่า ปลอดภัย โปร่งใส
              จองง่ายในไม่กี่ขั้นตอน
            </p>
            <div className="animate-fade-in-up mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:0.15s]">
              <Link
                href="/cars"
                className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
              >
                ค้นหารถเช่า
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-accent"
              >
                ลงทะเบียนปล่อยเช่ารถของคุณ
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <h2 className="font-display text-2xl font-light text-ink">
            รถแนะนำ
          </h2>
          <Link
            href="/cars"
            className="text-sm text-ink-muted transition-colors hover:text-accent"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        {cars.length === 0 ? (
          <p className="text-ink-muted">ยังไม่มีรถที่เปิดให้เช่าในขณะนี้</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} {...car} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {FEATURES.map(({ n, Icon, title, body }) => (
              <div key={n} className="px-0 py-8 first:pt-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-3 text-ink-faint">
                  <span className="font-display text-sm">{n}</span>
                  <span className="h-px flex-1 bg-border" />
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display mt-4 text-lg font-normal text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
