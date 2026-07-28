"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THAI_LOCATIONS } from "@/lib/constants";

type CarFormValues = {
  title: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  seats: number;
  fuelType: string;
  location: string;
  pricePerDay: number;
  description: string;
  imageUrl: string;
};

const EMPTY: CarFormValues = {
  title: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  transmission: "AUTO",
  seats: 5,
  fuelType: "GASOLINE",
  location: THAI_LOCATIONS[0],
  pricePerDay: 1000,
  description: "",
  imageUrl: "",
};

export function CarForm({
  carId,
  initialValues,
}: {
  carId?: string;
  initialValues?: Partial<CarFormValues>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CarFormValues>({
    ...EMPTY,
    ...initialValues,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(carId ? `/api/cars/${carId}` : "/api/cars", {
      method: carId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    router.push("/owner");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">ชื่อประกาศ</label>
        <input
          required
          placeholder="เช่น Toyota Yaris 2022 เกียร์ออโต้ ประหยัดน้ำมัน"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium">ยี่ห้อ</label>
          <input
            required
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">รุ่น</label>
          <input
            required
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">ปี</label>
          <input
            type="number"
            required
            value={form.year}
            onChange={(e) => set("year", Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">ที่นั่ง</label>
          <input
            type="number"
            required
            value={form.seats}
            onChange={(e) => set("seats", Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">เกียร์</label>
          <select
            value={form.transmission}
            onChange={(e) => set("transmission", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="AUTO">ออโต้</option>
            <option value="MANUAL">ธรรมดา</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">เชื้อเพลิง</label>
          <select
            value={form.fuelType}
            onChange={(e) => set("fuelType", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="GASOLINE">น้ำมันเบนซิน</option>
            <option value="DIESEL">ดีเซล</option>
            <option value="HYBRID">ไฮบริด</option>
            <option value="EV">ไฟฟ้า (EV)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">จังหวัด</label>
          <select
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {THAI_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          ราคาเช่าต่อวัน (บาท)
        </label>
        <input
          type="number"
          required
          min={1}
          value={form.pricePerDay}
          onChange={(e) => set("pricePerDay", Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          ลิงก์รูปภาพ (URL, ถ้ามี)
        </label>
        <input
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">รายละเอียด</label>
        <textarea
          required
          rows={4}
          minLength={10}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "กำลังบันทึก..."
          : carId
            ? "บันทึกการแก้ไข"
            : "ลงประกาศรถ"}
      </button>
    </form>
  );
}
