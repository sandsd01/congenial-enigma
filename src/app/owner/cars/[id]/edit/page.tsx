import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CarForm } from "@/components/car-form";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/owner/cars/${id}/edit`);
  }

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  if (car.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/owner");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">แก้ไขประกาศรถ</h1>
      <CarForm carId={car.id} initialValues={{ ...car, imageUrl: car.imageUrl ?? "" }} />
    </div>
  );
}
