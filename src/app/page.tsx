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
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            เช่ารถได้ง่ายๆ จากเจ้าของรถทั่วประเทศ
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            แพลตฟอร์มตัวกลางเชื่อมเจ้าของรถกับผู้เช่า ปลอดภัย โปร่งใส
            จองง่ายในไม่กี่ขั้นตอน
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="rounded-md bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              ค้นหารถเช่า
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-white px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              ลงทะเบียนปล่อยเช่ารถของคุณ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">รถแนะนำ</h2>
          <Link href="/cars" className="text-sm text-blue-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        {cars.length === 0 ? (
          <p className="text-slate-500">ยังไม่มีรถที่เปิดให้เช่าในขณะนี้</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} {...car} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl">🔑</div>
            <h3 className="mt-2 font-semibold">ลงประกาศฟรี</h3>
            <p className="mt-1 text-sm text-slate-500">
              เจ้าของรถลงประกาศได้ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl">🤝</div>
            <h3 className="mt-2 font-semibold">จองง่าย ปลอดภัย</h3>
            <p className="mt-1 text-sm text-slate-500">
              ระบบจองและยืนยันผ่านแพลตฟอร์ม ตรวจสอบได้ทุกขั้นตอน
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl">💰</div>
            <h3 className="mt-2 font-semibold">รับรายได้ทันทีที่มีคนเช่า</h3>
            <p className="mt-1 text-sm text-slate-500">
              แพลตฟอร์มหักค่าคอมมิชชั่นเพียงเล็กน้อยจากยอดจองแต่ละครั้ง
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
