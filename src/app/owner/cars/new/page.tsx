import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CarForm } from "@/components/car-form";

export default async function NewCarPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login?callbackUrl=/owner/cars/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">ลงประกาศรถใหม่</h1>
      <CarForm />
    </div>
  );
}
