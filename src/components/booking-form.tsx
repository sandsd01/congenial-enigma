"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function BookingForm({
  carId,
  pricePerDay,
}: {
  carId: string;
  pricePerDay: number;
}) {
  const { status } = useSession();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const total = days * pricePerDay;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/cars/${carId}`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, startDate, endDate, notes }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ส่งคำขอจองรถสำเร็จ! เจ้าของรถจะตรวจสอบและยืนยันการจองของคุณเร็วๆ นี้
        ดูสถานะได้ที่{" "}
        <a href="/bookings" className="font-medium underline">
          การจองของฉัน
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h3 className="font-semibold">จองรถคันนี้</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            วันรับรถ
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            วันคืนรถ
          </label>
          <input
            type="date"
            required
            min={startDate || new Date().toISOString().split("T")[0]}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          หมายเหตุถึงเจ้าของรถ (ถ้ามี)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {days > 0 && (
        <div className="rounded-md bg-slate-50 p-3 text-sm">
          <div className="flex justify-between">
            <span>
              {days} วัน × ฿{pricePerDay.toLocaleString()}
            </span>
            <span className="font-semibold">฿{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || days <= 0}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "กำลังส่งคำขอ..." : "ขอจองรถ"}
      </button>
    </form>
  );
}
