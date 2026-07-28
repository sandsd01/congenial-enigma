"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THAI_LOCATIONS } from "@/lib/constants";

const inputClass =
  "w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const labelClass = "mb-1 block text-sm font-medium text-ink-muted";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.imageUrl || null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

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

    if (!res.ok) {
      setLoading(false);
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    const car = await res.json();
    const targetCarId = carId ?? car.id;

    if (imageFile) {
      const imageForm = new FormData();
      imageForm.append("image", imageFile);
      const imageRes = await fetch(`/api/cars/${targetCarId}/image`, {
        method: "POST",
        body: imageForm,
      });
      if (!imageRes.ok) {
        setLoading(false);
        const data = await imageRes.json();
        setError(data.error ?? "อัปโหลดรูปภาพไม่สำเร็จ");
        return;
      }
    }

    setLoading(false);
    router.push("/owner");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-surface p-6"
    >
      <div>
        <label className={labelClass}>ชื่อประกาศ</label>
        <input
          required
          placeholder="เช่น Toyota Yaris 2022 เกียร์ออโต้ ประหยัดน้ำมัน"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>ยี่ห้อ</label>
          <input
            required
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>รุ่น</label>
          <input
            required
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>ปี</label>
          <input
            type="number"
            required
            value={form.year}
            onChange={(e) => set("year", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>ที่นั่ง</label>
          <input
            type="number"
            required
            value={form.seats}
            onChange={(e) => set("seats", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>เกียร์</label>
          <select
            value={form.transmission}
            onChange={(e) => set("transmission", e.target.value)}
            className={inputClass}
          >
            <option value="AUTO">ออโต้</option>
            <option value="MANUAL">ธรรมดา</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>เชื้อเพลิง</label>
          <select
            value={form.fuelType}
            onChange={(e) => set("fuelType", e.target.value)}
            className={inputClass}
          >
            <option value="GASOLINE">น้ำมันเบนซิน</option>
            <option value="DIESEL">ดีเซล</option>
            <option value="HYBRID">ไฮบริด</option>
            <option value="EV">ไฟฟ้า (EV)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>จังหวัด</label>
          <select
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
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
        <label className={labelClass}>ราคาเช่าต่อวัน (บาท)</label>
        <input
          type="number"
          required
          min={1}
          value={form.pricePerDay}
          onChange={(e) => set("pricePerDay", Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>รูปภาพรถ</label>
        {imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="ตัวอย่างรูปรถ"
            className="mb-2 h-40 w-full rounded-md border border-border object-cover"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className={`${inputClass} text-sm file:mr-3 file:rounded file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-ink file:transition-colors hover:file:bg-surface-raised`}
        />
        <p className="mt-1 text-xs text-ink-faint">
          JPEG, PNG หรือ WebP ขนาดไม่เกิน 4MB
        </p>
      </div>

      <div>
        <label className={labelClass}>
          หรือลิงก์รูปภาพ (URL, ถ้าไม่ได้อัปโหลดไฟล์)
        </label>
        <input
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>รายละเอียด</label>
        <textarea
          required
          rows={4}
          minLength={10}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
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
