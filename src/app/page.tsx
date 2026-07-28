import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/car-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cars = await prisma.car.findMany({
    where: { status: "APPROVED", isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface-raised via-bg to-bg">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-25"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, var(--accent) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="animate-fade-in-up text-3xl font-bold text-ink sm:text-4xl">
            เช่ารถได้ง่ายๆ จาก
            <span className="text-accent"> เจ้าของรถทั่วประเทศ</span>
          </h1>
          <p className="animate-fade-in-up mx-auto mt-4 max-w-xl text-ink-muted [animation-delay:0.08s]">
            แพลตฟอร์มตัวกลางเชื่อมเจ้าของรถกับผู้เช่า ปลอดภัย โปร่งใส
            จองง่ายในไม่กี่ขั้นตอน
          </p>
          <div className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:0.16s]">
            <Link
              href="/cars"
              className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              ค้นหารถเช่า
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-border-strong px-6 py-3 font-semibold text-ink transition-colors hover:bg-surface-hover"
            >
              ลงทะเบียนปล่อยเช่ารถของคุณ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">รถแนะนำ</h2>
          <Link
            href="/cars"
            className="text-sm text-accent transition-colors hover:text-accent-hover"
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
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl">🔑</div>
            <h3 className="mt-2 font-semibold text-ink">ลงประกาศฟรี</h3>
            <p className="mt-1 text-sm text-ink-muted">
              เจ้าของรถลงประกาศได้ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl">🤝</div>
            <h3 className="mt-2 font-semibold text-ink">จองง่าย ปลอดภัย</h3>
            <p className="mt-1 text-sm text-ink-muted">
              ระบบจองและยืนยันผ่านแพลตฟอร์ม ตรวจสอบได้ทุกขั้นตอน
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl">💰</div>
            <h3 className="mt-2 font-semibold text-ink">
              รับรายได้ทันทีที่มีคนเช่า
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              แพลตฟอร์มหักค่าคอมมิชชั่นเพียงเล็กน้อยจากยอดจองแต่ละครั้ง
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
